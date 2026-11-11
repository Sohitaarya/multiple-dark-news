import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  angle?: number;
  color?: { r: number; g: number; b: number };
}

export interface PageNumberOptions {
  position?: 'bottom-center' | 'bottom-right' | 'top-right';
  format?: 'page-x-of-y' | 'x';
}

export interface MetadataOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export interface SignatureOptions {
  signatureImageBytes: Uint8Array;
  imageFormat: 'png' | 'jpg';
  pageIndex: number;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  width: number;
  height: number;
}

/**
 * Merge multiple PDF documents into a single PDF
 */
export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  if (pdfBuffers.length === 0) {
    throw new Error('At least one PDF file is required to merge.');
  }

  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < pdfBuffers.length; i++) {
    const srcDoc = await PDFDocument.load(pdfBuffers[i], { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  return await mergedDoc.save({ useObjectStreams: true });
}

/**
 * Parse string page range (e.g. "1-3, 5") into array of 1-indexed page numbers
 */
export function parsePageRange(rangeStr: string): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          pages.add(i);
        }
      }
    } else {
      const num = Number(trimmed);
      if (!isNaN(num) && num > 0) pages.add(num);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Split a PDF into a new PDF containing only specified pages (1-indexed input)
 */
export async function splitPdf(
  pdfBuffer: Uint8Array,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validPages = pageNumbers
    .filter((num) => num >= 1 && num <= totalPages)
    .map((num) => num - 1); // convert to 0-indexed

  if (validPages.length === 0) {
    throw new Error(`No valid pages selected. Document contains ${totalPages} page(s).`);
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, validPages);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Rotate pages of a PDF by 90, 180, or 270 degrees
 */
export async function rotatePdf(
  pdfBuffer: Uint8Array,
  rotationDegrees: 90 | 180 | 270,
  pageNumbers?: number[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const pages = doc.getPages();

  const targetIndices = pageNumbers && pageNumbers.length > 0
    ? pageNumbers.filter((p) => p >= 1 && p <= totalPages).map((p) => p - 1)
    : pages.map((_, idx) => idx);

  for (const idx of targetIndices) {
    const page = pages[idx];
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + rotationDegrees) % 360));
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Delete specified pages from PDF
 */
export async function deletePdfPages(
  pdfBuffer: Uint8Array,
  pagesToDelete: number[] // 1-indexed
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  const pagesToKeep: number[] = [];
  const deleteSet = new Set(pagesToDelete);

  for (let i = 1; i <= totalPages; i++) {
    if (!deleteSet.has(i)) {
      pagesToKeep.push(i - 1);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Cannot delete all pages from the PDF document.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(doc, pagesToKeep);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Rearrange pages of a PDF according to custom sequence (1-indexed)
 */
export async function rearrangePdfPages(
  pdfBuffer: Uint8Array,
  newPageOrder: number[] // e.g. [3, 1, 2]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const targetIndices = newPageOrder
    .filter((num) => num >= 1 && num <= totalPages)
    .map((num) => num - 1);

  if (targetIndices.length === 0) {
    throw new Error('Invalid page order sequence.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Stamp text watermark across PDF pages
 */
export async function watermarkPdf(
  pdfBuffer: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  const opacity = options.opacity ?? 0.3;
  const fontSize = options.fontSize ?? 48;
  const angle = options.angle ?? 45;
  const color = options.color ?? { r: 0.8, g: 0.1, b: 0.1 };

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(angle),
    });
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Add page numbering to PDF (bottom right, bottom center, top right)
 */
export async function addPageNumbersToPdf(
  pdfBuffer: Uint8Array,
  options: PageNumberOptions = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const totalPages = pages.length;

  const position = options.position || 'bottom-center';
  const format = options.format || 'page-x-of-y';
  const fontSize = 10;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const pageStr = format === 'page-x-of-y' ? `Page ${i + 1} of ${totalPages}` : `${i + 1}`;
    const textWidth = font.widthOfTextAtSize(pageStr, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 20;

    if (position === 'bottom-right') {
      x = width - textWidth - 30;
      y = 20;
    } else if (position === 'top-right') {
      x = width - textWidth - 30;
      y = height - 25;
    }

    page.drawText(pageStr, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
      opacity: 0.8,
    });
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Read and edit PDF metadata properties
 */
export async function readPdfMetadata(pdfBuffer: Uint8Array) {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  return {
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
    subject: doc.getSubject() || '',
    keywords: doc.getKeywords() ? [doc.getKeywords()!] : [],
    creator: doc.getCreator() || '',
    producer: doc.getProducer() || '',
    pageCount: doc.getPageCount(),
  };
}

export async function editPdfMetadata(
  pdfBuffer: Uint8Array,
  meta: MetadataOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  if (meta.title !== undefined) doc.setTitle(meta.title);
  if (meta.author !== undefined) doc.setAuthor(meta.author);
  if (meta.subject !== undefined) doc.setSubject(meta.subject);
  if (meta.keywords !== undefined) doc.setKeywords(meta.keywords);
  if (meta.creator !== undefined) doc.setCreator(meta.creator);
  if (meta.producer !== undefined) doc.setProducer(meta.producer);

  return await doc.save({ useObjectStreams: true });
}

/**
 * Stamp visual signature on PDF
 */
export async function signPdf(
  pdfBuffer: Uint8Array,
  options: SignatureOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  const pageIndex = Math.min(Math.max(0, options.pageIndex), pages.length - 1);
  const page = pages[pageIndex];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  let embeddedImage;
  if (options.imageFormat === 'png') {
    embeddedImage = await doc.embedPng(options.signatureImageBytes);
  } else {
    embeddedImage = await doc.embedJpg(options.signatureImageBytes);
  }

  const x = (options.xPercent / 100) * pageWidth;
  const y = (options.yPercent / 100) * pageHeight;

  page.drawImage(embeddedImage, {
    x,
    y,
    width: options.width,
    height: options.height,
  });

  return await doc.save({ useObjectStreams: true });
}

/**
 * Convert plain text string or TXT file into a structured PDF document
 */
export async function textToPdf(
  text: string,
  docTitle = 'Document'
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 standard width (points)
  const pageHeight = 841.89; // A4 standard height (points)
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  const titleSize = 18;
  const bodySize = 10;

  // Split text into words and wrap lines to fit width
  const paragraphs = text.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      wrappedLines.push('');
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = font.widthOfTextAtSize(testLine, bodySize);
      if (lineWidth <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  // Draw pages
  let currentPage = doc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin - titleSize;

  // Header Title
  currentPage.drawText(docTitle, {
    x: margin,
    y: currentY,
    size: titleSize,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.15),
  });
  currentY -= titleSize + 15;

  for (const line of wrappedLines) {
    if (currentY <= margin + lineHeight) {
      currentPage = doc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin - lineHeight;
    }

    if (line) {
      currentPage.drawText(line, {
        x: margin,
        y: currentY,
        size: bodySize,
        font,
        color: rgb(0.15, 0.15, 0.2),
      });
    }

    currentY -= lineHeight;
  }

  doc.setTitle(docTitle);
  return await doc.save({ useObjectStreams: true });
}

/**
 * Convert images (JPG / PNG) into a high-quality PDF document
 */
export async function imagesToPdf(
  images: { bytes: Uint8Array; format: 'jpg' | 'png' }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const imgData of images) {
    let embeddedImg;
    if (imgData.format === 'png') {
      embeddedImg = await doc.embedPng(imgData.bytes);
    } else {
      embeddedImg = await doc.embedJpg(imgData.bytes);
    }

    const imgDims = embeddedImg.scale(1);
    const page = doc.addPage([imgDims.width, imgDims.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Optimize and compress PDF internal streams
 */
export async function compressPdf(
  pdfBuffer: Uint8Array,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  // Strip non-essential metadata if high compression
  if (quality === 'high') {
    doc.setKeywords([]);
    doc.setSubject('');
  }

  // Re-encode with object streams enabled to compress cross-references
  return await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
}

/**
 * Crop PDF margins by applying MediaBox insets
 */
export async function cropPdf(
  pdfBuffer: Uint8Array,
  marginPoints = 20
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (const page of pages) {
    const { x, y, width, height } = page.getMediaBox();
    if (width > marginPoints * 2 && height > marginPoints * 2) {
      page.setMediaBox(
        x + marginPoints,
        y + marginPoints,
        width - marginPoints * 2,
        height - marginPoints * 2
      );
    }
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Repair damaged PDF structures by recreating document dictionary
 */
export async function repairPdf(pdfBuffer: Uint8Array): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const cleanDoc = await PDFDocument.create();
  const pages = await cleanDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  pages.forEach((p) => cleanDoc.addPage(p));
  return await cleanDoc.save({ useObjectStreams: true });
}
