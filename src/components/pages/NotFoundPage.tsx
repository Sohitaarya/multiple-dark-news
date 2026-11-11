import React, { useState } from 'react';
import { Search, Home, AlertCircle, ArrowRight, Layers, FileText, Image as ImageIcon, Calculator, Code } from 'lucide-react';
import { searchTools, getPopularTools } from '../../data/toolsRegistry';
import { ToolDefinition } from '../../types/tools';

interface NotFoundPageProps {
  onNavigate: (view: string, param?: string) => void;
  requestedSlug?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, requestedSlug }) => {
  const [query, setQuery] = useState(requestedSlug ? requestedSlug.replace(/-/g, ' ') : '');
  const [searchResults, setSearchResults] = useState<ToolDefinition[]>(() => {
    return requestedSlug ? searchTools(requestedSlug).slice(0, 6) : getPopularTools(6);
  });

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      setSearchResults(searchTools(val).slice(0, 6));
    } else {
      setSearchResults(getPopularTools(6));
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 text-center space-y-8 max-w-4xl mx-auto">
      {/* Visual Badge */}
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-950/40 animate-pulse">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
          404 Page Not Found
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tool or Route Not Found
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          The requested page <code className="text-rose-400 bg-slate-900 px-2 py-0.5 rounded font-mono text-xs">/{requestedSlug || ''}</code> does not exist or has been moved. Explore our 331+ free tools below.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search 331+ PDF, Image, Developer, Calculators..."
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-rose-500 transition shadow-inner"
        />
      </div>

      {/* Suggested Tools Grid */}
      <div className="w-full space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
          {query.trim().length > 1 ? 'Matching Tools' : 'Popular Recommended Tools'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {searchResults.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate('tool', tool.slug)}
              className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 rounded-2xl text-left transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-rose-400 transition truncate">
                  {tool.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {tool.description}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                <span className="uppercase text-rose-400">{tool.category}</span>
                <span className="group-hover:translate-x-1 transition-transform">Launch →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800/80 w-full">
        <button
          onClick={() => onNavigate('tools')}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-950/40"
        >
          <Home className="w-4 h-4" />
          <span>Go to 331 Tools Suite</span>
        </button>
        <button
          onClick={() => onNavigate('portfolio')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <span>Sohit Aarya Portfolio</span>
          <ArrowRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
