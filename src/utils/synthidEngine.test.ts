import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectAiSignaturesFromBytes,
  stripJpegMetadataBinary,
  stripPngMetadataBinary,
  neutralizeWatermarkPixels,
  buildCameraExifApp1,
  injectCameraExifIntoJpeg,
  CAMERA_PROFILES,
} from '../services/synthidEngine';

test('detectAiSignaturesFromBytes flags C2PA and prompt signatures', () => {
  const fakeAiText = 'C2PA:manifest JUMBF urn:c2pa:claim Midjourney v6.0 prompt: "A cyberpunk city" parameters Steps: 25 Sampler: DPM++ 2M';
  const bytes = new TextEncoder().encode(fakeAiText);
  const result = detectAiSignaturesFromBytes(bytes, 'test-image.jpg');

  assert.equal(result.isClean, false);
  assert.ok(result.riskScore > 50, `Expected riskScore > 50, got ${result.riskScore}`);
  assert.equal(result.hasC2pa, true);
  assert.equal(result.hasPrompts, true);
  assert.ok(result.signatures.length >= 2);
});

test('detectAiSignaturesFromBytes identifies clean standard media', () => {
  const cleanBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]);
  const result = detectAiSignaturesFromBytes(cleanBytes, 'camera-photo.jpg');

  assert.equal(result.isClean, true);
  assert.equal(result.riskScore, 0);
  assert.equal(result.riskLevel, 'CLEAN');
  assert.equal(result.hasC2pa, false);
});

test('stripJpegMetadataBinary removes COM and metadata segments', () => {
  // Construct dummy JPEG with APP1 (EXIF) and COM segment
  const comment = new TextEncoder().encode('synthid deepmind prompt text');
  const comSeg = new Uint8Array([0xff, 0xfe, 0x00, comment.length + 2, ...comment]);
  const soi = new Uint8Array([0xff, 0xd8]);
  const app0 = new Uint8Array([0xff, 0xe0, 0x00, 0x06, 0x4a, 0x46, 0x49, 0x46]);
  const sos = new Uint8Array([0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0x11, 0x22, 0x33, 0xff, 0xd9]);

  const rawJpeg = new Uint8Array(soi.length + comSeg.length + app0.length + sos.length);
  let off = 0;
  rawJpeg.set(soi, off); off += soi.length;
  rawJpeg.set(comSeg, off); off += comSeg.length;
  rawJpeg.set(app0, off); off += app0.length;
  rawJpeg.set(sos, off);

  const stripped = stripJpegMetadataBinary(rawJpeg);
  const text = new TextDecoder().decode(stripped);
  assert.ok(!text.includes('synthid deepmind'));
  assert.equal(stripped[0], 0xff);
  assert.equal(stripped[1], 0xd8);
});

test('stripPngMetadataBinary strips tEXt chunks and keeps IHDR/IDAT/IEND', () => {
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  // IHDR (13 bytes payload + 12 frame = 25 bytes)
  const ihdr = [0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 0x90, 0x77, 0x53, 0xde];
  // tEXt with prompt
  const textChunk = [0x00, 0x00, 0x00, 0x06, 0x74, 0x45, 0x58, 0x74, 0x50, 0x72, 0x6f, 0x6d, 0x70, 0x74, 0x00, 0x00, 0x00, 0x00];
  // IEND
  const iend = [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82];

  const rawPng = new Uint8Array([...pngSig, ...ihdr, ...textChunk, ...iend]);
  const stripped = stripPngMetadataBinary(rawPng);
  const text = new TextDecoder().decode(stripped);
  assert.ok(!text.includes('tEXt'));
  assert.ok(text.includes('IHDR'));
  assert.ok(text.includes('IEND'));
});

test('neutralizeWatermarkPixels scatters high-frequency patterns while keeping pixel bounds valid', () => {
  const width = 16;
  const height = 16;
  const buffer = new Uint8ClampedArray(width * height * 4);
  // Fill with simulated periodic high-frequency watermark noise
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = (i % 8 === 0) ? 200 : 150;     // R
    buffer[i + 1] = 120;                       // G
    buffer[i + 2] = (i % 16 === 0) ? 220 : 140; // B (SynthID chroma)
    buffer[i + 3] = 255;                       // A
  }

  const dummyImageData = {
    width,
    height,
    data: buffer,
    colorSpace: 'srgb' as PredefinedColorSpace,
  } as ImageData;

  const { cleanedData, diffData } = neutralizeWatermarkPixels(dummyImageData, 80, true, 0.015);

  assert.equal(cleanedData.width, width);
  assert.equal(cleanedData.height, height);
  assert.equal(diffData.width, width);
  assert.equal(diffData.height, height);

  // Verify all channels remain strictly within [0, 255]
  for (let i = 0; i < cleanedData.data.length; i++) {
    const val = cleanedData.data[i];
    assert.ok(val >= 0 && val <= 255, `Pixel out of range: ${val}`);
  }
});

test('buildCameraExifApp1 generates a valid TIFF/EXIF APP1 segment', () => {
  const profile = CAMERA_PROFILES['apple-iphone-15-pro'];
  assert.ok(profile !== null);
  const app1 = buildCameraExifApp1(profile!);

  assert.equal(app1[0], 0xff);
  assert.equal(app1[1], 0xe1); // APP1
  const text = new TextDecoder().decode(app1);
  assert.ok(text.includes('Exif'));
  assert.ok(text.includes('Apple'));
  assert.ok(text.includes('iPhone 15 Pro'));
});

test('injectCameraExifIntoJpeg wraps clean JPEG with authentic camera tags', () => {
  const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9]);
  const cloaked = injectCameraExifIntoJpeg(fakeJpeg, 'sony-a7-iv');

  assert.ok(cloaked.length > fakeJpeg.length);
  assert.equal(cloaked[0], 0xff);
  assert.equal(cloaked[1], 0xd8);
  const text = new TextDecoder().decode(cloaked);
  assert.ok(text.includes('SONY'));
  assert.ok(text.includes('ILCE-7M4'));
});
