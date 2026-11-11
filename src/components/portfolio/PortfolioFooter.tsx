import React from 'react';
import {
  ArrowUp,
  Lock,
  ExternalLink,
  Wrench,
  Sparkles,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { SOHIT_AARYA_DATA } from '../../data/sohitPortfolioData';

interface PortfolioFooterProps {
  onNavigateTools: () => void;
  onNavigateAdmin: () => void;
}

export const PortfolioFooter: React.FC<PortfolioFooterProps> = ({
  onNavigateTools,
  onNavigateAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-[#1a1a1a] text-neutral-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Row: Brand & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between pb-12 border-b border-[#181818]">
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white uppercase">
                SOHIT AARYA
              </span>
              <span className="text-[#FF2638] font-black text-lg italic">
                ///
              </span>
            </div>
            <div className="text-xs font-mono text-[#FF2638] tracking-widest uppercase">
              {SOHIT_AARYA_DATA.motto}
            </div>
            <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
              Personal portfolio, digital creations, and 331 client-side in-browser tools built by Sohit Aarya. Powered by zero tracking and maximum data privacy.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col md:items-end gap-3">
            <div className="text-sm font-serif italic text-neutral-300 font-bold">
              {SOHIT_AARYA_DATA.quote}
            </div>
            <div className="text-xs font-mono text-neutral-500">
              — {SOHIT_AARYA_DATA.signatureText}
            </div>
            <button
              onClick={scrollToTop}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white border border-[#262626] text-xs font-mono transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#FF2638]" />
            </button>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2.5">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">
              Portfolio Sections
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li><a href="#about" className="hover:text-white transition-colors">01 About Identity</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">02 What I Do</a></li>
              <li><a href="#tools-ecosystem" className="hover:text-white transition-colors">03 331 Tools Ecosystem</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">04 Projects Showcase</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">
              Development
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li><a href="#progress" className="hover:text-white transition-colors">05 Work In Progress</a></li>
              <li><a href="#social" className="hover:text-white transition-colors">06 Social Connect</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">07 My Journey Roadmap</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">08 Contact &amp; Inquiries</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">
              331 Tools Suite
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button onClick={onNavigateTools} className="hover:text-[#FF2638] transition-colors text-left flex items-center gap-1 font-semibold text-neutral-300">
                  <Wrench className="w-3 h-3 text-[#FF2638]" />
                  <span>Open Full Tools Suite</span>
                </button>
              </li>
              <li><a href="#tool/pdf-compressor" className="hover:text-white transition-colors">PDF Tools Suite</a></li>
              <li><a href="#tool/image-compressor" className="hover:text-white transition-colors">Image Tools Suite</a></li>
              <li><a href="#tool/json-formatter" className="hover:text-white transition-colors">Developer Tools Suite</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">
              Ecosystem &amp; Links
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <a
                  href="https://multipledarknews.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>multipledarknews.com</span>
                  <ExternalLink className="w-3 h-3 text-[#FF2638]" />
                </a>
              </li>
              <li><a href="#sitemap" className="hover:text-white transition-colors">XML Sitemaps Directory</a></li>
              <li><a href="#audit" className="hover:text-white transition-colors">Audit &amp; Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Staff Gate */}
        <div className="pt-8 border-t border-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            © {new Date().getFullYear()} SOHIT AARYA. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span>Built with precision &amp; zero tracking</span>
            <span className="text-neutral-700">•</span>
            <button
              onClick={onNavigateAdmin}
              className="text-neutral-600 hover:text-neutral-400 transition-colors inline-flex items-center gap-1 text-[11px]"
              title="Staff Authorization Portal (Ctrl+Shift+A)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
