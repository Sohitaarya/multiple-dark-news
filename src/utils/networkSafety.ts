/**
 * Shared SSRF-safe URL and hostname validation helpers for server.ts and Cloudflare Worker.
 */

const PRIVATE_HOSTNAME_RE = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?|\[?fe80:.*\]?|\[?fc[0-9a-f]{2}:.*\]?|\[?fd[0-9a-f]{2}:.*\]?)$/i;

export function isPrivateOrInternalHost(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!clean) return true;
  if (PRIVATE_HOSTNAME_RE.test(clean)) return true;
  if (clean.endsWith('.local') || clean.endsWith('.internal') || clean.endsWith('.localhost')) return true;
  // Block single-label hosts without dots (e.g. metadata, redis, db)
  if (!clean.includes('.')) return true;
  // Block decimal / octal IP obfuscations like http://2130706433 or http://0177.0.0.1
  if (/^\d+$/.test(clean) || /^0x[0-9a-f]+$/i.test(clean)) return true;
  return false;
}

export function validatePublicHttpUrl(rawUrl: string): { valid: true; url: URL } | { valid: false; error: string } {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'URL is required.' };
  }
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: 'Invalid URL syntax.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http:// and https:// URLs are permitted.' };
  }
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'Embedded URL credentials are not permitted.' };
  }
  if (isPrivateOrInternalHost(parsed.hostname)) {
    return { valid: false, error: 'Private, loopback, or internal network addresses are blocked.' };
  }
  return { valid: true, url: parsed };
}

export function normalizePublicDomain(rawDomain: string): { valid: true; domain: string; rootDomain: string } | { valid: false; error: string } {
  const stripped = (rawDomain || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase()
    .replace(/\.$/, '');

  if (!stripped || isPrivateOrInternalHost(stripped) || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(stripped)) {
    return { valid: false, error: 'Enter a valid public domain name (e.g. multipledarknews.com).' };
  }

  const parts = stripped.split('.');
  const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : stripped;
  return { valid: true, domain: stripped, rootDomain };
}
