"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RepoFeed from "@/components/RepoFeed";
import { Repository } from "@/types/repository";
import { fetchTrendingRepos } from "@/lib/github";
import Header from "@/components/Header";

export default function LanguagePage() {
  const params = useParams();
  const language = params.lang as string;
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRepos() {
      setLoading(true);
      try {
        const data = await fetchTrendingRepos(language);
        setRepos(data);
      } catch (error) {
        console.error("Error loading repos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, [language]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
            <p className="text-white text-lg">
              Loading {language} repositories...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (repos.length === 0) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <h2 className="text-white text-2xl mb-4">No repositories found</h2>
            <p className="text-gray-400">
              Try exploring other languages or check back later.
            </p>
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

