import React, { useEffect } from 'react';

export interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

const DEFAULT_ADSENSE_CLIENT = 'ca-pub-9800000000000000'; // Default placeholder client ID

export const GoogleAdsenseScript: React.FC<{ client?: string }> = ({ client }) => {
  const pubId = client || import.meta.env.VITE_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT;

  useEffect(() => {
    if (!pubId || document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [pubId]);

  return null;
};

export const AdSlot: React.FC<AdSlotProps> = ({
  client,
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  style = { display: 'block' },
  label = 'Advertisement',
}) => {
  const pubId = client || import.meta.env.VITE_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignore push errors during dev/preview
    }
  }, []);

  return (
    <div className={`my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#0d0d12]/80 p-3 backdrop-blur-md ${className}`}>
      <div className="mb-2 flex items-center justify-between w-full max-w-4xl px-2 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
        <span>{label}</span>
        <span className="text-red-400/80">Google AdSense Enabled</span>
      </div>

      <div className="w-full min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={pubId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};

export default GoogleAdsenseScript;
