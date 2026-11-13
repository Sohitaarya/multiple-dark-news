/**
 * Pure TypeScript GIF89a Encoder & Decoder Helpers
 * Zero external dependencies, works both in Browser Canvas & Node unit tests.
 */

export interface GifFrameInput {
  rgba: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
  delayMs: number;
}

export interface GifFileInfo {
  width: number;
  height: number;
  version: string;
  frameCount: number;
  hasGlobalColorTable: boolean;
  globalColorCount: number;
  isAnimated: boolean;
}

/**
 * Quantize RGBA pixels into a 256-color RGB palette (uniform 6x6x6 color cube + grayscale ramp + transparency slot 255)
 */
export function buildUniform256Palette(): Uint8Array {
  const palette = new Uint8Array(256 * 3);
  let idx = 0;
  // 216 web-safe RGB colors (6x6x6)
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette[idx * 3] = Math.round((r * 255) / 5);
        palette[idx * 3 + 1] = Math.round((g * 255) / 5);
        palette[idx * 3 + 2] = Math.round((b * 255) / 5);
        idx++;
      }
    }
  }
  // 39 grayscale steps
  for (let i = 0; i < 39; i++) {
    const v = Math.round((i * 255) / 38);
    palette[idx * 3] = v;
    palette[idx * 3 + 1] = v;
    palette[idx * 3 + 2] = v;
    idx++;
  }
  // Index 255: transparent fallback (black)
  palette[255 * 3] = 0;
  palette[255 * 3 + 1] = 0;
  palette[255 * 3 + 2] = 0;
  return palette;
}

/**
 * Map RGBA pixel buffer to 8-bit color table indices using fast nearest 6x6x6 cube lookup
 */
export function quantizeRgbaToPalette(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): { indices: Uint8Array; hasTransparency: boolean } {
  const count = width * height;
  const indices = new Uint8Array(count);
  let hasTransparency = false;

  for (let i = 0; i < count; i++) {
    const off = i * 4;
    const a = rgba[off + 3];
    if (a < 128) {
      indices[i] = 255;
      hasTransparency = true;
      continue;
    }
    const r = rgba[off];
    const g = rgba[off + 1];
    const b = rgba[off + 2];

    // Check if near grayscale -> map into grayscale ramp (216..254) for smoother gradients
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    if (maxC - minC < 12) {
      const gray = Math.round((r + g + b) / 3);
      const grayIdx = Math.min(38, Math.round((gray * 38) / 255));
      indices[i] = 216 + grayIdx;
    } else {
      const rq = Math.round((r * 5) / 255);
      const gq = Math.round((g * 5) / 255);
      const bq = Math.round((b * 5) / 255);
      indices[i] = rq * 36 + gq * 6 + bq;
    }
  }

  return { indices, hasTransparency };
}

/**
 * LZW compress 8-bit pixel indices for GIF image data blocks (minCodeSize = 8)
 */
function lzwEncodeGif(indices: Uint8Array): Uint8Array {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize; // 256
  const eoiCode = clearCode + 1; // 257

  const outBytes: number[] = [minCodeSize];
  const subBlock: number[] = [];

  let bitBuffer = 0;
  let bitCount = 0;

  const flushSubBlock = () => {
    if (subBlock.length > 0) {
      outBytes.push(subBlock.length);
      for (let i = 0; i < subBlock.length; i++) outBytes.push(subBlock[i]);
      subBlock.length = 0;
    }
  };

  const writeBits = (code: number, size: number) => {
    bitBuffer |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      subBlock.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitCount -= 8;
      if (subBlock.length === 255) {
        flushSubBlock();
      }
    }
  };

  let codeSize = minCodeSize + 1; // 9
  let nextCode = eoiCode + 1; // 258
  let dict = new Int32Array(4096 * 256); // Wait: too large if static; use Map/typed sparse hash for speed!
  // Actually let's use a fast integer-keyed Map<number, number> cleanly:
  dict = new Int32Array(0);
  const table = new Map<number, number>();

  const resetTable = () => {
    table.clear();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  };

  writeBits(clearCode, codeSize);

  if (indices.length > 0) {
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = (prefix << 8) | k;
      const existing = table.get(key);
      if (existing !== undefined) {
        prefix = existing;
      } else {
        writeBits(prefix, codeSize);
        if (nextCode < 4096) {
          table.set(key, nextCode++);
          if (nextCode > 1 << codeSize && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeBits(clearCode, codeSize);
          resetTable();
        }
        prefix = k;
      }
    }
    writeBits(prefix, codeSize);
  }

  writeBits(eoiCode, codeSize);

  if (bitCount > 0) {
    subBlock.push(bitBuffer & 0xff);
  }
  flushSubBlock();
  outBytes.push(0); // Block terminator

  // Keep reference silent
  void dict;

  return new Uint8Array(outBytes);
}

/**
 * Encode one or more RGBA frames into a standard GIF89a byte array
 */
export function encodeGif(frames: GifFrameInput[], loopCount = 0): Uint8Array {
  if (frames.length === 0) {
    throw new Error('At least one frame is required to encode GIF.');
  }

  const width = Math.max(1, Math.min(65535, frames[0].width));
  const height = Math.max(1, Math.min(65535, frames[0].height));
  const palette = buildUniform256Palette();

  const chunks: number[] = [];
  const pushBytes = (arr: ArrayLike<number>) => {
    for (let i = 0; i < arr.length; i++) chunks.push(arr[i]);
  };
  const pushStr = (s: string) => {
    for (let i = 0; i < s.length; i++) chunks.push(s.charCodeAt(i));
  };
  const pushU16 = (v: number) => {
    chunks.push(v & 0xff, (v >> 8) & 0xff);
  };

  // Header
  pushStr('GIF89a');
  // Logical Screen Descriptor
  pushU16(width);
  pushU16(height);
  // Global Color Table Flag (1), Color Res (7 -> 111), Sort (0), Size of GCT (7 -> 2^(7+1)=256)
  chunks.push(0xf7);
  chunks.push(0x00); // Background color index
  chunks.push(0x00); // Pixel aspect ratio

  // Global Color Table (256 * 3 = 768 bytes)
  pushBytes(palette);

  // NETSCAPE2.0 looping extension if animated (>1 frame)
  if (frames.length > 1) {
    chunks.push(0x21, 0xff, 0x0b);
    pushStr('NETSCAPE2.0');
    chunks.push(0x03, 0x01);
    pushU16(loopCount); // 0 = infinite loop
    chunks.push(0x00);
  }

  for (const frame of frames) {
    const { indices, hasTransparency } = quantizeRgbaToPalette(frame.rgba, frame.width, frame.height);
    const delayCs = Math.max(2, Math.round((frame.delayMs || 100) / 10));

    // Graphic Control Extension
    chunks.push(0x21, 0xf9, 0x04);
    chunks.push(hasTransparency ? 0x09 : 0x04); // disposal method 2 (restore bg) if transparent, else 1
    pushU16(delayCs);
    chunks.push(hasTransparency ? 255 : 0); // Transparent color index
    chunks.push(0x00);

    // Image Descriptor
    chunks.push(0x2c);
    pushU16(0); // left
    pushU16(0); // top
    pushU16(frame.width);
    pushU16(frame.height);
    chunks.push(0x00); // no local color table

    // LZW Image Data
    const lzw = lzwEncodeGif(indices);
    pushBytes(lzw);
  }

  // GIF Trailer
  chunks.push(0x3b);
  return new Uint8Array(chunks);
}

/**
 * Inspect basic metadata and frame count of a GIF binary without Canvas
 */
export function inspectGifBytes(bytes: Uint8Array): GifFileInfo {
  if (bytes.length < 13) {
    throw new Error('File is too small to be a valid GIF.');
  }
  const sig = String.fromCharCode(...bytes.slice(0, 6));
  if (sig !== 'GIF87a' && sig !== 'GIF89a') {
    throw new Error('Invalid GIF signature header.');
  }

  const width = bytes[6] | (bytes[7] << 8);
  const height = bytes[8] | (bytes[9] << 8);
  const packed = bytes[10];
  const hasGct = (packed & 0x80) !== 0;
  const gctCount = hasGct ? 1 << ((packed & 0x07) + 1) : 0;

  let offset = 13 + (hasGct ? gctCount * 3 : 0);
  let frameCount = 0;

  while (offset < bytes.length) {
    const block = bytes[offset++];
    if (block === 0x3b) break; // trailer
    if (block === 0x2c) {
      // Image descriptor
      frameCount++;
      if (offset + 9 >= bytes.length) break;
      const imgPacked = bytes[offset + 8];
      offset += 9;
      if ((imgPacked & 0x80) !== 0) {
        const lctCount = 1 << ((imgPacked & 0x07) + 1);
        offset += lctCount * 3;
      }
      offset++; // LZW min code size
      while (offset < bytes.length) {
        const subLen = bytes[offset++];
        if (subLen === 0) break;
        offset += subLen;
      }
    } else if (block === 0x21) {
      // Extension block
      offset++; // extension label
      while (offset < bytes.length) {
        const subLen = bytes[offset++];
        if (subLen === 0) break;
        offset += subLen;
      }
    } else {
      break;
    }
  }

  return {
    width,
    height,
    version: sig,
    frameCount: Math.max(1, frameCount),
    hasGlobalColorTable: hasGct,
    globalColorCount: gctCount,
    isAnimated: frameCount > 1,
  };
}
