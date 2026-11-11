/**
 * MultipleDarkNews SEO Tools Engine
 * 100% In-Browser client-side algorithms for search engine optimization
 */

export interface SerpPreviewResult {
  desktopTitle: string;
  desktopSnippet: string;
  mobileTitle: string;
  mobileSnippet: string;
  titlePixelWidth: number;
  isTitleTruncated: boolean;
  isDescriptionTruncated: boolean;
  score: number;
  suggestions: string[];
}

/**
 * Simulate Google SERP Desktop & Mobile Snippets
 */
export function simulateSerp(
  title: string,
  description: string,
  url: string
): SerpPreviewResult {
  const cleanTitle = title.trim();
  const cleanDesc = description.trim();
  const cleanUrl = url.trim() || 'https://multipledarknews.com';

  // Average pixel width estimation (Arial ~16px for Google SERP)
  const titlePixelWidth = Math.round(cleanTitle.length * 9.2);
  const isTitleTruncated = titlePixelWidth > 580 || cleanTitle.length > 60;
  const isDescriptionTruncated = cleanDesc.length > 160;

  const suggestions: string[] = [];
  if (cleanTitle.length < 30) suggestions.push('Title is too short (< 30 chars). Aim for 50-60 characters for maximum CTR.');
  if (cleanTitle.length > 60) suggestions.push('Title exceeds 60 characters and may be truncated on Google SERPs.');
  if (cleanDesc.length < 70) suggestions.push('Meta description is too short (< 70 chars). Aim for 130-155 characters.');
  if (cleanDesc.length > 160) suggestions.push('Meta description exceeds 160 characters and will likely be truncated with an ellipsis.');
  if (!cleanTitle.toLowerCase().includes('free') && !cleanTitle.toLowerCase().includes('online')) {
    suggestions.push('Consider adding high-CTR search modifiers like "Free", "Online", or "Fast".');
  }

  let score = 100;
  score -= suggestions.length * 15;
  if (score < 30) score = 30;

  return {
    desktopTitle: isTitleTruncated ? cleanTitle.slice(0, 56) + '...' : cleanTitle,
    desktopSnippet: isDescriptionTruncated ? cleanDesc.slice(0, 155) + '...' : cleanDesc,
    mobileTitle: cleanTitle.length > 65 ? cleanTitle.slice(0, 62) + '...' : cleanTitle,
    mobileSnippet: cleanDesc.length > 120 ? cleanDesc.slice(0, 118) + '...' : cleanDesc,
    titlePixelWidth,
    isTitleTruncated,
    isDescriptionTruncated,
    score,
    suggestions,
  };
}

/**
 * Generate Complete HTML Meta Tags & Social Cards
 */
export function generateMetaTags(params: {
  title: string;
  description: string;
  keywords: string;
  author?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  siteName?: string;
  twitterHandle?: string;
}): string {
  const {
    title,
    description,
    keywords,
    author = 'MultipleDarkNews',
    canonicalUrl = 'https://multipledarknews.com',
    imageUrl = 'https://multipledarknews.com/og-cover.png',
    siteName = 'MultipleDarkNews Tools',
    twitterHandle = '@MultipleDarkNews',
  } = params;

  return `<!-- Primary Meta Tags -->
<title>${escapeHtml(title)}</title>
<meta name="title" content="${escapeHtml(title)}" />
<meta name="description" content="${escapeHtml(description)}" />
<meta name="keywords" content="${escapeHtml(keywords)}" />
<meta name="author" content="${escapeHtml(author)}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta property="og:site_name" content="${escapeHtml(siteName)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(imageUrl)}" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${escapeHtml(twitterHandle)}" />
<meta name="twitter:creator" content="${escapeHtml(twitterHandle)}" />
<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`;
}

/**
 * Analyze HTML snippet for SEO Tags & Compliance
 */
export function analyzeMetaTags(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const titleEl = doc.querySelector('title');
  const title = titleEl ? titleEl.textContent || '' : '';

  const getMeta = (nameOrProp: string) => {
    const el = doc.querySelector(`meta[name="${nameOrProp}"], meta[property="${nameOrProp}"]`);
    return el ? el.getAttribute('content') || '' : '';
  };

  const desc = getMeta('description');
  const ogTitle = getMeta('og:title');
  const ogDesc = getMeta('og:description');
  const ogImage = getMeta('og:image');
  const twitterCard = getMeta('twitter:card');
  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const canonical = canonicalEl ? canonicalEl.getAttribute('href') || '' : '';
  const robots = getMeta('robots');

  const issues: string[] = [];
  const passes: string[] = [];

  if (title) {
    if (title.length >= 30 && title.length <= 60) passes.push(`Title length is optimal (${title.length} chars).`);
    else issues.push(`Title length (${title.length} chars) should be between 30 and 60 chars.`);
  } else issues.push('Missing <title> tag.');

  if (desc) {
    if (desc.length >= 100 && desc.length <= 160) passes.push(`Meta description length is ideal (${desc.length} chars).`);
    else issues.push(`Meta description length (${desc.length} chars) should be between 100 and 160 chars.`);
  } else issues.push('Missing <meta name="description"> tag.');

  if (canonical) passes.push(`Canonical URL declared: ${canonical}`);
  else issues.push('Missing <link rel="canonical"> tag.');

  if (ogTitle && ogImage) passes.push('OpenGraph social tags configured.');
  else issues.push('Incomplete OpenGraph tags (missing og:title or og:image).');

  if (twitterCard) passes.push(`Twitter card type: ${twitterCard}`);
  else issues.push('Missing twitter:card meta tag.');

  const score = Math.max(10, 100 - issues.length * 18);

  return {
    score,
    title,
    description: desc,
    canonical,
    ogImage,
    passes,
    issues,
  };
}

/**
 * Analyze Keyword Density & n-gram frequency in text
 */
export function analyzeKeywordDensity(text: string): {
  totalWords: number;
  uniqueWords: number;
  singleWords: { word: string; count: number; density: number }[];
  twoWordPhrases: { phrase: string; count: number; density: number }[];
  threeWordPhrases: { phrase: string; count: number; density: number }[];
  warningKeywords: string[];
} {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  ]);

  const rawWords = clean.split(' ').filter(Boolean);
  const totalWords = rawWords.length;
  if (totalWords === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      singleWords: [],
      twoWordPhrases: [],
      threeWordPhrases: [],
      warningKeywords: [],
    };
  }

  // 1-word frequency
  const wordMap: Record<string, number> = {};
  for (const w of rawWords) {
    if (w.length > 2 && !stopWords.has(w)) {
      wordMap[w] = (wordMap[w] || 0) + 1;
    }
  }

  const singleWords = Object.entries(wordMap)
    .map(([word, count]) => ({
      word,
      count,
      density: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 2-word phrases
  const biMap: Record<string, number> = {};
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (!stopWords.has(w1) || !stopWords.has(w2)) {
      const phrase = `${w1} ${w2}`;
      biMap[phrase] = (biMap[phrase] || 0) + 1;
    }
  }

  const twoWordPhrases = Object.entries(biMap)
    .filter(([_, count]) => count > 1)
    .map(([phrase, count]) => ({
      phrase,
      count,
      density: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3-word phrases
  const triMap: Record<string, number> = {};
  for (let i = 0; i < rawWords.length - 2; i++) {
    const phrase = `${rawWords[i]} ${rawWords[i + 1]} ${rawWords[i + 2]}`;
    triMap[phrase] = (triMap[phrase] || 0) + 1;
  }

  const threeWordPhrases = Object.entries(triMap)
    .filter(([_, count]) => count > 1)
    .map(([phrase, count]) => ({
      phrase,
      count,
      density: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const warningKeywords = singleWords
    .filter((k) => k.density > 3.5)
    .map((k) => `"${k.word}" has high density (${k.density}%). Risk of keyword stuffing.`);

  return {
    totalWords,
    uniqueWords: Object.keys(wordMap).length,
    singleWords,
    twoWordPhrases,
    threeWordPhrases,
    warningKeywords,
  };
}

/**
 * Generate standard robots.txt file
 */
export function generateRobotsTxt(options: {
  siteUrl?: string;
  allowAll?: boolean;
  disallowPaths?: string[];
  crawlDelay?: number;
}): string {
  const siteUrl = options.siteUrl || 'https://multipledarknews.com';
  const delay = options.crawlDelay ? `Crawl-delay: ${options.crawlDelay}\n` : '';
  const disallows = options.disallowPaths && options.disallowPaths.length > 0
    ? options.disallowPaths.map((p) => `Disallow: ${p}`).join('\n')
    : 'Disallow: /admin\nDisallow: /api/private';

  return `# MultipleDarkNews Online Tools Platform - Robots.txt
# Optimized for Googlebot, Bingbot, Applebot, DuckDuckBot
User-agent: *
Allow: /
${disallows}
${delay}
# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-tools.xml`;
}

/**
 * Convert string to SEO-Friendly URL Slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape HTML special chars
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
