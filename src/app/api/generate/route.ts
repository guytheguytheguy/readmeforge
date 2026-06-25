import { NextRequest, NextResponse } from "next/server";
import { fetchRepoInfo } from "@/lib/github";
import { generateReadme } from "@/lib/readme-generator";

const FREE_TIER_MONTHLY_LIMIT = 5;

// ---------------------------------------------------------------------------
// Lightweight in-process rate limiter for anonymous (unauthenticated) requests.
// Limit: 3 requests per IP per hour. Resets automatically via TTL eviction.
// This is a best-effort guard — it won't survive server restarts or multi-instance
// deploys, but it stops casual abuse on Vercel's single-region serverless.
// ---------------------------------------------------------------------------
const ANON_HOURLY_LIMIT = 3;
const ANON_WINDOW_MS = 60 * 60 * 1_000; // 1 hour

const anonRateMap = new Map<string, { count: number; resetAt: number }>();

function checkAnonRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = anonRateMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    anonRateMap.set(ip, { count: 1, resetAt: now + ANON_WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= ANON_HOURLY_LIMIT) return false; // blocked
  entry.count += 1;
  return true; // allowed
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { repoUrl } = body as { repoUrl?: unknown };

  if (!repoUrl || typeof repoUrl !== "string" || !repoUrl.trim()) {
    return NextResponse.json({ error: "repoUrl is required." }, { status: 400 });
  }

  const url = repoUrl.trim();

  if (!url.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/)) {
    return NextResponse.json(
      { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
      { status: 422 }
    );
  }

  // Resolve authenticated user from Bearer token (optional — anonymous users can still generate)
  let userId: string | null = null;
  let userEmail: string | null = null;
  let isPro = false;

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    // Lazy-init to avoid build-time env errors
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const admin = getSupabaseAdmin();

    const { data: { user }, error } = await admin.auth.getUser(token);
    if (!error && user) {
      userId = user.id;
      userEmail = user.email ?? null;

      // Check subscription status
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status, plan")
        .eq("email", userEmail)
        .maybeSingle();

      isPro = sub?.status === "active" && sub?.plan === "pro";

      // Enforce free-tier monthly limit
      if (!isPro) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await admin
          .from("generations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth.toISOString());

        if ((count ?? 0) >= FREE_TIER_MONTHLY_LIMIT) {
          return NextResponse.json(
            {
              error: `Free tier limit reached (${FREE_TIER_MONTHLY_LIMIT} READMEs/month). Upgrade to Pro for unlimited generations.`,
              upgradeUrl: "/pricing",
            },
            { status: 429 }
          );
        }
      }
    }
  }

  // Apply anonymous rate limit when no authenticated user resolved
  if (!userId) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    if (!checkAnonRateLimit(ip)) {
      return NextResponse.json(
        {
          error: `Rate limit reached (${ANON_HOURLY_LIMIT} free generations per hour). Sign in for a higher free limit, or upgrade to Pro for unlimited.`,
          upgradeUrl: "/pricing",
        },
        { status: 429 }
      );
    }
  }

  try {
    const repoInfo = await fetchRepoInfo(url);
    const readme = generateReadme(repoInfo);

    // Record generation for authenticated users
    if (userId) {
      const { getSupabaseAdmin } = await import("@/lib/supabase");
      const admin = getSupabaseAdmin();
      await admin.from("generations").insert({
        user_id: userId,
        repo_url: url,
        repo_name: `${repoInfo.owner}/${repoInfo.repo}`,
      });
    }

    return NextResponse.json({ readme, repo: { owner: repoInfo.owner, name: repoInfo.repo } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error generating README.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
