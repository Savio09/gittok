"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Github } from "lucide-react";

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
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10"
            }
          }}
        />
      </SignedIn>
    </>
  );
}
