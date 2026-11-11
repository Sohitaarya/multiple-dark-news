import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  Type,
  Calculator,
  ArrowRightLeft,
  Search,
  ShieldCheck,
  GraduationCap,
  Share2,
  Video,
  Headphones,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  Flame,
  Globe,
  Layers,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { ToolCategory } from '../../types/tools';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

const CATEGORY_ICON_MAP: Record<ToolCategory, React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  developer: Code,
  text: Type,
  calculator: Calculator,
  'unit-converter': ArrowRightLeft,
  seo: Search,
  security: ShieldCheck,
  education: GraduationCap,
  'social-media': Share2,
  video: Video,
  audio: Headphones,
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate('category', 'pdf');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Official MultipleDarkNews.com & Sohit Aarya Creator Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div
          onClick={() => onNavigate('portfolio')}
          className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14080a] via-[#1c0d10] to-[#0d0708] border-2 border-[#FF2638]/60 hover:border-[#FF2638] shadow-[0_0_50px_rgba(255,38,56,0.3)] hover:shadow-[0_0_70px_rgba(255,38,56,0.5)] transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2638]/12 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF2638] to-[#990011] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#FF2638]/50 shrink-0 group-hover:scale-105 transition-transform">
                SA
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2638]/20 text-[#FF2638] font-mono text-[11px] font-bold uppercase tracking-wider border border-[#FF2638]/30">
                  <span className="w-2 h-2 rounded-full bg-[#FF2638] animate-ping" />
                  <span>OFFICIAL FOUNDER &amp; PORTFOLIO</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 justify-center md:justify-start">
                  <span>Sohit Aarya — Developer &amp; Creator</span>
                  <span className="text-[#FF2638]">///</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 font-medium">
                  Explore the official 3D personal portfolio website, 331 tools ecosystem, and tech creations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://multipledarknews.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#333333] hover:border-[#FF2638]/60 transition-all flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-[#FF2638]" />
                <span>MultipleDarkNews.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('portfolio');
                }}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#b30012] hover:from-[#ff3d4e] hover:to-[#cc0016] shadow-xl shadow-[#FF2638]/40 transition-all flex items-center gap-2 shrink-0 group-hover:scale-105 cursor-pointer"
              >
                <span>OPEN PORTFOLIO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hero Interactive Command Center */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-[#FF2638]/12 blur-[140px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] border border-[#262626] text-xs font-mono font-bold text-[#FF2638] mb-6 shadow-xl">
          <Sparkles className="w-4 h-4 text-[#FF2638]" />
          <span>MULTIPLEDARKNEWS ECOSYSTEM • 331 IN-BROWSER TOOLS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight">
          331 FREE &amp; PRIVATE <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#FF2638]">
            ONLINE TOOLS
          </span> SUITE
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud upload. 100% private and free forever.
        </p>

        {/* Quick Search Bar */}
        <div className="mt-8 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search e.g. 'Compress PDF', 'Resize Image', 'JSON Formatter'..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="w-full pl-5 pr-32 py-4 bg-[#111111] border border-[#2a2a2a] focus:border-[#FF2638] rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none shadow-2xl transition-colors font-medium"
            />
            <button
              type="submit"
              onClick={() => {
                if (heroSearch.trim()) onNavigate('tool', 'pdf-compressor');
              }}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-gradient-to-r from-[#FF2638] to-[#cc0016] hover:from-[#ff3d4e] hover:to-[#e6001a] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#FF2638]/40 transition-all cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Category Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono">
            <span className="font-bold text-neutral-500 flex items-center gap-1 uppercase">
              <Flame className="w-3.5 h-3.5 text-[#FF2638]" /> Top Suites:
            </span>
            {[
              { label: 'PDF Suite', slug: 'pdf' },
              { label: 'Image Suite', slug: 'image' },
              { label: 'Developer Suite', slug: 'developer' },
              { label: 'SEO Suite', slug: 'seo' },
              { label: 'Calculators', slug: 'calculator' },
              { label: 'Converters', slug: 'unit-converter' }
            ].map((tag) => (
              <button
                key={tag.slug}
                onClick={() => onNavigate('category', tag.slug)}
                className="px-3 py-1 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white border border-[#262626] hover:border-[#FF2638]/50 transition-colors font-bold uppercase"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 12 Master Category Hub Cards Grid (No redundant individual tool clutter below) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#222222] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FF2638] font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>ORGANIZED CATEGORY DIRECTORY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              12 DIGITAL TOOL SUITES
            </h2>
          </div>
          <a
            href="https://multipledarknews.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Powered by MultipleDarkNews.com</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FF2638]" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.id] || Layers;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', cat.slug)}
                className="p-6 rounded-3xl bg-[#111111] border border-[#222222] hover:border-[#FF2638]/60 hover:bg-[#161616] text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#FF2638]/15 cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] text-[#FF2638] flex items-center justify-center border border-[#2b2b2b] group-hover:scale-110 group-hover:bg-[#FF2638] group-hover:text-white transition-all shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#181818] text-[#FF2638] border border-[#262626] uppercase">
                      {cat.toolCount} TOOLS
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-white uppercase tracking-tight group-hover:text-[#FF2638] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mt-1.5 line-clamp-2 font-medium">
                      {cat.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f1f1f] flex items-center justify-between text-xs font-bold text-[#FF2638] group-hover:text-white transition-colors">
                  <span>Open Category Suite</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Official MultipleDarkNews Publishing Hub Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#12080a] via-[#0e0e0e] to-[#080808] border-2 border-[#FF2638]/40 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#2e2e2e] text-xs font-mono text-[#FF2638] font-bold uppercase">
                <Globe className="w-4 h-4 text-[#FF2638]" />
                <span>OFFICIAL PUBLISHING &amp; MEDIA ECOSYSTEM</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                MULTIPLEDARKNEWS.COM
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-medium max-w-2xl">
                MultipleDarkNews is the flagship digital news, technology analysis, and media publication founded by Sohit Aarya. Connecting readers worldwide with technology insights, digital product breakdowns, and instant in-browser software tools.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-xs font-mono text-neutral-300">
                  Global Reader Network
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-xs font-mono text-neutral-300">
                  Tech News &amp; Tutorials
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-xs font-mono text-neutral-300">
                  331 Tools Suite Sync
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <a
                href="https://multipledarknews.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#b30012] hover:from-[#ff3d4e] hover:to-[#cc0016] shadow-xl shadow-[#FF2638]/40 transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-95"
              >
                <span>VISIT MULTIPLEDARKNEWS.COM</span>
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Security & Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#101010] border border-[#222222] grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF2638]/10 text-[#FF2638] flex items-center justify-center font-bold border border-[#FF2638]/30">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Browser-Isolated Sandbox</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Your confidential documents and photos never touch cloud servers. Everything is processed locally in WebAssembly and HTML5 Canvas sandboxes.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Strict ₹0 Budget Guarantee</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              No hidden fees, no subscriptions, no paywalls, and no credit card required. Free and open source client libraries power all 331 tools.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold border border-sky-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Zero Watermarks or Ads</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Downloads are clean, original, and unwatermarked. Perfect for official government filings, university submissions, and commercial work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
