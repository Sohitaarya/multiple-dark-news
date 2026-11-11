import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2,
  Wrench,
  Shield,
  Layers
} from 'lucide-react';
import { SOHIT_AARYA_DATA } from '../../data/sohitPortfolioData';

interface PortfolioNavbarProps {
  onNavigateTools: () => void;
  activeSection: string;
}

export const PortfolioNavbar: React.FC<PortfolioNavbarProps> = ({
  onNavigateTools,
  activeSection
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '01 About', href: '#about', id: 'about' },
    { label: '02 What I Do', href: '#services', id: 'services' },
    { label: '03 331 Tools', href: '#tools-ecosystem', id: 'tools-ecosystem' },
    { label: '04 Projects', href: '#projects', id: 'projects' },
    { label: '05 Progress', href: '#progress', id: 'progress' },
    { label: '06 Social', href: '#social', id: 'social' },
    { label: '07 Journey', href: '#journey', id: 'journey' },
    { label: '08 Contact', href: '#contact', id: 'contact' }
  ];

  const scrollTo = (href: string) => {
    setIsMobileMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-[#222222] py-3.5 shadow-2xl shadow-black/80'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Wordmark */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2638] to-[#990011] p-0.5 shadow-lg shadow-[#FF2638]/20 group-hover:shadow-[#FF2638]/40 transition-all">
              <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center font-black tracking-tighter text-[#FF2638] text-sm group-hover:text-white transition-colors">
                SA
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase group-hover:text-[#FF2638] transition-colors">
                  SOHIT AARYA
                </span>
                <span className="text-[#FF2638] font-black tracking-tighter text-sm italic">
                  ///
                </span>
              </div>
              <div className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase">
                PORTFOLIO • DEVELOPER • CREATOR
              </div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.href)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSection === link.id
                    ? 'text-white bg-[#1a1a1a] border border-[#FF2638]/40 shadow-sm shadow-[#FF2638]/20'
                    : 'hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Link to 331 Tools Suite */}
            <button
              onClick={onNavigateTools}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1f1f1f] border border-[#2b2b2b] transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
              title="Open Standalone 331 Tools Suite"
            >
              <Wrench className="w-3.5 h-3.5 text-[#FF2638]" />
              <span>331 Tools Suite</span>
            </button>

            {/* Let's Connect CTA */}
            <button
              onClick={() => scrollTo('#contact')}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] to-[#D91427] hover:from-[#ff3d4e] hover:to-[#eb1c30] shadow-lg shadow-[#FF2638]/30 hover:shadow-[#FF2638]/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>LET&apos;S CONNECT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[#141414] border border-[#262626] text-neutral-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0a0a0a]/95 border-b border-[#222222] backdrop-blur-2xl px-4 py-6 mt-3 space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.href)}
                className={`p-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSection === link.id
                    ? 'text-white bg-[#1f1f1f] border border-[#FF2638]/40'
                    : 'text-neutral-400 hover:text-white bg-[#121212]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateTools();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-200 bg-[#141414] border border-[#2b2b2b] flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4 text-[#FF2638]" />
              <span>Explore All 331 Online Tools</span>
            </button>

            <button
              onClick={() => scrollTo('#contact')}
              className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] to-[#D91427] flex items-center justify-center gap-2 shadow-lg shadow-[#FF2638]/40"
            >
              <span>LET&apos;S CONNECT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
