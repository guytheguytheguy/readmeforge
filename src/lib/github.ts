export interface RepoInfo {
  owner: string;
  repo: string;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  topics: string[];
  license: string | null;
  hasTests: boolean;
  hasDocker: boolean;
  hasCi: boolean;
  packageJson: Record<string, unknown> | null;
  files: string[];
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const clean = url.trim().replace(/\.git$/, "");
  const match = clean.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function fetchRepoInfo(repoUrl: string): Promise<RepoInfo> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo");

  const { owner, repo } = parsed;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;

  // Fetch repo metadata
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error("Repository not found. Make sure it's public.");
    throw new Error(`GitHub API error: ${repoRes.status}`);
  }
  const repoData = await repoRes.json();

  // Fetch root file tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}`,
    { headers }
  );
  const treeData = treeRes.ok ? await treeRes.json() : { tree: [] };
  const files: string[] = (treeData.tree || []).map((f: { path: string }) => f.path);

  // Detect tooling from file list
  const hasTests = files.some(
    (f) =>
      f.includes("test") ||
      f.includes("spec") ||
      f === "jest.config.js" ||
      f === "vitest.config.ts"
  );
  const hasDocker = files.some((f) => f === "Dockerfile" || f === "docker-compose.yml");
  const hasCi = files.some(
    (f) => f.startsWith(".github/workflows") || f === ".travis.yml" || f === ".circleci"
  );

  // Fetch package.json if present
  let packageJson: Record<string, unknown> | null = null;
  if (files.includes("package.json")) {
    const pkgRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      { headers }
    );
    if (pkgRes.ok) {
      const pkgData = await pkgRes.json();
      try {
        packageJson = JSON.parse(Buffer.from(pkgData.content, "base64").toString("utf-8"));
      } catch {
        // ignore parse errors
      }
    }
  }

  return {
    owner,
    repo,
    description: repoData.description,
    defaultBranch: repoData.default_branch,
    language: repoData.language,
    topics: repoData.topics || [],
    license: repoData.license?.spdx_id || null,
    hasTests,
    hasDocker,
    hasCi,
    packageJson,
    files,
  };
}
