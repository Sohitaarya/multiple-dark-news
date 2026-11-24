/**
 * Runtime-Agnostic Backend Handlers for Amazon Affiliate Extraction & Pinterest API v5 OAuth
 * Works identically in Node.js (server.ts) and Cloudflare Workers (src/worker.ts).
 */

import {
  AmazonMarketplace,
  isAllowedAmazonHost,
  isAllowedAmazonImageHost,
  parseAmazonProductHtml,
  parseAmazonUrl,
} from '../services/amazonPinterestEngine';
import { validatePublicHttpUrl } from './networkSafety';
import {
  decryptSessionPayload,
  encryptSessionPayload,
  generateRandomHex,
} from './oauthCrypto';

export interface PinterestRuntimeConfig {
  clientId?: string;
  clientSecret?: string;
  sessionSecret?: string;
  appUrl?: string;
}

interface SignedOAuthState {
  purpose: 'oauth-state';
  nonce: string;
  origin: string;
  redirectUri: string;
  exp: number;
}

export interface PinterestUserSummary {
  username: string;
  businessName?: string;
  profileImage?: string;
  accountType?: string;
}

interface SignedExchangePayload {
  purpose: 'exchange';
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: PinterestUserSummary;
  exp: number;
}

interface SignedSessionPayload {
  purpose: 'session';
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: PinterestUserSummary;
  exp: number;
}

// Per-isolate ephemeral secret if SESSION_SECRET / PINTEREST_CLIENT_SECRET are not set
let runtimeEphemeralSecret: string | null = null;

export function resolveSigningSecret(cfg: PinterestRuntimeConfig): string {
  const configured = (cfg.sessionSecret || cfg.clientSecret || '').trim();
  if (configured.length >= 16) return configured;
  if (!runtimeEphemeralSecret) {
    runtimeEphemeralSecret = generateRandomHex(32);
  }
  return runtimeEphemeralSecret;
}

export function resolvePinterestRedirectUri(cfg: PinterestRuntimeConfig, requestOrigin: string): string {
  const base = (cfg.appUrl || requestOrigin || 'https://tools.multipledarknews.com').trim().replace(/\/+$/, '');
  return `${base}/auth/pinterest/callback`;
}

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// 1. SSRF-Guarded Amazon Product Extractor
// ---------------------------------------------------------------------------

export async function extractAmazonProductServer(rawUrl: string, marketplaceHint: AmazonMarketplace = 'amazon.in') {
  const parsed = parseAmazonUrl(rawUrl, marketplaceHint);
  if (!parsed.valid) {
    return { status: 400, body: { success: false, error: parsed.error } };
  }

  let currentUrl = rawUrl.trim();
  if (/^[A-Z0-9]{10}$/i.test(currentUrl)) {
    currentUrl = parsed.normalizedUrl;
  } else if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = `https://${currentUrl}`;
  }

  let finalRes: Response | null = null;
  let finalUrl = currentUrl;

  for (let hop = 0; hop < 6; hop++) {
    const hopCheck = validatePublicHttpUrl(currentUrl);
    if (!hopCheck.valid || !isAllowedAmazonHost(hopCheck.url.hostname)) {
      return {
        status: 400,
        body: { success: false, error: 'Redirect or hostname is outside allowed Amazon marketplaces.' },
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const upstream = await fetch(hopCheck.url.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
        },
      });

      const loc = upstream.headers.get('location');
      if (upstream.status >= 300 && upstream.status < 400 && loc) {
        currentUrl = new URL(loc, hopCheck.url.toString()).toString();
        continue;
      }

      finalRes = upstream;
      finalUrl = hopCheck.url.toString();
      break;
    } catch (err: any) {
      return {
        status: 502,
        body: {
          success: false,
          asin: parsed.asin,
          marketplace: parsed.marketplace,
          canonicalUrl: parsed.normalizedUrl,
          botProtected: true,
          error: err?.name === 'AbortError' ? 'Amazon timed out. Use Manual Product Input below.' : 'Could not fetch Amazon page directly.',
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }

  if (!finalRes) {
    return {
      status: 502,
      body: { success: false, error: 'Too many redirects from Amazon link.' },
    };
  }

  // Cap HTML read at 1.5 MB
  const rawText = await finalRes.text();
  const cappedHtml = rawText.length > 1_500_000 ? rawText.slice(0, 1_500_000) : rawText;
  const extracted = parseAmazonProductHtml(cappedHtml, finalUrl, parsed.marketplace);

  return {
    status: 200,
    body: extracted,
  };
}

// ---------------------------------------------------------------------------
// 2. SSRF-Guarded Amazon CDN Image Fetcher (Prevents Canvas CORS Taint)
// ---------------------------------------------------------------------------

export async function proxyAmazonImageServer(rawImageUrl: string) {
  const validated = validatePublicHttpUrl(rawImageUrl || '');
  if (!validated.valid) {
    return { status: 400, body: { success: false, error: validated.error } };
  }
  if (!isAllowedAmazonImageHost(validated.url.hostname)) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Only official Amazon CDN image URLs (media-amazon.com, images-amazon.com) may be fetched through the image proxy.',
      },
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const imgRes = await fetch(validated.url.toString(), {
      method: 'GET',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        Accept: 'image/webp,image/png,image/jpeg,*/*;q=0.8',
        'User-Agent': 'MultipleDarkNews-PinStudio/1.0',
      },
    });
    if (!imgRes.ok) {
      return { status: 502, body: { success: false, error: `Image host returned HTTP ${imgRes.status}.` } };
    }
    const contentType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) {
      return { status: 400, body: { success: false, error: 'Target URL did not return an image MIME type.' } };
    }
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 10 * 1024 * 1024) {
      return { status: 400, body: { success: false, error: 'Image file size exceeds 10 MB limit.' } };
    }
    const dataUrl = `data:${contentType};base64,${arrayBufferToBase64(buf)}`;
    return {
      status: 200,
      body: { success: true, contentType, dataUrl },
    };
  } catch (err: any) {
    return { status: 502, body: { success: false, error: err?.message || 'Failed to fetch image.' } };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 3. Pinterest OAuth 2.0 Authorization & Token Exchange
// ---------------------------------------------------------------------------

export async function buildPinterestAuthUrlServer(
  cfg: PinterestRuntimeConfig,
  requestOrigin: string,
  callerOrigin?: string
) {
  const redirectUri = resolvePinterestRedirectUri(cfg, requestOrigin);
  const clientId = (cfg.clientId || '').trim();
  const clientSecret = (cfg.clientSecret || '').trim();

  if (!clientId || !clientSecret) {
    return {
      status: 200,
      body: {
        success: true,
        configured: false,
        redirectUri,
        directTokenSupported: true,
        message: 'Pinterest OAuth Client credentials are not configured on the server yet. Users can connect with a Pinterest Developer Access Token or add PINTEREST_CLIENT_ID & PINTEREST_CLIENT_SECRET.',
      },
    };
  }

  const secret = resolveSigningSecret(cfg);
  const safeCallerOrigin = isTrustedAppOrigin(callerOrigin) ? callerOrigin! : requestOrigin;
  const statePayload: SignedOAuthState = {
    purpose: 'oauth-state',
    nonce: generateRandomHex(16),
    origin: safeCallerOrigin,
    redirectUri,
    exp: Date.now() + 10 * 60 * 1000,
  };
  const state = await encryptSessionPayload(statePayload, secret);

  const oauthUrl = new URL('https://www.pinterest.com/oauth/');
  oauthUrl.searchParams.set('client_id', clientId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('response_type', 'code');
  oauthUrl.searchParams.set('scope', 'boards:read,boards:write,pins:read,pins:write,user_accounts:read');
  oauthUrl.searchParams.set('state', state);

  return {
    status: 200,
    body: {
      success: true,
      configured: true,
      authUrl: oauthUrl.toString(),
      redirectUri,
    },
  };
}

export function isTrustedAppOrigin(origin?: string): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (u.hostname === 'tools.multipledarknews.com') return u.protocol === 'https:';
    if (u.hostname.endsWith('.run.app')) return u.protocol === 'https:';
    if (u.hostname.endsWith('.workers.dev')) return u.protocol === 'https:';
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
}

function renderOAuthPopupHtml(messagePayload: Record<string, unknown>, targetOrigin: string, heading: string, detail: string): string {
  const safePayload = JSON.stringify(messagePayload).replace(/</g, '\\u003c');
  const safeOrigin = JSON.stringify(targetOrigin || '*').replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pinterest Authentication | MultipleDarkNews</title>
  <style>
    body { background:#09090b; color:#f8fafc; font-family:system-ui,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:24px; text-align:center; }
    .card { max-width:420px; background:#111116; border:1px solid #27272a; border-radius:20px; padding:28px; }
    h1 { font-size:18px; margin:0 0 8px; }
    p { font-size:13px; color:#a1a1aa; margin:0 0 18px; line-height:1.5; }
    button { background:#e11d48; color:#fff; border:none; border-radius:10px; padding:10px 18px; font-weight:700; cursor:pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(detail)}</p>
    <button type="button" onclick="window.close()">Close Window</button>
  </div>
  <script>
    (function () {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(${safePayload}, ${safeOrigin});
        }
      } catch (e) {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(${safePayload}, '*');
          }
        } catch (_err) {}
      }
      setTimeout(function () { window.close(); }, 600);
    })();
  </script>
</body>
</html>`;
}

export async function handlePinterestCallbackServer(
  cfg: PinterestRuntimeConfig,
  params: { code?: string; state?: string; error?: string; errorDescription?: string },
  requestOrigin: string
): Promise<{ status: number; html: string }> {
  if (params.error) {
    return {
      status: 200,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_ERROR', error: params.errorDescription || params.error },
        '*',
        'Pinterest Login Cancelled',
        params.errorDescription || 'Authorization was declined. You can close this popup and try again.'
      ),
    };
  }

  const clientId = (cfg.clientId || '').trim();
  const clientSecret = (cfg.clientSecret || '').trim();
  if (!clientId || !clientSecret) {
    return {
      status: 500,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_ERROR', error: 'Pinterest OAuth credentials are not configured on the server.' },
        '*',
        'OAuth Not Configured',
        'Server PINTEREST_CLIENT_ID / PINTEREST_CLIENT_SECRET environment variables are missing.'
      ),
    };
  }

  const secret = resolveSigningSecret(cfg);
  const stateData = await decryptSessionPayload<SignedOAuthState>(params.state || '', secret);
  if (!stateData || stateData.purpose !== 'oauth-state' || Date.now() > stateData.exp) {
    return {
      status: 400,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_ERROR', error: 'OAuth state validation failed or expired. Please retry login.' },
        '*',
        'Session Expired',
        'OAuth state could not be verified. Please return to the tool and click Login again.'
      ),
    };
  }

  if (!params.code) {
    return {
      status: 400,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_ERROR', error: 'Missing Pinterest authorization code.' },
        stateData.origin,
        'Missing Code',
        'Pinterest did not return an authorization code.'
      ),
    };
  }

  try {
    const basicCreds = btoa(`${clientId}:${clientSecret}`);
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: stateData.redirectUri || resolvePinterestRedirectUri(cfg, requestOrigin),
    });

    const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicCreds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const tokenJson = (await tokenRes.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      message?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenJson.access_token) {
      return {
        status: 400,
        html: renderOAuthPopupHtml(
          {
            type: 'PINTEREST_OAUTH_ERROR',
            error: tokenJson.error_description || tokenJson.message || `Pinterest token exchange failed (HTTP ${tokenRes.status}).`,
          },
          stateData.origin,
          'Pinterest Login Failed',
          tokenJson.error_description || tokenJson.message || 'Unable to exchange authorization code.'
        ),
      };
    }

    const meRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const meJson = (await meRes.json().catch(() => ({}))) as {
      username?: string;
      business_name?: string;
      profile_image?: string;
      account_type?: string;
    };

    const user: PinterestUserSummary = {
      username: meJson.username || 'pinterest_user',
      businessName: meJson.business_name,
      profileImage: meJson.profile_image,
      accountType: meJson.account_type,
    };

    const exchangePayload: SignedExchangePayload = {
      purpose: 'exchange',
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      expiresAt: Date.now() + (tokenJson.expires_in || 2592000) * 1000,
      user,
      exp: Date.now() + 2 * 60 * 1000,
    };

    const exchangeToken = await encryptSessionPayload(exchangePayload, secret);

    return {
      status: 200,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_SUCCESS', exchangeToken },
        stateData.origin,
        'Pinterest Connected!',
        `Connected @${user.username}. Returning to studio...`
      ),
    };
  } catch (err: any) {
    return {
      status: 500,
      html: renderOAuthPopupHtml(
        { type: 'PINTEREST_OAUTH_ERROR', error: err?.message || 'Unexpected OAuth error.' },
        stateData.origin,
        'Authentication Error',
        err?.message || 'Unexpected error while connecting Pinterest.'
      ),
    };
  }
}

export async function redeemPinterestExchangeTokenServer(cfg: PinterestRuntimeConfig, exchangeToken: string) {
  if (!exchangeToken) {
    return { status: 400, body: { success: false, error: 'Missing exchange token.' } };
  }
  const secret = resolveSigningSecret(cfg);
  const data = await decryptSessionPayload<SignedExchangePayload>(exchangeToken, secret);
  if (!data || data.purpose !== 'exchange' || Date.now() > data.exp) {
    return { status: 401, body: { success: false, error: 'OAuth exchange token invalid or expired. Please sign in again.' } };
  }

  const sessionPayload: SignedSessionPayload = {
    purpose: 'session',
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    user: data.user,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encrypted = await encryptSessionPayload(sessionPayload, secret);
  return {
    status: 200,
    body: {
      success: true,
      sessionToken: `sess_${encrypted}`,
      user: data.user,
      expiresAt: sessionPayload.exp,
    },
  };
}

// ---------------------------------------------------------------------------
// 4. Authenticated Pinterest API v5 Proxies (Me, Boards, Create Board, Create Pin)
// ---------------------------------------------------------------------------

async function resolvePinterestAccessToken(
  cfg: PinterestRuntimeConfig,
  authHeader: string
): Promise<{ ok: true; accessToken: string; user?: PinterestUserSummary } | { ok: false; status: number; error: string }> {
  const raw = (authHeader || '').trim();
  const match = /^Bearer\s+(.+)$/i.exec(raw);
  const token = match?.[1]?.trim() || '';
  if (!token) {
    return { ok: false, status: 401, error: 'Pinterest login required. Missing Authorization header.' };
  }

  if (token.startsWith('sess_')) {
    const secret = resolveSigningSecret(cfg);
    const session = await decryptSessionPayload<SignedSessionPayload>(token.slice(5), secret);
    if (!session || session.purpose !== 'session' || Date.now() > session.exp) {
      return { ok: false, status: 401, error: 'Pinterest session expired. Please reconnect your Pinterest account.' };
    }

    // Attempt refresh if Pinterest access token is near expiry & client credentials exist
    if (
      session.refreshToken &&
      session.expiresAt - Date.now() < 120_000 &&
      cfg.clientId &&
      cfg.clientSecret
    ) {
      try {
        const basicCreds = btoa(`${cfg.clientId}:${cfg.clientSecret}`);
        const refRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicCreds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: session.refreshToken,
          }).toString(),
        });
        const refJson = (await refRes.json().catch(() => ({}))) as { access_token?: string };
        if (refRes.ok && refJson.access_token) {
          return { ok: true, accessToken: refJson.access_token, user: session.user };
        }
      } catch {
        // Fall back to existing accessToken if refresh network fails
      }
    }

    return { ok: true, accessToken: session.accessToken, user: session.user };
  }

  // Direct user-supplied Pinterest API v5 token (e.g. pina_...)
  if (token.length < 20 || /\s/.test(token)) {
    return { ok: false, status: 401, error: 'Invalid Pinterest access token format.' };
  }
  return { ok: true, accessToken: token };
}

export async function handlePinterestMeServer(cfg: PinterestRuntimeConfig, authHeader: string) {
  const auth = await resolvePinterestAccessToken(cfg, authHeader);
  if (!auth.ok) return { status: auth.status, body: { success: false, error: auth.error } };

  try {
    const res = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, any>;
    if (!res.ok) {
      return {
        status: res.status === 401 ? 401 : 502,
        body: { success: false, error: data.message || `Pinterest API returned HTTP ${res.status}.` },
      };
    }
    return {
      status: 200,
      body: {
        success: true,
        user: {
          username: data.username || auth.user?.username || 'pinterest_user',
          businessName: data.business_name,
          profileImage: data.profile_image,
          accountType: data.account_type,
        },
      },
    };
  } catch (err: any) {
    return { status: 502, body: { success: false, error: err?.message || 'Pinterest API connection failed.' } };
  }
}

export async function handlePinterestBoardsListServer(cfg: PinterestRuntimeConfig, authHeader: string) {
  const auth = await resolvePinterestAccessToken(cfg, authHeader);
  if (!auth.ok) return { status: auth.status, body: { success: false, error: auth.error } };

  try {
    const res = await fetch('https://api.pinterest.com/v5/boards?page_size=100', {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const data = (await res.json().catch(() => ({}))) as { items?: any[]; message?: string };
    if (!res.ok) {
      return {
        status: res.status === 401 ? 401 : 502,
        body: { success: false, error: data.message || `Could not fetch boards (HTTP ${res.status}).` },
      };
    }
    const boards = (data.items || []).map((b) => ({
      id: String(b.id),
      name: String(b.name || 'Untitled Board'),
      privacy: String(b.privacy || 'PUBLIC'),
      pinCount: Number(b.pin_count || 0),
    }));
    return { status: 200, body: { success: true, boards } };
  } catch (err: any) {
    return { status: 502, body: { success: false, error: err?.message || 'Failed to load Pinterest boards.' } };
  }
}

export async function handlePinterestCreateBoardServer(
  cfg: PinterestRuntimeConfig,
  authHeader: string,
  input: { name?: string; description?: string; privacy?: string }
) {
  const auth = await resolvePinterestAccessToken(cfg, authHeader);
  if (!auth.ok) return { status: auth.status, body: { success: false, error: auth.error } };

  const name = (input.name || '').trim();
  if (!name || name.length > 50) {
    return { status: 400, body: { success: false, error: 'Board name is required (max 50 characters).' } };
  }

  const privacy = input.privacy === 'SECRET' ? 'SECRET' : 'PUBLIC';
  try {
    const res = await fetch('https://api.pinterest.com/v5/boards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: (input.description || 'Curated Amazon finds & deals').slice(0, 500),
        privacy,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || !data.id) {
      return {
        status: res.status === 401 ? 401 : 400,
        body: { success: false, error: data.message || `Could not create board (HTTP ${res.status}).` },
      };
    }
    return {
      status: 200,
      body: {
        success: true,
        board: {
          id: String(data.id),
          name: String(data.name || name),
          privacy: String(data.privacy || privacy),
          pinCount: 0,
        },
      },
    };
  } catch (err: any) {
    return { status: 502, body: { success: false, error: err?.message || 'Failed to create Pinterest board.' } };
  }
}

export async function handlePinterestCreatePinServer(
  cfg: PinterestRuntimeConfig,
  authHeader: string,
  input: {
    boardId?: string;
    title?: string;
    description?: string;
    altText?: string;
    link?: string;
    imageBase64?: string;
    imageUrl?: string;
    contentType?: string;
  }
) {
  const auth = await resolvePinterestAccessToken(cfg, authHeader);
  if (!auth.ok) return { status: auth.status, body: { success: false, error: auth.error } };

  const boardId = (input.boardId || '').trim();
  if (!boardId) {
    return { status: 400, body: { success: false, error: 'Select or create a Pinterest board first.' } };
  }

  const linkCheck = validatePublicHttpUrl(input.link || '');
  if (!linkCheck.valid) {
    return { status: 400, body: { success: false, error: `Invalid destination link: ${linkCheck.error}` } };
  }

  let mediaSource: Record<string, string>;
  if (input.imageBase64) {
    const cleanBase64 = input.imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
    if (cleanBase64.length > 11_000_000) {
      return { status: 400, body: { success: false, error: 'Pin image payload too large (max ~8 MB).' } };
    }
    mediaSource = {
      source_type: 'image_base64',
      content_type: input.contentType === 'image/png' ? 'image/png' : 'image/jpeg',
      data: cleanBase64,
    };
  } else if (input.imageUrl) {
    const imgUrlCheck = validatePublicHttpUrl(input.imageUrl);
    if (!imgUrlCheck.valid) {
      return { status: 400, body: { success: false, error: `Invalid image URL: ${imgUrlCheck.error}` } };
    }
    mediaSource = {
      source_type: 'image_url',
      url: imgUrlCheck.url.toString(),
    };
  } else {
    return { status: 400, body: { success: false, error: 'Provide a Pin poster image before publishing.' } };
  }

  const payload = {
    board_id: boardId,
    title: (input.title || 'Trending Amazon Find').trim().slice(0, 100),
    description: (input.description || '').trim().slice(0, 800),
    alt_text: (input.altText || input.title || 'Amazon product preview').trim().slice(0, 500),
    link: linkCheck.url.toString(),
    media_source: mediaSource,
  };

  try {
    const res = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || !data.id) {
      return {
        status: res.status === 401 ? 401 : 400,
        body: {
          success: false,
          error: data.message || `Pinterest API rejected Pin publish (HTTP ${res.status}).`,
        },
      };
    }
    return {
      status: 200,
      body: {
        success: true,
        pin: {
          id: String(data.id),
          url: `https://www.pinterest.com/pin/${data.id}/`,
          boardId: String(data.board_id || boardId),
          link: String(data.link || payload.link),
          title: String(data.title || payload.title),
        },
      },
    };
  } catch (err: any) {
    return { status: 502, body: { success: false, error: err?.message || 'Failed to publish Pin to Pinterest.' } };
  }
}
