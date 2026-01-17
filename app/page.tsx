"use client";

import { useEffect, useState } from "react";
import RepoFeed from "@/components/RepoFeed";
import { Repository } from "@/types/repository";
import { fetchTrendingRepos } from "@/lib/github";
import Header from "@/components/Header";

export default function Home() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRepos() {
      try {
        const data = await fetchTrendingRepos();
        setRepos(data);
      } catch (error) {
        console.error("Error loading repos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
            <p className="text-white text-lg">Loading trending repos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <RepoFeed repos={repos} />
    </>
  );
}

