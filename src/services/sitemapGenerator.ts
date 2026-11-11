/**
 * MultipleDarkNews XML Sitemap & SEO Index Generator
 * Builds complete standard XML sitemaps for all 325+ tools and 12 categories
 */

import { ALL_TOOLS } from '../data/toolsRegistry';
import { CATEGORIES } from '../data/categories';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  category?: string;
  name: string;
}

/**
 * Generate all Sitemap entries for the site
 */
export function getSitemapEntries(domain = 'https://tools.multipledarknews.com'): SitemapEntry[] {
  const cleanDomain = domain.replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // 1. Home
    {
      loc: `${cleanDomain}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0',
      name: 'Home - Free Online Tools Platform',
    },
    // 2. Sohit Aarya Official Portfolio
    {
      loc: `${cleanDomain}/portfolio`,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0',
      name: 'Sohit Aarya - Official Portfolio, Developer & Founder',
    },
    // 3. Audit & Governance
    {
      loc: `${cleanDomain}/audit`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
      name: 'Engineering & Security Audit Report',
    },
    {
      loc: `${cleanDomain}/privacy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7',
      name: 'Privacy Policy & Zero-Data Deletion',
    },
    {
      loc: `${cleanDomain}/terms`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7',
      name: 'Terms of Service',
    },
    {
      loc: `${cleanDomain}/integration`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8',
      name: 'Website Integration Guide & Embed Hub',
    },
  ];

  // 3. All 12 Categories
  for (const cat of CATEGORIES) {
    entries.push({
      loc: `${cleanDomain}/category/${cat.id}`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9',
      category: cat.id,
      name: `${cat.name} Category (${cat.toolCount} tools)`,
    });
  }

  // 4. All 331+ Tools
  for (const tool of ALL_TOOLS) {
    const priority = tool.isPopular || tool.isFeatured ? '0.9' : '0.8';
    entries.push({
      loc: `${cleanDomain}/${tool.slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority,
      category: tool.category,
      name: tool.name,
    });
  }

  return entries;
}

/**
 * Generate XML string conforming to sitemaps.org protocol
 */
export function generateXmlSitemap(domain = 'https://tools.multipledarknews.com'): string {
  const entries = getSitemapEntries(domain);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
