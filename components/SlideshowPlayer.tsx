"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, GitFork, Star, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { Repository } from "@/types/repository";
import { Slide, Slideshow } from "@/types/repository";
import { AppSettings } from "@/lib/appSettings";
import { fetchSlideVoiceoverAudio } from "@/lib/frontendApi";

// ---------------------------------------------------------------------------
// Language → accent colour
// ---------------------------------------------------------------------------

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#ce422b",
  Ruby: "#CC342D",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Vue: "#41b883",
};
const DEFAULT_COLOR = "#58a6ff";
const VOICEOVER_RATE = 0.95;
// Remote TTS is enabled by default — falls back to Web Speech API on failure.
// Set NEXT_PUBLIC_REMOTE_TTS_DISABLED=true to force browser-only speech.
const REMOTE_TTS_ENABLED = process.env.NEXT_PUBLIC_REMOTE_TTS_DISABLED !== "true";

function langColor(lang: string | null | undefined) {
  return LANGUAGE_COLORS[lang ?? ""] ?? DEFAULT_COLOR;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function estimateSpeechDurationMs(text: string, rate: number) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const punctuationPauses = (text.match(/[.,!?;:]/g) || []).length * 120;
  const newlinePauses = (text.match(/\n/g) || []).length * 180;
  const wordsPerMinute = 170 * Math.max(rate, 0.5);
  const baseDuration =
    words === 0 ? 2500 : (words / (wordsPerMinute / 60)) * 1000;

  return Math.max(2500, baseDuration + punctuationPauses + newlinePauses);
}

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function useCounter(target: number, active: boolean, ms = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / ms, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, active, ms]);
  return val;
}

// ---------------------------------------------------------------------------
// Best-voice picker for Web Speech API
// ---------------------------------------------------------------------------

function useBestVoice(): SpeechSynthesisVoice | null {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      // Prefer high-quality English voices — these are the best on each platform
      const ranked = [
        "Samantha",        // macOS (natural)
        "Karen",           // macOS (Australian, very clear)
        "Daniel",          // macOS (British)
        "Google US English", // Chrome
        "Google UK English Female",
        "Microsoft Zira",  // Windows
      ];
      for (const name of ranked) {
        const v = voices.find((v) => v.name.includes(name));
        if (v) { setVoice(v); return; }
      }
      // fallback: first English voice
      const en = voices.find((v) => v.lang.startsWith("en"));
      if (en) setVoice(en);
    };
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
    return () => speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);
  return voice;
}

// ---------------------------------------------------------------------------
// Per-slide content components
// ---------------------------------------------------------------------------

function IntroSlide({ repo }: { repo: Repository }) {
  const color = langColor(repo.language);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 16 }}
        className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl"
        style={{ boxShadow: `0 0 0 4px ${color}60` }}
      >
        <Image src={repo.owner.avatar_url} alt={repo.owner.login} width={96} height={96} unoptimized />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-black text-white tracking-tight leading-none"
      >
        {repo.name}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5 }} className="text-white text-lg">
        by @{repo.owner.login}
      </motion.p>
      {repo.language && (
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="px-5 py-2 rounded-full text-sm font-bold text-white border"
          style={{ backgroundColor: `${color}25`, borderColor: `${color}80` }}
        >
          {repo.language}
        </motion.span>
      )}
    </div>
  );
}

function OverviewSlide({ description }: { description: string }) {
  const words = description.split(" ");
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.1 }} className="text-white text-xs uppercase tracking-widest font-semibold mb-5">
        What is it?
      </motion.p>
      <p className="text-white text-3xl font-bold leading-snug">
        {words.map((word, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04, duration: 0.25 }} className="inline-block mr-[0.3em]">
            {word}
          </motion.span>
        ))}
      </p>
    </div>
  );
}

function FeaturesSlide({ features }: { features: string[] }) {
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.1 }} className="text-white text-xs uppercase tracking-widest font-semibold mb-6">
        Key Features
      </motion.p>
      <div className="flex flex-col gap-4">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.22 }} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-white text-lg leading-snug">{f}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatsSlide({ repo, active }: { repo: Repository; active: boolean }) {
  const stars = useCounter(repo.stargazers_count, active, 1400);
  const forks = useCounter(repo.forks_count, active, 1200);
  const watchers = useCounter(repo.watchers_count, active, 1600);
  const stats = [
    { label: "Stars", val: stars, icon: <Star className="w-8 h-8" />, color: "#facc15" },
    { label: "Forks", val: forks, icon: <GitFork className="w-8 h-8" />, color: "#60a5fa" },
    { label: "Watchers", val: watchers, icon: <Eye className="w-8 h-8" />, color: "#4ade80" },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.1 }} className="text-white text-xs uppercase tracking-widest font-semibold mb-5">
        By the Numbers
      </motion.p>
      <div className="flex flex-col gap-5">
        {stats.map(({ label, val, icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.18, type: "spring" }} className="flex items-center gap-5">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}20`, color }}>{icon}</div>
            <div>
              <div className="text-4xl font-black text-white tabular-nums">{fmt(val)}</div>
              <div className="text-white/50 text-sm mt-0.5">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TopicsSlide({ repo }: { repo: Repository }) {
  const color = langColor(repo.language);
  const topics = repo.topics ?? [];
  const items = topics.length > 0 ? topics.slice(0, 8) : [repo.language ?? "code"];
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.1 }} className="text-white text-xs uppercase tracking-widest font-semibold mb-6">
        Topics & Tags
      </motion.p>
      <div className="flex flex-wrap gap-3">
        {items.map((topic, i) => (
          <motion.span key={topic} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.09, type: "spring", stiffness: 220 }} className="px-4 py-2 rounded-full text-white font-medium text-sm border" style={{ backgroundColor: `${color}25`, borderColor: `${color}60` }}>
            #{topic}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function IssuesSlide({ slide }: { slide: Slide }) {
  const issues = slide.issues ?? [];
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.1 }} className="text-white text-xs uppercase tracking-widest font-semibold mb-6">
        Open Issues
      </motion.p>
      {issues.length > 0 ? (
        <div className="flex flex-col gap-4">
          {issues.map((issue, i) => (
            <motion.div key={issue.number} initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.18 }} className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-white text-base leading-snug">#{issue.number} {issue.title}</span>
                {issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {issue.labels.slice(0, 3).map((label) => (
                      <span key={label} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.2 }} className="text-white text-xl font-medium">
          {slide.transcript}
        </motion.p>
      )}
    </div>
  );
}

function CTASlide({ repo }: { repo: Repository }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-5 text-center">
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 160 }} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl font-black text-white">
        Check it out
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5 }} className="text-white text-lg font-mono">
        {repo.full_name}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.7 }} className="text-white text-sm">
        Tap "View Repo" below to open on GitHub
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide dispatcher
// ---------------------------------------------------------------------------

function SlideContent({ slide, repo, active }: { slide: Slide; repo: Repository; active: boolean }) {
  switch (slide.type) {
    case "intro": return <IntroSlide repo={repo} />;
    case "overview": return <OverviewSlide description={slide.transcript} />;
    case "features": return <FeaturesSlide features={slide.features ?? []} />;
    case "stats": return <StatsSlide repo={repo} active={active} />;
    case "issues": return <IssuesSlide slide={slide} />;
    case "topics": return <TopicsSlide repo={repo} />;
    case "cta": return <CTASlide repo={repo} />;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Main SlideshowPlayer
// ---------------------------------------------------------------------------

interface SlideshowPlayerProps {
  repo: Repository;
  slideshow: Slideshow;
  isActive: boolean;
  settings: AppSettings;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export default function SlideshowPlayer({
  repo,
  slideshow,
  isActive,
  settings,
  audioEnabled,
  onToggleAudio,
}: SlideshowPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [segProgress, setSegProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceCacheRef = useRef<Map<string, string>>(new Map());
  const playbackTokenRef = useRef(0);
  const remoteVoiceDisabledRef = useRef(false);
  const ownsVoicePlaybackRef = useRef(false);

  const slide = slideshow.slides[current];
  const color = langColor(repo.language);
  const bestVoice = useBestVoice();
  const voiceoverEnabled = audioEnabled;

  // ── Refs for values used inside effects (avoids unnecessary effect re-runs) ──
  const bestVoiceRef = useRef(bestVoice);
  bestVoiceRef.current = bestVoice;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const slideRef = useRef(slide);
  slideRef.current = slide;
  const repoRef = useRef(repo);
  repoRef.current = repo;
  const slideshowRef = useRef(slideshow);
  slideshowRef.current = slideshow;

  const stopRemoteVoiceAudio = useCallback(() => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
    audio.src = "";
    voiceAudioRef.current = null;
  }, []);

  const stopVoicePlayback = useCallback(() => {
    ownsVoicePlaybackRef.current = false;
    stopRemoteVoiceAudio();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesis.cancel();
    }
  }, [stopRemoteVoiceAudio]);

  // ── Navigation ──
  const advance = useCallback(() => {
    startRef.current = null;
    setCurrent((i) => {
      if (i >= slideshowRef.current.slides.length - 1) {
        return settingsRef.current.autoLoop ? 0 : i;
      }
      return i + 1;
    });
    setSegProgress(0);
  }, []);

  const goBack = useCallback(() => {
    startRef.current = null;
    setCurrent((i) => Math.max(i - 1, 0));
    setSegProgress(0);
  }, []);

  // ── rAF progress loop (only when voiceover is OFF) ──
  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (voiceoverEnabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const s = slideRef.current;
    const duration =
      Math.max(1, s.duration * settingsRef.current.slideDurationMultiplier) * 1000;
    const maxProgress = 100;
    startRef.current = null;
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const pct = Math.min(((ts - startRef.current) / duration) * 100, maxProgress);
      setSegProgress(pct);
      if (pct < maxProgress) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      advance();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isActive, voiceoverEnabled]);

  // ── Reset on deactivate ──
  useEffect(() => {
    if (!isActive) {
      stopRemoteVoiceAudio();
      ownsVoicePlaybackRef.current = false;
      setCurrent(0);
      setSegProgress(0);
    }
  }, [isActive, stopRemoteVoiceAudio]);

  // ── Unmount cleanup ──
  useEffect(() => {
    return () => {
      if (ownsVoicePlaybackRef.current) {
        stopVoicePlayback();
      }
      for (const url of voiceCacheRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      voiceCacheRef.current.clear();
    };
  }, [stopVoicePlayback]);

  // ── Voiceover (OpenAI TTS with Web Speech fallback) ──
  // IMPORTANT: deps are intentionally minimal — [current, isActive, voiceoverEnabled].
  // Everything else is accessed via refs so that re-renders (e.g. from progress
  // bar updates or settings loading) do NOT restart the speech synthesis.
  useEffect(() => {
    if (typeof window === "undefined" || !isActive || !voiceoverEnabled) {
      return;
    }

    // Snapshot ref values at effect start
    const slide = slideRef.current;
    const repo = repoRef.current;

    // Cancel any prior playback
    stopRemoteVoiceAudio();
    ownsVoicePlaybackRef.current = false;
    playbackTokenRef.current += 1;
    const token = playbackTokenRef.current;
    let fallbackProgressRef: number | null = null;

    const clearFallbackProgress = () => {
      if (fallbackProgressRef !== null) {
        cancelAnimationFrame(fallbackProgressRef);
        fallbackProgressRef = null;
      }
    };

    const finishSlide = () => {
      clearFallbackProgress();
      setSegProgress(100);
      advance();
    };

    const startFallbackProgress = (transcript: string) => {
      const estimatedDurationMs = estimateSpeechDurationMs(transcript, VOICEOVER_RATE);
      let startedAt: number | null = null;
      const tick = (ts: number) => {
        if (playbackTokenRef.current !== token) return;
        if (startedAt === null) startedAt = ts;
        const pct = Math.min(((ts - startedAt) / estimatedDurationMs) * 100, 99);
        setSegProgress((prev) => Math.max(prev, pct));
        if (pct < 99) {
          fallbackProgressRef = requestAnimationFrame(tick);
        }
      };
      fallbackProgressRef = requestAnimationFrame(tick);
    };

    const playBrowserSpeech = () => {
      if (!window.speechSynthesis) {
        finishSlide();
        return;
      }

      ownsVoicePlaybackRef.current = true;
      const utter = new SpeechSynthesisUtterance(slide.transcript);
      if (bestVoiceRef.current) utter.voice = bestVoiceRef.current;
      utter.rate = VOICEOVER_RATE;
      utter.pitch = 1.0;
      utter.volume = 0.85;

      utter.onboundary = (event) => {
        if (playbackTokenRef.current !== token) return;
        if (!slide.transcript.length) return;
        const pct = Math.min((event.charIndex / slide.transcript.length) * 100, 99);
        setSegProgress((prev) => Math.max(prev, pct));
      };

      // Chrome bug: calling cancel() then speak() synchronously can silently
      // drop the utterance. A small gap avoids the race.
      setTimeout(() => {
        if (playbackTokenRef.current !== token) return;

        speechSynthesis.speak(utter);
        startFallbackProgress(slide.transcript);

        // Chrome pauses speech after ~15s. Periodic resume() keeps it going.
        const keepAlive = setInterval(() => {
          if (playbackTokenRef.current !== token) {
            clearInterval(keepAlive);
            return;
          }
          speechSynthesis.resume();
        }, 5000);

        utter.onend = () => {
          clearInterval(keepAlive);
          if (playbackTokenRef.current !== token) return;
          finishSlide();
        };
        utter.onerror = (event) => {
          clearInterval(keepAlive);
          if (playbackTokenRef.current !== token) return;
          clearFallbackProgress();
          if (event.error === "canceled" || event.error === "interrupted") return;
          advance();
        };
      }, 50);
    };

    const playRemoteVoiceover = async () => {
      const cacheKey = `${repo.id}:${current}:${slide.type}:${slide.transcript}`;
      let audioUrl = voiceCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const audioBlob = await fetchSlideVoiceoverAudio(slide.transcript, slideshowRef.current.voice);
        if (playbackTokenRef.current !== token) return false;
        audioUrl = URL.createObjectURL(audioBlob);
        voiceCacheRef.current.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      ownsVoicePlaybackRef.current = true;
      voiceAudioRef.current = audio;
      audio.preload = "auto";
      audio.volume = 1;
      audio.ontimeupdate = () => {
        if (playbackTokenRef.current !== token) return;
        if (!audio.duration || !Number.isFinite(audio.duration)) return;
        const pct = Math.min((audio.currentTime / audio.duration) * 100, 99);
        setSegProgress(pct);
      };
      audio.onended = () => {
        if (playbackTokenRef.current !== token) return;
        finishSlide();
      };
      audio.onerror = () => {
        if (playbackTokenRef.current !== token) return;
        stopRemoteVoiceAudio();
        playBrowserSpeech();
      };

      await audio.play();

      // Reset safety timer to actual audio duration now that we know it
      if (audio.duration && Number.isFinite(audio.duration)) {
        resetSafetyTimer(audio.duration * 1000 + 3000);
      }

      return true;
    };

    const startVoiceover = async () => {
      setSegProgress(0);

      if (!slide.transcript.trim()) {
        finishSlide();
        return;
      }

      if (REMOTE_TTS_ENABLED && !remoteVoiceDisabledRef.current) {
        try {
          const didStartRemoteVoiceover = await playRemoteVoiceover();
          if (didStartRemoteVoiceover) return;
        } catch (error) {
          if (playbackTokenRef.current !== token) return;
          stopRemoteVoiceAudio();
          if (!(error instanceof DOMException) || error.name !== "NotAllowedError") {
            remoteVoiceDisabledRef.current = true;
          }
        }
      }

      playBrowserSpeech();
    };

    // Safety net: force-advance if voiceover stalls.
    // Use a generous initial budget (estimate + 15s) to cover TTS fetch latency.
    // Once remote audio starts playing, the timer is reset to actual duration + 3s.
    let safetyTimerId: ReturnType<typeof setTimeout> | null = null;
    const resetSafetyTimer = (durationMs: number) => {
      if (safetyTimerId !== null) clearTimeout(safetyTimerId);
      safetyTimerId = setTimeout(() => {
        if (playbackTokenRef.current !== token) return;
        finishSlide();
      }, durationMs);
    };

    const initialMaxWaitMs = estimateSpeechDurationMs(slide.transcript, VOICEOVER_RATE) + 15000;
    resetSafetyTimer(initialMaxWaitMs);

    void startVoiceover();

    return () => {
      if (safetyTimerId !== null) clearTimeout(safetyTimerId);
      clearFallbackProgress();
      if (playbackTokenRef.current === token) {
        playbackTokenRef.current += 1;
      }
      if (ownsVoicePlaybackRef.current) {
        ownsVoicePlaybackRef.current = false;
        stopRemoteVoiceAudio();
        if (window.speechSynthesis) speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isActive, voiceoverEnabled]);

  // ── Background music ──
  useEffect(() => {
    const el = musicRef.current;
    if (!el) return;
    if (isActive && audioEnabled && settings.backgroundMusic) {
      el.volume = 0.12; // subtle
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, audioEnabled, settings.backgroundMusic]);

  // ── Tap handler ──
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const x = e.clientX;
    const w = (e.currentTarget as HTMLDivElement).offsetWidth;
    if (x < w / 3) goBack();
    else advance();
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden cursor-pointer select-none"
      role="region"
      aria-label="Repository slideshow"
      onClick={handleTap}
      style={{
        background: `
          radial-gradient(ellipse at 25% 15%, ${color}30, transparent 55%),
          radial-gradient(ellipse at 75% 85%, ${color}18, transparent 50%),
          linear-gradient(160deg, #08080f 0%, #10101a 100%)
        `,
      }}
    >
      {/* Background music — drop an MP3 at public/audio/background.mp3 */}
      {settings.backgroundMusic && (
        <audio ref={musicRef} src="/audio/background.mp3" loop preload="none" />
      )}

      {/* ── Audio toggle ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleAudio(); }}
        className="absolute top-[4.5rem] right-4 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
        aria-label={audioEnabled ? "Mute" : "Unmute"}
      >
        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* ── Progress segments ── */}
      <div className="absolute top-16 left-4 right-14 z-30 flex gap-1 pointer-events-none">
        {slideshow.slides.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: i < current ? "100%" : i === current ? `${segProgress}%` : "0%",
                transition: i === current ? "none" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Slide content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-x-0 top-20 bottom-[11rem] pr-14 overflow-hidden"
        >
          <SlideContent slide={slide} repo={repo} active={isActive} />
        </motion.div>
      </AnimatePresence>

      {/* ── Transcript caption ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={`cap-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="absolute bottom-36 left-5 right-16 z-20 pointer-events-none"
          >
            <p className="text-white/60 text-xs leading-relaxed">{slide.transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
