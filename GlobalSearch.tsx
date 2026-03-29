"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Global Search Bar */}
      <div className="w-full border-b border-[#27272a] bg-[#141414] py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-[#71717a]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all tools... (Movies, News, Tech, Jobs, etc.)"
                className="search-input w-full rounded-xl py-3 pl-12 pr-4 text-sm placeholder:text-[#71717a]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 rounded-full p-1 text-[#71717a] hover:bg-[#27272a] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#e50914] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#b20710]"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </>
  );
}