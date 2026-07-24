"use client";

import { useState } from "react";

const CROSS_PROMO = [
  {
    name: "HeaderGuard",
    url: "https://headerguard.veridux.ai",
    desc: "Scan your live site's security headers after every deploy",
  },
  {
    name: "CronPilot",
    url: "https://cronpilot.veridux.ai",
    desc: "Build and monitor cron expressions in plain English",
  },
  {
    name: "DeployDiff",
    url: "https://deploydiff.veridux.ai",
    desc: "Diff two deploys of your app in seconds",
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to subscribe");
      }

      setStatus("done");
      setMessage("You're on the list.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <footer className="border-t border-gray-800 px-6 py-12 mt-16">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10">
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Get notified of new features</h3>
          <p className="text-sm text-gray-400 mb-4">
            Occasional emails about new README generation capabilities. No spam.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400/50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              {status === "loading" ? "Adding…" : "Subscribe"}
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-3">More from Veridux</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {CROSS_PROMO.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-900 border border-gray-800 hover:border-indigo-400/40 rounded-lg p-4 transition-colors"
              >
                <div className="text-sm font-semibold text-white mb-1">{p.name}</div>
                <div className="text-xs text-gray-400">{p.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
