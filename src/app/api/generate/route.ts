import { NextRequest, NextResponse } from "next/server";
import { fetchRepoInfo } from "@/lib/github";
import { generateReadme } from "@/lib/readme-generator";

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

  // Validate it looks like a GitHub URL before hitting the API
  if (!url.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/)) {
    return NextResponse.json(
      { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
      { status: 422 }
    );
  }

  try {
    const repoInfo = await fetchRepoInfo(url);
    const readme = generateReadme(repoInfo);
    return NextResponse.json({ readme, repo: { owner: repoInfo.owner, name: repoInfo.repo } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error generating README.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
