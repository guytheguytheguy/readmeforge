"use client";

import { useState } from "react";

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [readme, setReadme] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setReadme("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate README. Please try again.");
        return;
      }

      setReadme(data.readme);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-xl">ReadMeForge</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
            Pricing
          </a>
          <a
            href="/auth"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Generate Beautiful READMEs{" "}
            <span className="text-indigo-400">Instantly</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Paste any public GitHub repository URL. We analyze the codebase and generate a
            professional, structured README in seconds. No AI hallucinations — just real data.
          </p>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="mb-8">
          <div className="flex gap-3">
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={loading}
              aria-label="GitHub repository URL"
            />
            <button
              id="generate-btn"
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                "Generate README"
              )}
            </button>
          </div>

          {error && (
            <p id="error-msg" className="mt-3 text-red-400 text-sm">
              {error}
            </p>
          )}
        </form>

        {/* Sample repos */}
        <div className="mb-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Try with a sample:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "https://github.com/vercel/next.js",
              "https://github.com/supabase/supabase",
              "https://github.com/tailwindlabs/tailwindcss",
            ].map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setRepoUrl(url)}
                className="text-indigo-400 hover:text-indigo-300 text-xs underline underline-offset-2"
              >
                {url.replace("https://github.com/", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {readme && (
          <div id="readme-output" className="border border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">README.md</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 p-6 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
              {readme}
            </pre>
          </div>
        )}

        {/* Feature grid */}
        {!readme && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: "🔍",
                title: "Codebase Analysis",
                desc: "Detects framework, language, tests, Docker, CI/CD, and package manager automatically.",
              },
              {
                icon: "🏷️",
                title: "Badges Included",
                desc: "License, framework, test status, and Docker badges added automatically.",
              },
              {
                icon: "⚡",
                title: "Zero AI Cost",
                desc: "Template-driven generation — instant results with no API rate limits or token costs.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
