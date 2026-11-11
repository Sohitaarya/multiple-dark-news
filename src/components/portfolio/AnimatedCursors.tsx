import React from 'react';

export const AnimatedCursors: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Floating Pointer 1: Top Right */}
      <div className="absolute top-[18%] right-[15%] hidden md:flex items-center gap-1.5 animate-cursor-1">
        <svg
          className="w-5 h-5 text-[#FF2638] drop-shadow-[0_0_8px_rgba(255,38,56,0.8)] -rotate-12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 0l16 12.279-6.78 1.07 4.78 8.651-3.414 1.886-4.78-8.651-5.806 4.765z" />
        </svg>
        <div className="px-2.5 py-1 rounded-md bg-[#FF2638] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>Sohit Aarya</span>
        </div>
      </div>

      {/* Floating Pointer 2: Mid Left */}
      <div className="absolute top-[48%] left-[8%] hidden lg:flex items-center gap-1.5 animate-cursor-2">
        <svg
          className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] rotate-12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 0l16 12.279-6.78 1.07 4.78 8.651-3.414 1.886-4.78-8.651-5.806 4.765z" />
        </svg>
        <div className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#333333] text-neutral-300 text-[10px] font-mono tracking-wider shadow-lg">
          331 In-Browser Tools
        </div>
      </div>

      {/* Floating Pointer 3: Bottom Right */}
      <div className="absolute bottom-[22%] right-[22%] hidden lg:flex items-center gap-1.5 animate-cursor-1 [animation-delay:-4s]">
        <svg
          className="w-5 h-5 text-[#FF2638] drop-shadow-[0_0_8px_rgba(255,38,56,0.8)] -rotate-45"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 0l16 12.279-6.78 1.07 4.78 8.651-3.414 1.886-4.78-8.651-5.806 4.765z" />
        </svg>
        <div className="px-2 py-0.5 rounded-md bg-[#FF2638]/20 border border-[#FF2638]/50 text-[#FF2638] text-[9px] font-mono font-bold tracking-wider backdrop-blur-sm">
          Auto-Deploy
        </div>
      </div>
    </div>
  );
};
