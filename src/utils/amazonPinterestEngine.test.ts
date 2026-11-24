import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAmazonAffiliateLink,
  extractAsinFromText,
  generatePinterestPinCopy,
  isAllowedAmazonHost,
  isAllowedAmazonImageHost,
  parseAmazonProductHtml,
  parseAmazonUrl,
  validateAssociateTag,
} from '../services/amazonPinterestEngine';
import { isTrustedAppOrigin } from './pinterestServer';

test('isAllowedAmazonHost allows official Amazon stores & blocks SSRF hosts', () => {
  assert.equal(isAllowedAmazonHost('www.amazon.in'), true);
  assert.equal(isAllowedAmazonHost('amazon.com'), true);
  assert.equal(isAllowedAmazonHost('amzn.to'), true);
  assert.equal(isAllowedAmazonHost('127.0.0.1'), false);
  assert.equal(isAllowedAmazonHost('localhost'), false);
  assert.equal(isAllowedAmazonHost('169.254.169.254'), false);
  assert.equal(isAllowedAmazonHost('amazon.in.evil.com'), false);
});

test('isAllowedAmazonImageHost restricts image proxy strictly to Amazon CDN domains', () => {
  assert.equal(isAllowedAmazonImageHost('m.media-amazon.com'), true);
  assert.equal(isAllowedAmazonImageHost('images-na.ssl-images-amazon.com'), true);
  assert.equal(isAllowedAmazonImageHost('internal.local'), false);
  assert.equal(isAllowedAmazonImageHost('media-amazon.com.attacker.org'), false);
});

test('extractAsinFromText & parseAmazonUrl support /dp/, /gp/product/, short links & raw ASIN', () => {
  assert.equal(extractAsinFromText('https://www.amazon.in/Sony-Headphones/dp/B0CX23V2ZK/ref=sr_1_1'), 'B0CX23V2ZK');
  assert.equal(extractAsinFromText('https://www.amazon.com/gp/product/B08N5WRWNW?psc=1'), 'B08N5WRWNW');
  assert.equal(extractAsinFromText('b0cx23v2zk'), 'B0CX23V2ZK');

  const rawAsin = parseAmazonUrl('B0CX23V2ZK', 'amazon.in');
  assert.equal(rawAsin.valid, true);
  assert.equal(rawAsin.asin, 'B0CX23V2ZK');
  assert.equal(rawAsin.normalizedUrl, 'https://www.amazon.in/dp/B0CX23V2ZK');

  const shortLink = parseAmazonUrl('https://amzn.to/3AbCdEf', 'amazon.com');
  assert.equal(shortLink.valid, true);
  assert.equal(shortLink.isShortLink, true);

  const nonAmazon = parseAmazonUrl('https://example.com/dp/B0CX23V2ZK');
  assert.equal(nonAmazon.valid, false);
});

test('validateAssociateTag & buildAmazonAffiliateLink embed clean Amazon tag & subtag', () => {
  assert.equal(validateAssociateTag('').valid, false);
  assert.equal(validateAssociateTag('bad tag!').valid, false);
  assert.equal(validateAssociateTag('multipledark-21').valid, true);

  const built = buildAmazonAffiliateLink({
    urlOrAsin: 'https://www.amazon.in/Some-Great-Product/dp/B0CX23V2ZK?ref=pd_sl&junk=123',
    associateTag: 'sohitdeals-21',
    subTag: 'pinterest',
  });
  assert.equal(built.valid, true);
  assert.equal(built.asin, 'B0CX23V2ZK');
  const u = new URL(built.affiliateUrl);
  assert.equal(u.origin, 'https://www.amazon.in');
  assert.equal(u.pathname, '/dp/B0CX23V2ZK');
  assert.equal(u.searchParams.get('tag'), 'sohitdeals-21');
  assert.equal(u.searchParams.get('ascsubtag'), 'pinterest');
  assert.equal(u.searchParams.get('junk'), null);
});

test('parseAmazonProductHtml extracts title, high-res image, price, discount & detects CAPTCHA', () => {
  const sampleHtml = `
    <html>
      <head>
        <meta property="og:description" content="Flagship wireless audio experience." />
      </head>
      <body>
        <span id="productTitle">   Sony WH-1000XM5 Wireless Headphones   </span>
        <img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/71o8Q5XJS5L._SL1500_.jpg" />
        <span class="a-price priceToPay"><span class="a-offscreen">₹24,990</span></span>
        <span class="basisPrice"><span class="a-offscreen">₹34,990</span></span>
        <span class="savingsPercentage">-29%</span>
        <span class="a-icon-alt">4.6 out of 5 stars</span>
      </body>
    </html>
  `;
  const parsed = parseAmazonProductHtml(sampleHtml, 'https://www.amazon.in/dp/B09XS7JWHH', 'amazon.in');
  assert.equal(parsed.success, true);
  assert.equal(parsed.botProtected, false);
  assert.equal(parsed.title, 'Sony WH-1000XM5 Wireless Headphones');
  assert.equal(parsed.imageUrl, 'https://m.media-amazon.com/images/I/71o8Q5XJS5L.jpg');
  assert.equal(parsed.price, '₹24,990');
  assert.equal(parsed.mrp, '₹34,990');
  assert.equal(parsed.discountPercent, '29%');
  assert.equal(parsed.rating, '4.6★');

  const captcha = parseAmazonProductHtml('<html><body>Enter the characters you see in this image validateCaptcha</body></html>', 'https://www.amazon.in/dp/B09XS7JWHH', 'amazon.in');
  assert.equal(captcha.botProtected, true);
  assert.equal(captcha.success, false);
});

test('generatePinterestPinCopy formats multilingual EN/Hinglish/Hindi copy within Pinterest limits', () => {
  const en = generatePinterestPinCopy({
    title: 'Smart Watch Pro',
    price: '₹2,499',
    discountBadge: '60% OFF',
    language: 'en',
  });
  assert.ok(en.title.length <= 100);
  assert.ok(en.description.length <= 500);
  assert.ok(en.description.includes('#AmazonFinds'));

  const hinglish = generatePinterestPinCopy({ title: 'Smart Watch Pro', price: '₹2,499', language: 'hinglish' });
  assert.ok(hinglish.description.includes('photo ke niche'));

  const hi = generatePinterestPinCopy({ title: 'Smart Watch Pro', price: '₹2,499', language: 'hi' });
  assert.ok(hi.description.includes('फोटो के नीचे'));
});

test('isTrustedAppOrigin validates production, AI Studio preview, and localhost origins', () => {
  assert.equal(isTrustedAppOrigin('https://tools.multipledarknews.com'), true);
  assert.equal(isTrustedAppOrigin('https://ais-dev-nuionpsrsixiky7idzwf6y-529606111096.asia-east1.run.app'), true);
  assert.equal(isTrustedAppOrigin('http://localhost:3000'), true);
  assert.equal(isTrustedAppOrigin('https://evil-phishing.com'), false);
});
