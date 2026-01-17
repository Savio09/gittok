"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Repository } from "@/types/repository";
import { FeedItem } from "@/lib/personalizedFeed";
import {
  Star,
  GitFork,
  ExternalLink,
  Code,
  Eye,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
} from "lucide-react";
import Image from "next/image";
import ShareButton from "./ShareButton";
import { useEffect, useRef, useState } from "react";
import { createVideoPrompt } from "@/lib/videoGeneration";

interface VideoRepoCardProps {
  repo: Repository;
  isActive: boolean;
  videoUrl?: string;
  feedItem?: FeedItem; // Info about why this is in the feed
}

export default function VideoRepoCard({
  repo,
  isActive,
  videoUrl,
  feedItem,
}: VideoRepoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [videoPrompt] = useState(() => createVideoPrompt(repo));

  // Auto-play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
      video.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const languageColors: { [key: string]: string } = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        poster={`https://via.placeholder.com/1080x1920/000000/ffffff?text=${encodeURIComponent(
          repo.name
        )}`}
      >
        {videoUrl && <source src={videoUrl} type="video/mp4" />}
        {/* Fallback to sample video */}
        <source
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Video Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-3">
        <button
          onClick={togglePlay}
          className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
          title="View AI Prompt"
        >
          <Code className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* AI Prompt Overlay */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-32 right-4 left-4 z-30 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-md ml-auto"
        >
          <h4 className="text-white font-semibold mb-2 text-sm">
            AI Video Prompt:
          </h4>
          <p className="text-gray-300 text-xs leading-relaxed max-h-40 overflow-y-auto">
            {videoPrompt}
          </p>
        </motion.div>
      )}

      {/* Repository Information Overlay */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 h-full w-full flex flex-col justify-end p-6 pb-24"
          >
            {/* Feed Reason Badge */}
            {feedItem?.actor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-3 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-3 py-2 rounded-full self-start"
              >
                <img 
                  src={feedItem.actor.avatar_url} 
                  alt={feedItem.actor.login}
                  className="w-6 h-6 rounded-full border border-white/30"
                />
                <span className="text-white text-xs font-medium">
                  {feedItem.reason}
                </span>
              </motion.div>
            )}

            {/* Owner Avatar & Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/50">
                <Image
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <a
                  href={repo.owner.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:underline"
                >
                  @{repo.owner.login}
                </a>
                {feedItem?.type && (
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {feedItem.type === "starred" && "Starred by your network"}
                    {feedItem.type === "forked" && "Forked by your network"}
                    {feedItem.type === "created" && "Created by someone you follow"}
                    {feedItem.type === "trending" && "Trending in your network"}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Repository Name */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg"
            >
              {repo.name}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white text-sm mb-4 line-clamp-2 drop-shadow-lg"
            >
              {repo.description || "No description provided"}
            </motion.p>

            {/* Language Badge */}
            {repo.language && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-2 backdrop-blur-sm"
                  style={{
                    backgroundColor: `${
                      languageColors[repo.language] || "#555"
                    }33`,
                    borderColor: languageColors[repo.language] || "#555",
                    borderWidth: "1px",
                    color: "white",
                  }}
                >
                  <Code className="w-3 h-3" />
                  {repo.language}
                </span>
              </motion.div>
            )}

            {/* Stats - TikTok Style Vertical */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute right-6 bottom-32 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/50 backdrop-blur-sm rounded-full">
                  <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {formatNumber(repo.stargazers_count)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/50 backdrop-blur-sm rounded-full">
                  <GitFork className="w-7 h-7 text-blue-400" />
                </div>
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {formatNumber(repo.forks_count)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/50 backdrop-blur-sm rounded-full">
                  <Eye className="w-7 h-7 text-green-400" />
                </div>
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {formatNumber(repo.watchers_count)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/50 backdrop-blur-sm rounded-full">
                  <AlertCircle className="w-7 h-7 text-orange-400" />
                </div>
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {formatNumber(repo.open_issues_count)}
                </span>
              </div>

              <div className="relative">
                <ShareButton repoUrl={repo.html_url} repoName={repo.name} />
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3"
            >
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                View Repo
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/30 transition-all border border-white/50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Swipe Up" indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs flex flex-col items-center gap-1"
        >
          <span>Swipe up for next</span>
          <div className="w-1 h-8 bg-white/30 rounded-full" />
        </motion.div>
      )}
    </div>
  );
}

