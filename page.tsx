"use client";

import { useState } from "react";
import { Search, Cpu, ExternalLink, Sparkles, Zap, Smartphone, Laptop, Gamepad2, Watch, Monitor, HardDrive } from "lucide-react";
import PostGenerator from "../../components/PostGenerator";

interface TechProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  specs?: Record<string, string>;
  image?: string;
  url?: string;
}

const techCategories = [
  { id: "all", label: "All Tech", icon: Cpu },
  { id: "laptop", label: "Laptops", icon: Laptop },
  { id: "smartphone", label: "Smartphones", icon: Smartphone },
  { id: "tablet", label: "Tablets", icon: Monitor },
  { id: "storage", label: "Storage", icon: HardDrive },
];

export default function TechPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TechProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState<TechProduct | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchTechResults = async (searchQuery: string) => {
    setLoading(true);
    setError("");
    try {
      let enhancedQuery = searchQuery;
      if (activeCategory !== "all") {
        enhancedQuery = `${searchQuery} ${activeCategory}`;
      }
      
      const response = await fetch(`/api/tech?q=${encodeURIComponent(enhancedQuery)}`);
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Format TechSpecs API response
        const formattedProducts = data.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.product?.name || item.name || "Unknown Product",
          brand: item.product?.brand || item.brand || "Unknown Brand",
          category: item.product?.category || item.category || activeCategory,
          description: item.product?.description || item.description || "No description available",
          specs: item.specs || item.specifications || {},
          image: item.product?.image || item.image,
          url: item.product?.url || item.url,
        }));
        setResults(formattedProducts);
      } else if (data.error) {
        setError(data.error);
        // Fallback to search API
        fallbackSearch(enhancedQuery);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError("Failed to fetch tech results");
      fallbackSearch(searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const fallbackSearch = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=tech`);
      const data = await response.json();
      if (data.items) {
        const formatted = data.items.map((item: any) => ({
          id: item.link,
          name: item.title,
          brand: "Various",
          category: activeCategory,
          description: item.snippet,
          url: item.link,
        }));
        setResults(formatted);
      }
    } catch (e) {
      console.error("Fallback search failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchTechResults(query.trim());
    }
  };

  const openPost = (result: TechProduct) => {
    setSelectedResult(result);
    setPostOpen(true);
  };

  const getImageFromResult = (result: TechProduct) => {
    return result.image;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-purple-500">
              <Cpu className="h-5 w-5" />
              <span className="text-sm font-medium">Tech Explorer</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Discover Latest Technology
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#a1a1aa]">
              Search for gadgets, devices, reviews, and tech news. Find specifications and generate informative posts.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tech products, reviews, specs... (e.g., iPhone 16, RTX 4090)"
                className="search-input w-full rounded-xl py-4 pl-12 pr-32 text-base placeholder:text-[#71717a]"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
            {techCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-purple-600 text-white"
                      : "bg-[#141414] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#27272a] border-t-purple-600"></div>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{query}"
                </h2>
                <span className="text-[#71717a]">{results.length} results found</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#27272a] bg-[#141414] transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  {/* Image */}
                  {getImageFromResult(result) && (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={getImageFromResult(result)}
                        alt={result.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs text-[#71717a]">
                      <Zap className="h-3 w-3 text-purple-500" />
                      <span className="truncate">{result.brand}</span>
                    </div>

                    <h3 
                      className="mb-3 line-clamp-2 text-lg font-semibold text-white group-hover:text-purple-400 cursor-pointer"
                      onClick={() => openPost(result)}
                    >
                      {result.name}
                    </h3>

                    <p 
                      className="mb-4 line-clamp-3 flex-1 text-sm text-[#a1a1aa] cursor-pointer"
                      onClick={() => openPost(result)}
                    >
                      {result.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                      <button
                        onClick={() => openPost(result)}
                        className="flex items-center gap-2 text-sm font-medium text-purple-500 hover:text-purple-400"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate Post
                      </button>
                      {result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-[#71717a] hover:text-white"
                        >
                          Visit
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.length === 0 && !loading && !error && (
              <div className="py-20 text-center">
                <Cpu className="mx-auto mb-4 h-16 w-16 text-[#27272a]" />
                <h3 className="text-xl font-semibold text-white">Start Exploring Tech</h3>
                <p className="mt-2 text-[#71717a]">Search for your favorite tech products and news</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {["iPhone 16", "RTX 4090", "MacBook Pro", "PlayStation 5", "Samsung Galaxy"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        fetchTechResults(term);
                      }}
                      className="rounded-lg bg-[#141414] border border-[#27272a] px-4 py-2 text-sm text-[#a1a1aa] hover:border-purple-500 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Generator Modal */}
      {selectedResult && (
        <PostGenerator
          isOpen={postOpen}
          onClose={() => {
            setPostOpen(false);
            setSelectedResult(null);
          }}
          title={selectedResult.name}
          content={selectedResult.description}
          image={getImageFromResult(selectedResult)}
          category="Technology"
          metadata={{
            "Brand": selectedResult.brand,
            "Category": selectedResult.category,
            "URL": selectedResult.url,
            ...(selectedResult.specs || {}),
          }}
        />
      )}
    </div>
  );
}