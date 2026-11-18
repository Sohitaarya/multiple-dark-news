import { getToolBySlug } from '../data/toolsRegistry';
import { getCategoryById } from '../data/categories';
import { ToolCategory } from '../types/tools';
import { RouteMatch } from './routing';

export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  noIndex: boolean;
}

const BASE_ORIGIN = 'https://tools.multipledarknews.com';

export function resolveRouteSeoMeta(match: RouteMatch): RouteSeoMeta {
  if (match.is404 || match.view === '404') {
    return {
      title: '404 Page Not Found | MultipleDarkNews Tools Ecosystem',
      description: 'The requested tool or page route was not found in the 331-tool registry.',
      canonicalUrl: BASE_ORIGIN,
      noIndex: true,
    };
  }

  if (match.view === 'portfolio') {
    return {
      title: 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem',
      description: 'Official profile of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.',
      canonicalUrl: `${BASE_ORIGIN}/sohit-aarya`,
      noIndex: false,
    };
  }

  if (match.view === 'tool' && match.param) {
    const tool = getToolBySlug(match.param);
    if (tool) {
      return {
        title: tool.seoTitle || `${tool.name} Online - Free & Private | MultipleDarkNews Tools`,
        description: tool.seoDescription || tool.description,
        canonicalUrl: `${BASE_ORIGIN}/${tool.slug}`,
        noIndex: false,
      };
    }
  }

  if (match.view === 'category' && match.param) {
    const cat = getCategoryById(match.param as ToolCategory);
    if (cat) {
      return {
        title: `${cat.name} Online — 100% Free Client-Side Tools Suite | MultipleDarkNews`,
        description: `${cat.shortDescription} Access all ${cat.toolCount} free tools with zero file uploads and instant in-browser execution.`,
        canonicalUrl: `${BASE_ORIGIN}/category/${cat.id}`,
        noIndex: false,
      };
    }
  }

  if (match.view === 'admin') {
    return {
      title: 'Admin Dashboard & Central Tool Registry | MultipleDarkNews Tools',
      description: 'Platform governance and real-time monitoring dashboard for MultipleDarkNews central tool registry.',
      canonicalUrl: `${BASE_ORIGIN}/admin`,
      noIndex: true,
    };
  }

  if (match.view === 'audit') {
    return {
      title: 'Technical Audit Report & Verification | MultipleDarkNews Tools',
      description: 'Comprehensive engineering audit, test coverage verification, and privacy compliance report.',
      canonicalUrl: `${BASE_ORIGIN}/audit`,
      noIndex: false,
    };
  }

  if (match.view === 'privacy') {
    return {
      title: 'Privacy Policy & Zero-Data Deletion | MultipleDarkNews Tools',
      description: 'Privacy policy explaining 100% client-side in-browser processing with zero file uploads.',
      canonicalUrl: `${BASE_ORIGIN}/privacy`,
      noIndex: false,
    };
  }

  if (match.view === 'terms') {
    return {
      title: 'Terms of Service | MultipleDarkNews Tools',
      description: 'Terms of service for the MultipleDarkNews 331+ free online tools platform.',
      canonicalUrl: `${BASE_ORIGIN}/terms`,
      noIndex: false,
    };
  }

  if (match.view === 'integration') {
    return {
      title: 'Website Integration Guide — Add 331+ Tools to Your Website | MultipleDarkNews',
      description: 'Step-by-step guide to connect 331+ free tools to multipledarknews.com via Subdomain CNAME, Subfolder proxy, or embed.',
      canonicalUrl: `${BASE_ORIGIN}/integration`,
      noIndex: false,
    };
  }

  return {
    title: 'MultipleDarkNews Tools — 331+ Free Online PDF, Image, Developer & SEO Tools',
    description: 'Fast, 100% private online tools platform by Sohit Aarya & MultipleDarkNews. Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud uploads.',
    canonicalUrl: BASE_ORIGIN,
    noIndex: false,
  };
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function injectRouteSeoIntoHtml(html: string, meta: RouteSeoMeta): string {
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeUrl = escapeHtmlAttr(meta.canonicalUrl);
  const robotsValue = meta.noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${robotsValue}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${safeUrl}" />`);

  if (!/property="og:url"/i.test(out)) {
    out = out.replace(/<\/head>/i, `    <meta property="og:url" content="${safeUrl}" />\n  </head>`);
  }
  return out;
}
