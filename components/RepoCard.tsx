"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Repository } from "@/types/repository";
import {
  Star,
  GitFork,
  ExternalLink,
  Code,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import ShareButton from "./ShareButton";

interface RepoCardProps {
  repo: Repository;
  isActive: boolean;
}

export default function RepoCard({ repo, isActive }: RepoCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
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
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    HTML: "#e34c26",
    CSS: "#563d7c",
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 h-full w-full flex flex-col justify-end p-8 pb-24"
          >
            {/* Owner Avatar & Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
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
                  className="text-white font-semibold text-lg hover:underline"
                >
                  {repo.owner.login}
                </a>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(repo.updated_at)}
                </p>
              </div>
            </motion.div>

            {/* Repository Name */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            >
              {repo.name}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 text-lg mb-6 line-clamp-3 max-w-3xl"
            >
              {repo.description || "No description provided"}
            </motion.p>

            {/* Language & Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {repo.language && (
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
                  style={{
                    backgroundColor: `${languageColors[repo.language] || "#555"}33`,
                    borderColor: languageColors[repo.language] || "#555",
                    borderWidth: "1px",
                    color: "white",
                  }}
                >
                  <Code className="w-4 h-4" />
                  {repo.language}
                </span>
              )}
              {repo.topics?.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium border border-white/20"
                >
                  #{topic}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 mb-6"
            >
              <div className="flex items-center gap-2 text-white">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">
                  {formatNumber(repo.stargazers_count)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <GitFork className="w-5 h-5 text-blue-400" />
                <span className="text-xl font-bold">
                  {formatNumber(repo.forks_count)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Eye className="w-5 h-5 text-green-400" />
                <span className="text-xl font-bold">
                  {formatNumber(repo.watchers_count)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-xl font-bold">
                  {formatNumber(repo.open_issues_count)}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                View on GitHub
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/30 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5" />
                  Website
                </a>
              )}
              <div className="relative">
                <ShareButton repoUrl={repo.html_url} repoName={repo.name} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Hint */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm flex flex-col items-center gap-2"
        >
          <span>Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

