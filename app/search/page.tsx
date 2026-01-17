"use client";

import { useState } from "react";
import RepoFeed from "@/components/RepoFeed";
import { Repository } from "@/types/repository";
import { searchRepos } from "@/lib/github";
import Header from "@/components/Header";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchRepos(query);
      setRepos(data);
    } catch (error) {
      console.error("Error searching repos:", error);
    } finally {
      setLoading(false);
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
        <div className="max-w-2xl w-full mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <SearchIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Search GitHub Repos
            </h1>
            <p className="text-gray-400 text-lg">
              Find repositories by name, topic, language, or description
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try 'machine learning', 'react hooks', or 'language:rust'..."
                className="w-full px-6 py-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
              />
              <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Search Tips */}
          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-3">Search Tips:</h3>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>• Use <code className="text-white bg-white/10 px-2 py-1 rounded">language:python</code> to filter by language</li>
              <li>• Use <code className="text-white bg-white/10 px-2 py-1 rounded">stars:&gt;1000</code> to find popular repos</li>
              <li>• Use <code className="text-white bg-white/10 px-2 py-1 rounded">topic:machine-learning</code> to search by topic</li>
              <li>• Combine filters: <code className="text-white bg-white/10 px-2 py-1 rounded">language:go stars:&gt;500</code></li>
            </ul>
          </div>

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
              <p className="text-white">Searching repositories...</p>
            </div>
          )}

          {!loading && hasSearched && repos.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-lg">
                No repositories found for "{query}"
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

