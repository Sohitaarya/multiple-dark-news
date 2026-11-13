import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateLoanEmi,
  calculateBmi,
  calculateGst,
  convertLength,
  convertWeight,
  convertTemperature,
  convertStorage,
} from '../services/calcEngine';

import {
  analyzeText,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  removeDuplicateLines,
  cleanText,
  computeTextDiff,
} from '../services/textEngine';

import {
  formatJson,
  minifyJson,
  encodeBase64,
  decodeBase64,
  decodeJwt,
  generateUuidV4,
  convertTimestamp,
  computeHash,
} from '../services/devToolsEngine';

import {
  getToolBySlug,
  getToolsByCategory,
  searchTools,
  getRegistryStats,
  ALL_TOOLS,
} from '../data/toolsRegistry';
import { adminAuthService, DEFAULT_INITIAL_PASSWORD, sha256 } from '../services/adminAuthService';

test('calculateLoanEmi computes accurate EMI and interest', () => {
  const result = calculateLoanEmi(100000, 10, 1); // 100k at 10% for 1 year
  assert.ok(result.monthlyEmi > 8700 && result.monthlyEmi < 8900);
  assert.equal(result.tenureMonths, 12);
  assert.ok(result.totalInterest > 5000 && result.totalInterest < 6000);
});

test('calculateBmi evaluates BMI and healthy weight categories', () => {
  const normal = calculateBmi(70, 175);
  assert.equal(normal.bmi, 22.9);
  assert.equal(normal.category, 'Normal weight');

  const overweight = calculateBmi(90, 175);
  assert.equal(overweight.category, 'Overweight');
});

test('calculateGst computes inclusive and exclusive tax amounts', () => {
  const exclusive = calculateGst(1000, 18, 'exclusive');
  assert.equal(exclusive.gstAmount, 180);
  assert.equal(exclusive.totalAmount, 1180);
  assert.equal(exclusive.cgst, 90);
  assert.equal(exclusive.sgst, 90);

  const inclusive = calculateGst(1180, 18, 'inclusive');
  assert.equal(inclusive.baseAmount, 1000);
  assert.equal(inclusive.gstAmount, 180);
});

test('unit converters convert accurately across metric and imperial', () => {
  // 1 mile ~ 1609.344 meters
  const metersInMile = convertLength(1, 'miles', 'meters');
  assert.equal(metersInMile, 1609.344);

  // 1 kg ~ 2.20462 pounds
  const poundsInKg = convertWeight(1, 'kilograms', 'pounds');
  assert.ok(poundsInKg > 2.2 && poundsInKg < 2.21);

  // 100 Celsius to Fahrenheit is 212
  const f = convertTemperature(100, 'C', 'F');
  assert.equal(f, 212);

  // 1 GB = 1000 MB
  const mbInGb = convertStorage(1, 'gb', 'mb');
  assert.equal(mbInGb, 1000);
});

test('analyzeText calculates words, characters, sentences, and reading time', () => {
  const sample = 'MultipleDarkNews Tools platform is ultra fast. It provides 325+ tools for everyone!';
  const stats = analyzeText(sample);
  assert.equal(stats.words, 12);
  assert.equal(stats.sentences, 2);
  assert.ok(stats.characters > 50);
});

test('case conversions transform text properly', () => {
  assert.equal(toTitleCase('the quick brown fox'), 'The Quick Brown Fox');
  assert.equal(toSentenceCase('HELLO WORLD. HOW ARE YOU?'), 'Hello world. How are you?');
  assert.equal(toCamelCase('multiple dark news'), 'multipleDarkNews');
  assert.equal(toSnakeCase('Multiple Dark News'), 'multiple_dark_news');
  assert.equal(toKebabCase('Multiple Dark News'), 'multiple-dark-news');
});

test('removeDuplicateLines deduplicates accurately', () => {
  const input = 'apple\nbanana\napple\norange\nbanana';
  const deduped = removeDuplicateLines(input);
  assert.equal(deduped, 'apple\nbanana\norange');
});

test('cleanText removes HTML and cleans whitespace', () => {
  const messy = '<p>Hello   <strong>World</strong>! </p>';
  const cleaned = cleanText(messy);
  assert.equal(cleaned, 'Hello World!');
});

test('computeTextDiff highlights added and removed lines', () => {
  const a = 'line 1\nline 2';
  const b = 'line 1\nline modified';
  const diff = computeTextDiff(a, b);
  assert.equal(diff.length, 3);
  assert.equal(diff[0].type, 'unchanged');
  assert.equal(diff[1].type, 'removed');
  assert.equal(diff[2].type, 'added');
});

test('formatJson and minifyJson validate and format properly', () => {
  const valid = '{"name":"MultipleDarkNews","status":"active"}';
  const formatted = formatJson(valid, 2);
  assert.equal(formatted.success, true);
  assert.ok(formatted.result.includes('\n'));

  const minified = minifyJson(formatted.result);
  assert.equal(minified.success, true);
  assert.equal(minified.result, valid);

  const invalid = formatJson('{name: invalid}');
  assert.equal(invalid.success, false);
});

test('Base64 encoding and decoding handles UTF-8 characters', () => {
  const original = 'MultipleDarkNews 🔥 100% Secure';
  const encoded = encodeBase64(original);
  const decoded = decodeBase64(encoded);
  assert.equal(decoded, original);
});

test('generateUuidV4 produces valid standard UUID format', () => {
  const uuid = generateUuidV4();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.match(uuid, uuidRegex);
});

test('convertTimestamp extracts UTC and local dates', () => {
  const ts = 1600000000; // 2020-09-13T12:26:40.000Z
  const conv = convertTimestamp(ts);
  assert.ok(conv.utc.includes('2020'));
  assert.equal(conv.epochSeconds, 1600000000);
});

test('tools registry contains all 325+ cataloged tools with valid metadata', () => {
  assert.ok(ALL_TOOLS.length >= 325, `Expected >= 325 tools, found ${ALL_TOOLS.length}`);

  const pdfTools = getToolsByCategory('pdf');
  assert.equal(pdfTools.length, 35, `Expected 35 PDF tools, found ${pdfTools.length}`);

  const imageTools = getToolsByCategory('image');
  assert.ok(imageTools.length >= 40, `Expected >= 40 Image tools, found ${imageTools.length}`);

  const compressor = getToolBySlug('pdf-compressor');
  assert.ok(compressor);
  assert.equal(compressor.name, 'PDF Compressor');
  assert.equal(compressor.status, 'PRODUCTION_READY');

  const searchResults = searchTools('watermark');
  assert.ok(searchResults.length >= 2);

  const stats = getRegistryStats();
  assert.ok(stats.productionReady >= 60);
  assert.ok(stats.total >= 325);
});

test('simulateSerp and generateMetaTags create optimal Google search tags', async () => {
  const { simulateSerp, generateMetaTags, generateSlug } = await import('../services/seoToolsEngine');
  const serp = simulateSerp('Free Online PDF Compressor | MultipleDarkNews', 'Compress PDF files online with 100% privacy and zero file uploads.', 'https://multipledarknews.com/#tool/pdf-compressor');
  assert.ok(serp.score >= 70);
  assert.ok(serp.desktopTitle.includes('PDF Compressor'));
  assert.equal(serp.isTitleTruncated, false);

  const meta = generateMetaTags({
    title: 'Test Title',
    description: 'Test Description',
    keywords: 'test, keywords',
  });
  assert.ok(meta.includes('<title>Test Title</title>'));
  assert.ok(meta.includes('name="description"'));
  assert.ok(meta.includes('property="og:title"'));

  const slug = generateSlug('Free Online PDF Compressor 2026!');
  assert.equal(slug, 'free-online-pdf-compressor-2026');
});

test('generateXmlSitemap indexes all 325+ tools conforming to sitemaps.org', async () => {
  const { generateXmlSitemap, getSitemapEntries } = await import('../services/sitemapGenerator');
  const entries = getSitemapEntries();
  assert.ok(entries.length >= 340, `Expected >= 340 entries, found ${entries.length}`);

  const xml = generateXmlSitemap('https://multipledarknews.com');
  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  assert.ok(xml.includes('https://multipledarknews.com/pdf-compressor'));
  assert.ok(xml.includes('https://multipledarknews.com/category/pdf'));
  assert.ok(xml.includes('<priority>0.9</priority>'));
});

test('extractYouTubeThumbnails parses video ID and yields HD thumbnails', async () => {
  const { extractYouTubeThumbnails } = await import('../services/mediaToolsEngine');
  const res = extractYouTubeThumbnails('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(res.valid, true);
  assert.equal(res.videoId, 'dQw4w9WgXcQ');
  assert.ok(res.maxRes?.includes('maxresdefault.jpg'));
});

test('calculateGpa accurately calculates cumulative grade point average', async () => {
  const { calculateGpa } = await import('../services/educationToolsEngine');
  const gpa = calculateGpa([
    { courseName: 'CS101', credits: 4, grade: 'A' }, // 16
    { courseName: 'MATH', credits: 3, grade: 'B' },  // 9
  ]);
  assert.equal(gpa.totalCredits, 7);
  assert.equal(gpa.gpa, 3.57); // 25 / 7 = 3.5714
});

test('3D studio and Gemini AI tools are fully registered and PRODUCTION_READY', () => {
  const ids = [
    '3d-scene-viewer',
    'ai-image-generator',
    'ai-search-assistant',
    'ai-places-finder',
    'ai-voice-transcriber',
    'live-voice-chat'
  ];

  for (const id of ids) {
    const tool = getToolBySlug(id);
    assert.ok(tool, `Tool ${id} must exist in registry`);
    assert.equal(tool.status, 'PRODUCTION_READY');
    assert.ok(tool.name.length > 5);
    assert.ok(tool.keywords.length >= 2);
  }

  // Verify 0 tools are non-production ready
  const nonProd = ALL_TOOLS.filter((t) => t.status !== 'PRODUCTION_READY');
  assert.equal(nonProd.length, 0, `All tools must be PRODUCTION_READY, found ${nonProd.length}`);
});

test('adminAuthService locks unauthorized access and verifies credentials', async () => {
  // 1. Initial state is locked
  adminAuthService.logout();
  assert.equal(adminAuthService.isAuthenticated(), false);

  // 2. SHA-256 produces valid hex digest
  const hash = await sha256('testpassword123');
  assert.ok(hash && hash.length === 64);

  // 3. Incorrect password fails
  const failedAttempt = await adminAuthService.login('wrongpassword999');
  assert.equal(failedAttempt.success, false);
  assert.equal(adminAuthService.isAuthenticated(), false);

  // 4. Correct default master password succeeds
  const loginSuccess = await adminAuthService.login(DEFAULT_INITIAL_PASSWORD);
  assert.equal(loginSuccess.success, true);
  assert.equal(adminAuthService.isAuthenticated(), true);

  // 5. Change password flow
  const changeRes = await adminAuthService.changePassword(DEFAULT_INITIAL_PASSWORD, 'superSecretCustom2026!');
  assert.equal(changeRes.success, true);

  // 6. Old password now rejected
  adminAuthService.logout();
  const oldLogin = await adminAuthService.login(DEFAULT_INITIAL_PASSWORD);
  assert.equal(oldLogin.success, false);

  // 7. New password succeeds
  const newLogin = await adminAuthService.login('superSecretCustom2026!');
  assert.equal(newLogin.success, true);
  assert.equal(adminAuthService.isAuthenticated(), true);

  // 8. Logout locks session again
  adminAuthService.logout();
  assert.equal(adminAuthService.isAuthenticated(), false);

  // 9. Reset to default for clean state
  await adminAuthService.resetToDefault();
  assert.equal(await adminAuthService.isDefaultPasswordInUse(), true);
});


