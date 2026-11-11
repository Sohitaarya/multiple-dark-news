import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SOHIT_AARYA_DATA, ProgressItem } from '../../data/sohitPortfolioData';

export const WorkInProgressSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const progressList = SOHIT_AARYA_DATA.progressList;

  const filteredItems = selectedFilter === 'all'
    ? progressList
    : progressList.filter((item) => item.status.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <section id="progress" className="relative py-28 bg-[#0a0a0a] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF2638]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 05</span>
              <span className="text-neutral-600">/</span>
              <span>LIVE DEVELOPMENT DASHBOARD</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              WORK IN PROGRESS <br />
              <span className="text-[#FF2638]">NOT EVERYTHING IS FINISHED. EVERYTHING IS MOVING.</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            REAL-TIME TRANSPARENCY
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {(['all', 'completed', 'testing', 'in progress'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === status
                  ? 'bg-[#FF2638] text-white shadow-md shadow-[#FF2638]/30'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
              }`}
            >
              {status === 'all' ? 'All Milestones' : status}
            </button>
          ))}
        </div>

        {/* Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#242424] hover:border-[#FF2638]/40 transition-all duration-300 shadow-xl space-y-6"
            >
              {/* Card Header: Category & Status Badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-[#181818] px-2.5 py-1 rounded-lg border border-[#262626]">
                  {item.category}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    item.status === 'Completed'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : item.status === 'Testing'
                      ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{item.status}</span>
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {item.title}
                </h3>
                <div className="text-[11px] font-mono text-neutral-500 mt-1">
                  Last Updated: {item.lastUpdated}
                </div>
              </div>

              {/* Progress Percentage Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Execution Velocity</span>
                  <span className="text-[#FF2638] font-bold">{item.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1c1c1c] overflow-hidden p-0.5 border border-[#2b2b2b]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF2638] to-[#ff4d5e] transition-all duration-1000"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Completed Features */}
              <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed &amp; Deployed:</span>
                </div>
                <div className="space-y-1.5">
                  {item.completedFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features In Development */}
              {item.inDevelopmentFeatures.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Active Development:</span>
                  </div>
                  <div className="space-y-1.5">
                    {item.inDevelopmentFeatures.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <span className="text-amber-400 shrink-0 font-bold">⏳</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Milestone */}
              <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#282828] flex items-center justify-between gap-3 text-xs">
                <span className="text-neutral-400 font-medium">Next Milestone:</span>
                <span className="text-white font-mono font-bold text-right text-[11px] text-[#FF2638]">
                  {item.nextMilestone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
