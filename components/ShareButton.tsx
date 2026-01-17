"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  repoUrl: string;
  repoName: string;
}

export default function ShareButton({ repoUrl, repoName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `Check out ${repoName} on GitHub!`;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: repoName,
          text: shareText,
          url: repoUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(repoUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/30"
      title="Share repository"
    >
      <Share2 className="w-5 h-5 text-white" />
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
          Copied!
        </span>
      )}
    </button>
  );
}

