/**
 * Pure TypeScript Engine for Amazon-to-Pinterest Affiliate Automation
 * Covers:
 * - Amazon URL & ASIN extraction across global marketplaces
 * - Allowlist verification for Amazon product pages & CDN images (SSRF guard)
 * - Clean Amazon Associates Affiliate Link builder
 * - HTML product metadata parser (title, image, price, MRP, discount, rating, features)
 * - High-converting Pinterest Pin SEO title/description/hashtags generator (EN / Hinglish / HI)
 * - HTML5 Canvas 2:3 vertical (1000x1500) Pinterest Pin designer
 */

export type AmazonMarketplace =
  | 'amazon.in'
  | 'amazon.com'
  | 'amazon.co.uk'
  | 'amazon.ca'
  | 'amazon.de'
  | 'amazon.fr'
  | 'amazon.es'
  | 'amazon.it'
  | 'amazon.co.jp'
  | 'amazon.com.au'
  | 'amazon.ae';

export interface ParsedAmazonUrl {
  valid: boolean;
  asin: string | null;
  marketplace: AmazonMarketplace;
  isShortLink: boolean;
  normalizedUrl: string;
  error?: string;
}

export interface ExtractedAmazonProduct {
  success: boolean;
  asin: string | null;
  marketplace: AmazonMarketplace;
  canonicalUrl: string;
  title: string;
  imageUrl: string;
  price: string;
  mrp?: string;
  discountPercent?: string;
  rating?: string;
  reviewCount?: string;
  description: string;
  botProtected: boolean;
  error?: string;
}

export interface CuratedAmazonDeal {
  id: string;
  category: string;
  title: string;
  price: string;
  mrp: string;
  discountBadge: string;
  rating: string;
  asin: string;
  defaultUrl: string;
  imageUrl: string;
}

export const CURATED_AMAZON_DEALS: CuratedAmazonDeal[] = [
  {
    id: 'deal-1',
    category: 'Electronics',
    title: 'Wireless Noise Cancelling Over-Ear Headphones with 60H Battery & Hi-Res Audio',
    price: '$79.99',
    mrp: '$149.99',
    discountBadge: '47% OFF',
    rating: '4.6★',
    asin: 'B0983C3RD6',
    defaultUrl: 'https://www.amazon.com/dp/B0983C3RD6',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61CGHv6yuFL._SL1500_.jpg',
  },
  {
    id: 'deal-2',
    category: 'Smart Home',
    title: 'Smart LED Color Bulb 4-Pack Compatible with Alexa & Google Assistant',
    price: '$24.99',
    mrp: '$49.99',
    discountBadge: '50% OFF',
    rating: '4.7★',
    asin: 'B084M5X773',
    defaultUrl: 'https://www.amazon.com/dp/B084M5X773',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71W9YgQ6aSL._SL1500_.jpg',
  },
  {
    id: 'deal-3',
    category: 'Workspace',
    title: 'Ergonomic Vertical Wireless Mouse with Adjustable DPI & Wrist Rest',
    price: '$29.99',
    mrp: '$59.99',
    discountBadge: '50% OFF',
    rating: '4.5★',
    asin: 'B079JGP7FG',
    defaultUrl: 'https://www.amazon.com/dp/B079JGP7FG',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61a5uN21jYL._SL1500_.jpg',
  },
  {
    id: 'deal-4',
    category: 'Gadgets',
    title: '100W 4-Port GaN Fast Charger Station for Laptops, Tablets & Phones',
    price: '$45.99',
    mrp: '$89.99',
    discountBadge: '49% OFF',
    rating: '4.8★',
    asin: 'B09N3X2FSV',
    defaultUrl: 'https://www.amazon.com/dp/B09N3X2FSV',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61j8s8v3z+L._SL1500_.jpg',
  },
  {
    id: 'deal-5',
    category: 'Fitness',
    title: 'Smart Fitness Tracker Watch with Heart Rate, Sleep & SpO2 Monitor',
    price: '$39.99',
    mrp: '$79.99',
    discountBadge: '50% OFF',
    rating: '4.4★',
    asin: 'B0B3M4Y82F',
    defaultUrl: 'https://www.amazon.com/dp/B0B3M4Y82F',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61Zjlqjt1wL._SL1500_.jpg',
  },
  {
    id: 'deal-6',
    category: 'Creator Kit',
    title: 'Desktop Ring Light with Phone Holder & Tripod for Live Streaming & Video',
    price: '$19.99',
    mrp: '$39.99',
    discountBadge: '50% OFF',
    rating: '4.5★',
    asin: 'B082W4WPGW',
    defaultUrl: 'https://www.amazon.com/dp/B082W4WPGW',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71m8v3z3w+L._SL1500_.jpg',
  },
];

export type PinCopyLanguage = 'en' | 'hinglish' | 'hi';


export interface GeneratedPinCopy {
  title: string;
  description: string;
  altText: string;
  hashtags: string[];
}

export type PinPosterTemplate = 'original' | 'dark-luxury' | 'editorial-light' | 'deal-spotlight';

export interface PinPosterOptions {
  template: PinPosterTemplate;
  title: string;
  price: string;
  mrp?: string;
  discountBadge?: string;
  ctaLabel: string;
  accentColor: string;
  showAffiliateDisclosure: boolean;
  rating?: string;
}

const ALLOWED_AMAZON_MARKETPLACES: Record<string, AmazonMarketplace> = {
  'amazon.in': 'amazon.in',
  'amazon.com': 'amazon.com',
  'amazon.co.uk': 'amazon.co.uk',
  'amazon.ca': 'amazon.ca',
  'amazon.de': 'amazon.de',
  'amazon.fr': 'amazon.fr',
  'amazon.es': 'amazon.es',
  'amazon.it': 'amazon.it',
  'amazon.co.jp': 'amazon.co.jp',
  'amazon.com.au': 'amazon.com.au',
  'amazon.ae': 'amazon.ae',
};

const SHORT_LINK_HOSTS = new Set(['amzn.to', 'amzn.in', 'a.co', 'amzn.eu', 'amzn.asia']);

const ALLOWED_AMAZON_IMAGE_HOST_RE = /(?:^|\.)(?:media-amazon\.com|ssl-images-amazon\.com|images-amazon\.com)$/i;

export function isAllowedAmazonHost(hostname: string): boolean {
  const clean = (hostname || '').trim().toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  if (!clean) return false;
  if (SHORT_LINK_HOSTS.has(clean)) return true;
  return Boolean(ALLOWED_AMAZON_MARKETPLACES[clean]);
}

export function isAllowedAmazonImageHost(hostname: string): boolean {
  const clean = (hostname || '').trim().toLowerCase();
  return ALLOWED_AMAZON_IMAGE_HOST_RE.test(clean);
}

export function extractAsinFromText(input: string): string | null {
  const trimmed = (input || '').trim();
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /[?&]asin=([A-Z0-9]{10})(?:&|$)/i,
    /\/([B][0-9A-Z]{9})(?:[/?#]|$)/i,
  ];
  for (const re of patterns) {
    const match = re.exec(trimmed);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }
  return null;
}

export function parseAmazonUrl(rawInput: string, defaultMarketplace: AmazonMarketplace = 'amazon.in'): ParsedAmazonUrl {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      asin: null,
      marketplace: defaultMarketplace,
      isShortLink: false,
      normalizedUrl: '',
      error: 'Enter an Amazon product link or 10-character ASIN.',
    };
  }

  // Raw ASIN input e.g. B08N5WRWNW
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    const asin = trimmed.toUpperCase();
    return {
      valid: true,
      asin,
      marketplace: defaultMarketplace,
      isShortLink: false,
      normalizedUrl: `https://www.${defaultMarketplace}/dp/${asin}`,
    };
  }

  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProto);
  } catch {
    return {
      valid: false,
      asin: null,
      marketplace: defaultMarketplace,
      isShortLink: false,
      normalizedUrl: '',
      error: 'Invalid URL format. Paste a full Amazon link (e.g. https://www.amazon.in/dp/...).',
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      asin: null,
      marketplace: defaultMarketplace,
      isShortLink: false,
      normalizedUrl: '',
      error: 'Only http:// and https:// URLs are allowed.',
    };
  }

  const cleanHost = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  if (!isAllowedAmazonHost(cleanHost)) {
    return {
      valid: false,
      asin: null,
      marketplace: defaultMarketplace,
      isShortLink: false,
      normalizedUrl: '',
      error: 'Only official Amazon domains (amazon.in, amazon.com, amzn.to, etc.) are supported.',
    };
  }

  const isShortLink = SHORT_LINK_HOSTS.has(cleanHost);
  const marketplace = isShortLink
    ? cleanHost === 'amzn.in'
      ? 'amazon.in'
      : defaultMarketplace
    : ALLOWED_AMAZON_MARKETPLACES[cleanHost] || defaultMarketplace;

  const asin = extractAsinFromText(parsed.pathname + parsed.search);
  const normalizedUrl = asin ? `https://www.${marketplace}/dp/${asin}` : parsed.toString();

  return {
    valid: true,
    asin,
    marketplace,
    isShortLink,
    normalizedUrl,
  };
}

export function validateAssociateTag(tag: string): { valid: boolean; cleaned: string; error?: string } {
  const cleaned = (tag || '').trim();
  if (!cleaned) {
    return { valid: false, cleaned: '', error: 'Enter your Amazon Associate Tag (e.g. yourtag-21) to earn commission.' };
  }
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(cleaned)) {
    return { valid: false, cleaned, error: 'Associate Tag may only contain letters, numbers, hyphens, dots, or underscores.' };
  }
  return { valid: true, cleaned };
}

/**
 * Generates clean canonical Amazon Affiliate URL preserving user's Associate tag.
 */
export function buildAmazonAffiliateLink(opts: {
  urlOrAsin: string;
  associateTag: string;
  marketplace?: AmazonMarketplace;
  subTag?: string;
}): { valid: boolean; affiliateUrl: string; asin: string | null; error?: string } {
  const parsed = parseAmazonUrl(opts.urlOrAsin, opts.marketplace || 'amazon.in');
  if (!parsed.valid) {
    return { valid: false, affiliateUrl: '', asin: null, error: parsed.error };
  }

  const tagCheck = validateAssociateTag(opts.associateTag);
  if (!tagCheck.valid) {
    return { valid: false, affiliateUrl: parsed.normalizedUrl, asin: parsed.asin, error: tagCheck.error };
  }

  const targetUrl = new URL(
    parsed.asin ? `https://www.${parsed.marketplace}/dp/${parsed.asin}` : parsed.normalizedUrl
  );
  targetUrl.searchParams.set('tag', tagCheck.cleaned);
  targetUrl.searchParams.set('linkCode', 'ogi');
  targetUrl.searchParams.set('th', '1');
  targetUrl.searchParams.set('psc', '1');
  if (opts.subTag && /^[a-zA-Z0-9_-]{1,32}$/.test(opts.subTag.trim())) {
    targetUrl.searchParams.set('ascsubtag', opts.subTag.trim());
  }

  return {
    valid: true,
    affiliateUrl: targetUrl.toString(),
    asin: parsed.asin,
  };
}

// ---------------------------------------------------------------------------
// HTML Entity Decoding & Amazon Product Metadata Parser
// ---------------------------------------------------------------------------

function decodeHtmlEntities(text: string): string {
  return (text || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchMetaContent(html: string, key: string): string {
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i');
  const m = re1.exec(html) || re2.exec(html);
  return m?.[1] ? decodeHtmlEntities(m[1]) : '';
}

function upgradeAmazonImageResolution(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.replace(/^http:\/\//i, 'https://').trim();
  // Remove small thumbnail modifiers like ._SX300_ or ._AC_US40_ to get crisp full resolution
  url = url.replace(/\._[A-Z0-9,_]+_\.(jpg|jpeg|png|webp)/i, '.$1');
  return url;
}

export function parseAmazonProductHtml(
  html: string,
  pageUrl: string,
  fallbackMarketplace: AmazonMarketplace = 'amazon.in'
): ExtractedAmazonProduct {
  const parsedUrl = parseAmazonUrl(pageUrl, fallbackMarketplace);
  const asin = parsedUrl.asin || extractAsinFromText(html) || null;
  const marketplace = parsedUrl.marketplace;
  const canonicalUrl = asin ? `https://www.${marketplace}/dp/${asin}` : parsedUrl.normalizedUrl;

  const lower = (html || '').toLowerCase();
  const isCaptchaPage =
    lower.includes('validatecaptcha') ||
    lower.includes('type the characters you see in this image') ||
    lower.includes('sorry, we just need to make sure you\'re not a robot');

  // 1. Title
  let title = '';
  const prodTitleMatch = /<span[^>]+id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i.exec(html);
  if (prodTitleMatch?.[1]) {
    title = decodeHtmlEntities(prodTitleMatch[1].replace(/<[^>]+>/g, ''));
  }
  if (!title) title = matchMetaContent(html, 'og:title');
  if (!title) {
    const titleTagMatch = /<title>([\s\S]*?)<\/title>/i.exec(html);
    if (titleTagMatch?.[1]) title = decodeHtmlEntities(titleTagMatch[1]);
  }
  title = title
    .replace(/^Amazon\.(in|com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|ae)\s*:\s*/i, '')
    .replace(/\s*:\s*Amazon\.(in|com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|ae).*$/i, '')
    .trim();

  // 2. High-Res Product Image
  let imageUrl = '';
  const oldHiresMatch = /data-old-hires=["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (oldHiresMatch?.[1]) {
    imageUrl = oldHiresMatch[1];
  }

  if (!imageUrl) {
    const dynImgMatch = /data-a-dynamic-image=["'](\{[^"']+\})["']/i.exec(html);
    if (dynImgMatch?.[1]) {
      try {
        const decodedJson = decodeHtmlEntities(dynImgMatch[1]);
        const map = JSON.parse(decodedJson) as Record<string, [number, number]>;
        let bestUrl = '';
        let bestArea = 0;
        for (const [candidate, dims] of Object.entries(map)) {
          const area = Array.isArray(dims) ? (dims[0] || 0) * (dims[1] || 0) : 0;
          if (area >= bestArea) {
            bestArea = area;
            bestUrl = candidate;
          }
        }
        if (bestUrl) imageUrl = bestUrl;
      } catch {
        // Ignore dynamic JSON parse errors
      }
    }
  }

  if (!imageUrl) {
    const hiResJsonMatch = /"hiRes"\s*:\s*"(https?:\/\/[^"]+)"/i.exec(html);
    if (hiResJsonMatch?.[1]) imageUrl = hiResJsonMatch[1];
  }
  if (!imageUrl) {
    const largeJsonMatch = /"large"\s*:\s*"(https?:\/\/[^"]+)"/i.exec(html);
    if (largeJsonMatch?.[1]) imageUrl = largeJsonMatch[1];
  }
  if (!imageUrl) {
    const ogImg = matchMetaContent(html, 'og:image');
    if (ogImg && !ogImg.includes('amazon-logo')) imageUrl = ogImg;
  }

  imageUrl = upgradeAmazonImageResolution(imageUrl);

  // 3. Price & MRP
  let price = '';
  const priceRegexes = [
    /<span[^>]+class=["'][^"']*priceToPay[^"']*["'][^>]*>[\s\S]*?<span[^>]+class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i,
    /<span[^>]+id=["']priceblock_(?:ourprice|dealprice|saleprice)["'][^>]*>([^<]+)<\/span>/i,
    /<span[^>]+class=["'][^"']*a-price[^"']*["'][^>]*>[\s\S]*?<span[^>]+class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i,
  ];
  for (const re of priceRegexes) {
    const m = re.exec(html);
    if (m?.[1]) {
      price = decodeHtmlEntities(m[1]);
      break;
    }
  }
  if (!price) {
    const wholeMatch = /<span[^>]+class=["']a-price-whole["'][^>]*>([^<]+)</i.exec(html);
    const symMatch = /<span[^>]+class=["']a-price-symbol["'][^>]*>([^<]+)</i.exec(html);
    if (wholeMatch?.[1]) {
      price = `${decodeHtmlEntities(symMatch?.[1] || (marketplace === 'amazon.in' ? '₹' : '$'))}${decodeHtmlEntities(wholeMatch[1]).replace(/\.$/, '')}`;
    }
  }

  let mrp = '';
  const mrpMatch = /basisPrice[\s\S]{0,200}?<span[^>]+class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i.exec(html);
  if (mrpMatch?.[1]) mrp = decodeHtmlEntities(mrpMatch[1]);

  let discountPercent = '';
  const discMatch = /class=["'][^"']*savingsPercentage[^"']*["'][^>]*>([^<]+)</i.exec(html);
  if (discMatch?.[1]) discountPercent = decodeHtmlEntities(discMatch[1]).replace('-', '').trim();

  // 4. Rating
  let rating = '';
  const ratingMatch = /<span[^>]+class=["']a-icon-alt["'][^>]*>([0-9.]+)\s+out of\s+5/i.exec(html);
  if (ratingMatch?.[1]) rating = `${ratingMatch[1]}★`;

  let reviewCount = '';
  const revMatch = /id=["']acrCustomerReviewText["'][^>]*>([^<]+)</i.exec(html);
  if (revMatch?.[1]) reviewCount = decodeHtmlEntities(revMatch[1]);

  // 5. Description
  let description = matchMetaContent(html, 'description') || matchMetaContent(html, 'og:description');
  if (!description) {
    const bulletsMatch = /<div[^>]+id=["']feature-bullets["'][^>]*>([\s\S]*?)<\/div>/i.exec(html);
    if (bulletsMatch?.[1]) {
      description = decodeHtmlEntities(bulletsMatch[1].replace(/<[^>]+>/g, ' ')).slice(0, 320);
    }
  }

  const botProtected = isCaptchaPage || (!title && !imageUrl);

  return {
    success: !botProtected && Boolean(title || imageUrl),
    asin,
    marketplace,
    canonicalUrl,
    title: title || (asin ? `Amazon Product (${asin})` : ''),
    imageUrl,
    price,
    mrp: mrp || undefined,
    discountPercent: discountPercent || undefined,
    rating: rating || undefined,
    reviewCount: reviewCount || undefined,
    description: description || '',
    botProtected,
  };
}

// ---------------------------------------------------------------------------
// Pinterest Pin SEO Copy Generator
// ---------------------------------------------------------------------------

export function generatePinterestPinCopy(params: {
  title: string;
  price?: string;
  mrp?: string;
  discountBadge?: string;
  niche?: string;
  language?: PinCopyLanguage;
  includeDisclosure?: boolean;
}): GeneratedPinCopy {
  const cleanTitle = (params.title || 'Trending Amazon Product').trim();
  const priceTag = params.price ? ` (${params.price})` : '';
  const discountTag = params.discountBadge ? ` • ${params.discountBadge}` : '';
  const nicheClean = (params.niche || 'AmazonFinds').replace(/[^a-zA-Z0-9]/g, '');

  const rawPinTitle = `${cleanTitle}${priceTag}`.slice(0, 98).trim();
  const hashtags = [
    '#AmazonFinds',
    '#AmazonMustHaves',
    '#BestDeals',
    nicheClean ? `#${nicheClean}` : '#TrendingProducts',
    '#OnlineShopping',
  ];

  const disclosure = params.includeDisclosure !== false ? ' (Affiliate Link / Ad)' : '';
  let body = '';

  if (params.language === 'hi') {
    body = `${cleanTitle}${priceTag}${discountTag} अब Amazon पर उपलब्ध है! 🔥\n\n👇 इस फोटो के नीचे दिए गए लिंक पर क्लिक करके अभी कीमत चेक करें और सीधे Amazon से खरीदें।${disclosure}\n\n${hashtags.join(' ')}`;
  } else if (params.language === 'hinglish') {
    body = `Best Amazon Deal Alert! ${cleanTitle}${priceTag}${discountTag} ✨\n\n👇 Product ke photo ke niche diye gaye Amazon link par click karke latest price aur offers check karein aur buy karein!${disclosure}\n\n${hashtags.join(' ')}`;
  } else {
    body = `Trending Amazon Find: ${cleanTitle}${priceTag}${discountTag} ✨\n\n👇 Tap the product link right below this Pin image to check today's live price, customer reviews & order directly on Amazon.${disclosure}\n\n${hashtags.join(' ')}`;
  }

  return {
    title: rawPinTitle,
    description: body.slice(0, 498),
    altText: `${cleanTitle}${priceTag} product preview — tap Pin link to shop on Amazon`.slice(0, 495),
    hashtags,
  };
}

// ---------------------------------------------------------------------------
// Browser Canvas 2:3 Vertical Pin Poster Designer (1000x1500)
// ---------------------------------------------------------------------------

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  if (lines.length === maxLines && words.length > 0) {
    const joined = lines.join(' ');
    if (text.length > joined.length + 3) {
      lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -3).trim()}...`;
    }
  }
  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function renderPinPosterCanvas(
  sourceImage: HTMLImageElement,
  opts: PinPosterOptions
): Promise<{ blob: Blob; dataUrl: string; base64: string; width: number; height: number }> {
  const canvas = document.createElement('canvas');

  // If "original" template, keep crisp original aspect ratio clamped cleanly for Pinterest
  if (opts.template === 'original') {
    const w = Math.min(1600, sourceImage.naturalWidth || sourceImage.width || 1000);
    const h = Math.min(2400, sourceImage.naturalHeight || sourceImage.height || 1000);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(sourceImage, 0, 0, w, h);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), 'image/jpeg', 0.94)
    );
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    return { blob, dataUrl, base64: dataUrl.split(',')[1] || '', width: w, height: h };
  }

  // Standard High-Converting 2:3 Pinterest Vertical Poster (1000 x 1500 px)
  const W = 1000;
  const H = 1500;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const isLight = opts.template === 'editorial-light';
  const accent = opts.accentColor || '#ef4444';

  // Background
  if (opts.template === 'dark-luxury') {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#09090d');
    bg.addColorStop(1, '#14141d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  } else if (opts.template === 'editorial-light') {
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#18090c');
    bg.addColorStop(0.5, '#0c0c12');
    bg.addColorStop(1, '#09090d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  // Top Pill Badge
  const badgeText = opts.discountBadge
    ? opts.discountBadge.toUpperCase()
    : opts.template === 'deal-spotlight'
    ? 'TOP AMAZON FIND'
    : 'CURATED AMAZON PICK';

  ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
  const badgeW = Math.min(620, ctx.measureText(badgeText).width + 72);
  drawRoundedRectPath(ctx, (W - badgeW) / 2, 56, badgeW, 56, 28);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, W / 2, 85);

  // Central Product Photo Frame (crisp white showcase card so transparent/white Amazon photos pop)
  const boxX = 72;
  const boxY = 148;
  const boxW = W - 144;
  const boxH = 820;

  ctx.save();
  drawRoundedRectPath(ctx, boxX, boxY, boxW, boxH, 36);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = isLight ? '#e7e5e4' : 'rgba(255,255,255,0.14)';
  ctx.stroke();
  ctx.clip();

  // Fit product image cleanly inside frame with subtle padding
  const pad = 36;
  const availW = boxW - pad * 2;
  const availH = boxH - pad * 2;
  const natW = sourceImage.naturalWidth || sourceImage.width || 1000;
  const natH = sourceImage.naturalHeight || sourceImage.height || 1000;
  const scale = Math.min(availW / natW, availH / natH);
  const drawW = natW * scale;
  const drawH = natH * scale;
  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;
  ctx.drawImage(sourceImage, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Floating Price Pill (Bottom-Right of Image Card)
  if (opts.price) {
    ctx.font = '800 38px "Plus Jakarta Sans", system-ui, sans-serif';
    const priceW = Math.max(210, ctx.measureText(opts.price).width + 64);
    const px = boxX + boxW - priceW - 28;
    const py = boxY + boxH - 96;
    drawRoundedRectPath(ctx, px, py, priceW, 74, 22);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = accent;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.price, px + priceW / 2, py + 38);
  }

  // Rating Badge (Bottom-Left of Image Card)
  if (opts.rating) {
    ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
    const rateTxt = `${opts.rating} Amazon Rated`;
    const rateW = ctx.measureText(rateTxt).width + 44;
    drawRoundedRectPath(ctx, boxX + 28, boxY + boxH - 86, rateW, 56, 18);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rateTxt, boxX + 28 + rateW / 2, boxY + boxH - 57);
  }

  // Product Headline (Lower Panel)
  ctx.font = '800 44px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = isLight ? '#111827' : '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = wrapCanvasText(ctx, opts.title || 'Featured Amazon Product', W - 120, 3);
  let textY = 1015;
  for (const line of lines) {
    ctx.fillText(line, W / 2, textY);
    textY += 56;
  }

  // CTA Pill Button at Bottom
  const ctaY = 1280;
  const ctaText = (opts.ctaLabel || 'Check Price on Amazon →').trim();
  ctx.font = '800 34px "Plus Jakarta Sans", system-ui, sans-serif';
  const ctaW = Math.min(760, Math.max(480, ctx.measureText(ctaText).width + 110));
  drawRoundedRectPath(ctx, (W - ctaW) / 2, ctaY, ctaW, 92, 46);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ctaText, W / 2, ctaY + 47);

  // Subtle Affiliate Disclosure Footer
  if (opts.showAffiliateDisclosure) {
    ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = isLight ? '#78716c' : '#94a3b8';
    ctx.fillText('Tap the Amazon link attached below this Pin • Paid Affiliate Link', W / 2, 1432);
  }

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), 'image/jpeg', 0.94)
  );
  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  return { blob, dataUrl, base64: dataUrl.split(',')[1] || '', width: W, height: H };
}
