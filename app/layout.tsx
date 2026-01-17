import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "GitTok - Discover GitHub Repos",
  description: "TikTok-style exploration of trending GitHub repositories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0a0a0a",
          colorText: "#ffffff",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
          card: "bg-gray-900 border-gray-800",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-gray-800 border-gray-700 text-white",
          footerActionLink: "text-purple-400 hover:text-purple-300",
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

