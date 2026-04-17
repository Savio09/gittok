"use client";

import { useEffect, useState } from "react";
import DiscoverFeed from "@/components/DiscoverFeed";
import { Repository } from "@/types/repository";
import Header from "@/components/Header";
import { Film } from "lucide-react";
import { batchFetchRepos, fetchTrendingRepos } from "@/lib/frontendApi";

const FEATURED_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "microsoft/vscode",
  "tailwindlabs/tailwindcss",
  "openai/openai-node",
  "anthropics/anthropic-sdk-python",
  "langchain-ai/langchain",
  "supabase/supabase",
  "prisma/prisma",
  "shadcn-ui/ui",
];

export default function DiscoverPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoadingRepos(true);

    let repoResults: Repository[] = [];
    try {
      repoResults = await batchFetchRepos(FEATURED_REPOS);
    } catch {
      // non-critical — trending will fill the gap
    }

    let trending: Repository[] = [];
    try {
      trending = (await fetchTrendingRepos())
        .filter((r) => r.description && r.description.length > 50 && r.stargazers_count > 100)
        .slice(0, 5);
    } catch {
      // non-critical
    }

    const all = [...repoResults, ...trending];
    const unique = Array.from(new Map(all.map((r) => [r.id, r])).values());

    setRepos(unique);
    setLoadingRepos(false);
    // Slideshows are fetched on-demand by each DiscoverCard when it becomes active.
    // This avoids a long blocking wait for LLM transcript generation + issue fetching.
  }

  if (loadingRepos) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <Film className="w-14 h-14 text-white animate-pulse" />
            <p className="text-white text-lg font-medium">Loading repos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <DiscoverFeed repos={repos} />

      {/* Badge */}
      <div className="fixed top-16 left-4 z-40 bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
        <p className="text-white text-xs font-bold flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" />
          Discover
        </p>
      </div>
    </>
  );
}
