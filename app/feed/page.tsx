"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import DiscoverFeed from "@/components/DiscoverFeed";
import { Repository } from "@/types/repository";
import { Slideshow } from "@/types/repository";
import Header from "@/components/Header";
import {
  Heart,
  Users,
  Github,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { FeedItem } from "@/types/repository";
import { batchFetchSlideshows } from "@/lib/frontendApi";

export default function PersonalizedFeedPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [slideshowMap, setSlideshowMap] = useState<Map<number, Slideshow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedSource, setFeedSource] = useState<"personalized" | "trending">(
    "trending"
  );
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadFeed(1);
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const loadFeed = async (page: number) => {
    try {
      setLoading(true);

      // Fetch personalized feed from API with pagination
      const response = await fetch(
        `/api/feed/personalized?page=${page}&pageSize=20`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Feed API error:", data.error);
        setLoading(false);
        return;
      }

      setFeedSource(data.source);
      setGithubUsername(data.username || null);
      setFeedItems(data.items || []);
      setHasMore(data.pagination?.hasMore ?? false);
      setCurrentPage(data.pagination?.nextPage ?? 1);

      // Extract repos from feed items
      const repoList = (data.items || []).map((item: FeedItem) => item.repo);
      setRepos(repoList);
      setLoading(false);

      // Build slideshows for top repos
      if (repoList.length > 0) {
        const map = await batchFetchSlideshows(repoList);
        setSlideshowMap(map);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      setLoading(false);
    }
  };

  // Use refs so the callback identity never changes — prevents re-render
  // loops between DiscoverFeed's onReachEnd effect and this component.
  const paginationRef = useRef({ currentPage, hasMore, loadingMore });
  paginationRef.current = { currentPage, hasMore, loadingMore };

  const loadMoreFeed = useCallback(async () => {
    const { currentPage: page, hasMore: more, loadingMore: busy } = paginationRef.current;
    if (busy || !more) return;

    try {
      setLoadingMore(true);
      const response = await fetch(
        `/api/feed/personalized?page=${page}&pageSize=20`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Load more error:", data.error);
        setLoadingMore(false);
        return;
      }

      const newItems = data.items || [];
      if (newItems.length > 0) {
        setFeedItems((prev) => [...prev, ...newItems]);
        const newRepos = newItems.map((item: FeedItem) => item.repo);
        setRepos((prev) => [...prev, ...newRepos]);

        setHasMore(data.pagination?.hasMore ?? false);
        setCurrentPage(data.pagination?.nextPage ?? page + 1);
        setLoadingMore(false);

        // Build slideshows for new repos (after clearing spinner)
        try {
          const newSlides = await batchFetchSlideshows(newRepos);
          setSlideshowMap((prev) => new Map([...prev, ...newSlides]));
        } catch {
          // Non-critical — cards will generate client-side fallbacks
        }
        return;
      }

      setHasMore(data.pagination?.hasMore ?? false);
      setCurrentPage(data.pagination?.nextPage ?? page + 1);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error loading more:", error);
      setLoadingMore(false);
    }
  }, []);

  // Not signed in - show sign in prompt
  if (isLoaded && !isSignedIn) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="max-w-md mx-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Personalized Feed
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Sign in to see repos from developers you follow and personalized
              recommendations
            </p>
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-3 mx-auto">
                <Github className="w-6 h-6" />
                Sign in to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </>
    );
  }

  if (!isLoaded || loading) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <Users className="w-16 h-16 text-white animate-pulse" />
            <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
            <p className="text-white text-lg">
              Welcome {user?.firstName || "back"}! Loading your feed...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <DiscoverFeed
        repos={repos}
        slideshowMap={slideshowMap}
        feedItems={feedItems}
        onReachEnd={loadMoreFeed}
      />

      {/* Feed Type Badge */}
      <div className="fixed top-16 left-4 z-40 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
        <p className="text-white text-xs font-bold flex items-center gap-2">
          {feedSource === "personalized" ? (
            <>
              <Sparkles className="w-4 h-4" />
              For You {githubUsername && `(@${githubUsername})`}
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Trending
            </>
          )}
        </p>
      </div>

      {/* Loading indicator for near-end pagination */}
      <div
        className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none"
      >
        {loadingMore && (
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-white text-sm">Loading more...</span>
          </div>
        )}
      </div>
    </>
  );
}
