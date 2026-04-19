"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Github,
  Flame,
  Play,
  Heart,
  Star,
  GitFork,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Floating particles background
// ---------------------------------------------------------------------------

function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Feature card
// ---------------------------------------------------------------------------

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 overflow-hidden"
    >
      {/* Hover glow */}
      <div
        className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${gradient}`}
      />
      <div className="relative z-10">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 ${gradient}`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="bg-[#050507] text-white min-h-screen overflow-x-hidden">
      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] animate-pulse [animation-delay:4s]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <Particles />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">
              Discover GitHub like never before
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
          >
            <span className="block">Swipe Through</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Open Source
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            GitTok turns GitHub repositories into bite-sized, TikTok-style
            slideshows. Discover trending projects, explore code visually, and
            never miss what&apos;s hot in open source.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/trending"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/15 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Heart className="w-5 h-5" />
              Personalized Feed
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint — positioned relative to the section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/30"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-5 h-9 border-2 border-white/20 rounded-full flex justify-center pt-2">
              <motion.div
                animate={{ opacity: [1, 0], y: [0, 10] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1.5 bg-white/40 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three ways to discover your next favorite repository
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Flame}
              title="Trending"
              description="Browse the hottest repositories on GitHub right now. Swipe through cards showing stats, descriptions, and topics at a glance."
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
              delay={0}
            />
            <FeatureCard
              icon={Play}
              title="Discover"
              description="Watch AI-generated slideshows that break down repositories into visual stories with narration. Like TikTok, but for code."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0.15}
            />
            <FeatureCard
              icon={Heart}
              title="For You"
              description="Sign in with GitHub and get a personalized feed based on who you follow, what you star, and what's trending in your network."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { icon: Github, value: 100, suffix: "M+", label: "GitHub repos" },
              { icon: Star, value: 500, suffix: "K+", label: "Stars tracked" },
              { icon: GitFork, value: 200, suffix: "K+", label: "Forks indexed" },
              { icon: Eye, value: 30, suffix: "+", label: "Languages" },
            ].map(({ icon: Icon, value, suffix, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <Icon className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <span className="text-gray-500 text-sm">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ PREVIEW MOCK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for Developers
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A beautiful, fast experience that makes exploring code feel effortless
            </p>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-[300px] sm:w-[340px]"
          >
            {/* Glow behind phone */}
            <div className="absolute -inset-10 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-500/20 rounded-[60px] blur-3xl" />

            {/* Phone frame */}
            <div className="relative bg-gray-900 rounded-[40px] border-2 border-white/10 p-3 shadow-2xl">
              {/* Screen */}
              <div className="bg-black rounded-[32px] overflow-hidden aspect-[9/19.5]">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-2">
                  <span className="text-white/60 text-xs font-medium">9:41</span>
                  <div className="w-20 h-5 bg-white/10 rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white/40 rounded-sm" />
                  </div>
                </div>

                {/* Mock app header */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/80">
                  <div className="flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">GitTok</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Mock card */}
                <div className="relative h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 pb-20">
                  <div className="absolute top-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div>
                        <div className="w-20 h-3 bg-white/20 rounded" />
                        <div className="w-14 h-2 bg-white/10 rounded mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-24 left-4 right-4">
                    <div className="w-32 h-5 bg-white/20 rounded mb-2" />
                    <div className="w-full h-3 bg-white/10 rounded mb-1" />
                    <div className="w-3/4 h-3 bg-white/10 rounded mb-4" />

                    <div className="flex gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white/60 text-xs">45.2k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60 text-xs">12.1k</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="px-4 py-1.5 bg-white rounded-full">
                        <span className="text-black text-xs font-bold">View Repo</span>
                      </div>
                      <div className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                        <span className="text-white text-xs">Share</span>
                      </div>
                    </div>
                  </div>

                  {/* Side dots */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-purple-600/10 to-transparent rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Jump into the feed and start discovering amazing open source
            projects in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/trending"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Start Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Github className="w-4 h-4" />
            <span>GitTok</span>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <Link href="/trending" className="hover:text-white/60 transition-colors">
              Trending
            </Link>
            <Link href="/discover" className="hover:text-white/60 transition-colors">
              Discover
            </Link>
            <Link href="/feed" className="hover:text-white/60 transition-colors">
              For You
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
