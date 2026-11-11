import React, { useState } from 'react';
import {
  Globe,
  Layout,
  Cpu,
  Zap,
  Search,
  Box,
  Binary,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Code2
} from 'lucide-react';
import { SOHIT_AARYA_DATA, ServiceItem } from '../../data/sohitPortfolioData';

const ICONS_MAP: Record<string, React.ReactNode> = {
  'web-dev': <Globe className="w-5 h-5 text-[#FF2638]" />,
  'web-apps': <Layout className="w-5 h-5 text-[#FF2638]" />,
  'ai-tech': <Cpu className="w-5 h-5 text-[#FF2638]" />,
  'automation': <Zap className="w-5 h-5 text-[#FF2638]" />,
  'seo-publishing': <Search className="w-5 h-5 text-[#FF2638]" />,
  'product-dev': <Box className="w-5 h-5 text-[#FF2638]" />,
  'software-projects': <Binary className="w-5 h-5 text-[#FF2638]" />,
  'creative-tech': <Layers className="w-5 h-5 text-[#FF2638]" />
};

interface WhatIDoSectionProps {
  onNavigateTools: () => void;
  onNavigateContact: () => void;
}

export const WhatIDoSection: React.FC<WhatIDoSectionProps> = ({
  onNavigateTools,
  onNavigateContact
}) => {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const services = SOHIT_AARYA_DATA.services;

  return (
    <section id="services" className="relative py-28 bg-[#080808] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-[#FF2638]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 02</span>
              <span className="text-neutral-600">/</span>
              <span>CAPABILITIES &amp; EXPERTISE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              WHAT I <span className="text-[#FF2638]">DO &amp; BUILD</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            8 SPECIALIZED ENGINEERING DISCIPLINES
          </div>
        </div>

        {/* 8 Premium Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setActiveService(service)}
              className="group p-6 rounded-3xl bg-[#111111] hover:bg-[#161616] border border-[#222222] hover:border-[#FF2638]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#FF2638]/10"
            >
              <div>
                {/* Card Top: Number & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-black font-mono text-neutral-500 group-hover:text-[#FF2638] transition-colors">
                    {service.number}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#1c1c1c] border border-[#2b2b2b] group-hover:border-[#FF2638]/40 flex items-center justify-center transition-all group-hover:scale-110">
                    {ICONS_MAP[service.id]}
                  </div>
                </div>

                {/* Category & Title */}
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  {service.category}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#FF2638] transition-colors mb-2.5">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>

              {/* Bottom: Tech Stack Tags & Interactive Details */}
              <div className="pt-6 mt-6 border-t border-[#1f1f1f]">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {service.techStack.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-neutral-400 border border-[#292929]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#FF2638] group-hover:text-white transition-colors">
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Deep Dive Details Drawer */}
        {activeService && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#2b2b2b] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#1c1c1c] text-[#FF2638] font-mono text-[11px] font-bold uppercase mb-1">
                    {activeService.number} • {activeService.category}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {activeService.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveService(null)}
                  className="p-2 rounded-xl bg-[#1c1c1c] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {activeService.description}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-mono text-white uppercase font-bold tracking-wider">
                  Key Capabilities &amp; Deliverables:
                </div>
                <div className="space-y-2">
                  {activeService.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-[#FF2638] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-white uppercase font-bold tracking-wider">
                  Engineered With:
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeService.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#1c1c1c] text-neutral-200 border border-[#2b2b2b]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  onClick={() => {
                    setActiveService(null);
                    onNavigateContact();
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] to-[#cc0016] hover:from-[#ff3d4e] hover:to-[#e6001a] transition-all text-center cursor-pointer shadow-lg shadow-[#FF2638]/20"
                >
                  Discuss This Project
                </button>
                <button
                  onClick={() => {
                    setActiveService(null);
                    onNavigateTools();
                  }}
                  className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] transition-colors cursor-pointer"
                >
                  Explore 331 Tools
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
