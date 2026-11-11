import React from 'react';
import { ShieldCheck, Lock, Cpu, Globe, ExternalLink, Heart } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 mt-20">
      {/* Privacy & Guarantee Bar */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-rose-500 border border-slate-700/60">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">100% Client-Side Privacy</div>
              <div className="text-xs text-slate-400">Files process locally. Zero server upload.</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-500 border border-slate-700/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">₹0 Cost & No Watermarks</div>
              <div className="text-xs text-slate-400">Always free forever. No sign-up required.</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-blue-500 border border-slate-700/60">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Ultra Fast Processing</div>
              <div className="text-xs text-slate-400">Hardware accelerated browser engines.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-950/50">
                <span className="font-extrabold text-white text-base">MD</span>
              </div>
              <span className="font-extrabold text-lg text-white">
                MultipleDarkNews <span className="text-rose-500">TOOLS</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              MultipleDarkNews Tools is a high-speed, privacy-first online tools platform featuring 325+ tools for PDF, Image, Developer, Calculators, SEO, and Media workflows. Built for international users across USA, India, UK, and worldwide.
            </p>
            <div className="pt-2">
              <a
                href="https://multipledarknews.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <span>Visit Parent Website: multipledarknews.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('category', cat.slug)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    {cat.name} ({cat.toolCount})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">More Categories</h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(6, 12).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('category', cat.slug)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    {cat.name} ({cat.toolCount})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Engineering & Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('audit')} className="hover:text-emerald-400 transition-colors">
                  Technical Audit Report
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-rose-400 transition-colors">
                  Privacy Policy & Data Deletion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-rose-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sitemap')} className="hover:text-rose-400 transition-colors font-semibold text-rose-300">
                  XML Sitemap & Google Index
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('integration')} className="hover:text-cyan-400 transition-colors font-semibold text-cyan-300">
                  Add to Your Website (Integration)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('audit')} className="hover:text-emerald-400 transition-colors">
                  System Audit & Compliance
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MultipleDarkNews Tools. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Engineered with zero tracking for maximum privacy</span>
            <span className="text-slate-800">•</span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-700 hover:text-slate-500 transition-colors inline-flex items-center gap-1 text-[11px]"
              title="Staff Access (Ctrl+Shift+A)"
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
