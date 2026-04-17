"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Repository, FeedItem, Slideshow } from "@/types/repository";
import DiscoverCard from "./DiscoverCard";
import { AppSettings, DEFAULT_SETTINGS, loadAppSettings } from "@/lib/appSettings";

// Only render the visible card ±1 neighbour.
const RENDER_WINDOW = 1;
const MAX_DOTS = 20;

function SlidingDots({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}) {
  if (total === 0) return null;

  const dotCount = Math.min(total, MAX_DOTS);

  // Calculate the sliding window start so the active dot stays visible
  let windowStart = 0;
  if (total > MAX_DOTS) {
    // Keep the active dot roughly centred in the window
    windowStart = Math.max(
      0,
      Math.min(current - Math.floor(MAX_DOTS / 2), total - MAX_DOTS)
    );
  }

  const activeDot = current - windowStart;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 overflow-hidden">
      {Array.from({ length: dotCount }, (_, i) => {
        const repoIndex = windowStart + i;
        const isActive = i === activeDot;
        // Fade dots near the edges when the window is sliding
        const distFromEdge = Math.min(i, dotCount - 1 - i);
        const edgeFade = total > MAX_DOTS && distFromEdge < 2 ? 0.3 + distFromEdge * 0.35 : 1;

        return (
          <button
            key={repoIndex}
            onClick={() => onDotClick(repoIndex)}
            style={{ opacity: isActive ? 1 : edgeFade }}
            className={`w-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-white h-8"
                : "bg-gray-500 hover:bg-gray-300 h-2"
            }`}
            aria-label={`Go to repository ${repoIndex + 1}`}
          />
        );
      })}
    </div>
  );
}

interface DiscoverFeedProps {
  repos: Repository[];
  slideshowMap?: Map<number, Slideshow>;
  feedItems?: FeedItem[];
  onReachEnd?: () => void;
}

export default function DiscoverFeed({
  repos,
  slideshowMap,
  feedItems,
  onReachEnd,
}: DiscoverFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [playbackSettings, setPlaybackSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  // Stabilise onReachEnd via ref so the effect doesn't depend on callback identity
  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;
  const reachEndFiredRef = useRef(false);

  useEffect(() => {
    const settings = loadAppSettings();
    setPlaybackSettings(settings);
    setAudioEnabled(settings.autoplayVoiceover);
  }, []);

  // Notify parent when nearing end of list — fires 5 repos before the end
  // so new content loads before the user reaches the last card.
  useEffect(() => {
    if (repos.length === 0) return;
    if (currentIndex >= repos.length - 5) {
      if (!reachEndFiredRef.current) {
        reachEndFiredRef.current = true;
        onReachEndRef.current?.();
      }
    } else {
      // Reset so it can fire again when user scrolls near end again
      reachEndFiredRef.current = false;
    }
  }, [currentIndex, repos.length]);

  const visibleRange = useMemo(() => {
    const lo = Math.max(0, currentIndex - RENDER_WINDOW);
    const hi = Math.min(repos.length - 1, currentIndex + RENDER_WINDOW);
    return { lo, hi };
  }, [currentIndex, repos.length]);

  const scrollToRepo = useCallback(
    (index: number) => {
      if (index < 0 || index >= repos.length) return;
      const container = containerRef.current;
      if (!container) return;
      container.scrollTo({
        top: index * window.innerHeight,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    },
    [repos.length]
  );

  // ── Wheel ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 800 || isScrolling) return;
      lastScrollTime.current = now;
      setIsScrolling(true);
      if (e.deltaY > 0) scrollToRepo(currentIndex + 1);
      else if (e.deltaY < 0) scrollToRepo(currentIndex - 1);
      setTimeout(() => setIsScrolling(false), 800);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, isScrolling, scrollToRepo]);

  // ── Touch ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) scrollToRepo(currentIndex + 1);
      else scrollToRepo(currentIndex - 1);
    }
  };

  // ── Keyboard ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        scrollToRepo(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToRepo(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, scrollToRepo]);

  const toggleAudio = useCallback(() => setAudioEnabled((prev) => !prev), []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {repos.map((repo, index) => {
        const inWindow = index >= visibleRange.lo && index <= visibleRange.hi;

        if (!inWindow) {
          return (
            <div
              key={repo.id}
              className="h-screen w-screen snap-start snap-always bg-black"
            />
          );
        }

        const feedItem = feedItems?.find((item) => item.repo.id === repo.id);
        return (
          <div
            key={repo.id}
            className="h-screen w-screen snap-start snap-always"
          >
            <DiscoverCard
              repo={repo}
              isActive={index === currentIndex}
              slideshow={slideshowMap?.get(repo.id)}
              feedItem={feedItem}
              playbackSettings={playbackSettings}
              audioEnabled={audioEnabled}
              onToggleAudio={toggleAudio}
            />
          </div>
        );
      })}

      <SlidingDots
        total={repos.length}
        current={currentIndex}
        onDotClick={scrollToRepo}
      />
    </div>
  );
}
