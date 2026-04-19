"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Github, Search, Menu, X, Flame, Heart, Play, Settings } from "lucide-react";
import Link from "next/link";
import AuthButton from "./AuthButton";

const NAV_ITEMS = [
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/feed", label: "For You", icon: Heart },
  { href: "/discover", label: "Discover", icon: Play },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight"
        >
          <Github className="w-6 h-6" />
          <span>GitTok</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white/80 hover:text-white transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 mt-1">
              <AuthButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
