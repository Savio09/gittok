"use client";

import { useState } from "react";
import { Github, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <Github className="w-8 h-8" />
          <span>GitTok</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Trending
          </Link>
          <Link
            href="/feed"
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <span className="relative flex items-center gap-1">
              ❤️ For You
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            </span>
          </Link>
          <Link
            href="/video"
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            🎬 Videos
          </Link>
          <Link
            href="/search"
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* User Profile */}
        <div className="hidden md:flex items-center gap-4">
          <AuthButton />
        </div>
      </div>

        {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Trending
            </Link>
            <Link
              href="/feed"
              className="text-white hover:text-gray-300 transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              ❤️ For You
              <span className="text-xs bg-pink-600 px-2 py-0.5 rounded-full">Personal</span>
            </Link>
            <Link
              href="/video"
              className="text-white hover:text-gray-300 transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              🎬 AI Videos
            </Link>
            <Link
              href="/search"
              className="text-white hover:text-gray-300 transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="w-5 h-5" />
              Search
            </Link>
            <Link
              href="/settings"
              className="text-white hover:text-gray-300 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

