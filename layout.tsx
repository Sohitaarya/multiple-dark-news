import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import GlobalSearch from "./components/GlobalSearch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multiple Dark News - Your Ultimate Information Hub",
  description: "Access multiple tools including Movies, Tech, Automobile, Jobs, Results Checker, and News - all in one dark-themed platform.",
  keywords: "movies, tech news, automobiles, jobs, results, news, search tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <GlobalSearch />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#27272a] bg-[#0a0a0a] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold gradient-text">Multiple Dark News</span>
              </div>
              <p className="text-sm text-[#71717a]">
                © 2026 Multiple Dark News. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="/tools/movies" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Movies</a>
                <a href="/tools/news" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">News</a>
                <a href="/tools/tech" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Tech</a>
                <a href="/tools/jobs" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Jobs</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
