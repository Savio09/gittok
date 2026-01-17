"use client";

import { signIn } from "next-auth/react";
import { Github, TrendingUp, Users, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to GitTok
          </h1>
          <p className="text-gray-400 text-lg">
            Discover GitHub repos like never before
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-white">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Personalized Feed</h3>
              <p className="text-gray-400 text-sm">
                See repos starred and created by developers you follow
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-white">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Network Activity</h3>
              <p className="text-gray-400 text-sm">
                Discover what&apos;s trending in your GitHub network
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-white">
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-Generated Videos</h3>
              <p className="text-gray-400 text-sm">
                Watch stunning AI videos showcasing each repository
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-white">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Trending Content</h3>
              <p className="text-gray-400 text-sm">
                Explore the hottest repositories across GitHub
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 mb-4"
        >
          <Github className="w-6 h-6" />
          Sign in with GitHub
        </button>

        {/* Continue as Guest */}
        <Link
          href="/"
          className="block text-center text-gray-400 hover:text-white transition-colors"
        >
          Continue as guest
        </Link>

        {/* Privacy Note */}
        <p className="text-gray-600 text-xs text-center mt-8">
          We only request read access to your public GitHub data.
          <br />
          Your data is never stored or shared.
        </p>
      </div>
    </div>
  );
}
