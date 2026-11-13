/**
 * Advanced Image Engine covering all 41 Image Tools
 * Includes pure TypeScript binary JPEG APP0 / PNG pHYs DPI writers,
 * EXIF / TIFF IFD parser, upscaler, palette extractor, watermarks, collage, borders, & SVG->PNG.
 */
import { loadImage } from './imageEngine';
import { encodeGif, inspectGifBytes } from './gifEngine';

/**
 * Pure CRC-32 calculation (standard ISO 3309 / PNG chunk checksum)
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Inject target DPI into JPEG JFIF APP0 header bytes
 */
export function setJpegDpiBytes(jpegBytes: Uint8Array, dpi: number): Uint8Array {
  const copy = new Uint8Array(jpegBytes);
  if (copy[0] !== 0xff || copy[1] !== 0xd8) {
    throw new Error('Not a valid JPEG file');
  }
  // Look for APP0 (FF E0) with JFIF\0 signature
  let i = 2;
  while (i + 4 < copy.length) {
    if (copy[i] !== 0xff) break;
    const marker = copy[i + 1];
    const segLen = (copy[i + 2] << 8) | copy[i + 3];
    if (
      marker === 0xe0 &&
      segLen >= 16 &&
      copy[i + 4] === 0x4a && // J
      copy[i + 5] === 0x46 && // F
      copy[i + 6] === 0x49 && // I
      copy[i + 7] === 0x46 && // F
      copy[i + 8] === 0x00
    ) {
      copy[i + 11] = 1; // units = pixels per inch
      copy[i + 12] = (dpi >> 8) & 0xff;
      copy[i + 13] = dpi & 0xff;
      copy[i + 14] = (dpi >> 8) & 0xff;
      copy[i + 15] = dpi & 0xff;
      return copy;
    }
    if (marker === 0xda) break; // SOS
    i += 2 + segLen;
  }
  // If no APP0 JFIF segment, prepend one right after SOI (FF D8)
  const app0 = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01,
    0x01, // dots per inch
    (dpi >> 8) & 0xff, dpi & 0xff,
    (dpi >> 8) & 0xff, dpi & 0xff,
    0x00, 0x00,
  ]);
  const out = new Uint8Array(2 + app0.length + (copy.length - 2));
  out.set(copy.slice(0, 2), 0);
  out.set(app0, 2);
  out.set(copy.slice(2), 2 + app0.length);
  return out;
}

/**
 * Inject target DPI into PNG pHYs chunk (inches -> meters conversion)
 */
export function setPngDpiBytes(pngBytes: Uint8Array, dpi: number): Uint8Array {
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let k = 0; k < 8; k++) {
    if (pngBytes[k] !== pngSig[k]) throw new Error('Not a valid PNG file');
  }
  const ppm = Math.round(dpi / 0.0254); // pixels per meter
  const physChunk = new Uint8Array(4 + 4 + 9 + 4);
  const view = new DataView(physChunk.buffer);
  view.setUint32(0, 9, false); // length
  physChunk[4] = 0x70; // p
  physChunk[5] = 0x48; // H
  physChunk[6] = 0x59; // Y
  physChunk[7] = 0x73; // s
  view.setUint32(8, ppm, false);
  view.setUint32(12, ppm, false);
  physChunk[16] = 1; // unit specifier: meter
  const crc = crc32(physChunk.slice(4, 17));
  view.setUint32(17, crc, false);

  // Strip any existing pHYs chunk and insert right after IHDR (chunk 1)
  const outParts: Uint8Array[] = [pngBytes.slice(0, 8)];
  let pos = 8;
  let inserted = false;
  while (pos + 12 <= pngBytes.length) {
    const chunkLen = new DataView(pngBytes.buffer, pngBytes.byteOffset + pos, 4).getUint32(0, false);
    const type = String.fromCharCode(...pngBytes.slice(pos + 4, pos + 8));
    const totalLen = 12 + chunkLen;
    if (type !== 'pHYs') {
      outParts.push(pngBytes.slice(pos, pos + totalLen));
    }
    if (type === 'IHDR' && !inserted) {
      outParts.push(physChunk);
      inserted = true;
    }
    pos += totalLen;
    if (type === 'IEND') break;
  }
  const totalBytes = outParts.reduce((a, b) => a + b.length, 0);
  const res = new Uint8Array(totalBytes);
  let off = 0;
  for (const part of outParts) {
    res.set(part, off);
    off += part.length;
  }
  return res;
}

/**
 * Pure Binary JPEG EXIF (APP1 TIFF/IFD0) & PNG Metadata Inspector
 */
export function parseImageExifBinary(bytes: Uint8Array): Record<string, string> {
  const info: Record<string, string> = {};
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    info['Format'] = 'JPEG / JFIF';
    let pos = 2;
    while (pos + 4 < bytes.length) {
      if (bytes[pos] !== 0xff) break;
      const marker = bytes[pos + 1];
      const len = (bytes[pos + 2] << 8) | bytes[pos + 3];
      if (marker === 0xe0 && len >= 14) {
        const unit = bytes[pos + 11];
        const xDpi = (bytes[pos + 12] << 8) | bytes[pos + 13];
        const yDpi = (bytes[pos + 14] << 8) | bytes[pos + 15];
        info['Density'] = `${xDpi} × ${yDpi} ${unit === 1 ? 'DPI' : unit === 2 ? 'DPCM' : 'aspect'}`;
      }
      if (marker === 0xc0 || marker === 0xc2) {
        const h = (bytes[pos + 5] << 8) | bytes[pos + 6];
        const w = (bytes[pos + 7] << 8) | bytes[pos + 8];
        info['Dimensions'] = `${w} × ${h} px`;
      }
      if (marker === 0xe1 && String.fromCharCode(...bytes.slice(pos + 4, pos + 8)) === 'Exif') {
        info['EXIF Segment'] = `Present (${len} bytes)`;
        const tiffStart = pos + 10;
        const littleEndian = bytes[tiffStart] === 0x49 && bytes[tiffStart + 1] === 0x49;
        const dv = new DataView(bytes.buffer, bytes.byteOffset + tiffStart);
        try {
          const ifdOffset = dv.getUint32(4, littleEndian);
          const count = dv.getUint16(ifdOffset, littleEndian);
          const tagNames: Record<number, string> = {
            0x010f: 'Camera Make',
            0x0110: 'Camera Model',
            0x0112: 'Orientation',
            0x0131: 'Software',
            0x0132: 'Date Modified',
            0x013b: 'Artist / Copyright',
          };
          for (let e = 0; e < Math.min(count, 40); e++) {
            const base = ifdOffset + 2 + e * 12;
            const tag = dv.getUint16(base, littleEndian);
            const type = dv.getUint16(base + 2, littleEndian);
            const valCount = dv.getUint32(base + 4, littleEndian);
            if (tagNames[tag] && type === 2 && valCount > 1 && valCount < 120) {
              const strOff = valCount > 4 ? dv.getUint32(base + 8, littleEndian) : base + 8;
              const strBytes = bytes.slice(tiffStart + strOff, tiffStart + strOff + valCount - 1);
              info[tagNames[tag]] = new TextDecoder().decode(strBytes).replace(/\0/g, '').trim();
            }
          }
        } catch {
          // Malformed EXIF IFD handled gracefully
        }
      }
      if (marker === 0xda) break;
      pos += 2 + len;
    }
    if (!info['EXIF Segment']) info['EXIF Segment'] = 'None (clean JPEG)';
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    info['Format'] = 'PNG';
    let pos = 8;
    while (pos + 12 <= bytes.length) {
      const len = new DataView(bytes.buffer, bytes.byteOffset + pos, 4).getUint32(0, false);
      const type = String.fromCharCode(...bytes.slice(pos + 4, pos + 8));
      if (type === 'IHDR') {
        const w = new DataView(bytes.buffer, bytes.byteOffset + pos + 8, 4).getUint32(0, false);
        const h = new DataView(bytes.buffer, bytes.byteOffset + pos + 12, 4).getUint32(0, false);
        info['Dimensions'] = `${w} × ${h} px`;
        info['Bit Depth'] = `${bytes[pos + 16]}-bit`;
      } else if (type === 'pHYs' && len >= 9) {
        const ppmX = new DataView(bytes.buffer, bytes.byteOffset + pos + 8, 4).getUint32(0, false);
        info['DPI'] = `${Math.round(ppmX * 0.0254)} DPI`;
      } else if (type === 'tEXt') {
        const rawText = new TextDecoder().decode(bytes.slice(pos + 8, pos + 8 + Math.min(len, 120)));
        const [k, v] = rawText.split('\0');
        if (k) info[`Metadata (${k})`] = v || '';
      }
      pos += 12 + len;
      if (type === 'IEND') break;
    }
  } else {
    info['Format'] = 'Raster Image';
  }
  return info;
}

export async function convertImageWithDpi(
  file: File,
  targetDpi: number,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Encode failed'))), format, 0.95)
  );
  const arr = new Uint8Array(await blob.arrayBuffer());
  const patched = format === 'image/jpeg' ? setJpegDpiBytes(arr, targetDpi) : setPngDpiBytes(arr, targetDpi);
  return new Blob([patched as unknown as BlobPart], { type: format });
}

export async function upscaleImageCanvas(file: File, scale: 2 | 3 | 4): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(8000, img.width * scale);
  canvas.height = Math.min(8000, img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Upscale failed'))), 'image/png'));
}

export async function changeImageBackground(
  file: File,
  bgColor: string,
  tolerance = 45
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  // Parse hex replacement background
  const hex = bgColor.replace('#', '');
  const br = parseInt(hex.slice(0, 2), 16) || 255;
  const bg = parseInt(hex.slice(2, 4), 16) || 255;
  const bb = parseInt(hex.slice(4, 6), 16) || 255;

  // Sample corner pixel as detected backdrop color if mostly opaque
  const cornerR = d[0];
  const cornerG = d[1];
  const cornerB = d[2];
  const tolSq = tolerance * tolerance * 3;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    const dr = d[i] - cornerR;
    const dg = d[i + 1] - cornerG;
    const db = d[i + 2] - cornerB;
    const distSq = dr * dr + dg * dg + db * db;
    if (a < 40 || distSq < tolSq) {
      d[i] = br;
      d[i + 1] = bg;
      d[i + 2] = bb;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('BG replace failed'))), 'image/png'));
}

export async function watermarkImageCanvas(
  file: File,
  text: string,
  opacity = 0.4,
  position: 'bottom-right' | 'center' | 'tiled' = 'bottom-right',
  color = '#ffffff'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const fontSize = Math.max(20, Math.round(canvas.width * 0.05));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  if (position === 'center') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  } else if (position === 'tiled') {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = 'center';
    const stepX = Math.max(180, text.length * fontSize * 0.8);
    const stepY = fontSize * 3.2;
    for (let y = -canvas.height; y < canvas.height; y += stepY) {
      for (let x = -canvas.width; x < canvas.width; x += stepX) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  } else {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, canvas.width - 24, canvas.height - 20);
  }
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Watermark failed'))), 'image/png'));
}

export async function adjustImageColorsCanvas(
  file: File,
  adj: { brightness: number; contrast: number; saturate: number; hue: number; sepia: number; invert: number }
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturate}%) hue-rotate(${adj.hue}deg) sepia(${adj.sepia}%) invert(${adj.invert}%)`;
  ctx.drawImage(img, 0, 0);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Color adjust failed'))), 'image/png'));
}

export async function addImageBorderCanvas(file: File, borderWidth: number, borderColor: string): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width + borderWidth * 2;
  canvas.height = img.height + borderWidth * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, borderWidth, borderWidth);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Border failed'))), 'image/png'));
}

export async function createCollageCanvas(files: File[], cols = 2, gap = 16, bgColor = '#0f172a'): Promise<Blob> {
  const imgs = await Promise.all(files.map((f) => loadImage(f)));
  const cellW = 600;
  const cellH = 600;
  const rows = Math.ceil(imgs.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellW + (cols + 1) * gap;
  canvas.height = rows * cellH + (rows + 1) * gap;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  imgs.forEach((im, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const dx = gap + c * (cellW + gap);
    const dy = gap + r * (cellH + gap);
    const scale = Math.max(cellW / im.width, cellH / im.height);
    const sw = cellW / scale;
    const sh = cellH / scale;
    const sx = (im.width - sw) / 2;
    const sy = (im.height - sh) / 2;
    ctx.drawImage(im, sx, sy, sw, sh, dx, dy, cellW, cellH);
  });

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Collage failed'))), 'image/jpeg', 0.94));
}

export async function renderScreenshotBeautify(
  file: File,
  padding = 48,
  radius = 20,
  gradientFrom = '#0f172a',
  gradientTo = '#be123c'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width + padding * 2;
  canvas.height = img.height + padding * 2;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, gradientFrom);
  grad.addColorStop(1, gradientTo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  ctx.beginPath();
  ctx.roundRect(padding, padding, img.width, img.height, radius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, padding, img.width, img.height, radius);
  ctx.clip();
  ctx.drawImage(img, padding, padding);
  ctx.restore();

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Screenshot compose failed'))), 'image/png'));
}

export async function analyzePixelsAndPalette(file: File): Promise<{
  width: number;
  height: number;
  totalPixels: number;
  megapixels: string;
  aspectRatio: string;
  palette: string[];
}> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const maxDim = 200;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const buckets: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = Math.round(data[i] / 24) * 24;
    const g = Math.round(data[i + 1] / 24) * 24;
    const b = Math.round(data[i + 2] / 24) * 24;
    const hex = `#${[r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    buckets[hex] = (buckets[hex] || 0) + 1;
  }

  const palette = Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex]) => hex);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(img.width, img.height) || 1;
  const totalPixels = img.width * img.height;

  return {
    width: img.width,
    height: img.height,
    totalPixels,
    megapixels: (totalPixels / 1_000_000).toFixed(2) + ' MP',
    aspectRatio: `${img.width / d}:${img.height / d}`,
    palette,
  };
}

export async function renderSvgToPngBlob(svgFile: File, scale = 2): Promise<Blob> {
  const svgText = await svgFile.text();
  const blobUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImage(blobUrl);
    const w = Math.max(100, (img.width || 512) * scale);
    const h = Math.max(100, (img.height || 512) * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('SVG export failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export async function convertPngToGifBlob(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const maxW = Math.min(img.width, 800);
  const scale = maxW / img.width;
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const gifBytes = encodeGif([{ rgba: imgData.data, width: w, height: h, delayMs: 100 }]);
  return new Blob([gifBytes as unknown as BlobPart], { type: 'image/gif' });
}

export async function processGifFile(file: File, mode: 'to-png' | 'compress'): Promise<{ blob: Blob; infoText: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = inspectGifBytes(bytes);
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const scale = mode === 'compress' ? 0.75 : 1;
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (mode === 'to-png') {
    const pngBlob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('GIF to PNG failed'))), 'image/png')
    );
    return {
      blob: pngBlob,
      infoText: `Extracted PNG frame (${canvas.width}×${canvas.height}px) from ${info.version} (${info.frameCount} frame(s) detected).`,
    };
  }
  const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const compressedGif = encodeGif([{ rgba, width: canvas.width, height: canvas.height, delayMs: 100 }]);
  return {
    blob: new Blob([compressedGif as unknown as BlobPart], { type: 'image/gif' }),
    infoText: `Compressed GIF (${canvas.width}×${canvas.height}px) • Original ${(bytes.length / 1024).toFixed(1)} KB → ${(compressedGif.length / 1024).toFixed(1)} KB`,
  };
}
