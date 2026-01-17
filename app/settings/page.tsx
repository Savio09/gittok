"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { VideoProvider } from "@/lib/videoGeneration";
import { Settings, Film, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>("veo");
  const [saved, setSaved] = useState(false);

  const providers = [
    {
      id: "veo" as VideoProvider,
      name: "Google Veo",
      description: "Next-gen video generation with 4K support",
      status: "active",
      color: "from-blue-600 to-cyan-600",
      features: ["4K Resolution", "Audio Generation", "Advanced Physics"],
    },
    {
      id: "nano-banana" as VideoProvider,
      name: "Nano Banana",
      description: "Studio-quality videos with character consistency",
      status: "available",
      color: "from-yellow-600 to-orange-600",
      features: ["Fast Generation", "Multi-scene", "Commercial Rights"],
    },
    {
      id: "runway" as VideoProvider,
      name: "Runway ML Gen-4",
      description: "High-quality AI video generation",
      status: "available",
      color: "from-purple-600 to-pink-600",
      features: ["10s Clips", "1080p", "Professional Quality"],
    },
    {
      id: "sora" as VideoProvider,
      name: "OpenAI Sora",
      description: "Advanced text-to-video generation",
      status: "limited",
      color: "from-green-600 to-emerald-600",
      features: ["Photorealistic", "Long Videos", "High Quality"],
    },
    {
      id: "mock" as VideoProvider,
      name: "Mock (Development)",
      description: "Demo videos for testing",
      status: "active",
      color: "from-gray-600 to-gray-700",
      features: ["Free", "Instant", "No Setup"],
    },
  ];

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("videoProvider", selectedProvider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Settings</h1>
            <p className="text-gray-400 text-lg">
              Configure your AI video generation provider
            </p>
          </div>

          {/* Current Provider Status */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Film className="w-6 h-6 text-blue-400" />
              <h2 className="text-white font-semibold text-xl">
                Current Provider
              </h2>
            </div>
            <p className="text-gray-300 mb-4">
              {providers.find((p) => p.id === selectedProvider)?.name} is
              selected for video generation
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Active and ready</span>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-4 mb-8">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  selectedProvider === provider.id
                    ? "border-white bg-white/10"
                    : "border-white/10 bg-black/30 hover:border-white/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-lg flex items-center justify-center`}
                      >
                        <Film className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {provider.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {selectedProvider === provider.id ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-500 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  {provider.status === "active" && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Ready to use
                    </span>
                  )}
                  {provider.status === "available" && (
                    <span className="text-xs text-blue-400">
                      API key required
                    </span>
                  )}
                  {provider.status === "limited" && (
                    <span className="text-xs text-orange-400">
                      Limited availability
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* API Key Info */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🔑</span> API Configuration
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              To use {providers.find((p) => p.id === selectedProvider)?.name},
              add your API key to{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-purple-300">
                .env.local
              </code>
            </p>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
              {selectedProvider === "veo" && (
                <>NEXT_PUBLIC_GOOGLE_VEO_API_KEY=AIzaSyAndNhTX8PAhxdECBLapEfoVzoO-E0_pko</>
              )}
              {selectedProvider === "nano-banana" && (
                <>NEXT_PUBLIC_NANO_BANANA_API_KEY=your_key_here</>
              )}
              {selectedProvider === "runway" && (
                <>NEXT_PUBLIC_RUNWAY_API_KEY=your_key_here</>
              )}
              {selectedProvider === "sora" && (
                <>NEXT_PUBLIC_OPENAI_API_KEY=sk-your_key_here</>
              )}
              {selectedProvider === "mock" && (
                <>
                  # No API key needed
                  <br />
                  # Mock provider is always available
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Saved!
              </span>
            ) : (
              "Save Settings"
            )}
          </button>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Changes take effect on next video generation
            <br />
            Visit{" "}
            <a href="/video" className="text-blue-400 hover:underline">
              /video
            </a>{" "}
            to see AI-generated videos
          </p>
        </div>
      </div>
    </>
  );
}

