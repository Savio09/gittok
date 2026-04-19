"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Settings, Volume2, RotateCcw, Github, CheckCircle2 } from "lucide-react";
import { AppSettings, DEFAULT_SETTINGS, loadAppSettings } from "@/lib/appSettings";

export default function SettingsPage() {
  const { isLoaded, user } = useUser();
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const [saved, setSaved] = useState(false);

  // Clerk uses "oauth_github" for GitHub OAuth provider. Also check
  // for "github" in case of Clerk version differences.
  const githubAccount = user?.externalAccounts?.find(
    (a) => {
      const p = (a as any).provider ?? "";
      return p === "oauth_github" || p === "github";
    }
  );

  const update = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("gittok-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("gittok-settings");
    setSaved(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Customise your GitTok experience</p>
          </div>

          {/* GitHub Account */}
          <section className="mb-8">
            <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Account
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              {!isLoaded ? (
                <p className="text-gray-500 text-sm">Loading account info...</p>
              ) : githubAccount ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      @{(githubAccount as any).username ?? user?.username ?? "connected"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Connected — your feed is personalised
                    </p>
                  </div>
                </div>
              ) : user ? (
                <div>
                  <p className="text-white text-sm mb-1">
                    Signed in as {user.firstName ?? user.username ?? user.primaryEmailAddress?.emailAddress}
                  </p>
                  <p className="text-gray-500 text-xs">
                    To get a personalised feed, sign out and sign back in using
                    the &quot;Continue with GitHub&quot; option.
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Sign in with GitHub to get a personalised feed.
                </p>
              )}
            </div>
          </section>

          {/* Slideshow Settings */}
          <section className="mb-8">
            <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Slideshow
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Voiceover"
                description="Start slideshows with text-to-speech already turned on"
                checked={settings.autoplayVoiceover}
                onChange={(v) => update({ autoplayVoiceover: v })}
              />
              <Toggle
                label="Background Music"
                description="Play ambient music during slideshows"
                checked={settings.backgroundMusic}
                onChange={(v) => update({ backgroundMusic: v })}
              />
              <Toggle
                label="Auto-loop"
                description="Restart slideshow when it reaches the end"
                checked={settings.autoLoop}
                onChange={(v) => update({ autoLoop: v })}
              />

              {/* Speed */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">
                      Slide Speed
                    </p>
                    <p className="text-gray-500 text-xs">
                      Adjust how long each slide displays
                    </p>
                  </div>
                  <span className="text-white text-sm font-mono bg-white/10 px-2 py-0.5 rounded">
                    {settings.slideDurationMultiplier}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.25}
                  value={settings.slideDurationMultiplier}
                  onChange={(e) =>
                    update({ slideDurationMultiplier: parseFloat(e.target.value) })
                  }
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Faster</span>
                  <span>Slower</span>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                saved
                  ? "bg-green-600 text-white"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {saved ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </span>
              ) : (
                "Save Settings"
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl font-semibold text-sm bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Toggle component ---- */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 text-left transition-colors hover:bg-white/[0.07]"
    >
      <div className="pr-4">
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-white/20"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
    </button>
  );
}
