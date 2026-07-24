import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { SUBSCRIBE_HOURLY_LIMIT, checkSubscribeRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!checkSubscribeRateLimit(ip)) {
    return NextResponse.json(
      { error: `Rate limit reached (${SUBSCRIBE_HOURLY_LIMIT} requests per hour). Please try again later.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body as { email?: unknown } | null)?.email;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("readmeforge_subscribers")
    .insert({ email: normalizeEmail(email) });

  if (error) {
    if (error.code === "23505") {
      // Already subscribed — treat as success so the client doesn't need to distinguish.
      return NextResponse.json({ subscribed: true });
    }
    console.error(`Subscribe insert failed: ${error.message}`);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ subscribed: true });
}
