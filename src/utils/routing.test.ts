import test from 'node:test';
import assert from 'node:assert/strict';

import { ALL_TOOLS, getToolBySlug, getToolsByCategory } from '../data/toolsRegistry';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { isStaticAssetPath, resolveAppRoute } from './routing';
import { isPrivateOrInternalHost, normalizePublicDomain, validatePublicHttpUrl } from './networkSafety';
import { markdownToHtml } from '../services/textEngine';
import {
  SUPPORTED_LANGUAGES,
  detectPreferredLanguage,
  getTranslations,
  normalizeLangCode,
} from './i18n';
import { injectRouteSeoIntoHtml, resolveRouteSeoMeta } from './seoHtml';

test('resolveRouteSeoMeta & injectRouteSeoIntoHtml produce unique canonicals for GSC indexing', () => {
  const sampleHtml = '<html><head><title>Default</title><meta name="description" content="Default" /><meta name="robots" content="index, follow" /><meta property="og:title" content="Default" /><meta property="og:description" content="Default" /><meta name="twitter:title" content="Default" /><meta name="twitter:description" content="Default" /><link rel="canonical" href="https://tools.multipledarknews.com" /></head></html>';

  const imgCat = resolveAppRoute('/category/image', '', '', resolvers);
  const imgCatHtml = injectRouteSeoIntoHtml(sampleHtml, resolveRouteSeoMeta(imgCat));
  assert.ok(imgCatHtml.includes('<link rel="canonical" href="https://tools.multipledarknews.com/category/image" />'));

  const imgComp = resolveAppRoute('/image-compressor', '', '', resolvers);
  const imgCompHtml = injectRouteSeoIntoHtml(sampleHtml, resolveRouteSeoMeta(imgComp));
  assert.ok(imgCompHtml.includes('<link rel="canonical" href="https://tools.multipledarknews.com/image-compressor" />'));

  const sohit = resolveAppRoute('/sohit-aarya', '', '', resolvers);
  const sohitHtml = injectRouteSeoIntoHtml(sampleHtml, resolveRouteSeoMeta(sohit));
  assert.ok(sohitHtml.includes('<link rel="canonical" href="https://tools.multipledarknews.com/sohit-aarya" />'));

  const hiddenSitemap = resolveAppRoute('/sitemap', '', '', resolvers);
  const hiddenHtml = injectRouteSeoIntoHtml(sampleHtml, resolveRouteSeoMeta(hiddenSitemap));
  assert.ok(hiddenHtml.includes('content="noindex, nofollow"'));
});

const resolvers = {
  findToolBySlug: (s: string) => getToolBySlug(s),
  hasCategory: (id: string) => Boolean(getCategoryById(id as any)),
};

test('getToolBySlug does not hijack unrelated substrings like /test or /fake', () => {
  assert.equal(getToolBySlug('test'), undefined);
  assert.equal(getToolBySlug('fake'), undefined);
  assert.equal(getToolBySlug('nonexistent-fake-route-123'), undefined);
  assert.equal(getToolBySlug('study-timetable-maker')?.slug, 'study-timetable-maker');
  assert.equal(getToolBySlug('pdf-compressor')?.slug, 'pdf-compressor');
});

test('resolveAppRoute accurately distinguishes valid routes vs hidden/404 routes and /sohit-aarya', () => {
  const validUrls = [
    '/',
    '/study-timetable-maker',
    '/pdf-compressor',
    '/sohit-aarya',
    '/admin',
    '/category/pdf',
    '/tool/pdf-compressor',
  ];
  for (const path of validUrls) {
    const r = resolveAppRoute(path, '', '', resolvers);
    assert.equal(r.is404, false, `Expected ${path} to be valid`);
  }

  // Legacy /portfolio resolves to /sohit-aarya cleanly with URL replacement
  const legacyPortfolio = resolveAppRoute('/portfolio', '', '', resolvers);
  assert.equal(legacyPortfolio.is404, false);
  assert.equal(legacyPortfolio.view, 'portfolio');
  assert.equal(legacyPortfolio.cleanPath, '/sohit-aarya');
  assert.equal(legacyPortfolio.shouldReplaceUrl, true);

  // /sitemap & /seo-hub are hidden from user pages (404), while /sitemap.xml stays a static asset
  const invalidUrls = [
    '/nonexistent-fake-route-123',
    '/category/fake',
    '/tool/fake',
    '/test',
    '/pdf-compressor/extra-segment',
    '/sitemap',
    '/seo-hub',
  ];
  for (const path of invalidUrls) {
    const r = resolveAppRoute(path, '', '', resolvers);
    assert.equal(r.is404, true, `Expected ${path} to resolve to 404`);
    assert.equal(r.view, '404');
  }
});

test('isStaticAssetPath detects asset URLs and rejects page routes', () => {
  assert.equal(isStaticAssetPath('/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png'), true);
  assert.equal(isStaticAssetPath('/assets/nonexistent-image.png'), true);
  assert.equal(isStaticAssetPath('/robots.txt'), true);
  assert.equal(isStaticAssetPath('/sitemap.xml'), true);
  assert.equal(isStaticAssetPath('/study-timetable-maker'), false);
  assert.equal(isStaticAssetPath('/sohit-aarya'), false);
  assert.equal(isStaticAssetPath('/nonexistent-fake-route-123'), false);
});

test('CATEGORIES dynamically derives exact tool counts summing to ALL_TOOLS length (331)', () => {
  const sum = CATEGORIES.reduce((acc, c) => acc + c.toolCount, 0);
  assert.equal(sum, ALL_TOOLS.length);
  assert.ok(ALL_TOOLS.length >= 331);
  assert.equal(ALL_TOOLS.length, 333);
  for (const cat of CATEGORIES) {
    assert.equal(cat.toolCount, getToolsByCategory(cat.id).length, `Mismatch on ${cat.id}`);
  }
});

test('i18n detects user browser/search languages worldwide and supports RTL for Arabic', () => {
  assert.equal(SUPPORTED_LANGUAGES.length, 12);
  assert.equal(normalizeLangCode('hi-IN'), 'hi');
  assert.equal(normalizeLangCode('es-MX'), 'es');
  assert.equal(normalizeLangCode('ar-AE'), 'ar');
  assert.equal(normalizeLangCode('xx-UNKNOWN'), 'en');

  assert.equal(detectPreferredLanguage('?lang=hi', ['en-US']), 'hi');
  assert.equal(detectPreferredLanguage('?hl=es', ['en-US']), 'es');
  assert.equal(detectPreferredLanguage('', ['fr-FR', 'en-US']), 'fr');
  assert.equal(detectPreferredLanguage('', ['ar-SA']), 'ar');
  assert.equal(detectPreferredLanguage('', ['xx-ZZ']), 'en');

  const hiDict = getTranslations('hi');
  assert.ok(hiDict.heroTitle.includes('331'));
  assert.equal(hiDict.founderCta, 'Sohit Aarya');

  const arMeta = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
  assert.equal(arMeta?.rtl, true);
});

test('networkSafety blocks private/loopback IPs and allows public domains/URLs', () => {
  assert.equal(isPrivateOrInternalHost('localhost'), true);
  assert.equal(isPrivateOrInternalHost('127.0.0.1'), true);
  assert.equal(isPrivateOrInternalHost('169.254.169.254'), true);
  assert.equal(isPrivateOrInternalHost('10.0.0.5'), true);
  assert.equal(isPrivateOrInternalHost('tools.multipledarknews.com'), false);

  assert.equal(validatePublicHttpUrl('http://127.0.0.1:3000').valid, false);
  assert.equal(validatePublicHttpUrl('file:///etc/passwd').valid, false);
  assert.equal(validatePublicHttpUrl('https://tools.multipledarknews.com').valid, true);

  const dom = normalizePublicDomain('https://tools.multipledarknews.com/pdf-compressor');
  assert.equal(dom.valid, true);
  if (dom.valid) {
    assert.equal(dom.domain, 'tools.multipledarknews.com');
    assert.equal(dom.rootDomain, 'multipledarknews.com');
  }
});

test('markdownToHtml escapes raw HTML tags and blocks javascript: URLs', () => {
  const xss = markdownToHtml('# Hello <script>alert(1)</script>\n\n[Click](javascript:alert(1))');
  assert.equal(xss.includes('<script>'), false);
  assert.equal(xss.includes('javascript:'), false);
  assert.ok(xss.includes('&lt;script&gt;'));
});
