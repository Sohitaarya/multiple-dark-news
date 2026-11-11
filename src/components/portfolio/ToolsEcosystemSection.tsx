import React from 'react';
import {
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

interface ToolsEcosystemSectionProps {
  onOpenTool: (slug: string) => void;
  onOpenCategory: (categoryId: string) => void;
  onNavigateToolsFull: () => void;
}

export const ToolsEcosystemSection: React.FC<ToolsEcosystemSectionProps> = ({
  onOpenCategory,
  onNavigateToolsFull
}) => {
  return (
    <section id="tools-ecosystem" className="relative py-28 bg-[#0a0a0a] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF2638]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2638] animate-ping" />
              <span>SECTION 03</span>
              <span className="text-neutral-600">/</span>
              <span>IN-BROWSER UTILITY SUITE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              331 TOOLS. <span className="text-[#FF2638]">ONE DIGITAL ECOSYSTEM.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs font-mono text-emerald-400 font-bold">
              331/331 VERIFIED PRODUCTION READY
            </span>
          </div>
        </div>

        {/* Hero Ecosystem Showcase Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#14080a] via-[#101010] to-[#080808] border-2 border-[#FF2638]/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2638]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FF2638] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#FF2638]" />
                <span>100% Client-Side In-Memory Execution • Zero Server Uploads</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                Lightning-Fast Utilities Powered By <span className="text-[#FF2638]">WebAssembly &amp; Canvas</span>
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl font-medium">
                Sohit Aarya’s 331-tool ecosystem delivers high-performance utilities across 12 distinct categories—from PDF compression and image conversion to developer JSON formatting and SEO audits. Everything runs locally in your browser memory.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-[#262626] text-xs font-mono text-neutral-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>0% Data Retention</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-[#262626] text-xs font-mono text-neutral-300">
                  <Zap className="w-4 h-4 text-[#FF2638]" />
                  <span>Instant Execution</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <button
                onClick={onNavigateToolsFull}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#b30012] hover:from-[#ff3d4e] hover:to-[#cc0016] shadow-xl shadow-[#FF2638]/40 hover:shadow-[#FF2638]/60 transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-95"
              >
                <Wrench className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                <span>LAUNCH 331 TOOLS SUITE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 12 Category Hub Cards Grid (Clean, Professional Ecosystem Navigation) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white font-bold uppercase tracking-widest">
              Explore By Category ({CATEGORIES.length} Suites):
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Click any suite to open category directory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onOpenCategory(cat.id)}
                className="group p-5 rounded-2xl bg-[#111111] hover:bg-[#161616] border border-[#222222] hover:border-[#FF2638]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#FF2638]/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#FF2638]/10 text-[#FF2638] border border-[#FF2638]/20 font-bold uppercase tracking-wider">
                      {cat.toolCount} TOOLS
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] border border-[#2b2b2b] group-hover:border-[#FF2638]/40 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Wrench className="w-4 h-4 text-[#FF2638]" />
                    </div>
                  </div>

                  <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-[#FF2638] transition-colors mb-1">
                    {cat.name}
                  </h4>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-medium">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1c1c1c] flex items-center justify-between text-xs font-bold text-[#FF2638] group-hover:text-white transition-colors">
                  <span>Open Suite</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner to Full Directory */}
        <div className="text-center pt-6">
          <button
            onClick={onNavigateToolsFull}
            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-neutral-200 hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-[#2b2b2b] hover:border-[#FF2638] transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>View All 331 Verified Online Tools in Master Directory</span>
            <ExternalLink className="w-4 h-4 text-[#FF2638]" />
          </button>
        </div>
      </div>
    </section>
  );
};
