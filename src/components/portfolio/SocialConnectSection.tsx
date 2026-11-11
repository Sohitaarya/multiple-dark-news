import React from 'react';
import {
  Youtube,
  Instagram,
  Linkedin,
  Github,
  Send,
  Twitter,
  MessageCircle,
  Facebook,
  Bookmark,
  ExternalLink,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { SOHIT_AARYA_DATA, SocialLinkItem } from '../../data/sohitPortfolioData';

const SOCIAL_ICONS_MAP: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-5 h-5 text-[#FF2638]" />,
  instagram: <Instagram className="w-5 h-5 text-[#FF2638]" />,
  linkedin: <Linkedin className="w-5 h-5 text-[#FF2638]" />,
  facebook: <Facebook className="w-5 h-5 text-[#FF2638]" />,
  pinterest: <Bookmark className="w-5 h-5 text-[#FF2638]" />,
  github: <Github className="w-5 h-5 text-[#FF2638]" />,
  telegram: <Send className="w-5 h-5 text-[#FF2638]" />,
  twitter: <Twitter className="w-5 h-5 text-[#FF2638]" />,
  messageCircle: <MessageCircle className="w-5 h-5 text-[#FF2638]" />
};

export const SocialConnectSection: React.FC = () => {
  const socialLinks = SOHIT_AARYA_DATA.socialLinks;

  return (
    <section id="social" className="relative py-28 bg-[#080808] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#FF2638]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 06</span>
              <span className="text-neutral-600">/</span>
              <span>DIGITAL PRESENCE &amp; COMMUNITY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              FIND ME <span className="text-[#FF2638]">ACROSS THE INTERNET.</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            VERIFIED OFFICIAL CHANNELS
          </div>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-3xl bg-[#111111] hover:bg-[#161616] border border-[#222222] hover:border-[#FF2638]/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#FF2638]/10"
            >
              <div className="space-y-4">
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] group-hover:border-[#FF2638]/40 flex items-center justify-center transition-all group-hover:scale-110">
                    {SOCIAL_ICONS_MAP[social.iconName] || <Share2 className="w-5 h-5 text-[#FF2638]" />}
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#181818] text-neutral-400 border border-[#262626] uppercase">
                    {social.badgeText}
                  </span>
                </div>

                {/* Platform & Username */}
                <div>
                  <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                    {social.platform}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#FF2638] transition-colors flex items-center gap-1.5 mt-0.5">
                    <span>{social.username}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#FF2638]" />
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  {social.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-[#1f1f1f] flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
                  Visit Channel
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] group-hover:bg-[#FF2638] text-neutral-400 group-hover:text-white flex items-center justify-center transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
