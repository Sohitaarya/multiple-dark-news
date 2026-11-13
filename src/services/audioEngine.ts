/**
 * Pure PCM Audio DSP & RIFF/WAVE Encoder + Web Audio API Helpers
 * Enables 100% client-side execution of all 27 Audio Tools + testable PCM math.
 */

/**
 * Encode Float32 PCM channel arrays (-1.0..1.0) into a standard 16-bit RIFF/WAVE file byte array
 */
export function encodeWavFromChannels(channels: Float32Array[], sampleRate: number): Uint8Array {
  const numChannels = Math.max(1, channels.length);
  const length = channels[0]?.length || 0;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // Bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i] || 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Uint8Array(buffer);
}

/**
 * Pure PCM transformations for unit testing & offline processing
 */
export function trimPcmChannels(
  channels: Float32Array[],
  sampleRate: number,
  startSec: number,
  endSec: number
): Float32Array[] {
  const len = channels[0]?.length || 0;
  const sIdx = Math.max(0, Math.min(len - 1, Math.floor(startSec * sampleRate)));
  const eIdx = Math.max(sIdx + 1, Math.min(len, Math.floor(endSec * sampleRate)));
  return channels.map((ch) => ch.slice(sIdx, eIdx));
}

export function applyGainPcmChannels(channels: Float32Array[], gainMultiplier: number): Float32Array[] {
  return channels.map((ch) => {
    const out = new Float32Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      // Soft clip via tanh above 0.95 to avoid harsh digital clipping
      const v = ch[i] * gainMultiplier;
      out[i] = Math.abs(v) > 0.95 ? Math.tanh(v) : v;
    }
    return out;
  });
}

export function reversePcmChannels(channels: Float32Array[]): Float32Array[] {
  return channels.map((ch) => {
    const out = new Float32Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      out[i] = ch[ch.length - 1 - i];
    }
    return out;
  });
}

export function applyFadePcmChannels(
  channels: Float32Array[],
  sampleRate: number,
  fadeInSec: number,
  fadeOutSec: number
): Float32Array[] {
  const fadeInSamples = Math.floor(fadeInSec * sampleRate);
  const fadeOutSamples = Math.floor(fadeOutSec * sampleRate);
  return channels.map((ch) => {
    const out = new Float32Array(ch);
    const n = out.length;
    for (let i = 0; i < Math.min(fadeInSamples, n); i++) {
      out[i] *= i / fadeInSamples;
    }
    for (let i = 0; i < Math.min(fadeOutSamples, n); i++) {
      out[n - 1 - i] *= i / fadeOutSamples;
    }
    return out;
  });
}

export function removeSilencePcmChannels(
  channels: Float32Array[],
  sampleRate: number,
  thresholdDb = -40
): Float32Array[] {
  const threshold = Math.pow(10, thresholdDb / 20);
  const windowSize = Math.max(128, Math.floor(sampleRate * 0.02)); // 20ms frame
  const len = channels[0]?.length || 0;
  const keepIndices: [number, number][] = [];

  for (let start = 0; start < len; start += windowSize) {
    const end = Math.min(len, start + windowSize);
    let peak = 0;
    for (let i = start; i < end; i++) {
      for (let c = 0; c < channels.length; c++) {
        const a = Math.abs(channels[c][i]);
        if (a > peak) peak = a;
      }
    }
    if (peak >= threshold) {
      if (keepIndices.length > 0 && keepIndices[keepIndices.length - 1][1] === start) {
        keepIndices[keepIndices.length - 1][1] = end;
      } else {
        keepIndices.push([start, end]);
      }
    }
  }

  const totalKept = keepIndices.reduce((acc, [s, e]) => acc + (e - s), 0);
  if (totalKept === 0) return channels.map((c) => c.slice(0, Math.min(len, sampleRate)));

  return channels.map((ch) => {
    const out = new Float32Array(totalKept);
    let write = 0;
    for (const [s, e] of keepIndices) {
      out.set(ch.slice(s, e), write);
      write += e - s;
    }
    return out;
  });
}

export function mixChannelsMode(channels: Float32Array[], target: 'mono' | 'stereo'): Float32Array[] {
  const len = channels[0]?.length || 0;
  if (target === 'mono') {
    if (channels.length === 1) return channels;
    const mono = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      let sum = 0;
      for (let c = 0; c < channels.length; c++) sum += channels[c][i];
      mono[i] = sum / channels.length;
    }
    return [mono];
  }
  if (channels.length >= 2) return [channels[0], channels[1]];
  return [new Float32Array(channels[0]), new Float32Array(channels[0])];
}

export function resampleLinearPcm(channels: Float32Array[], rateMultiplier: number): Float32Array[] {
  const len = channels[0]?.length || 0;
  const newLen = Math.max(1, Math.floor(len / rateMultiplier));
  return channels.map((ch) => {
    const out = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) {
      const srcPos = i * rateMultiplier;
      const idx = Math.floor(srcPos);
      const frac = srcPos - idx;
      const a = ch[idx] ?? 0;
      const b = ch[Math.min(len - 1, idx + 1)] ?? a;
      out[i] = a + (b - a) * frac;
    }
    return out;
  });
}

/**
 * Concat multiple decoded buffers (merges sample counts)
 */
export function mergePcmBuffers(buffers: { channels: Float32Array[]; sampleRate: number }[]): {
  channels: Float32Array[];
  sampleRate: number;
} {
  const sampleRate = buffers[0]?.sampleRate || 44100;
  const totalLen = buffers.reduce((sum, b) => sum + (b.channels[0]?.length || 0), 0);
  const left = new Float32Array(totalLen);
  const right = new Float32Array(totalLen);
  let offset = 0;
  for (const b of buffers) {
    const ch0 = b.channels[0];
    const ch1 = b.channels[1] || ch0;
    left.set(ch0, offset);
    right.set(ch1, offset);
    offset += ch0.length;
  }
  return { channels: [left, right], sampleRate };
}

/**
 * Browser-side helper: decode any audio OR video file via Web Audio API into PCM channels
 */
export async function decodeAudioFile(file: File | Blob): Promise<{
  channels: Float32Array[];
  sampleRate: number;
  duration: number;
}> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const arr = await file.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arr);
    const channels: Float32Array[] = [];
    for (let c = 0; c < audioBuf.numberOfChannels; c++) {
      channels.push(new Float32Array(audioBuf.getChannelData(c)));
    }
    return {
      channels,
      sampleRate: audioBuf.sampleRate,
      duration: audioBuf.duration,
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

/**
 * Render Multi-Band EQ / Noise Reduction using OfflineAudioContext BiquadFilters
 */
export async function renderFilteredAudioWav(
  file: File,
  opts: { bassDb?: number; midDb?: number; trebleDb?: number; noiseGate?: boolean }
): Promise<Blob> {
  const decoded = await decodeAudioFile(file);
  const offline = new OfflineAudioContext(decoded.channels.length, decoded.channels[0].length, decoded.sampleRate);
  const buf = offline.createBuffer(decoded.channels.length, decoded.channels[0].length, decoded.sampleRate);
  decoded.channels.forEach((ch, idx) => buf.copyToChannel(new Float32Array(ch), idx));

  const src = offline.createBufferSource();
  src.buffer = buf;

  let lastNode: AudioNode = src;

  if (opts.noiseGate) {
    const hp = offline.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 95;
    const lp = offline.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 8500;
    lastNode.connect(hp);
    hp.connect(lp);
    lastNode = lp;
  }

  const low = offline.createBiquadFilter();
  low.type = 'lowshelf';
  low.frequency.value = 250;
  low.gain.value = opts.bassDb || 0;

  const mid = offline.createBiquadFilter();
  mid.type = 'peaking';
  mid.frequency.value = 1000;
  mid.Q.value = 1;
  mid.gain.value = opts.midDb || 0;

  const high = offline.createBiquadFilter();
  high.type = 'highshelf';
  high.frequency.value = 4000;
  high.gain.value = opts.trebleDb || 0;

  lastNode.connect(low);
  low.connect(mid);
  mid.connect(high);
  high.connect(offline.destination);
  src.start();

  const rendered = await offline.startRendering();
  const outCh: Float32Array[] = [];
  for (let c = 0; c < rendered.numberOfChannels; c++) {
    outCh.push(new Float32Array(rendered.getChannelData(c)));
  }
  const wavBytes = encodeWavFromChannels(outCh, rendered.sampleRate);
  return new Blob([wavBytes as unknown as BlobPart], { type: 'audio/wav' });
}

/**
 * Draw crisp PNG Waveform Visualization from audio channels
 */
export function renderWaveformPngBlob(
  channels: Float32Array[],
  waveColor = '#f43f5e',
  bgColor = '#020617'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const data = channels[0];
  const step = Math.max(1, Math.floor(data.length / canvas.width));
  const midY = canvas.height / 2;

  ctx.fillStyle = waveColor;
  for (let x = 0; x < canvas.width; x++) {
    let min = 1;
    let max = -1;
    for (let j = 0; j < step; j++) {
      const v = data[x * step + j] || 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const top = midY + min * midY * 0.9;
    const h = Math.max(2, (max - min) * midY * 0.9);
    ctx.fillRect(x, top, 1, h);
  }
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Waveform export failed'))), 'image/png'));
}
