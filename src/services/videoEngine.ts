/**
 * Client-Side Video Processing Engine covering ALL 25 Video Tools
 * Uses HTML5 <video> + <canvas> + captureStream() + MediaRecorder + gifEngine.ts + Web Audio
 */
import { encodeGif } from './gifEngine';

export interface VideoProcessOptions {
  targetWidth?: number;
  targetHeight?: number;
  rotateDeg?: 0 | 90 | 180 | 270;
  speedMultiplier?: number;
  muteAudio?: boolean;
  watermarkText?: string;
  trimStart?: number;
  trimEnd?: number;
  videoBitrate?: number;
  cropPercent?: { x: number; y: number; w: number; h: number };
  replacementAudioFile?: File | null;
}

/**
 * Pure Subtitle SRT <-> VTT Converter & Extractor
 */
export function convertSrtToVtt(srt: string): string {
  const normalized = srt.replace(/\r\n/g, '\n').trim();
  const body = normalized.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT\n\n${body}`;
}

export function convertVttToSrt(vtt: string): string {
  const normalized = vtt.replace(/\r\n/g, '\n').replace(/^WEBVTT[^\n]*\n+/, '').trim();
  const blocks = normalized.split(/\n{2,}/);
  return blocks
    .map((blk, i) => {
      const converted = blk.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2');
      const lines = converted.split('\n');
      if (/^\d+$/.test(lines[0].trim())) return converted;
      return `${i + 1}\n${converted}`;
    })
    .join('\n\n');
}

export function parseSubtitleCues(text: string): { index: number; timestamp: string; content: string }[] {
  const blocks = text.replace(/\r\n/g, '\n').replace(/^WEBVTT[^\n]*\n+/, '').trim().split(/\n{2,}/);
  const cues: { index: number; timestamp: string; content: string }[] = [];
  for (const blk of blocks) {
    const lines = blk.split('\n').filter(Boolean);
    const arrowIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowIdx !== -1) {
      cues.push({
        index: cues.length + 1,
        timestamp: lines[arrowIdx].trim(),
        content: lines.slice(arrowIdx + 1).join(' ').trim(),
      });
    }
  }
  return cues;
}

export function captureFrameFromVideo(
  video: HTMLVideoElement,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Frame capture failed'))), format, 0.95)
  );
}

/**
 * Convert loaded video element segment into an animated GIF via gifEngine.ts
 */
export async function videoToAnimatedGif(
  video: HTMLVideoElement,
  opts: { startSec: number; durationSec: number; fps: number; width: number },
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 360;
  const outW = Math.min(opts.width || 420, vw);
  const outH = Math.max(1, Math.round((vh / vw) * outW));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  const fps = Math.min(12, Math.max(3, opts.fps || 8));
  const duration = Math.min(8, Math.max(0.5, opts.durationSec || 3));
  const totalFrames = Math.max(2, Math.round(fps * duration));
  const delayMs = Math.round(1000 / fps);
  const frames: { rgba: Uint8ClampedArray; width: number; height: number; delayMs: number }[] = [];

  const wasPaused = video.paused;
  video.pause();

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = Math.min(video.duration || opts.startSec + duration, opts.startSec + i / fps);
    await new Promise<void>((resolve) => {
      const onSeek = () => {
        video.removeEventListener('seeked', onSeek);
        resolve();
      };
      video.addEventListener('seeked', onSeek);
      video.currentTime = targetTime;
    });
    ctx.drawImage(video, 0, 0, outW, outH);
    const imgData = ctx.getImageData(0, 0, outW, outH);
    frames.push({ rgba: imgData.data, width: outW, height: outH, delayMs });
    if (onProgress) onProgress(Math.round(((i + 1) / totalFrames) * 85));
  }

  if (!wasPaused) {
    video.play().catch(() => {});
  }

  const gifBytes = encodeGif(frames);
  if (onProgress) onProgress(100);
  return new Blob([gifBytes as unknown as BlobPart], { type: 'image/gif' });
}

/**
 * Re-encode video stream via Canvas + MediaRecorder with optional resize/crop/rotate/speed/watermark/mute
 */
export async function processVideoCanvasPipeline(
  file: File,
  opts: VideoProcessOptions,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true; // needed so autoplay works; we capture original audio separately if needed
  video.playsInline = true;

  await new Promise<void>((res, rej) => {
    video.onloadedmetadata = () => res();
    video.onerror = () => rej(new Error('Could not load video file in browser decoder.'));
  });

  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 360;
  const rot = opts.rotateDeg || 0;
  const baseW = opts.targetWidth || vw;
  const baseH = opts.targetHeight || vh;

  const canvas = document.createElement('canvas');
  canvas.width = rot === 90 || rot === 270 ? baseH : baseW;
  canvas.height = rot === 90 || rot === 270 ? baseW : baseH;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);
  let audioCtx: AudioContext | null = null;
  let audioSrc: AudioBufferSourceNode | null = null;
  if (opts.replacementAudioFile) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AC();
      const buf = await audioCtx.decodeAudioData(await opts.replacementAudioFile.arrayBuffer());
      const dest = audioCtx.createMediaStreamDestination();
      audioSrc = audioCtx.createBufferSource();
      audioSrc.buffer = buf;
      audioSrc.connect(dest);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      // ignore invalid audio track
    }
  } else if (!opts.muteAudio) {
    try {
      const vStream = (video as any).captureStream ? (video as any).captureStream() : null;
      if (vStream) {
        vStream.getAudioTracks().forEach((t: MediaStreamTrack) => stream.addTrack(t));
      }
    } catch {
      // fallback silent stream
    }
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: opts.videoBitrate || 1_800_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Math.max(0, opts.trimStart ?? 0);
  const endTime = Math.min(video.duration || 10, opts.trimEnd && opts.trimEnd > startTime ? opts.trimEnd : video.duration || 5);
  const maxSpan = Math.min(endTime, startTime + 15); // Keep interactive browser encode snappy (<15s clip)

  video.currentTime = startTime;
  video.playbackRate = opts.speedMultiplier || 1;

  let rafId = 0;
  const renderLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);

    const drawW = rot === 90 || rot === 270 ? canvas.height : canvas.width;
    const drawH = rot === 90 || rot === 270 ? canvas.width : canvas.height;
    const c = opts.cropPercent;
    if (c) {
      ctx.drawImage(
        video,
        (c.x / 100) * vw,
        (c.y / 100) * vh,
        (c.w / 100) * vw,
        (c.h / 100) * vh,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
    } else {
      ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();

    if (opts.watermarkText) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `bold ${Math.max(16, Math.round(canvas.width * 0.035))}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(opts.watermarkText, canvas.width - 20, canvas.height - 20);
    }

    if (onProgress && maxSpan > startTime) {
      const pct = Math.min(98, Math.round(((video.currentTime - startTime) / (maxSpan - startTime)) * 100));
      onProgress(pct);
    }
    if (!video.paused && !video.ended && video.currentTime < maxSpan) {
      rafId = requestAnimationFrame(renderLoop);
    }
  };

  return await new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      URL.revokeObjectURL(url);
      try { audioSrc?.stop(); } catch {}
      audioCtx?.close().catch(() => {});
      if (onProgress) onProgress(100);
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
    recorder.onerror = () => {
      cancelAnimationFrame(rafId);
      URL.revokeObjectURL(url);
      try { audioSrc?.stop(); } catch {}
      audioCtx?.close().catch(() => {});
      reject(new Error('Video MediaRecorder failed.'));
    };
    recorder.start(200);
    if (audioSrc) {
      try { audioSrc.start(0); } catch {}
    }
    video.play().then(() => {
      rafId = requestAnimationFrame(renderLoop);
    }).catch(reject);

    const stopWatch = setInterval(() => {
      if (video.ended || video.currentTime >= maxSpan) {
        clearInterval(stopWatch);
        video.pause();
        if (recorder.state !== 'inactive') recorder.stop();
      }
    }, 100);
  });
}
