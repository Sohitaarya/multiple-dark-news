/**
 * Pure Application Route & Asset Path Resolver
 * Shared between App.tsx (client), server.ts (Node/Express), and worker.ts (Cloudflare Worker).
 */

export const STATIC_VIEW_ALIASES: Record<string, string> = {
  'sohit-aarya': 'portfolio',
  portfolio: 'portfolio',
  tools: 'tools',
  home: 'tools',
  admin: 'admin',
  audit: 'audit',
  privacy: 'privacy',
  terms: 'terms',
  integration: 'integration',
  embed: 'integration',
  'add-to-website': 'integration',
};

function canonicalStaticPath(view: string): string {
  if (view === 'tools') return '/';
  if (view === 'portfolio') return '/sohit-aarya';
  return `/${view}`;
}

export interface RouteMatch {
  view: string;
  param?: string;
  cleanPath: string;
  is404: boolean;
  shouldReplaceUrl?: boolean;
}

const INVISIBLE_CHARS_RE = /[\u200B-\u200D\u2060\uFEFF]/g;

export function cleanRouteSegment(seg: string): string {
  let decoded = seg || '';
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // keep raw segment
  }
  return decoded.replace(INVISIBLE_CHARS_RE, '').toLowerCase().trim();
}

const STATIC_ASSET_EXT_RE = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|cjs|map|json|xml|txt|php|woff2?|ttf|eot|otf|mp3|wav|ogg|mp4|webm|pdf|zip|webmanifest)$/i;

export function isStaticAssetPath(pathname: string): boolean {
  const clean = (pathname || '/').split('?')[0];
  if (clean.startsWith('/assets/')) return true;
  if (clean.startsWith('/.well-known/')) return true;
  const lastSeg = clean.split('/').filter(Boolean).pop() || '';
  return STATIC_ASSET_EXT_RE.test(lastSeg);
}

export interface RouteResolvers {
  findToolBySlug: (slug: string) => { slug: string } | undefined;
  hasCategory: (catId: string) => boolean;
}

export function resolveAppRoute(
  rawPathname: string,
  rawSearch: string,
  rawHash: string,
  resolvers: RouteResolvers
): RouteMatch {
  const pathname = cleanRouteSegment(rawPathname).replace(/\/+$/, '');

  // 1. Path-based routing
  if (pathname && pathname !== '' && pathname !== '/') {
    const parts = pathname.split('/').filter(Boolean).map(cleanRouteSegment);
    const first = parts[0] || '';

    // Extra trailing segments after known routes -> 404 unless /category/:id or /tool/:slug
    if (first === 'category') {
      if (parts.length === 2 && parts[1] && resolvers.hasCategory(parts[1])) {
        return { view: 'category', param: parts[1], cleanPath: `/category/${parts[1]}`, is404: false };
      }
      return { view: '404', param: parts.join('/'), cleanPath: pathname, is404: true };
    }

    if (first === 'tool') {
      if (parts.length === 2 && parts[1]) {
        const matchedTool = resolvers.findToolBySlug(parts[1]);
        if (matchedTool) {
          return { view: 'tool', param: matchedTool.slug, cleanPath: `/${matchedTool.slug}`, is404: false };
        }
      }
      return { view: '404', param: parts.join('/'), cleanPath: pathname, is404: true };
    }

    if (parts.length === 1 && STATIC_VIEW_ALIASES[first]) {
      const effective = STATIC_VIEW_ALIASES[first];
      const canonical = canonicalStaticPath(effective);
      return {
        view: effective,
        param: undefined,
        cleanPath: canonical,
        is404: false,
        shouldReplaceUrl: first === 'portfolio',
      };
    }

    if (parts.length === 1) {
      const directTool = resolvers.findToolBySlug(first);
      if (directTool) {
        return { view: 'tool', param: directTool.slug, cleanPath: `/${directTool.slug}`, is404: false };
      }
      if (resolvers.hasCategory(first)) {
        return { view: 'category', param: first, cleanPath: `/category/${first}`, is404: false };
      }
    }

    return { view: '404', param: parts.join('/'), cleanPath: pathname, is404: true };
  }

  // 2. Query Params Fallback (?tool=..., ?category=..., ?view=...)
  if (rawSearch) {
    const sp = new URLSearchParams(rawSearch.startsWith('?') ? rawSearch : `?${rawSearch}`);
    const qTool = sp.get('tool');
    const qCat = sp.get('category');
    const qView = sp.get('view');

    if (qTool) {
      const matched = resolvers.findToolBySlug(cleanRouteSegment(qTool));
      if (matched) {
        return { view: 'tool', param: matched.slug, cleanPath: `/${matched.slug}`, is404: false, shouldReplaceUrl: true };
      }
      return { view: '404', param: qTool, cleanPath: `/${cleanRouteSegment(qTool)}`, is404: true };
    }
    if (qCat) {
      const c = cleanRouteSegment(qCat);
      if (resolvers.hasCategory(c)) {
        return { view: 'category', param: c, cleanPath: `/category/${c}`, is404: false, shouldReplaceUrl: true };
      }
      return { view: '404', param: c, cleanPath: `/category/${c}`, is404: true };
    }
    if (qView) {
      const v = STATIC_VIEW_ALIASES[cleanRouteSegment(qView)];
      if (v) {
        const canonical = canonicalStaticPath(v);
        return { view: v, param: undefined, cleanPath: canonical, is404: false, shouldReplaceUrl: true };
      }
      return { view: '404', param: qView, cleanPath: `/${cleanRouteSegment(qView)}`, is404: true };
    }
  }

  // 3. Legacy Hash Fallback Migration (#tool/pdf-to-jpg or #study-timetable-maker)
  const cleanHash = cleanRouteSegment((rawHash || '').replace(/^#\/?/, ''));
  if (cleanHash) {
    const parts = cleanHash.split('/').filter(Boolean);
    const firstHash = parts[0] || '';

    if (firstHash === 'tool' && parts[1]) {
      const matched = resolvers.findToolBySlug(parts[1]);
      if (matched) {
        return { view: 'tool', param: matched.slug, cleanPath: `/${matched.slug}`, is404: false, shouldReplaceUrl: true };
      }
    } else if (firstHash === 'category' && parts[1]) {
      if (resolvers.hasCategory(parts[1])) {
        return { view: 'category', param: parts[1], cleanPath: `/category/${parts[1]}`, is404: false, shouldReplaceUrl: true };
      }
    } else if (['about', 'services', 'tools-ecosystem', 'projects', 'progress', 'social', 'journey', 'contact', 'faq'].includes(firstHash)) {
      return { view: 'portfolio', param: undefined, cleanPath: '/sohit-aarya', is404: false, shouldReplaceUrl: true };
    } else if (STATIC_VIEW_ALIASES[firstHash]) {
      const effective = STATIC_VIEW_ALIASES[firstHash];
      const canonical = canonicalStaticPath(effective);
      return { view: effective, param: undefined, cleanPath: canonical, is404: false, shouldReplaceUrl: true };
    } else {
      const matched = resolvers.findToolBySlug(firstHash);
      if (matched) {
        return { view: 'tool', param: matched.slug, cleanPath: `/${matched.slug}`, is404: false, shouldReplaceUrl: true };
      }
      if (resolvers.hasCategory(firstHash)) {
        return { view: 'category', param: firstHash, cleanPath: `/category/${firstHash}`, is404: false, shouldReplaceUrl: true };
      }
    }
  }

  // Default Home Route
  return { view: 'tools', param: undefined, cleanPath: '/', is404: false };
}
