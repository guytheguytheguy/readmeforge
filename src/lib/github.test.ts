import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchRepoInfo } from "./github";

// ---------------------------------------------------------------------------
// fetchRepoInfo — GitHub API integration
// ---------------------------------------------------------------------------
// Covers a real bug found during the 2026-07-14 daily maintenance pass: a
// misconfigured/expired GITHUB_TOKEN caused every generate request to hard-fail
// with a 401, even though GitHub allows unauthenticated reads of public repos.

const REPO_RESPONSE = {
  description: "desc",
  default_branch: "main",
  language: "TypeScript",
  topics: [],
  license: null,
};

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchRepoInfo", () => {
  const originalToken = process.env.GITHUB_TOKEN;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    vi.restoreAllMocks();
  });

  it("throws a clear error for an invalid GitHub URL", async () => {
    await expect(fetchRepoInfo("not-a-url")).rejects.toThrow("Invalid GitHub URL");
  });

  it("falls back to an unauthenticated request when GITHUB_TOKEN is invalid (401)", async () => {
    process.env.GITHUB_TOKEN = "bad-token";

    // Snapshot the Authorization header present at call-time (the implementation
    // mutates the shared headers object in place, so we must capture per-call,
    // not inspect mock.calls after the fact).
    const authSeen: (string | undefined)[] = [];
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string> | undefined;
      authSeen.push(headers?.Authorization);
      if (authSeen.length === 1) return jsonResponse(401, { message: "Bad credentials" });
      if (authSeen.length === 2) return jsonResponse(200, REPO_RESPONSE);
      return jsonResponse(200, { tree: [] });
    });

    const info = await fetchRepoInfo("https://github.com/acme/widget");

    expect(info.owner).toBe("acme");
    expect(info.repo).toBe("widget");
    expect(info.description).toBe("desc");

    // First call included the bad Authorization header, retry omitted it.
    expect(authSeen[0]).toBe("Bearer bad-token");
    expect(authSeen[1]).toBeUndefined();
  });

  it("throws a 'not found' error for a 404 repo", async () => {
    delete process.env.GITHUB_TOKEN;
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { message: "Not Found" }));

    await expect(fetchRepoInfo("https://github.com/acme/does-not-exist")).rejects.toThrow(
      "Repository not found"
    );
  });
});
