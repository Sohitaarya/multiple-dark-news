import React from 'react';
import {
  Calendar,
  Sparkles,
  Rocket,
  Milestone,
  CheckCircle2,
  Flag,
  ArrowRight
} from 'lucide-react';
import { SOHIT_AARYA_DATA, TimelineMilestone } from '../../data/sohitPortfolioData';

export const MyJourneySection: React.FC = () => {
  const milestones = SOHIT_AARYA_DATA.journey;

  return (
    <section id="journey" className="relative py-28 bg-[#0a0a0a] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#FF2638]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 07</span>
              <span className="text-neutral-600">/</span>
              <span>EVOLUTION &amp; MILESTONES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              MY <span className="text-[#FF2638]">JOURNEY</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            2023 — 2026 ROADMAP
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-[#242424] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {milestones.map((item, index) => {
            const isRoadmap = item.type === 'ROADMAP';

            return (
              <div key={index} className="relative group">
                {/* Timeline Marker Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full border-4 border-[#0a0a0a] transition-all duration-300 group-hover:scale-125 ${
                    isRoadmap
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/30'
                      : 'bg-[#FF2638] shadow-lg shadow-[#FF2638]/40'
                  }`}
                />

                {/* Milestone Content Box */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#242424] hover:border-[#FF2638]/40 transition-all duration-300 shadow-xl space-y-4">
                  {/* Top Bar: Year & Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black font-mono text-white bg-[#1c1c1c] px-3 py-1 rounded-xl border border-[#2e2e2e]">
                        {item.year}
                      </span>
                      <span className="text-xs font-mono text-[#FF2638] font-bold">
                        {item.quarter}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold ${
                        isRoadmap
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-[#181818] text-neutral-300 border border-[#292929]'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#FF2638] transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-400 mt-0.5">
                      {item.tagline}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {/* Key Achievements Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
                    <div className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider">
                      Key Highlights:
                    </div>
                    <div className="space-y-1.5">
                      {item.keyAchievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2638] shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
