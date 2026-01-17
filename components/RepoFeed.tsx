"use client";

import { useState, useRef, useEffect } from "react";
import { Repository } from "@/types/repository";
import RepoCard from "./RepoCard";

interface RepoFeedProps {
  repos: Repository[];
}

export default function RepoFeed({ repos }: RepoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  const scrollToRepo = (index: number) => {
    if (index < 0 || index >= repos.length) return;
    
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastScrollTime.current < 800 || isScrolling) return;
    
    lastScrollTime.current = now;
    setIsScrolling(true);
    
    if (e.deltaY > 0 && currentIndex < repos.length - 1) {
      scrollToRepo(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      scrollToRepo(currentIndex - 1);
    }
    
    setTimeout(() => setIsScrolling(false), 800);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < repos.length - 1) {
          scrollToRepo(currentIndex + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          scrollToRepo(currentIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, repos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < repos.length - 1) {
        scrollToRepo(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToRepo(currentIndex - 1);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, isScrolling]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {repos.map((repo, index) => (
        <div
          key={repo.id}
          className="h-screen w-screen snap-start snap-always"
        >
          <RepoCard
            repo={repo}
            isActive={index === currentIndex}
          />
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {repos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToRepo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white h-8"
                : "bg-gray-500 hover:bg-gray-300"
            }`}
            aria-label={`Go to repository ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

