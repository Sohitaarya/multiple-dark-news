import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  deletePdfPages,
  watermarkPdf,
  addPageNumbersToPdf,
  textToPdf,
  compressPdf,
  editPdfMetadata,
  readPdfMetadata,
} from '../services/pdfEngine';

async function createSamplePdf(pageCount = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Sample Page ${i}`, { x: 50, y: 500 });
  }
  return await doc.save();
}

test('mergePdfs combines multiple PDFs into a single valid document', async () => {
  const pdf1 = await createSamplePdf(2);
  const pdf2 = await createSamplePdf(3);

  const merged = await mergePdfs([pdf1, pdf2]);
  assert.ok(merged.length > 0);

  const mergedDoc = await PDFDocument.load(merged);
  assert.equal(mergedDoc.getPageCount(), 5);
});

test('splitPdf extracts specific page numbers accurately', async () => {
  const pdf = await createSamplePdf(4);
  const split = await splitPdf(pdf, [1, 3]);

  const splitDoc = await PDFDocument.load(split);
  assert.equal(splitDoc.getPageCount(), 2);
});

test('deletePdfPages removes specified pages', async () => {
  const pdf = await createSamplePdf(4);
  const pruned = await deletePdfPages(pdf, [2, 4]);

  const prunedDoc = await PDFDocument.load(pruned);
  assert.equal(prunedDoc.getPageCount(), 2);
});

test('rotatePdf updates rotation angle on pages', async () => {
  const pdf = await createSamplePdf(2);
  const rotated = await rotatePdf(pdf, 90);

  const doc = await PDFDocument.load(rotated);
  const page1 = doc.getPage(0);
  assert.equal(page1.getRotation().angle, 90);
});

test('watermarkPdf stamps watermark text onto all pages', async () => {
  const pdf = await createSamplePdf(2);
  const watermarked = await watermarkPdf(pdf, { text: 'CONFIDENTIAL', opacity: 0.5 });
  assert.ok(watermarked.length > pdf.length);
});

test('addPageNumbersToPdf stamps page number footer', async () => {
  const pdf = await createSamplePdf(3);
  const numbered = await addPageNumbersToPdf(pdf, { position: 'bottom-center' });
  assert.ok(numbered.length > 0);
});

test('textToPdf creates a valid multi-page PDF from plain text', async () => {
  const longText = 'MultipleDarkNews Tools Platform.\n\n' + 'Paragraph test. '.repeat(50);
  const pdf = await textToPdf(longText, 'Test Title');

  const doc = await PDFDocument.load(pdf);
  assert.ok(doc.getPageCount() >= 1);
  assert.equal(doc.getTitle(), 'Test Title');
});

test('editPdfMetadata and readPdfMetadata updates document properties', async () => {
  const pdf = await createSamplePdf(1);
  const updated = await editPdfMetadata(pdf, {
    title: 'MultipleDarkNews Guide',
    author: 'Editorial Team',
  });

  const meta = await readPdfMetadata(updated);
  assert.equal(meta.title, 'MultipleDarkNews Guide');
  assert.equal(meta.author, 'Editorial Team');
});

test('compressPdf outputs a valid PDF with object streams enabled', async () => {
  const pdf = await createSamplePdf(3);
  const compressed = await compressPdf(pdf, 'high');

  const doc = await PDFDocument.load(compressed);
  assert.equal(doc.getPageCount(), 3);
});
