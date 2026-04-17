"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repository, FeedItem, Slideshow } from "@/types/repository";
import { batchFetchSlideshows } from "@/lib/frontendApi";
import { Star, ExternalLink, Users } from "lucide-react";
import Image from "next/image";
import ShareButton from "./ShareButton";
import SlideshowPlayer from "./SlideshowPlayer";
import { AppSettings } from "@/lib/appSettings";

// ---------------------------------------------------------------------------
// Module-level slideshow cache — survives across card mount/unmount cycles
// and prevents duplicate fetches for the same repo.
// ---------------------------------------------------------------------------

const slideshowCache = new Map<number, Slideshow>();
const inflightRequests = new Map<number, Promise<Slideshow>>();

function getOrCreateSlideshow(repo: Repository): Promise<Slideshow> {
  const cached = slideshowCache.get(repo.id);
  if (cached) return Promise.resolve(cached);

  const inflight = inflightRequests.get(repo.id);
  if (inflight) return inflight;

  const promise = batchFetchSlideshows([repo]).then((map) => {
    const s = map.get(repo.id);
    if (!s) throw new Error("No slideshow returned");
    slideshowCache.set(repo.id, s);
    inflightRequests.delete(repo.id);
    return s;
  }).catch((err) => {
    inflightRequests.delete(repo.id);
    throw err;
  });

  inflightRequests.set(repo.id, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// DiscoverCard
// ---------------------------------------------------------------------------

interface DiscoverCardProps {
  repo: Repository;
  isActive: boolean;
  slideshow?: Slideshow;
  feedItem?: FeedItem;
  playbackSettings: AppSettings;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export default function DiscoverCard({
  repo,
  isActive,
  slideshow: externalSlideshow,
  feedItem,
  playbackSettings,
  audioEnabled,
  onToggleAudio,
}: DiscoverCardProps) {
  const [fallbackSlideshow, setFallbackSlideshow] = useState<Slideshow | null>(
    () => slideshowCache.get(repo.id) ?? null
  );
  const attemptedRef = useRef(false);

  // Generate a client-side fallback ONLY when this card becomes active
  // and no slideshow exists yet. Uses module-level dedup + cache.
  // IMPORTANT: fallbackSlideshow is intentionally NOT in the dep array —
  // including it would re-trigger the effect when we set state, causing a loop.
  useEffect(() => {
    if (externalSlideshow) return;
    if (!isActive) return; // only generate for the visible card
    if (attemptedRef.current) return; // don't retry on failure

    attemptedRef.current = true;
    let cancelled = false;

    getOrCreateSlideshow(repo)
      .then((s) => {
        if (!cancelled) setFallbackSlideshow(s);
      })
      .catch(() => {
        // Silently fail — card shows a static dark background
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo.id, isActive, externalSlideshow]);

  const slideshow = externalSlideshow ?? fallbackSlideshow;

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">

      {/* ── Background: Slideshow or plain dark fallback ── */}
      {slideshow ? (
        <SlideshowPlayer
          repo={repo}
          slideshow={slideshow}
          isActive={isActive}
          settings={playbackSettings}
          audioEnabled={audioEnabled}
          onToggleAudio={onToggleAudio}
        />
      ) : (
        <div className="absolute inset-0 bg-[#08080f]" />
      )}

      {/* ── Bottom gradient — lifts text off the background ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }}
      />

      {/* ── Right sidebar: stars + share ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ delay: 0.4 }}
            className="absolute right-3 bottom-36 z-20 flex flex-col items-center gap-5"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-white text-[11px] font-bold">
                {formatNumber(repo.stargazers_count)}
              </span>
            </div>
            <ShareButton repoUrl={repo.html_url} repoName={repo.name} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom bar: author identity + repo name + CTA ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-x-0 bottom-0 z-10 px-4 pb-7 pt-4 pointer-events-none"
          >
            {feedItem?.actor && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-3 bg-purple-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full self-start w-fit pointer-events-auto"
              >
                <img
                  src={feedItem.actor.avatar_url}
                  alt={feedItem.actor.login}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-white text-xs font-medium">
                  {feedItem.reason}
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-2 mb-1.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/30 flex-shrink-0">
                <Image
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold leading-none">
                  @{repo.owner.login}
                </span>
                {feedItem?.type && (
                  <span className="text-white/50 text-[10px] flex items-center gap-1 mt-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {feedItem.type === "starred" && "Starred by your network"}
                    {feedItem.type === "forked" && "Forked by your network"}
                    {feedItem.type === "created" && "Created by someone you follow"}
                    {feedItem.type === "trending" && "Trending in your network"}
                  </span>
                )}
              </div>
            </div>

            <p className="text-white font-bold text-xl leading-tight mb-3 pr-14">
              {repo.name}
            </p>

            <div className="flex gap-2 pointer-events-auto">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Repo
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white text-sm font-semibold rounded-full border border-white/30 hover:bg-white/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
