import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Grid,
  FileText,
  Image as ImageIcon,
  Shield,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Sliders,
  FileCode,
  Activity,
  Layers,
  Code2
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { searchTools } from '../../data/toolsRegistry';
import { ToolDefinition } from '../../types/tools';
import { adminAuthService } from '../../services/adminAuthService';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ToolDefinition[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => adminAuthService.isAuthenticated());

  useEffect(() => {
    setIsAdmin(adminAuthService.isAuthenticated());
  }, [currentView]);

  // Global Owner Shortcut: Ctrl+Shift+A or Cmd+Shift+A opens Admin Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onNavigate('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const searchRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setSearchResults(searchTools(searchQuery).slice(0, 8));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolSelect = (slug: string) => {
    onNavigate('tool', slug);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const handleCategorySelect = (catSlug: string) => {
    onNavigate('category', catSlug);
    setIsCatDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none whitespace-nowrap"
              aria-label="MultipleDarkNews Tools Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <span className="font-extrabold text-white text-base tracking-wider">MD</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-sm xl:text-base tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                  MultipleDarkNews <span className="text-rose-500 font-black">TOOLS</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide whitespace-nowrap">
                  331 FREE PRIVACY-FIRST TOOLS
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar - Center */}
          <div ref={searchRef} className="relative flex-1 min-w-[180px] max-w-xs xl:max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search 331 tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Tools ({searchResults.length})
                </div>
                {searchResults.map((tool, idx) => (
                  <button
                    key={`${tool.id}-${idx}`}
                    onClick={() => handleToolSelect(tool.slug)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-800/80 text-left transition-colors border-b border-slate-800/40 last:border-0"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-rose-400 mt-0.5">
                      {tool.category === 'pdf' ? <FileText className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white flex items-center justify-between">
                        <span>{tool.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-0.5 shrink-0 whitespace-nowrap">
            
            {/* Category Dropdown */}
            <div ref={catRef} className="relative">
              <button
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                aria-expanded={isCatDropdownOpen}
              >
                <Grid className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 grid grid-cols-1 gap-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    All 12 Tool Categories
                  </div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors group"
                    >
                      <span className="text-sm font-medium text-slate-200 group-hover:text-rose-400 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {cat.toolCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <button
              onClick={() => onNavigate('category', 'pdf')}
              className={`px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${currentView === 'category' ? 'text-rose-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              PDF Tools
            </button>

            <button
              onClick={() => onNavigate('category', 'image')}
              className="px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap"
            >
              Image Tools
            </button>

            <button
              onClick={() => onNavigate('sitemap')}
              className="px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Sitemap &amp; SEO</span>
            </button>

            <button
              onClick={() => onNavigate('audit')}
              className="px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Audit</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                title="Admin Mode Active (Ctrl+Shift+A)"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('integration')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-950/40 transition-all flex items-center gap-1.5 ml-1 whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5 shrink-0" />
              <span>Add to Website</span>
            </button>
          </div>

          {/* Right Action: Portfolio & Parent Site Links */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 border border-rose-500/60 shadow-md shadow-rose-950/60 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Sohit Aarya Portfolio</span>
            </button>

            <a
              href="https://multipledarknews.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors whitespace-nowrap"
            >
              <span>multipledarknews.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
              />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className="px-3 py-2 text-xs font-medium text-left bg-slate-900/60 hover:bg-slate-800 rounded-lg text-slate-200 border border-slate-800/80 flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400">{cat.toolCount}</span>
                </button>
              ))}
            </div>

            <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-2 border-t border-slate-800`}>
              <button
                onClick={() => { onNavigate('sitemap'); setIsMobileMenuOpen(false); }}
                className="py-2 text-xs font-semibold bg-slate-900 rounded-lg text-rose-400 border border-slate-800 text-center"
              >
                Sitemap & SEO
              </button>
              <button
                onClick={() => { onNavigate('audit'); setIsMobileMenuOpen(false); }}
                className="py-2 text-xs font-semibold bg-slate-900 rounded-lg text-slate-300 border border-slate-800 text-center"
              >
                Audit Report
              </button>
              {isAdmin && (
                <button
                  onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                  className="py-2 text-xs font-semibold bg-amber-950/60 rounded-lg text-amber-400 border border-amber-800 text-center flex items-center justify-center gap-1"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Admin</span>
                </button>
              )}
            </div>

            <div className="pt-1 space-y-2">

              <button
                onClick={() => { onNavigate('integration'); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 text-center flex items-center justify-center gap-2 shadow-md"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Add to Your Website (Integration Guide)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
