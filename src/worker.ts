/**
 * Cloudflare Worker Entrypoint for MultipleDarkNews Tools
 * Handles:
 * - Static asset serving with strict HTTP 404 (never falls back to index.html for missing assets)
 * - Valid SPA routes (HTTP 200) vs unrecognized routes (HTTP 404 + X-Robots-Tag: noindex, nofollow)
 * - SSRF-protected server-side SEO inspection, RDAP WHOIS proxy, and Sitemap ping APIs
 */

import { ALL_TOOLS } from './data/toolsRegistry';
import { CATEGORIES } from './data/categories';
import { isStaticAssetPath, resolveAppRoute, RouteMatch } from './utils/routing';
import { normalizePublicDomain, validatePublicHttpUrl } from './utils/networkSafety';
import { injectRouteSeoIntoHtml, resolveRouteSeoMeta } from './utils/seoHtml';

interface AssetsFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface WorkerEnv {
  ASSETS: AssetsFetcher;
}

const TOOL_SLUG_SET = new Set(ALL_TOOLS.map((t) => t.slug.toLowerCase()));
const CATEGORY_ID_SET = new Set(CATEGORIES.map((c) => c.id.toLowerCase()));

function isKnownRoute(pathname: string, search: string): { valid: boolean; view: string; match: RouteMatch } {
  const match = resolveAppRoute(pathname, search, '', {
    findToolBySlug: (slug) => (TOOL_SLUG_SET.has(slug.toLowerCase()) ? { slug } : undefined),
    hasCategory: (cat) => CATEGORY_ID_SET.has(cat.toLowerCase()),
  });
  return { valid: !match.is404, view: match.view, match };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function handleSeoInspect(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const validated = validatePublicHttpUrl(body.url || '');
    if (!validated.valid) {
      return jsonResponse({ success: false, error: validated.error }, 400);
    }

    let currentUrl = validated.url.toString();
    const hops: Array<{ url: string; status: number; location?: string }> = [];
    const started = Date.now();
    let finalRes: Response | null = null;

    for (let i = 0; i < 6; i++) {
      const check = validatePublicHttpUrl(currentUrl);
      if (!check.valid) {
        return jsonResponse({ success: false, error: `Redirect blocked: ${check.error}` }, 400);
      }
      const res = await fetch(check.url.toString(), {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'MultipleDarkNews-SEO-Inspector/1.0' },
      });
      const loc = res.headers.get('location') || undefined;
      hops.push({ url: check.url.toString(), status: res.status, location: loc });
      if (res.status >= 300 && res.status < 400 && loc) {
        currentUrl = new URL(loc, check.url.toString()).toString();
        continue;
      }
      finalRes = res;
      break;
    }

    if (!finalRes) {
      return jsonResponse({ success: false, error: 'Too many redirects (> 5).' }, 502);
    }

    const headers: Record<string, string> = {};
    finalRes.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    return jsonResponse({
      success: true,
      finalUrl: currentUrl,
      status: finalRes.status,
      statusText: finalRes.statusText || '',
      responseTimeMs: Date.now() - started,
      redirected: hops.length > 1,
      hops,
      headers,
    });
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || 'Upstream fetch failed' }, 502);
  }
}

async function handleSeoRdap(url: URL): Promise<Response> {
  const domainParam = url.searchParams.get('domain') || '';
  const parsed = normalizePublicDomain(domainParam);
  if (!parsed.valid) {
    return jsonResponse({ success: false, error: parsed.error }, 400);
  }

  try {
    const queriedDomain = parsed.rootDomain || parsed.domain;
    const parts = queriedDomain.toLowerCase().split('.');
    const tld = parts[parts.length - 1] || '';
    const candidates: string[] = [];

    if (tld === 'com') candidates.push(`https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(queriedDomain)}`);
    else if (tld === 'net') candidates.push(`https://rdap.verisign.com/net/v1/domain/${encodeURIComponent(queriedDomain)}`);
    else if (tld === 'org') candidates.push(`https://rdap.publicinterestregistry.org/rdap/domain/${encodeURIComponent(queriedDomain)}`);

    try {
      const ianaRes = await fetch('https://data.iana.org/rdap/dns.json', {
        headers: { 'User-Agent': 'MultipleDarkNews-RDAP/1.0' },
      });
      if (ianaRes.ok) {
        const ianaJson = (await ianaRes.json()) as { services?: Array<[string[], string[]]> };
        for (const [tlds, servers] of ianaJson.services || []) {
          if (tlds.includes(tld) && servers[0]) {
            const candidate = `${servers[0].replace(/\/+$/, '')}/domain/${encodeURIComponent(queriedDomain)}`;
            if (!candidates.includes(candidate)) candidates.push(candidate);
            break;
          }
        }
      }
    } catch {
      // Fallback below
    }

    candidates.push(`https://rdap.org/domain/${encodeURIComponent(queriedDomain)}`);

    let lastStatus = 502;
    for (const targetUrl of candidates) {
      try {
        const rdapRes = await fetch(targetUrl, {
          headers: {
            Accept: 'application/rdap+json, application/json',
            'User-Agent': 'MultipleDarkNews-RDAP/1.0',
          },
        });
        lastStatus = rdapRes.status;
        if (rdapRes.ok) {
          const data = await rdapRes.json();
          return jsonResponse({ success: true, domain: queriedDomain, registry: new URL(targetUrl).hostname, data });
        }
      } catch {
        // Try next candidate
      }
    }

    return jsonResponse({
      success: false,
      status: lastStatus,
      domain: queriedDomain,
      error: `RDAP registry returned HTTP ${lastStatus} for ${queriedDomain}.`,
    }, lastStatus === 404 ? 404 : 502);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || 'RDAP query failed' }, 502);
  }
}

async function handleSitemapPing(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { domain?: string; sitemapUrl?: string };
    const candidate = body.sitemapUrl || `${(body.domain || 'https://tools.multipledarknews.com').replace(/\/+$/, '')}/sitemap.xml`;
    const validated = validatePublicHttpUrl(candidate);
    if (!validated.valid) {
      return jsonResponse({ success: false, error: validated.error }, 400);
    }

    const pingOne = async (target: string, provider: string) => {
      try {
        const res = await fetch(target, {
          headers: { 'User-Agent': 'MultipleDarkNewsSitemapPinger/1.0' },
        });
        return {
          status: res.status,
          message: res.ok ? `${provider} ping accepted (HTTP ${res.status}).` : `${provider} returned HTTP ${res.status}.`,
          ok: res.ok,
        };
      } catch (err: any) {
        return { status: 0, message: `${provider} ping failed: ${err?.message || 'Network error'}`, ok: false };
      }
    };

    const encoded = encodeURIComponent(validated.url.toString());
    const [google, bing] = await Promise.all([
      pingOne(`https://www.google.com/ping?sitemap=${encoded}`, 'Google'),
      pingOne(`https://www.bing.com/ping?sitemap=${encoded}`, 'Bing'),
    ]);

    return jsonResponse({
      success: google.ok || bing.ok,
      google,
      bing,
      timestamp: new Date().toISOString(),
      sitemapUrl: validated.url.toString(),
    }, google.ok || bing.ok ? 200 : 502);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err?.message || 'Ping failed' }, 500);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, search } = url;

    // 1. API endpoints
    if (pathname === '/api/seo/inspect') return handleSeoInspect(request);
    if (pathname === '/api/seo/rdap') return handleSeoRdap(url);
    if (pathname === '/api/sitemap/ping') return handleSitemapPing(request);

    // 1b. Legacy /portfolio -> canonical /sohit-aarya 301 redirect
    if (pathname === '/portfolio' || pathname === '/portfolio/') {
      return Response.redirect(new URL(`/sohit-aarya${search}`, url.origin).toString(), 301);
    }

    // 2. Serve existing static assets cleanly; missing static assets NEVER fall back to index.html
    if (isStaticAssetPath(pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404) {
        return new Response('Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'X-Robots-Tag': 'noindex' },
        });
      }
      return assetResponse;
    }

    // 3. Direct asset lookup first (in case an extensionless asset matches)
    const directAsset = await env.ASSETS.fetch(request);
    if (directAsset.status !== 404) {
      return directAsset;
    }

    // 4. SPA Page Routing with authentic 200 vs 404 status codes & exact per-route SSR canonical metadata
    const routeCheck = isKnownRoute(pathname, search);
    const indexReq = new Request(new URL('/index.html', url.origin), { method: 'GET', headers: request.headers });
    const indexRes = await env.ASSETS.fetch(indexReq);
    const rawHtml = await indexRes.text();
    const seoMeta = resolveRouteSeoMeta(routeCheck.match);
    const seoHtml = injectRouteSeoIntoHtml(rawHtml, seoMeta);

    const headers = new Headers(indexRes.headers);
    headers.set('Content-Type', 'text/html; charset=UTF-8');
    headers.delete('Content-Length');
    headers.delete('ETag');

    if (!routeCheck.valid) {
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(seoHtml, { status: 404, headers });
    }

    if (routeCheck.view === 'admin') {
      headers.set('X-Robots-Tag', 'noindex, nofollow');
    }

    return new Response(seoHtml, { status: 200, headers });
  },
};
