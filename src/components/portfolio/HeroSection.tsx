import React from 'react';
import {
  Code,
  Cpu,
  Rocket,
  ArrowRight,
  Wrench,
  Mail,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Bookmark,
  Github,
  Send,
  Zap
} from 'lucide-react';
import { SOHIT_AARYA_DATA } from '../../data/sohitPortfolioData';

interface HeroSectionProps {
  onNavigateTools: () => void;
  onNavigateContact: () => void;
  onNavigateProjects: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateTools,
  onNavigateContact,
  onNavigateProjects
}) => {

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-transparent">
      {/* Background Cinematic Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-[#FF2638]/10 rounded-full blur-[140px]" />
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-[#FF2638]/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Photograph Card - Clean, Unobstructed, Responsive for Mobile & Desktop */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start order-1 lg:order-1">
            <div className="relative max-w-md w-full">
              {/* Outer Card with Refined Neon Accent */}
              <div className="relative bg-[#0d0d10] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-[#2e1216] shadow-2xl overflow-hidden hover:border-[#FF2638]/50 transition-colors duration-300">
                {/* 100% Clear Photo Container - Zero badges, zero overlays, zero animations on top */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={SOHIT_AARYA_DATA.photoUrl}
                    alt="Sohit Aarya - Full-Stack Developer & Creator"
                    className="w-full h-auto object-contain rounded-xl select-none"
                    loading="eager"
                  />
                </div>

                {/* Clean Professional Caption Bar Below the Photo (Completely Separate from Face) */}
                <div className="mt-3 px-3 py-2.5 flex items-center justify-between bg-[#141418] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide">SOHIT AARYA</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Founder &amp; Lead Architect</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-[#1f1315] border border-[#FF2638]/30 text-[#FF2638] text-[10px] font-mono font-bold tracking-wider">
                    VERIFIED
                  </div>
                </div>
              </div>

              {/* Motto Tag Below Card */}
              <div className="mt-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111114] border border-[#222] text-neutral-300 text-xs font-mono">
                  <Zap className="w-3.5 h-3.5 text-[#FF2638]" />
                  <span className="text-neutral-400">“Dream Big, Build Bigger.”</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Typography, Roles, Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-2 lg:order-2">
            {/* Top Kinetic Category Badge with Live Pulse */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#2b2b2b] text-neutral-300 text-xs font-mono tracking-widest uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#FF2638] animate-ping" />
              <span>PORTFOLIO • DEVELOPER • CREATOR</span>
              <span className="text-neutral-600">|</span>
              <span className="text-[#FF2638] font-bold">VERIFIED 2026</span>
            </div>

            {/* Main Bold Cinematic Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-white tracking-tighter uppercase leading-[0.95]">
                SOHIT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#FF2638]">
                  AARYA
                </span>
                <span className="text-[#FF2638] ml-2 italic tracking-tighter">///</span>
              </h1>
              <div className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white/90 pt-1">
                BUILDING DIGITAL EXPERIENCES. <br className="hidden sm:inline" />
                <span className="text-[#FF2638]">CREATING WHAT&apos;S NEXT.</span>
              </div>
            </div>

            {/* Subheadline description */}
            <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              I explore technology, build digital products, develop useful tools and turn ideas into working projects. Focused on zero-upload client privacy and accessible digital empowerment.
            </p>

            {/* 3 Pillar Role Cards with Hover 3D Shift */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#121212]/90 border border-[#262626] hover:border-[#FF2638] hover:shadow-[0_0_20px_rgba(255,38,56,0.25)] transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-[#FF2638]/10 text-[#FF2638] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#FF2638] group-hover:text-white transition-all">
                  <Code className="w-4 h-4" />
                </div>
                <div className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>Web Developer</span>
                  <span className="text-[10px] font-mono text-[#FF2638] opacity-0 group-hover:opacity-100 transition-opacity">01</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  High-speed modern web applications &amp; systems
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212]/90 border border-[#262626] hover:border-[#FF2638] hover:shadow-[0_0_20px_rgba(255,38,56,0.25)] transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-[#FF2638]/10 text-[#FF2638] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#FF2638] group-hover:text-white transition-all">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>AI &amp; Tech</span>
                  <span className="text-[10px] font-mono text-[#FF2638] opacity-0 group-hover:opacity-100 transition-opacity">02</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  In-browser neural processing &amp; client algorithms
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212]/90 border border-[#262626] hover:border-[#FF2638] hover:shadow-[0_0_20px_rgba(255,38,56,0.25)] transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-[#FF2638]/10 text-[#FF2638] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#FF2638] group-hover:text-white transition-all">
                  <Rocket className="w-4 h-4" />
                </div>
                <div className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>Digital Creator</span>
                  <span className="text-[10px] font-mono text-[#FF2638] opacity-0 group-hover:opacity-100 transition-opacity">03</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  MultipleDarkNews ecosystem &amp; tools builder
                </div>
              </div>
            </div>

            {/* Action Buttons with High-Energy Glow */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-3">
              <button
                onClick={onNavigateTools}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#b30012] hover:from-[#ff3d4e] hover:to-[#cc0016] shadow-xl shadow-[#FF2638]/35 hover:shadow-[#FF2638]/60 transition-all flex items-center gap-2 cursor-pointer group active:scale-95"
              >
                <Wrench className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>EXPLORE 331 TOOLS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onNavigateProjects}
                className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-200 hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-[#2b2b2b] hover:border-[#FF2638]/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>VIEW MY WORK</span>
              </button>

              <button
                onClick={onNavigateContact}
                className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-transparent hover:bg-neutral-900 border border-neutral-800 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Mail className="w-4 h-4 text-[#FF2638]" />
                <span>CONTACT ME</span>
              </button>
            </div>

            {/* Social Icons Strip with Verified Links */}
            <div className="pt-4 border-t border-[#1c1c1c] flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                VERIFIED CHANNELS:
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.linkedin.com/in/sohit-aarya-81704a321?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="LinkedIn Sohit Aarya"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/sohit__aarya?dlrf=NWZsYjNsZnZ3ZWdm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Instagram @sohit__aarya"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/share/1A1CNnw6VY/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Facebook Sohit Aarya"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@thynkova?si=9diIjidVgHqqTixg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="YouTube @thynkova"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://pin.it/1yvzB0klX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Pinterest Sohit Aarya"
                >
                  <Bookmark className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/Sohitaarya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="GitHub @Sohitaarya"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#FF2638] text-neutral-400 hover:text-white border border-[#262626] hover:border-[#FF2638] flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Telegram @sohitaarya"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
