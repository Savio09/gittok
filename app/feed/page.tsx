"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import VideoRepoFeed from "@/components/VideoRepoFeed";
import { Repository } from "@/types/repository";
import { batchGenerateVideos } from "@/lib/videoGeneration";
import Header from "@/components/Header";
import { Film, Heart, Users, Github, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { FeedItem } from "@/lib/personalizedFeed";

export default function PersonalizedFeedPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [videoMap, setVideoMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generatingVideos, setGeneratingVideos] = useState(false);
  const [feedSource, setFeedSource] = useState<"personalized" | "trending">("trending");
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadFeed(1);
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreFeed();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, currentPage]);

  const loadFeed = async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch personalized feed from API with pagination
      const response = await fetch(`/api/feed/personalized?page=${page}&pageSize=20`);
      const data = await response.json();

      if (data.error) {
        console.error("Feed API error:", data.error);
        setLoading(false);
        return;
      }

      // Log debug info if available
      if (data.debug) {
        console.log("Feed debug info:", data.debug);
      }
      if (data.message) {
        console.log("Feed message:", data.message);
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

      // Generate videos for top repos
      if (repoList.length > 0) {
        setGeneratingVideos(true);
        const videos = await batchGenerateVideos(repoList.slice(0, 10), {
          provider: "veo",
          duration: 15,
          aspectRatio: "9:16",
          quality: "hd",
        });

        const urlMap = new Map<string, string>();
        videos.forEach((video, repoId) => {
          urlMap.set(repoId, video.url);
        });
        setVideoMap(urlMap);
        setGeneratingVideos(false);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      setLoading(false);
      setGeneratingVideos(false);
    }
  };

  const loadMoreFeed = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      console.log(`Loading more content, page ${currentPage}...`);
      
      const response = await fetch(`/api/feed/personalized?page=${currentPage}&pageSize=20`);
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
        
        // Generate videos for new repos
        const videos = await batchGenerateVideos(newRepos.slice(0, 5), {
          provider: "veo",
          duration: 15,
          aspectRatio: "9:16",
          quality: "hd",
        });

        setVideoMap((prev) => {
          const newMap = new Map(prev);
          videos.forEach((video, repoId) => {
            newMap.set(repoId, video.url);
          });
          return newMap;
        });
      }

      setHasMore(data.pagination?.hasMore ?? false);
      setCurrentPage(data.pagination?.nextPage ?? currentPage + 1);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error loading more:", error);
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

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
              Sign in to see repos from developers you follow and personalized recommendations
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
              Welcome {user?.firstName || 'back'}! Loading your feed...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (generatingVideos) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-6 max-w-md mx-4 text-center">
            <div className="relative">
              <Film className="w-20 h-20 text-white animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 animate-ping" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">
                Generating Videos...
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                Creating personalized content for you
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <VideoRepoFeed repos={repos} videoMap={videoMap} feedItems={feedItems} />
      
      {/* Feed Type Badge */}
      <div className="fixed top-20 left-4 z-40 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg">
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

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
        {loadingMore && (
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-white text-sm">Loading more from your network...</span>
          </div>
        )}
        {!hasMore && feedItems.length > 0 && (
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-gray-400 text-sm">You've reached the end! 🎉</span>
          </div>
        )}
      </div>
    </>
  );
}
