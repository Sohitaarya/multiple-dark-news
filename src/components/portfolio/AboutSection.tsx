import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Code2,
  Sparkles,
  Zap,
  Target,
  Compass,
  CheckCircle2,
  Terminal,
  Database,
  Crosshair,
  Activity,
  Radio
} from 'lucide-react';
import { SOHIT_AARYA_DATA } from '../../data/sohitPortfolioData';

export const AboutSection: React.FC = () => {
  const { about, stats, roles } = SOHIT_AARYA_DATA;

  return (
    <section id="about" className="relative py-28 bg-[#0a0a0a] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-96 h-96 bg-[#FF2638]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-[#FF2638]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header with Number Tag */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2638] animate-ping" />
              <span>SECTION {about.sectionNumber}</span>
              <span className="text-neutral-600">/</span>
              <span>IDENTITY &amp; FOUNDATION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              WHO IS <span className="text-[#FF2638]">SOHIT AARYA?</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF2638] animate-pulse" />
            <span>DIGITAL FOUNDER • TOOL ARCHITECT</span>
          </div>
        </div>

        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: 3D Holographic Telemetry Terminal & Live Metrics HUD (NO DUPLICATE PHOTO) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#14080a] to-[#0a0a0a] p-5 sm:p-6 border-2 border-[#FF2638]/40 shadow-[0_0_40px_rgba(255,38,56,0.2)] overflow-hidden group">
              {/* Laser Scanline Beam Sweeping */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF2638] to-transparent animate-scanline pointer-events-none" />

              {/* Terminal Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2a1215] mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF2638] animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF2638]">
                    SYSTEM TELEMETRY
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  ID: SOHIT-CORE-331
                </div>
              </div>

              {/* 3D Cyber Radar Hologram */}
              <div className="relative py-8 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-[#FF2638]/30 flex items-center justify-center">
                  {/* Concentric Radar Rings */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-[#FF2638]/40 animate-radar-sweep" />
                  <div className="absolute inset-10 rounded-full border border-[#FF2638]/20" />
                  <div className="absolute inset-16 rounded-full border border-dotted border-[#FF2638]/50" />

                  {/* Target Crosshairs */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-[#FF2638]/30" />
                    <div className="absolute h-full w-px bg-[#FF2638]/30" />
                  </div>

                  {/* Center Core Badge */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF2638] to-[#990011] flex flex-col items-center justify-center text-white shadow-xl shadow-[#FF2638]/50 animate-pulse">
                    <Cpu className="w-7 h-7" />
                    <span className="text-[9px] font-mono font-bold mt-1">SA CORE</span>
                  </div>

                  {/* Orbiting Tech Node 1 */}
                  <div className="absolute top-2 left-6 px-2 py-0.5 rounded bg-black/80 border border-[#FF2638]/60 text-[9px] font-mono text-white animate-float-slow">
                    331 TOOLS
                  </div>

                  {/* Orbiting Tech Node 2 */}
                  <div className="absolute bottom-3 right-4 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/60 text-[9px] font-mono text-emerald-400 animate-float-reverse">
                    0ms UPLOAD
                  </div>
                </div>

                {/* Live Equalizer Activity Waveform */}
                <div className="mt-6 w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/60 border border-[#221013]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300">
                    <Activity className="w-4 h-4 text-[#FF2638] animate-pulse" />
                    <span>CLIENT LATENCY:</span>
                  </div>
                  <div className="flex items-end gap-1 h-4">
                    <div className="w-1 bg-[#FF2638] rounded-full animate-eq-1" />
                    <div className="w-1 bg-[#FF2638] rounded-full animate-eq-2" />
                    <div className="w-1 bg-[#FF2638] rounded-full animate-eq-3" />
                    <div className="w-1 bg-[#FF2638] rounded-full animate-eq-4" />
                    <div className="w-1 bg-[#FF2638] rounded-full animate-eq-1" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">&lt; 1.2ms</span>
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#222222] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs text-neutral-300">
                  <span className="font-bold text-white uppercase block">Zero-Retention Architecture</span>
                  All 331 tools run 100% inside visitor browser memory. No server uploads.
                </div>
              </div>
            </div>

            {/* 4 Stats Counters */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#121212] border border-[#222222] hover:border-[#FF2638]/40 transition-colors text-center group">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform">
                    <span className="text-[#FF2638]">{stat.value}</span>
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Biography, Philosophy, Pillars, Skills */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-snug">
                Turning Technical Curiosity Into <span className="text-[#FF2638]">Working Digital Utility</span>
              </h3>
              <p className="text-base text-neutral-300 leading-relaxed font-medium">
                {about.intro}
              </p>
              {about.paragraphs.map((para, i) => (
                <p key={i} className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* 3 Core Philosophical Pillars */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono text-[#FF2638] uppercase tracking-widest font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF2638]" />
                <span>CORE ARCHITECTURAL PILLARS:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {about.pillars.map((pillar, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FF2638]/50 hover:shadow-[0_0_20px_rgba(255,38,56,0.2)] transition-all">
                    <div className="w-7 h-7 rounded-lg bg-[#FF2638]/10 text-[#FF2638] flex items-center justify-center mb-2.5 font-mono text-xs font-black">
                      0{i + 1}
                    </div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      {pillar.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 leading-relaxed">
                      {pillar.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stacks Grid */}
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white uppercase tracking-widest font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#FF2638]" />
                  <span>Technical Expertise &amp; Tooling Stack</span>
                </span>
                <span className="text-[10px] font-mono text-[#FF2638] bg-[#FF2638]/10 px-2 py-0.5 rounded border border-[#FF2638]/20">
                  Verified In Codebase
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Frontend &amp; Interactive Graphics:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {about.skills.frontend.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono text-neutral-200 bg-[#1c1c1c] border border-[#2c2c2c] hover:border-[#FF2638]/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Client Engines, WebAssembly &amp; APIs:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {about.skills.backendAndTools.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono text-[#FF2638] bg-[#FF2638]/10 border border-[#FF2638]/20 font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Programmatic SEO &amp; Indexation:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {about.skills.digitalAndSEO.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono text-neutral-300 bg-[#171717] border border-[#262626]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
