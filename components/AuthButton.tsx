"use client";

import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Github, LogOut } from "lucide-react";

export default function AuthButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2">
            <Github className="w-5 h-5" />
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
          <SignOutButton redirectUrl="/">
            <button className="px-3 py-1.5 text-white/60 hover:text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </SignOutButton>
        </div>
      </SignedIn>
    </>
  );
}
