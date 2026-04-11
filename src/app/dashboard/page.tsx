"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GenerationRecord {
  id: string;
  repo_url: string;
  repo_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/auth";
        return;
      }
      setUserEmail(session.user.email || "");

      const { data } = await supabase
        .from("generations")
        .select("id, repo_url, repo_name, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setGenerations(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-xl flex items-center gap-2">
          <span>📄</span> ReadMeForge
        </a>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{userEmail}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <a
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New README
          </a>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : generations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500 mb-4">No READMEs generated yet.</p>
            <a href="/" className="text-indigo-400 hover:text-indigo-300 underline text-sm">
              Generate your first README
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((g) => (
              <div
                key={g.id}
                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-white">{g.repo_name || g.repo_url}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={g.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  View Repo ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
