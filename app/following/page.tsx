"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RepoFeed from "@/components/RepoFeed";
import { Repository } from "@/types/repository";
import { fetchUserFollowingForkedRepos } from "@/lib/github";
import Header from "@/components/Header";

export default function FollowingPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [inputValue, setInputValue] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const user = searchParams.get("user");
    if (user) {
      setInputValue(user);
      loadFollowingRepos(user);
    }
  }, [searchParams]);

  const loadFollowingRepos = async (user: string) => {
    setLoading(true);
    setUsername(user);
    try {
      const data = await fetchUserFollowingForkedRepos(user);
      setRepos(data);
    } catch (error) {
      console.error("Error loading following repos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      loadFollowingRepos(inputValue.trim());
    }
  };

  if (repos.length > 0 && !loading) {
    return (
      <>
        <Header />
        <RepoFeed repos={repos} />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Discover Forked Repos
            </h1>
            <p className="text-gray-400 text-lg">
              Enter a GitHub username to see repos forked by people they follow
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter GitHub username..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="w-full px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Explore Repos"}
            </button>
          </form>

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
              <p className="text-white">Finding forked repos from {username}'s network...</p>
            </div>
          )}

          {!loading && username && repos.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                No forked repositories found for {username}'s following list.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

