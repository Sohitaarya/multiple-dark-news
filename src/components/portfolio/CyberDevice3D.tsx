import React, { useState } from 'react';
import {
  Wrench,
  Globe,
  Brain,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  Power
} from 'lucide-react';

interface CyberDevice3DProps {
  onOpenToolSuite: () => void;
  onOpenProjects: () => void;
}

export const CyberDevice3D: React.FC<CyberDevice3DProps> = ({
  onOpenToolSuite,
  onOpenProjects
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const devices = [
    {
      num: '01',
      title: '331 TOOLS ECOSYSTEM',
      subtitle: 'In-Browser Client Engine',
      category: 'HIGH VELOCITY WASM',
      icon: Wrench,
      status: 'ONLINE • 331 LIVE',
      description: 'Zero server uploads. 100% private, instantaneous PDF, image, developer & converter utilities.',
      badge: '99.9% UPTIME',
      metric: '331 / 331 TOOLS'
    },
    {
      num: '02',
      title: 'MULTIPLEDARKNEWS.COM',
      subtitle: 'Digital Publishing Architecture',
      category: 'AUTOMATION & MEDIA',
      icon: Globe,
      status: 'PRODUCTION ACTIVE',
      description: 'High-frequency news publication pipeline with automated editorial curation and syndication.',
      badge: 'HIGH TRAFFIC',
      metric: 'INSTANT SYNC'
    },
    {
      num: '03',
      title: 'AARYA AI SYSTEMS',
      subtitle: 'Neural In-Browser Processing',
      category: 'EDGE INTELLIGENCE',
      icon: Brain,
      status: 'ACTIVE PIPELINE',
      description: 'Autonomous client algorithms, natural language understanding, and automated vision engines.',
      badge: 'EDGE INFERENCE',
      metric: '< 15ms LATENCY'
    },
    {
      num: '04',
      title: 'EXAMFORGE AI',
      subtitle: 'Adaptive Assessment Engine',
      category: 'EDTECH ARCHITECTURE',
      icon: GraduationCap,
      status: 'BETA TESTING',
      description: 'Real-time test paper synthesis, automated grading algorithms, and concept weakness diagnosis.',
      badge: 'ADAPTIVE AI',
      metric: '400+ TOPICS'
    }
  ];

  const current = devices[activeTab];
  const IconComponent = current.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-10 px-4">
      {/* Background Cybernetic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF2638]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Device Header Nav Tabs (Matching Video Style 01, 02, 03) */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {devices.map((dev, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
              activeTab === idx
                ? 'bg-[#FF2638] text-white border-[#ff4d5e] shadow-lg shadow-[#FF2638]/40 scale-105'
                : 'bg-[#121212] text-neutral-400 border-[#242424] hover:border-[#FF2638]/40 hover:text-white'
            }`}
          >
            <span className={activeTab === idx ? 'text-white' : 'text-[#FF2638]'}>
              {dev.num}.
            </span>
            <span>{dev.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* 3D Perspective Floating Device Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: '1200px'
        }}
        className="relative flex items-center justify-center cursor-default"
      >
        <div
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#180a0c] via-[#0d0708] to-[#080808] border-2 border-[#FF2638]/60 rounded-[36px] p-4 sm:p-7 shadow-[0_0_50px_rgba(255,38,56,0.25)] animate-float-slow"
        >
          {/* Laser Scanline Beam Sweeping Continuously */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF2638] to-transparent animate-scanline pointer-events-none rounded-full" />

          {/* Top Device Bezel & Speaker */}
          <div className="flex items-center justify-between pb-4 border-b border-[#291316] mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2638] animate-ping" />
              <span className="text-[10px] font-mono uppercase text-[#FF2638] font-bold tracking-widest">
                SYSTEM CORE ONLINE
              </span>
            </div>
            <div className="w-16 h-1 rounded-full bg-[#331115]" />
            <div className="text-[10px] font-mono text-neutral-400">
              {current.status}
            </div>
          </div>

          {/* Device Main Screen Content */}
          <div className="relative rounded-2xl bg-[#080808]/90 border border-[#2a1215] p-6 sm:p-8 space-y-6 overflow-hidden">
            {/* Background Soundwave / Equalizer Bars */}
            <div className="absolute top-4 right-4 flex items-end gap-1 h-8 opacity-40">
              <div className="w-1 bg-[#FF2638] rounded-full animate-eq-1" />
              <div className="w-1 bg-[#FF2638] rounded-full animate-eq-2" />
              <div className="w-1 bg-[#FF2638] rounded-full animate-eq-3" />
              <div className="w-1 bg-[#FF2638] rounded-full animate-eq-4" />
              <div className="w-1 bg-[#FF2638] rounded-full animate-eq-2" />
            </div>

            {/* Title & Category */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF2638]/10 text-[#FF2638] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#FF2638]/20">
                <span className="text-white">{current.num}</span>
                <span>/</span>
                <span>{current.category}</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                {current.subtitle}
              </p>
            </div>

            {/* Center Dynamic Visualizer / Hologram */}
            <div className="relative py-6 flex flex-col items-center justify-center">
              {/* Central Glowing Cyber Ring */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-[#FF2638]/60 flex items-center justify-center animate-radar-sweep shadow-[0_0_30px_rgba(255,38,56,0.3)]">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#FF2638] to-[#990011] flex items-center justify-center text-white shadow-xl shadow-[#FF2638]/50">
                  <IconComponent className="w-10 h-10 animate-pulse" />
                </div>
              </div>

              {/* Pulsing Power Indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-neutral-300">
                <Power className="w-3.5 h-3.5 text-[#FF2638]" />
                <span>ACTIVE VELOCITY:</span>
                <span className="text-[#FF2638]">{current.metric}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed text-center sm:text-left">
              {current.description}
            </p>

            {/* Bottom Controls / Action CTA */}
            <div className="pt-4 border-t border-[#221013] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Server Dependencies</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {activeTab === 0 ? (
                  <button
                    onClick={onOpenToolSuite}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF2638] hover:bg-[#e0192b] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF2638]/40 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>LAUNCH 331 TOOLS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenProjects}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF2638] hover:bg-[#e0192b] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF2638]/40 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>VIEW PROJECT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
