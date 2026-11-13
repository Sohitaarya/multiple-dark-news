/**
 * Combined Engine for Security (15), SEO (27), and Social Media (20) Tools
 * Pure algorithms + live public Cloudflare DoH / RDAP / oEmbed helpers.
 */
import JSZip from 'jszip';

// ==========================================
// A. SECURITY ALGORITHMS (ALL 15 TOOLS)
// ==========================================

export function generateRandomNumbersSet(min: number, max: number, count: number, unique = true, sort = false): number[] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const range = hi - lo + 1;
  const actualCount = unique ? Math.min(count, range) : count;
  const out: number[] = [];
  const seen = new Set<number>();

  let guard = 0;
  while (out.length < actualCount && guard < actualCount * 30) {
    guard++;
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    const val = lo + (buf[0] % range);
    if (unique) {
      if (!seen.has(val)) {
        seen.add(val);
        out.push(val);
      }
    } else {
      out.push(val);
    }
  }
  return sort ? out.sort((a, b) => a - b) : out;
}

export function generateRandomStringsList(
  length: number,
  count: number,
  mode: 'alphanumeric' | 'hex' | 'alpha' | 'numeric' | 'symbols' = 'alphanumeric'
): string[] {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    hex: '0123456789abcdef',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+',
  };
  const pool = charsets[mode] || charsets.alphanumeric;
  const results: string[] = [];
  for (let c = 0; c < Math.min(50, Math.max(1, count)); c++) {
    const arr = new Uint32Array(length);
    globalThis.crypto.getRandomValues(arr);
    let s = '';
    for (let i = 0; i < length; i++) s += pool[arr[i] % pool.length];
    results.push(s);
  }
  return results;
}

export function compareHashChecksums(hashA: string, hashB: string): {
  match: boolean;
  detectedType: string;
  normalizedA: string;
  normalizedB: string;
} {
  const a = hashA.trim().toLowerCase();
  const b = hashB.trim().toLowerCase();
  const len = a.length;
  let detectedType = 'Unknown';
  if (/^[a-f0-9]+$/.test(a)) {
    if (len === 32) detectedType = 'MD5 (128-bit)';
    else if (len === 40) detectedType = 'SHA-1 (160-bit)';
    else if (len === 64) detectedType = 'SHA-256 (256-bit)';
    else if (len === 96) detectedType = 'SHA-384 (384-bit)';
    else if (len === 128) detectedType = 'SHA-512 (512-bit)';
  }
  return {
    match: a.length > 0 && a === b,
    detectedType,
    normalizedA: a,
    normalizedB: b,
  };
}

export function analyzeUrlSafety(rawUrl: string): {
  valid: boolean;
  riskLevel: 'Low (Safe)' | 'Medium (Caution)' | 'High (Suspicious)';
  score: number;
  checks: { label: string; passed: boolean; detail: string }[];
} {
  let u: URL;
  try {
    u = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return {
      valid: false,
      riskLevel: 'High (Suspicious)',
      score: 0,
      checks: [{ label: 'URL Syntax', passed: false, detail: 'Malformed or unparseable URL.' }],
    };
  }

  const host = u.hostname.toLowerCase();
  const checks: { label: string; passed: boolean; detail: string }[] = [];

  const isHttps = u.protocol === 'https:';
  checks.push({ label: 'HTTPS Encryption', passed: isHttps, detail: isHttps ? 'Uses encrypted HTTPS transport' : 'Unencrypted HTTP protocol' });

  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':');
  checks.push({ label: 'Hostname Type', passed: !isIpHost, detail: isIpHost ? 'Raw IP address host (common in phishing)' : `Valid domain: ${host}` });

  const isPunycode = host.includes('xn--');
  checks.push({ label: 'Homograph / Punycode Check', passed: !isPunycode, detail: isPunycode ? 'Contains xn-- IDN punycode — verify brand spelling carefully' : 'Clean ASCII domain label' });

  const hasAtUserinfo = rawUrl.includes('@') && rawUrl.indexOf('@') < rawUrl.indexOf(host);
  checks.push({ label: 'Credential Spoofing (@)', passed: !hasAtUserinfo, detail: hasAtUserinfo ? 'Embedded @ userinfo in URL authority' : 'No credential obfuscation' });

  const suspiciousRedirect = /(redirect=|url=https?:|next=https?:|token=|login)/i.test(u.search);
  checks.push({ label: 'Query Redirect Parameters', passed: !suspiciousRedirect, detail: suspiciousRedirect ? 'Contains redirect/login query parameters' : 'Clean query string' });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const riskLevel = score >= 80 ? 'Low (Safe)' : score >= 50 ? 'Medium (Caution)' : 'High (Suspicious)';

  return { valid: true, riskLevel, score, checks };
}

export function validateEmailAddress(email: string): {
  validSyntax: boolean;
  localPart: string;
  domain: string;
  isDisposable: boolean;
  typoSuggestion: string | null;
} {
  const clean = email.trim();
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  const validSyntax = re.test(clean);
  const [localPart = '', domain = ''] = clean.split('@');
  const dLow = domain.toLowerCase();

  const disposableDomains = new Set([
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com',
  ]);
  const typos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  return {
    validSyntax,
    localPart,
    domain: dLow,
    isDisposable: disposableDomains.has(dLow),
    typoSuggestion: typos[dLow] ? `${localPart}@${typos[dLow]}` : null,
  };
}

export function inspectIpAddressDetails(ipRaw: string): {
  valid: boolean;
  version: 'IPv4' | 'IPv6' | 'Invalid';
  scope: string;
  binaryOrExpanded: string;
  integerValue?: string;
} {
  const ip = ipRaw.trim();
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255)) {
    const nums = ipv4Parts.map(Number);
    const [a, b] = nums;
    let scope = 'Public Internet Routable';
    if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) scope = 'RFC 1918 Private Network';
    else if (a === 127) scope = 'Loopback (Localhost)';
    else if (a === 169 && b === 254) scope = 'Link-Local (APIPA)';
    else if (a >= 224) scope = 'Multicast / Reserved';

    const intVal = (((nums[0] << 24) >>> 0) + (nums[1] << 16) + (nums[2] << 8) + nums[3]) >>> 0;
    const bin = nums.map((n) => n.toString(2).padStart(8, '0')).join('.');
    return { valid: true, version: 'IPv4', scope, binaryOrExpanded: bin, integerValue: String(intVal) };
  }

  if (ip.includes(':') && /^[0-9a-fA-F:]+$/.test(ip)) {
    const scope = ip === '::1' ? 'IPv6 Loopback' : ip.toLowerCase().startsWith('fe80') ? 'Link-Local Unicast' : 'Global Unicast / IPv6';
    return { valid: true, version: 'IPv6', scope, binaryOrExpanded: ip.toLowerCase() };
  }

  return { valid: false, version: 'Invalid', scope: 'Invalid IP syntax', binaryOrExpanded: '' };
}

/**
 * RFC 6238 HMAC-SHA1 TOTP Generator via Web Crypto API
 */
export async function generateRfcTotpCode(base32Secret: string): Promise<{ code: string; secondsRemaining: number }> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32Secret.toUpperCase().replace(/[^A-Z2-7]/g, '') || 'JBSWY3DPEHPK3PXP';
  let bits = '';
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx !== -1) bits += idx.toString(2).padStart(5, '0');
  }
  const keyBytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < keyBytes.length; i++) {
    keyBytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }

  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / 30);
  const secondsRemaining = 30 - (epoch % 30);

  const msg = new Uint8Array(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', cryptoKey, msg));
  const offset = sig[sig.length - 1] & 0x0f;
  const binCode =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  const otp = (binCode % 1000000).toString().padStart(6, '0');
  return { code: otp, secondsRemaining };
}

// ==========================================
// B. SEO ALGORITHMS (ALL NON-AI SEO TOOLS)
// ==========================================

export function generateSchemaJsonLd(
  schemaType: 'Article' | 'Product' | 'FAQPage' | 'LocalBusiness' | 'Organization',
  fields: { name: string; description: string; url: string; authorOrBrand: string; price?: string; currency?: string }
): string {
  const base: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
  };
  if (schemaType === 'Article') {
    base.headline = fields.name;
    base.description = fields.description;
    base.author = { '@type': 'Person', name: fields.authorOrBrand };
    base.mainEntityOfPage = fields.url;
    base.datePublished = new Date().toISOString().split('T')[0];
  } else if (schemaType === 'Product') {
    base.name = fields.name;
    base.description = fields.description;
    base.brand = { '@type': 'Brand', name: fields.authorOrBrand };
    base.offers = {
      '@type': 'Offer',
      price: fields.price || '29.00',
      priceCurrency: fields.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: fields.url,
    };
  } else if (schemaType === 'FAQPage') {
    base.mainEntity = [
      {
        '@type': 'Question',
        name: fields.name || 'How does this service work?',
        acceptedAnswer: { '@type': 'Answer', text: fields.description || 'It runs instantaneously in your browser.' },
      },
    ];
  } else {
    base.name = fields.name;
    base.description = fields.description;
    base.url = fields.url;
  }

  return `<script type="application/ld+json">\n${JSON.stringify(base, null, 2)}\n</script>`;
}

export function generateHreflangTags(baseUrl: string, locales: { code: string; pathPrefix?: string }[]): string {
  const clean = baseUrl.replace(/\/+$/, '');
  const tags = locales.map((l) => {
    const href = l.pathPrefix ? `${clean}/${l.pathPrefix.replace(/^\/+/, '')}` : clean;
    return `<link rel="alternate" hreflang="${l.code}" href="${href}" />`;
  });
  tags.push(`<link rel="alternate" hreflang="x-default" href="${clean}" />`);
  return tags.join('\n');
}

export function testRobotsTxtPath(robotsTxt: string, userAgent: string, testPath: string): {
  allowed: boolean;
  matchedRule: string;
} {
  const lines = robotsTxt.split(/\r?\n/).map((l) => l.trim());
  let currentUaMatches = false;
  let bestRule = 'Allow (default)';
  let bestLen = -1;
  let allowed = true;

  for (const line of lines) {
    const clean = line.split('#')[0].trim();
    if (!clean) continue;
    const colon = clean.indexOf(':');
    if (colon === -1) continue;
    const directive = clean.slice(0, colon).trim().toLowerCase();
    const value = clean.slice(colon + 1).trim();

    if (directive === 'user-agent') {
      currentUaMatches = value === '*' || value.toLowerCase() === userAgent.toLowerCase();
    } else if (currentUaMatches && (directive === 'disallow' || directive === 'allow')) {
      if (!value) continue;
      if (testPath.startsWith(value) && value.length >= bestLen) {
        bestLen = value.length;
        allowed = directive === 'allow';
        bestRule = `${directive === 'allow' ? 'Allow' : 'Disallow'}: ${value}`;
      }
    }
  }
  return { allowed, matchedRule: bestRule };
}

export function validateXmlSitemapContent(xml: string): {
  valid: boolean;
  urlCount: number;
  urls: string[];
  issues: string[];
} {
  const issues: string[] = [];
  if (!xml.includes('<urlset')) issues.push('Missing <urlset> root element.');
  const locMatches = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((m) => m[1].trim());
  if (locMatches.length === 0) issues.push('No <loc> URLs found inside sitemap.');
  const seen = new Set<string>();
  let duplicates = 0;
  for (const u of locMatches) {
    if (seen.has(u)) duplicates++;
    seen.add(u);
    if (!/^https?:\/\//i.test(u)) issues.push(`Invalid URL protocol: ${u}`);
  }
  if (duplicates > 0) issues.push(`${duplicates} duplicate URL(s) detected.`);
  return {
    valid: issues.length === 0,
    urlCount: locMatches.length,
    urls: locMatches.slice(0, 25),
    issues,
  };
}

export function generateKeywordIdeas(seedKeyword: string): { category: string; keywords: string[] }[] {
  const s = (seedKeyword || 'pdf compressor').trim();
  const year = new Date().getFullYear();
  return [
    {
      category: 'High-Intent Global Search Queries',
      keywords: [`best ${s}`, `free ${s} online`, `${s} no watermark`, `${s} without signup`, `fast ${s} ${year}`],
    },
    {
      category: 'Informational / Question Keywords',
      keywords: [`how to use ${s}`, `what is the best ${s}`, `is online ${s} safe`, `${s} step by step guide`],
    },
    {
      category: 'Commercial / Comparison Modifiers',
      keywords: [`${s} alternative`, `${s} vs desktop software`, `top 10 ${s} tools`, `${s} for mac and windows`],
    },
  ];
}

export async function generateFaviconPackZip(titleOrLetter: string, bgColor: string, fgColor: string, sourceFile?: File): Promise<{
  zipBlob: Blob;
  preview32Url: string;
  htmlSnippet: string;
}> {
  const sizes = [16, 32, 48, 180, 192, 512];
  const zip = new JSZip();
  let preview32Url = '';

  let imgEl: HTMLImageElement | null = null;
  if (sourceFile) {
    imgEl = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = URL.createObjectURL(sourceFile);
    });
  }

  for (const sz of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = sz;
    canvas.height = sz;
    const ctx = canvas.getContext('2d')!;
    if (imgEl) {
      ctx.drawImage(imgEl, 0, 0, sz, sz);
    } else {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, sz, sz, sz * 0.2);
      ctx.fill();
      ctx.fillStyle = fgColor;
      ctx.font = `900 ${Math.round(sz * 0.56)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((titleOrLetter || 'M').slice(0, 2).toUpperCase(), sz / 2, sz / 2 + sz * 0.04);
    }
    if (sz === 32) preview32Url = canvas.toDataURL('image/png');
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const name = sz === 180 ? 'apple-touch-icon.png' : sz >= 192 ? `android-chrome-${sz}x${sz}.png` : `favicon-${sz}x${sz}.png`;
    zip.file(name, blob);
  }

  zip.file(
    'site.webmanifest',
    JSON.stringify(
      {
        name: titleOrLetter || 'Web App',
        short_name: titleOrLetter || 'App',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: bgColor,
        background_color: bgColor,
        display: 'standalone',
      },
      null,
      2
    )
  );

  const htmlSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />`;

  zip.file('head-tags.html', htmlSnippet);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, preview32Url, htmlSnippet };
}

export async function lookupCloudflareDns(domain: string, recordType = 'A'): Promise<any> {
  const clean = domain.trim().replace(/^https?:\/\//, '').split('/')[0];
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(clean)}&type=${encodeURIComponent(recordType)}`, {
    headers: { Accept: 'application/dns-json' },
  });
  return await res.json();
}

// ==========================================
// C. SOCIAL MEDIA ALGORITHMS (ALL 20 TOOLS)
// ==========================================

export function generateSocialContentSuite(
  toolId: string,
  topic: string,
  niche = 'Technology & SaaS',
  tone = 'Engaging'
): string {
  const cleanTopic = topic.trim() || 'Online Productivity Tools';
  const words = cleanTopic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  const slugTag = words.join('');

  if (toolId === 'youtube-tag-generator') {
    const tags = [
      cleanTopic.toLowerCase(),
      `${cleanTopic.toLowerCase()} tutorial`,
      `best ${cleanTopic.toLowerCase()}`,
      `how to ${cleanTopic.toLowerCase()}`,
      `${cleanTopic.toLowerCase()} ${new Date().getFullYear()}`,
      `${niche.toLowerCase()} tips`,
      `${words[0] || 'tech'} guide`,
      `free ${cleanTopic.toLowerCase()}`,
      ...words.map((w) => `${w} tips`),
    ];
    return Array.from(new Set(tags)).join(', ');
  }

  if (toolId === 'youtube-title-generator') {
    return [
      `1. How to Master ${cleanTopic} in 10 Minutes (${new Date().getFullYear()} Complete Guide)`,
      `2. I Tested Every ${cleanTopic} Workflow — Here's What Actually Works!`,
      `3. 7 Game-Changing ${cleanTopic} Secrets Nobody Tells You`,
      `4. Stop Wasting Time: The Fastest ${cleanTopic} Setup for Beginners`,
      `5. ${cleanTopic} Explained Simply (${niche} Masterclass)`,
    ].join('\n');
  }

  if (toolId === 'youtube-description-generator') {
    return `🚀 In this video, we break down everything you need to know about ${cleanTopic} (${tone} ${niche} Guide).\n\n📌 TIMESTAMPS:\n00:00 — Introduction to ${cleanTopic}\n01:30 — Step-by-Step Setup & Workflow\n04:45 — Pro Tips for Faster Results\n08:10 — Common Mistakes to Avoid\n\n🔗 HELPFUL RESOURCES:\n• Official Website: https://tools.multipledarknews.com\n\n#${slugTag || 'tutorial'} #${niche.replace(/[^a-zA-Z]/g, '')} #YouTubeTips`;
  }

  if (toolId === 'youtube-hashtag-generator' || toolId === 'hashtag-generator') {
    const baseTags = [
      `#${slugTag || 'trending'}`,
      ...words.map((w) => `#${w}`),
      `#${niche.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#productivity', '#digitaltools', '#creator', '#tips', '#howto', '#viral', '#growth', '#global',
    ];
    return Array.from(new Set(baseTags)).slice(0, 18).join(' ');
  }

  if (toolId === 'instagram-bio-generator' || toolId === 'social-media-bio-formatter') {
    return `✨ ${cleanTopic} | ${niche}\n🚀 Helping creators & teams work 10x faster\n🌍 Built for global makers & professionals\n👇 Try our free tools below\n🔗 linktr.ee/yourbrand`;
  }

  if (toolId === 'instagram-caption-generator') {
    return `💡 Ready to level up your workflow with ${cleanTopic}?\n\nSave this post so you can revisit these steps anytime! 👇\n\n1️⃣ Start with clarity over complexity\n2️⃣ Automate repetitive tasks\n3️⃣ Stay consistent every single week\n\nWhich tip are you trying first? Drop a comment below! 💬\n\n#${slugTag || 'growth'} #${niche.replace(/[^a-zA-Z]/g, '')} #workflow #tips`;
  }

  return `#${slugTag || 'social'} — Generated for ${cleanTopic}`;
}

export function formatUnicodeSocialPost(text: string, style: 'bold' | 'italic' | 'bullets'): string {
  if (style === 'bullets') {
    return text
      .split(/\r?\n/)
      .map((l) => (l.trim() ? `▸ ${l.trim()}` : ''))
      .join('\n');
  }
  const upperBase = style === 'bold' ? 0x1d5d4 : 0x1d608;
  const lowerBase = style === 'bold' ? 0x1d5ee : 0x1d622;
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(upperBase + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(lowerBase + (code - 97));
      return ch;
    })
    .join('');
}

export function analyzeVideoTitleCtr(title: string): {
  length: number;
  wordCount: number;
  pixelWidth: number;
  score: number;
  feedback: string[];
} {
  const clean = title.trim();
  const wordCount = clean ? clean.split(/\s+/).length : 0;
  const pixelWidth = Math.round(clean.length * 8.5);
  const powerWords = ['how', 'best', 'free', 'secret', 'fast', 'top', 'tested', 'guide', 'mistakes', 'why', '2025', '2026'];
  const hasPower = powerWords.some((p) => clean.toLowerCase().includes(p));
  const hasNumber = /\d/.test(clean);

  let score = 50;
  const feedback: string[] = [];
  if (clean.length >= 40 && clean.length <= 68) {
    score += 20;
    feedback.push('✓ Optimal length (fits cleanly on YouTube Desktop & Mobile without truncation).');
  } else {
    feedback.push(clean.length < 40 ? '• Title is short (<40 chars). Add descriptive context.' : '• Title exceeds 68 chars and may truncate on YouTube feeds.');
  }
  if (hasPower) {
    score += 15;
    feedback.push('✓ Includes high-CTR trigger / curiosity keyword.');
  } else {
    feedback.push('• Consider adding a high-CTR word like "How", "Guide", "Tested", or "Best".');
  }
  if (hasNumber) {
    score += 15;
    feedback.push('✓ Numbers or year anchors boost browse click-through rate.');
  } else {
    feedback.push('• Adding a specific number or year (e.g. "5 Tips") often increases clicks.');
  }
  return { length: clean.length, wordCount, pixelWidth, score: Math.min(100, score), feedback };
}

export const SOCIAL_IMAGE_PRESETS = [
  { id: 'ig-post', label: 'Instagram Square (1080×1080)', w: 1080, h: 1080 },
  { id: 'ig-portrait', label: 'Instagram Portrait (1080×1350)', w: 1080, h: 1350 },
  { id: 'ig-reel', label: 'Reels / TikTok / Shorts (1080×1920)', w: 1080, h: 1920 },
  { id: 'yt-thumb', label: 'YouTube Thumbnail (1280×720)', w: 1280, h: 720 },
  { id: 'linkedin-banner', label: 'LinkedIn Banner (1584×396)', w: 1584, h: 396 },
  { id: 'x-header', label: 'Twitter / X Header (1500×500)', w: 1500, h: 500 },
  { id: 'fb-cover', label: 'Facebook Cover (1640×924)', w: 1640, h: 924 },
  { id: 'pinterest-pin', label: 'Pinterest Pin (1000×1500)', w: 1000, h: 1500 },
];

export function createPinterestPinCanvasBlob(
  title: string,
  subtitle: string,
  domain: string,
  bgColor = '#9f1239',
  bgImage?: HTMLImageElement | null
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1500;
  const ctx = canvas.getContext('2d')!;

  if (bgImage) {
    const scale = Math.max(1000 / bgImage.width, 1500 / bgImage.height);
    const sw = 1000 / scale;
    const sh = 1500 / scale;
    ctx.drawImage(bgImage, (bgImage.width - sw) / 2, (bgImage.height - sh) / 2, sw, sh, 0, 0, 1000, 1500);
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.fillRect(0, 0, 1000, 1500);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 1000, 1500);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 1500);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 904, 1404);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 68px sans-serif';
  const words = (title || '10 Productivity Tips That Save Hours Every Week').split(' ');
  let line = '';
  let y = 520;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > 800) {
      ctx.fillText(line, 500, y);
      line = w;
      y += 88;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 500, y);

  ctx.font = '500 32px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(subtitle || 'Save & Share this guide', 500, y + 110);

  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#fda4af';
  ctx.fillText((domain || 'TOOLS.MULTIPLEDARKNEWS.COM').toUpperCase(), 500, 1380);

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Pin render failed'))), 'image/png'));
}
