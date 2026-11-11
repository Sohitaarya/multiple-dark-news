import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

export const AiSearchStudio: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; url: string; snippet?: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQueries = [
    'WebAssembly performance and security architecture',
    'Search Engine Optimization ranking algorithms and core vitals',
    'Cryptography hash functions SHA-256 and public key infrastructure',
    'Renewable solar energy generation benchmarks'
  ];

  // 100% Free Public Web Knowledge Query (No API Key Required!)
  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) {
      setError('Please enter a research topic to search.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      // 1. Query Wikipedia Free API for rich structured summary & verified citations
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q.trim())}&format=json&origin=*`;
      const res = await fetch(wikiUrl);
      const data = await res.json();

      const searchHits = data.query?.search || [];

      if (searchHits.length === 0) {
        setAnswer(`No exact encyclopedic records found for "${q}". Try broader terms like SEO, WebAssembly, or Cryptography.`);
        return;
      }

      const topHits = searchHits.slice(0, 5);
      const mainSummary = topHits[0].snippet.replace(/<\/?[^>]+(>|$)/g, '');

      // Fetch lead extract of top hit
      let leadText = '';
      try {
        const pageRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(topHits[0].title)}&format=json&origin=*`
        );
        const pageData = await pageRes.json();
        const pages = pageData.query?.pages || {};
        const firstPageId = Object.keys(pages)[0];
        if (firstPageId && pages[firstPageId]?.extract) {
          leadText = pages[firstPageId].extract;
        }
      } catch {
        // fallback to snippet
      }

      setAnswer(
        leadText || `${mainSummary}...\n\nAdditional Verified Findings:\n${topHits.slice(1).map((h: any, idx: number) => `${idx + 1}. ${h.title}: ${h.snippet.replace(/<\/?[^>]+(>|$)/g, '')}`).join('\n\n')}`
      );

      setSources(
        topHits.map((h: any) => ({
          title: h.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/\s+/g, '_'))}`,
          snippet: h.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
        }))
      );
    } catch (err: any) {
      setError(`Search lookup error: ${err.message || 'Network lookup paused'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!answer) return;
    const content = `# Research Report: ${query}\n\n${answer}\n\n## Verified Sources\n${sources.map((s) => `- [${s.title}](${s.url})`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* 100% Free Engine Badge */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-Time Public Web Knowledge • Zero API Key Required • Lifetime ₹0 Free</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Open Knowledge REST Engine
        </span>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <Globe className="w-4 h-4" />
            <span>Search-Grounded Web Knowledge Assistant</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            Real-Time Verified Sources
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search topics, technical concepts, science, history, algorithm specifications..."
            className="w-full pl-11 pr-28 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:border-rose-500 focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/30 flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Research Queries
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition-colors text-left flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-rose-400" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {answer && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Grounded Knowledge Synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMd}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export MD</span>
              </button>
            </div>
          </div>

          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3">
            {answer}
          </div>

          {sources.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Verified Web Sources ({sources.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-200 group transition-all"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block truncate group-hover:text-rose-400 transition-colors">
                        {src.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">
                        {src.url}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
