"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  Newspaper,
  Cpu,
  Car,
  Briefcase,
  Award,
  Menu,
  X,
  Home,
  Bookmark,
} from "lucide-react";

const tools = [
  { id: "home", name: "Home", path: "/", icon: Home },
  { id: "movies", name: "Movies", path: "/tools/movies", icon: Film },
  { id: "news", name: "News", path: "/tools/news", icon: Newspaper },
  { id: "tech", name: "Tech", path: "/tools/tech", icon: Cpu },
  { id: "automobile", name: "Automobile", path: "/tools/automobile", icon: Car },
  { id: "jobs", name: "Jobs", path: "/tools/jobs", icon: Briefcase },
  { id: "results", name: "Results", path: "/tools/results", icon: Award },
  { id: "posts", name: "Saved Posts", path: "/posts", icon: Bookmark },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">Multiple Dark News</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname === tool.path || pathname.startsWith(`${tool.path}/`);
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#e50914] text-white"
                      : "text-[#a1a1aa] hover:bg-[#141414] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tool.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#a1a1aa] hover:bg-[#141414] hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#27272a] py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname === tool.path || pathname.startsWith(`${tool.path}/`);
                return (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#e50914] text-white"
                        : "text-[#a1a1aa] hover:bg-[#141414] hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}