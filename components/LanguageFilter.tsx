"use client";

import { Code } from "lucide-react";

interface LanguageFilterProps {
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
}

const popularLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "C++",
  "C#",
  "Swift",
  "Kotlin",
];

export default function LanguageFilter({
  selectedLanguage,
  onLanguageChange,
}: LanguageFilterProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-20 md:w-64">
      <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Filter by Language</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onLanguageChange(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedLanguage === null
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            All
          </button>
          {popularLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedLanguage === lang
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

