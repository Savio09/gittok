"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import VideoRepoFeed from "@/components/VideoRepoFeed";
import { Repository } from "@/types/repository";
import { batchGenerateVideos, VideoProvider } from "@/lib/videoGeneration";
import Header from "@/components/Header";
import { Film, Play, Video, Loader2 } from "lucide-react";

// Curated list of high-quality repos with good README content
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

export default function VideoPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [videoMap, setVideoMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generatingVideos, setGeneratingVideos] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [provider] = useState<VideoProvider>("veo");

  useEffect(() => {
    loadVideoContent();
  }, []);

  const loadVideoContent = async () => {
    try {
      setLoading(true);
      
      // Fetch curated repos with high-quality READMEs
      const repoPromises = FEATURED_REPOS.map(async (repoPath) => {
        try {
          const [owner, repo] = repoPath.split("/");
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch {
          return null;
        }
      });

      const fetchedRepos = (await Promise.all(repoPromises)).filter(Boolean) as Repository[];
      
      // Also fetch some trending repos that are good candidates for video content
      try {
        const trendingResponse = await fetch("/api/trending");
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          // Filter for repos with good descriptions (likely good README)
          const qualityTrending = (trendingData.repos || [])
            .filter((repo: Repository) => 
              repo.description && 
              repo.description.length > 50 && 
              repo.stargazers_count > 100
            )
            .slice(0, 5);
          fetchedRepos.push(...qualityTrending);
        }
      } catch (error) {
        console.log("Could not fetch trending for video page");
      }

      // Remove duplicates
      const uniqueRepos = Array.from(
        new Map(fetchedRepos.map((r) => [r.id, r])).values()
      );

      setRepos(uniqueRepos);
      setLoading(false);

      // Generate videos with progress tracking - using README content for better videos
      if (uniqueRepos.length > 0) {
        setGeneratingVideos(true);
        setVideoProgress(0);
        
        const videos = await batchGenerateVideos(uniqueRepos.slice(0, 10), {
          provider,
          duration: 15,
          aspectRatio: "9:16",
          quality: "hd",
          useReadme: true, // Generate videos based on README content
        });

        const urlMap = new Map<string, string>();
        let progress = 0;
        videos.forEach((video, repoId) => {
          urlMap.set(repoId, video.url);
          progress++;
          setVideoProgress((progress / videos.size) * 100);
        });
        
        setVideoMap(urlMap);
        setGeneratingVideos(false);
      }
    } catch (error) {
      console.error("Error loading video content:", error);
      setLoading(false);
      setGeneratingVideos(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <Video className="w-16 h-16 text-white animate-pulse" />
            <div className="w-12 h-12 border-4 border-t-white border-gray-800 rounded-full animate-spin" />
            <p className="text-white text-lg">Loading featured repos...</p>
            <p className="text-gray-500 text-sm">Curating best content for video generation</p>
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
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-20 animate-ping" />
            </div>
            <div className="w-full">
              <h2 className="text-white text-2xl font-bold mb-2">
                Creating Video Showcases...
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                AI is generating stunning videos from README content
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(videoProgress, 10)}%` }}
                />
              </div>
              <p className="text-gray-500 text-sm mt-2">
                {Math.round(videoProgress)}% complete
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Using {provider === "mock" ? "demo" : provider} video generation
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <VideoRepoFeed repos={repos} videoMap={videoMap} />
      
      {/* Video Mode Badge */}
      <div className="fixed top-20 left-4 z-40 bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-full shadow-lg">
        <p className="text-white text-xs font-bold flex items-center gap-2">
          <Play className="w-4 h-4" />
          Video Showcases
        </p>
      </div>
    </>
  );
}
