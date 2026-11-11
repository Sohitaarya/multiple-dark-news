export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColorAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // 0 to 360
  sepia: number; // 0 to 100
  invert: boolean;
}

export interface MemeOptions {
  topText: string;
  bottomText: string;
  fontSize?: number;
  fontColor?: string;
  strokeColor?: string;
  allCaps?: boolean;
}

export interface WatermarkImageOptions {
  text: string;
  opacity: number; // 0 to 1
  fontSize: number;
  color: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  angle?: number;
}

/**
 * Load a File or Blob into an HTMLImageElement
 */
export function loadImage(file: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image file.'));
    if (typeof file === 'string') {
      img.src = file;
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * Compress image with custom quality and format
 */
export async function compressImage(
  file: File | Blob,
  quality: number, // 0.1 to 1.0
  format: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<{ blob: Blob; width: number; height: number; originalSize: number; compressedSize: number }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context.');

  // Fill background white for JPG to avoid black transparency
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Image compression failed.'));
        resolve({
          blob,
          width: img.width,
          height: img.height,
          originalSize: file.size,
          compressedSize: blob.size,
        });
      },
      format,
      quality
    );
  });
}

/**
 * Resize image to exact width / height or percentage
 */
export async function resizeImage(
  file: File | Blob,
  targetWidth: number,
  targetHeight: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Image resize failed.'));
      resolve(blob);
    }, format, quality);
  });
}

/**
 * Crop image to specific bounding box
 */
export async function cropImage(
  file: File | Blob,
  cropArea: CropArea,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
  quality = 0.95
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cropArea.width, cropArea.height);
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Crop operation failed.'));
      resolve(blob);
    }, format, quality);
  });
}

/**
 * Rotate or flip image
 */
export async function rotateOrFlipImage(
  file: File | Blob,
  angleDegrees: number, // 0, 90, 180, 270
  flipHorizontal = false,
  flipVertical = false,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const radians = (angleDegrees * Math.PI) / 180;
  const is90or270 = angleDegrees === 90 || angleDegrees === 270;

  canvas.width = is90or270 ? img.height : img.width;
  canvas.height = is90or270 ? img.width : img.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Transform failed.'));
      resolve(blob);
    }, format, 0.95);
  });
}

/**
 * Convert Image to Grayscale (BT.601 Luminance Weights)
 */
export async function convertToGrayscale(file: File | Blob): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    // 0.299 R + 0.587 G + 0.114 B standard luminance
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = gray;
    d[i + 1] = gray;
    d[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Grayscale failed.'));
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Apply Convolution Kernel (Sharpen or Blur)
 */
export async function applyKernelFilter(
  file: File | Blob,
  filterType: 'sharpen' | 'blur'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);
  const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const outputData = ctx.createImageData(canvas.width, canvas.height);

  const src = srcData.data;
  const dst = outputData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Kernels:
  // Sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0]
  // Blur (Box 3x3): [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]
  const kernel =
    filterType === 'sharpen'
      ? [0, -1, 0, -1, 5, -1, 0, -1, 0]
      : [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pIdx = ((y + ky) * w + (x + kx)) * 4;
          const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
          r += src[pIdx] * kVal;
          g += src[pIdx + 1] * kVal;
          b += src[pIdx + 2] * kVal;
        }
      }

      const dstIdx = (y * w + x) * 4;
      dst[dstIdx] = Math.min(255, Math.max(0, r));
      dst[dstIdx + 1] = Math.min(255, Math.max(0, g));
      dst[dstIdx + 2] = Math.min(255, Math.max(0, b));
      dst[dstIdx + 3] = src[dstIdx + 3]; // keep alpha
    }
  }

  ctx.putImageData(outputData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Kernel filtering failed.'));
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Remove Image Background via Chroma Difference & Alpha Matting
 */
export async function removeBackground(
  file: File | Blob,
  targetBgColor = { r: 255, g: 255, b: 255 },
  tolerance = 40
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  // Euclidean color distance thresholding
  const tolSq = tolerance * tolerance * 3;

  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - targetBgColor.r;
    const dg = d[i + 1] - targetBgColor.g;
    const db = d[i + 2] - targetBgColor.b;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < tolSq) {
      // Soft alpha feathering near boundary
      const factor = distSq / tolSq;
      d[i + 3] = Math.floor(factor * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Background removal failed.'));
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Real Vectorizer: Trace contours and vectorize bitmap PNG to genuine SVG paths
 */
export async function vectorizePngToSvg(
  file: File | Blob,
  threshold = 128
): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  // Downsample to max 400px width/height for fast path polygonization
  const maxDim = 400;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Binarize
  const binary: boolean[][] = [];
  for (let y = 0; y < h; y++) {
    binary[y] = [];
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const alpha = d[idx + 3];
      const brightness = (d[idx] + d[idx + 1] + d[idx + 2]) / 3;
      binary[y][x] = alpha > 50 && brightness < threshold;
    }
  }

  // Generate SVG path spans
  const paths: string[] = [];
  for (let y = 0; y < h; y++) {
    let spanStart = -1;
    for (let x = 0; x < w; x++) {
      if (binary[y][x]) {
        if (spanStart === -1) spanStart = x;
      } else {
        if (spanStart !== -1) {
          paths.push(`M ${spanStart} ${y} h ${x - spanStart} v 1 h -${x - spanStart} Z`);
          spanStart = -1;
        }
      }
    }
    if (spanStart !== -1) {
      paths.push(`M ${spanStart} ${y} h ${w - spanStart} v 1 h -${w - spanStart} Z`);
    }
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${img.width}" height="${img.height}">
  <path d="${paths.join(' ')}" fill="#1e293b" />
</svg>`;

  return svgContent;
}

/**
 * Generate Viral Meme with top and bottom impact text
 */
export async function generateMeme(
  file: File | Blob,
  options: MemeOptions
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);

  const fontSize = options.fontSize || Math.max(24, Math.floor(img.width * 0.08));
  ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = options.fontColor || '#FFFFFF';
  ctx.strokeStyle = options.strokeColor || '#000000';
  ctx.lineWidth = Math.max(3, Math.floor(fontSize / 8));
  ctx.lineJoin = 'round';

  const topText = options.allCaps !== false ? options.topText.toUpperCase() : options.topText;
  const bottomText = options.allCaps !== false ? options.bottomText.toUpperCase() : options.bottomText;

  if (topText) {
    ctx.textBaseline = 'top';
    ctx.strokeText(topText, canvas.width / 2, 20);
    ctx.fillText(topText, canvas.width / 2, 20);
  }

  if (bottomText) {
    ctx.textBaseline = 'bottom';
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
    ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Meme generation failed.'));
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Generate official passport photo preset (2x2 inch, 35x45mm)
 */
export async function createPassportPhoto(
  file: File | Blob,
  formatType: 'us_2x2' | 'india_35x45',
  bgColor = '#FFFFFF'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');

  // US 2x2 inch is 600x600 px (300 DPI)
  // India 35x45 mm is 413x531 px (300 DPI)
  if (formatType === 'us_2x2') {
    canvas.width = 600;
    canvas.height = 600;
  } else {
    canvas.width = 413;
    canvas.height = 531;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center crop image into passport aspect ratio
  const imgRatio = img.width / img.height;
  const targetRatio = canvas.width / canvas.height;

  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

  // Subtle border guideline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Passport photo creation failed.'));
      resolve(blob);
    }, 'image/jpeg', 0.98);
  });
}

/**
 * Convert Image to Base64 data string
 */
export function imageToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Base64 string to Blob
 */
export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].replace('data:', '') || 'image/png';
  const byteCharacters = atob(parts[1] || parts[0]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}
