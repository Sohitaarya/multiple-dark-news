import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

import { ALL_TOOLS } from '../data/toolsRegistry';
import { encodeGif, inspectGifBytes } from '../services/gifEngine';
import { CONVERTER_SPECS } from '../services/unitConverterEngine';
import {
  evaluateMathExpression,
  calculatePercentage,
  calculateDiscount,
  calculateBmrAndTdee,
  calculateInterest,
  calculateInternationalIncomeTax,
  calculateSalaryBreakdown,
  calculateProfitAndLoss,
  calculateAttendance,
  calculateElectricityBill,
  calculateFuelTripCost,
  calculateStatistics,
  calculateRatio,
  calculateFractions,
  calculateProbability,
  formatTimeInZones,
} from '../services/calcAdvancedEngine';
import {
  sortTextLines,
  reverseTextMode,
  findAndReplaceText,
  removeExtraSpaces,
  removeLineBreaks,
  removeEmojis,
  htmlToPlainText,
  calculateReadabilityMetrics,
  convertToUnicodeRepresentations,
  generateFancyTextVariants,
  checkGrammarAndStyle,
  comparePlagiarismSimilarity,
  encryptTextAesGcm,
  decryptTextAesGcm,
} from '../services/textAdvancedEngine';
import {
  encodeUrlPayload,
  decodeUrlPayload,
  runRegexTest,
  parseAndConvertColor,
  formatHtml,
  minifyHtml,
  formatCss,
  minifyCss,
  formatJs,
  minifyJs,
  formatSql,
  minifySql,
  jsonToXml,
  xmlToJson,
  parseYamlSafe,
  parseUserAgentString,
  describeCronExpression,
  generateHtaccessRules,
  generateHtmlTableCode,
} from '../services/devAdvancedEngine';
import { crc32, setJpegDpiBytes, setPngDpiBytes, parseImageExifBinary } from '../services/imageAdvancedEngine';
import { createBookletPdf, unlockPdfRestrictions, annotateEditPdf } from '../services/pdfAdvancedEngine';
import {
  encodeWavFromChannels,
  trimPcmChannels,
  applyGainPcmChannels,
  reversePcmChannels,
  applyFadePcmChannels,
  removeSilencePcmChannels,
  mixChannelsMode,
  resampleLinearPcm,
  mergePcmBuffers,
} from '../services/audioEngine';
import {
  generateRandomNumbersSet,
  generateRandomStringsList,
  compareHashChecksums,
  analyzeUrlSafety,
  validateEmailAddress,
  inspectIpAddressDetails,
  generateRfcTotpCode,
  generateSchemaJsonLd,
  generateHreflangTags,
  testRobotsTxtPath,
  validateXmlSitemapContent,
  generateKeywordIdeas,
  generateSocialContentSuite,
  formatUnicodeSocialPost,
  analyzeVideoTitleCtr,
} from '../services/seoSecuritySocialEngine';
import { convertSrtToVtt, convertVttToSrt, parseSubtitleCues } from '../services/videoEngine';
import { wordsToNumber, solveLinearEquation } from '../services/educationToolsEngine';

test('Every single tool ID in ALL_TOOLS is explicitly wired across ToolRunner and modular workspaces', () => {
  const combinedSource = [
    'src/components/tools/ToolRunner.tsx',
    'src/components/tools/PdfImageAdvancedWorkspace.tsx',
    'src/components/tools/DevTextWorkspace.tsx',
    'src/components/tools/CalcUnitWorkspace.tsx',
    'src/components/tools/SeoSecuritySocialWorkspace.tsx',
    'src/components/tools/MediaAudioVideoWorkspace.tsx',
    'src/components/tools/EducationToolsWorkspace.tsx',
    'src/services/unitConverterEngine.ts',
    'src/services/seoSecuritySocialEngine.ts',
  ]
    .map((p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8'))
    .join('\n');

  const unmapped = ALL_TOOLS.filter((t) => !combinedSource.includes(`'${t.id}'`) && !combinedSource.includes(`"${t.id}"`));
  assert.deepEqual(
    unmapped.map((t) => `${t.category}:${t.id}`),
    [],
    `Unmapped tool IDs found: ${unmapped.map((t) => t.id).join(', ')}`
  );
  assert.equal(ALL_TOOLS.length, 331);
});

test('gifEngine encodes & inspects valid GIF89a with NETSCAPE2.0 looping', () => {
  const rgba = new Uint8ClampedArray(4 * 4 * 4).fill(255);
  const bytes = encodeGif([
    { rgba, width: 4, height: 4, delayMs: 100 },
    { rgba, width: 4, height: 4, delayMs: 100 },
  ]);
  const info = inspectGifBytes(bytes);
  assert.equal(info.version, 'GIF89a');
  assert.equal(info.width, 4);
  assert.equal(info.height, 4);
  assert.equal(info.frameCount, 2);
});

test('unitConverterEngine covers all 20 unit converter tools with accurate math', () => {
  const unitTools = ALL_TOOLS.filter((t) => t.category === 'unit-converter');
  assert.equal(unitTools.length, 20);
  for (const ut of unitTools) {
    assert.ok(CONVERTER_SPECS[ut.id], `Missing CONVERTER_SPECS for ${ut.id}`);
  }
  assert.equal(CONVERTER_SPECS['temperature-converter'].convert('100', 'C', 'F').output, '212');
  assert.equal(CONVERTER_SPECS['binary-to-decimal'].convert('1010', '2', '10').output, '10');
  assert.equal(CONVERTER_SPECS['data-storage-converter'].convert('2', 'gb', 'mb').output, '2000');
});

test('calcAdvancedEngine covers global tax, math expression evaluator, finance & statistics', () => {
  assert.equal(evaluateMathExpression('sqrt(144) + 2^3 * 3', true), 36);
  assert.equal(calculatePercentage('percentOf', 25, 200).result, 50);
  assert.equal(calculateDiscount(200, 25, 10).finalPrice, 165);
  assert.ok(calculateBmrAndTdee('male', 26, 72, 176, 1.55).tdee > 2200);
  assert.ok(calculateInterest(10000, 10, 2, 'compound').totalInterest > calculateInterest(10000, 10, 2, 'simple').totalInterest);

  for (const country of ['US', 'UK', 'IN', 'CA', 'AU', 'DE'] as const) {
    const tax = calculateInternationalIncomeTax(country, 1200000);
    assert.ok(tax.estimatedTax > 0 && tax.netIncome < 1200000);
  }

  assert.ok(calculateSalaryBreakdown(120000, 20, 40).netMonthly > 0);
  assert.equal(calculateProfitAndLoss(50, 75, 10).amount, 250);
  assert.equal(calculateAttendance(15, 20, 75).status, 'On Track');
  assert.equal(calculateElectricityBill(1000, 5, 30, 0.2).totalCost, 30);
  assert.equal(calculateFuelTripCost(200, 20, 1.5).totalCost, 15);
  assert.equal(calculateStatistics([10, 20, 30, 30]).mean, 22.5);
  assert.equal(calculateRatio(4, 8, 20).scaledB, 40);
  assert.equal(calculateFractions(1, 2, '+', 1, 3).fraction, '5/6');
  assert.equal(calculateProbability(1, 4).percentage, '25.00%');
  assert.ok(formatTimeInZones('2026-01-01T12:00:00Z').length >= 8);
});

test('textAdvancedEngine transformations, readability, AES-256-GCM encryption & grammar', async () => {
  assert.equal(sortTextLines('b\na\nc', 'az'), 'a\nb\nc');
  assert.equal(reverseTextMode('abc', 'chars'), 'cba');
  assert.equal(findAndReplaceText('hello world hello', 'hello', 'hi').count, 2);
  assert.equal(removeExtraSpaces('  hello   world  '), 'hello world');
  assert.equal(removeLineBreaks('a\nb\nc', ' '), 'a b c');
  assert.equal(removeEmojis('Hi 🚀 Tools 🔥'), 'Hi Tools');
  assert.equal(htmlToPlainText('<h1>Title</h1><p>Body text</p>'), 'Title\nBody text');
  assert.ok(calculateReadabilityMetrics('Clear prose helps global users understand software tools.').fleschReadingEase > 0);
  assert.ok(convertToUnicodeRepresentations('A').jsEscaped.includes('\\u0041'));
  assert.ok(generateFancyTextVariants('Hello').length >= 8);
  assert.ok(checkGrammarAndStyle('This is teh duplicate duplicate test').issues.length >= 2);
  assert.equal(comparePlagiarismSimilarity('one two three four five', 'one two three four five').similarityPercent, 100);

  const enc = await encryptTextAesGcm('Top Secret Payload 2026', 'StrongPass#1');
  const dec = await decryptTextAesGcm(enc, 'StrongPass#1');
  assert.equal(dec, 'Top Secret Payload 2026');
});

test('devAdvancedEngine regex, color conversion, formatters, cron, yaml, and table builder', () => {
  assert.equal(decodeUrlPayload(encodeUrlPayload('hello world?a=1')), 'hello world?a=1');
  const rx = runRegexTest('\\d+', 'g', 'a12 b345');
  assert.equal(rx.matches.length, 2);
  const col = parseAndConvertColor('#e11d48');
  assert.equal(col.rgb, 'rgb(225, 29, 72)');
  assert.ok(col.cmyk.includes('cmyk('));

  assert.ok(formatHtml('<div><p>hi</p></div>').includes('\n'));
  assert.equal(minifyHtml('<div>  <p>hi</p>  </div>'), '<div><p>hi</p></div>');
  assert.ok(formatCss('body{color:red;}').includes('\n'));
  assert.equal(minifyCss('body { color: red; }'), 'body{color:red}');
  assert.ok(formatJs('function a(){return 1;}').includes('\n'));
  assert.ok(minifyJs('function a() {\n // comment\n return 1;\n}').length < 35);
  assert.ok(formatSql('select id from users where id = 1').includes('SELECT'));
  assert.equal(minifySql('SELECT  *\nFROM users'), 'SELECT * FROM users');
  const xml = jsonToXml('{"user":"Sohit"}');
  assert.ok(xml.includes('<user>Sohit</user>'));
  assert.ok(xmlToJson(xml).includes('Sohit'));
  assert.equal(parseYamlSafe('tools: 331\nactive: true').valid, true);
  assert.equal(parseUserAgentString('Mozilla/5.0 (Windows NT 10.0) Chrome/124.0').browser, 'Google Chrome 124.0');
  assert.equal(describeCronExpression('*/5 * * * *').valid, true);
  assert.ok(generateHtaccessRules({ forceHttps: true, canonicalHost: 'non-www', domain: 'tools.multipledarknews.com', enableGzip: true, enableBrowserCache: true, spaFallback: true }).includes('RewriteEngine On'));
  assert.ok(generateHtmlTableCode(['A'], [['1']]).includes('<table'));
});

test('imageAdvancedEngine CRC-32 & JPEG/PNG DPI binary chunk writers & EXIF parser', () => {
  assert.equal(crc32(new Uint8Array([0x70, 0x48, 0x59, 0x73])) > 0, true);
  // Minimal valid JPEG SOI + EOI
  const minJpg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const dpiJpg = setJpegDpiBytes(minJpg, 300);
  const parsedJpg = parseImageExifBinary(dpiJpg);
  assert.equal(parsedJpg.Density, '300 × 300 DPI');

  // Minimal valid PNG signature + IHDR + IEND
  const minPng = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 0, 0, 0, 0,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0,
  ]);
  const dpiPng = setPngDpiBytes(minPng, 300);
  const textSig = String.fromCharCode(...dpiPng);
  assert.ok(textSig.includes('pHYs'));
});

test('pdfAdvancedEngine booklet imposition, unlock & annotate work on in-memory PDFs', async () => {
  const doc = await PDFDocument.create();
  const p1 = doc.addPage([595, 842]);
  const p2 = doc.addPage([595, 842]);
  p1.drawText('Page 1');
  p2.drawText('Page 2');
  const bytes = await doc.save();

  const booklet = await createBookletPdf(bytes);
  const bookletDoc = await PDFDocument.load(booklet);
  assert.equal(bookletDoc.getPageCount(), 2); // 4-page padded booklet -> 2 double-sided sheets

  const annotated = await annotateEditPdf(bytes, { text: 'STAMP', pageNumber: 1, xPercent: 10, yPercent: 50, fontSize: 16, colorHex: '#e11d48' });
  assert.ok(annotated.length > 0);

  const unlocked = await unlockPdfRestrictions(bytes);
  assert.ok(unlocked.length > 0);
});

test('audioEngine encodes RIFF WAVE & performs trim/gain/reverse/fade/silence/channel/resample/merge', () => {
  const sr = 8000;
  const ch0 = new Float32Array([0.1, 0.2, 0.3, -0.4, 0.5, 0.6, 0.7, 0.8]);
  const wav = encodeWavFromChannels([ch0], sr);
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...wav.slice(8, 12)), 'WAVE');

  assert.ok(Math.abs(reversePcmChannels([ch0])[0][0] - 0.8) < 1e-5);
  assert.equal(applyGainPcmChannels([ch0], 2)[0][0] > 0.19, true);
  assert.equal(mixChannelsMode([ch0], 'stereo').length, 2);
  assert.equal(trimPcmChannels([ch0], sr, 0, 0.0005)[0].length, 4);
  assert.equal(applyFadePcmChannels([ch0], sr, 0.0002, 0.0002)[0][0], 0);
  assert.ok(removeSilencePcmChannels([new Float32Array([0, 0, 0.5, 0.5, 0])], sr, -30)[0].length <= 5);
  assert.equal(resampleLinearPcm([ch0], 2)[0].length, 4);
  assert.equal(mergePcmBuffers([{ channels: [ch0], sampleRate: sr }, { channels: [ch0], sampleRate: sr }]).channels[0].length, 16);
});

test('seoSecuritySocialEngine covers CSPRNG, TOTP, URL/Email audit, Schema JSON-LD, Hreflang & CTR', async () => {
  assert.equal(generateRandomNumbersSet(1, 10, 5, true).length, 5);
  assert.equal(generateRandomStringsList(12, 3, 'alphanumeric').length, 3);
  assert.equal(compareHashChecksums('ABC123', 'abc123 ').match, true);
  const urlAudit = analyzeUrlSafety('https://tools.multipledarknews.com/pdf-compressor');
  assert.equal(urlAudit.valid, true);
  assert.ok(urlAudit.score >= 80);
  assert.equal(validateEmailAddress('test@example.com').validSyntax, true);
  assert.equal(inspectIpAddressDetails('8.8.8.8').version, 'IPv4');

  const totp = await generateRfcTotpCode('JBSWY3DPEHPK3PXP');
  assert.match(totp.code, /^\d{6}$/);

  const schema = generateSchemaJsonLd('Article', {
    name: 'Guide',
    description: 'Comprehensive free tools',
    url: 'https://tools.multipledarknews.com',
    authorOrBrand: 'MultipleDarkNews',
  });
  assert.ok(schema.includes('application/ld+json'));
  assert.ok(
    generateHreflangTags('https://tools.multipledarknews.com/', [
      { code: 'en-US' },
      { code: 'en-IN', pathPrefix: 'in' },
    ]).includes('hreflang="en-IN"')
  );
  assert.equal(testRobotsTxtPath('User-agent: *\nDisallow: /admin', 'Googlebot', '/admin/login').allowed, false);
  assert.equal(validateXmlSitemapContent('<urlset><url><loc>https://tools.multipledarknews.com/</loc></url></urlset>').valid, true);
  assert.ok(generateKeywordIdeas('pdf compressor').length >= 3);
  assert.ok(generateSocialContentSuite('youtube-tag-generator', 'PDF Tools', 'Productivity', 'Clear').length > 10);
  assert.ok(formatUnicodeSocialPost('Hello', 'bold').length >= 5);
  assert.ok(analyzeVideoTitleCtr('7 Ways to Compress PDF Files Fast in 2026').score >= 60);
});

test('videoEngine SRT<->VTT & educationToolsEngine wordsToNumber + linear equations', () => {
  const srt = '1\n00:00:01,000 --> 00:00:03,500\nHello Global Users!';
  const vtt = convertSrtToVtt(srt);
  assert.ok(vtt.startsWith('WEBVTT'));
  assert.ok(convertVttToSrt(vtt).includes('00:00:01,000'));
  assert.equal(parseSubtitleCues(srt).length, 1);

  assert.equal(wordsToNumber('two million four hundred fifty thousand seven hundred').value, 2450700);
  assert.equal(wordsToNumber('five lakh twenty thousand').value, 520000);
  assert.equal(solveLinearEquation(2, 4, 10).solution, 3);
});
