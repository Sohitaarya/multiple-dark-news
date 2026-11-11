/**
 * MultipleDarkNews Media & Social Media Engine
 * Client-Side Audio, Video, and Social Media Processing
 */

/**
 * Extract YouTube Thumbnail images from URL
 */
export function extractYouTubeThumbnails(videoUrl: string): {
  valid: boolean;
  videoId?: string;
  maxRes?: string;
  high?: string;
  medium?: string;
  standard?: string;
  error?: string;
} {
  const clean = videoUrl.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = clean.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return {
      valid: true,
      videoId,
      maxRes: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    };
  }

  return {
    valid: false,
    error: 'Please enter a valid YouTube video link (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/...)',
  };
}

/**
 * Generate UTM tracking URL for Google Analytics & Google Ads
 */
export function buildUtmUrl(params: {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}): string {
  let url = params.baseUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const u = new URL(url);
  if (params.source) u.searchParams.set('utm_source', params.source);
  if (params.medium) u.searchParams.set('utm_medium', params.medium);
  if (params.campaign) u.searchParams.set('utm_campaign', params.campaign);
  if (params.term) u.searchParams.set('utm_term', params.term);
  if (params.content) u.searchParams.set('utm_content', params.content);

  return u.toString();
}

/**
 * Analyze Social Media character limits across networks
 */
export function analyzeSocialCharacters(text: string) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return {
    chars,
    words,
    twitter: {
      limit: 280,
      remaining: 280 - chars,
      exceeded: chars > 280,
    },
    instagram: {
      limit: 2200,
      remaining: 2200 - chars,
      exceeded: chars > 2200,
    },
    linkedin: {
      limit: 3000,
      remaining: 3000 - chars,
      exceeded: chars > 3000,
    },
    facebook: {
      limit: 63206,
      remaining: 63206 - chars,
      exceeded: chars > 63206,
    },
  };
}

/**
 * Web Audio API Tone Generator Synthesizer
 */
let audioCtx: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;

export function playSynthesizerTone(frequency = 440, type: OscillatorType = 'sine'): boolean {
  try {
    stopSynthesizerTone();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    audioCtx = new AudioContextClass();
    currentOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    currentOscillator.type = type;
    currentOscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Fade in to avoid clicks
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);

    currentOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    currentOscillator.start();
    return true;
  } catch (err) {
    console.error('Audio synthesizer error:', err);
    return false;
  }
}

export function stopSynthesizerTone(): void {
  if (currentOscillator) {
    try {
      currentOscillator.stop();
      currentOscillator.disconnect();
    } catch {
      // ignore
    }
    currentOscillator = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {
      // ignore
    }
    audioCtx = null;
  }
}

/**
 * Extract frame from video element to PNG data URL
 */
export function captureVideoFrame(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 360;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }
  return '';
}
