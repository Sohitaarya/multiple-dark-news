import React from 'react';

interface MarqueeTickerProps {
  variant?: 'crimson' | 'dark';
  reverse?: boolean;
  speed?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  variant = 'crimson',
  reverse = false
}) => {
  const items = [
    'SOHIT AARYA',
    '331 IN-BROWSER TOOLS',
    'ZERO-LATENCY ENGINE',
    'CLIENT-SIDE PRIVACY',
    'WEBASSEMBLY POWERED',
    'INNOVATE • CREATE • GROW',
    'DREAM BIG, BUILD BIGGER',
    'MULTIPLEDARKNEWS',
    'AARYA AI',
    'EXAMFORGE AI'
  ];

  const content = items.map((item, idx) => (
    <span key={idx} className="inline-flex items-center gap-4 mx-4">
      <span className="tracking-tighter uppercase font-black">{item}</span>
      <span className="opacity-60 text-xs font-mono">///</span>
    </span>
  ));

  if (variant === 'crimson') {
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#FF2638] py-2.5 sm:py-3 shadow-lg shadow-[#FF2638]/20 z-10 border-y border-[#ff4d5e]">
        <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}>
          <div className="flex items-center text-white text-xs sm:text-sm font-black whitespace-nowrap">
            {content}
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a] border-y border-[#202020] py-2 sm:py-2.5 z-10">
      <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}>
        <div className="flex items-center text-neutral-400 text-xs font-mono font-bold whitespace-nowrap">
          {content}
          {content}
        </div>
      </div>
    </div>
  );
};
