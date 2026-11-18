import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { ALL_TOOLS } from './src/data/toolsRegistry';
import { CATEGORIES } from './src/data/categories';
import { isStaticAssetPath, resolveAppRoute, RouteMatch } from './src/utils/routing';
import { normalizePublicDomain, validatePublicHttpUrl } from './src/utils/networkSafety';
import { injectRouteSeoIntoHtml, resolveRouteSeoMeta } from './src/utils/seoHtml';
import { resolveServerConfig } from './src/utils/serverConfig';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const { port, host } = resolveServerConfig();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy Gemini Server Client so missing GEMINI_API_KEY never blocks server startup
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: any): string {
  const msg = err?.message || String(err);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'Google Gemini API quota or rate limit reached. Please wait a few moments before trying again, or upgrade your API tier.';
  }
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Invalid Gemini API key. Please check your environment variables.';
  }
  return msg;
}

// 1. Image Generation & Editing API (gemini-nano-banana-2.1)
app.post('/api/gemini/image', async (req, res) => {
  try {
    const { prompt, inputImageBase64, inputImageMime = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const parts: any[] = [];

    // If an image is provided for editing
    if (inputImageBase64) {
      const cleanData = inputImageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: inputImageMime,
        },
      });
    }

    parts.push({ text: prompt });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize,
        },
        tools: [
          {
            googleSearch: {
              searchTypes: {
                webSearch: {},
                imageSearch: {},
              },
            },
          },
        ],
      },
    });

    let imageUrl = '';
    let explanation = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        explanation += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ success: false, error: 'Model did not return image data.', details: explanation });
    }

    res.json({ success: true, imageUrl, imageUri: imageUrl, text: explanation });
  } catch (err: any) {
    console.error('Error in /api/gemini/image:', err);
    res.status(500).json({ success: false, error: formatGeminiError(err) });
  }
});

// 2. Google Search Grounding API (gemini-3.8-flash with googleSearch)
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Search query is required.' });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri);

    res.json({
      success: true,
      text,
      sources: webSources,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/search:', err);
    res.status(500).json({ success: false, error: formatGeminiError(err) });
  }
});

// 3. Google Maps Grounding API (gemini-3.8-flash with googleMaps)
app.post('/api/gemini/maps', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required.' });

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (latitude !== undefined && longitude !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
        },
      };
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .map((c: any) => c.maps)
      .filter((m: any) => m && m.uri);

    res.json({
      success: true,
      text,
      places,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/maps:', err);
    res.status(500).json({ success: false, error: formatGeminiError(err) });
  }
});

// 4. Audio Transcription API (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) return res.status(400).json({ success: false, error: 'Audio data is required.' });

    const cleanData = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType,
            },
          },
          { text: 'Transcribe this audio file accurately word-for-word in its original language.' },
        ],
      },
    });

    res.json({ success: true, text: response.text || '', transcription: response.text || '' });
  } catch (err: any) {
    console.error('Error in /api/gemini/transcribe:', err);
    res.status(500).json({ success: false, error: formatGeminiError(err) });
  }
});

// 5. WebSocket Live Voice Conversation API (gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs) => {
  try {
    let session: any = null;

    try {
      const ai = getGeminiClient();
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the MultipleDarkNews Voice Assistant. Help users quickly with any tools, calculations, or questions.',
        },
        callbacks: {
          onmessage: (message: any) => {
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });
    } catch (connectErr: any) {
      console.error('Failed to connect to Gemini Live session:', connectErr);
      clientWs.send(JSON.stringify({ error: connectErr.message || 'Live session initialization failed' }));
    }

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err) {
        console.error('Error routing audio to Live session:', err);
      }
    });

    clientWs.on('close', () => {
      // Session cleanup handled automatically
    });
  } catch (err) {
    console.error('WebSocket live connection error:', err);
  }
});

const TOOL_SLUG_SET = new Set(ALL_TOOLS.map((t) => t.slug.toLowerCase()));
const CATEGORY_ID_SET = new Set(CATEGORIES.map((c) => c.id.toLowerCase()));

function isKnownAppRoute(reqUrl: string): { valid: boolean; view: string; match: RouteMatch } {
  const parsed = new URL(reqUrl || '/', 'http://localhost');
  const match = resolveAppRoute(parsed.pathname, parsed.search, '', {
    findToolBySlug: (slug) => (TOOL_SLUG_SET.has(slug.toLowerCase()) ? { slug } : undefined),
    hasCategory: (catId) => CATEGORY_ID_SET.has(catId.toLowerCase()),
  });
  return { valid: !match.is404, view: match.view, match };
}

// 6. Server-side SEO HTTP Header, Redirect & Latency Inspector (SSRF-guarded)
app.post('/api/seo/inspect', async (req, res) => {
  try {
    const { url: rawUrl } = req.body || {};
    const validated = validatePublicHttpUrl(rawUrl || '');
    if (!validated.valid) {
      return res.status(400).json({ success: false, error: validated.error });
    }

    let currentUrl = validated.url.toString();
    const hops: Array<{ url: string; status: number; location?: string }> = [];
    const started = Date.now();
    let finalRes: globalThis.Response | null = null;

    for (let i = 0; i < 6; i++) {
      const hopCheck = validatePublicHttpUrl(currentUrl);
      if (!hopCheck.valid) {
        return res.status(400).json({ success: false, error: `Redirect blocked: ${hopCheck.error}` });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const upstream = await fetch(hopCheck.url.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: { 'User-Agent': 'MultipleDarkNews-SEO-Inspector/1.0' },
        });
        const loc = upstream.headers.get('location') || undefined;
        hops.push({ url: hopCheck.url.toString(), status: upstream.status, location: loc });
        if (upstream.status >= 300 && upstream.status < 400 && loc) {
          currentUrl = new URL(loc, hopCheck.url.toString()).toString();
          continue;
        }
        finalRes = upstream;
        break;
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!finalRes) {
      return res.status(502).json({ success: false, error: 'Too many redirects (> 5).' });
    }

    const headers: Record<string, string> = {};
    finalRes.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    return res.json({
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
    return res.status(502).json({ success: false, error: err?.message || 'Upstream request failed' });
  }
});

// 7. Server-side RDAP / WHOIS Proxy (uses IANA bootstrap + authoritative TLD RDAP servers)
let cachedIanaDnsServices: Array<[string[], string[]]> | null = null;
let cachedIanaTimestamp = 0;

async function resolveAuthoritativeRdapUrls(domain: string): Promise<string[]> {
  const parts = domain.toLowerCase().split('.');
  const tld = parts[parts.length - 1] || '';
  const urls: string[] = [];

  if (tld === 'com') urls.push(`https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`);
  else if (tld === 'net') urls.push(`https://rdap.verisign.com/net/v1/domain/${encodeURIComponent(domain)}`);
  else if (tld === 'org') urls.push(`https://rdap.publicinterestregistry.org/rdap/domain/${encodeURIComponent(domain)}`);

  try {
    if (!cachedIanaDnsServices || Date.now() - cachedIanaTimestamp > 3600_000) {
      const ianaRes = await fetch('https://data.iana.org/rdap/dns.json', {
        headers: { 'User-Agent': 'MultipleDarkNews-RDAP/1.0' },
      });
      if (ianaRes.ok) {
        const ianaJson = (await ianaRes.json()) as { services?: Array<[string[], string[]]> };
        if (Array.isArray(ianaJson.services)) {
          cachedIanaDnsServices = ianaJson.services;
          cachedIanaTimestamp = Date.now();
        }
      }
    }
    if (cachedIanaDnsServices) {
      for (const [tlds, servers] of cachedIanaDnsServices) {
        if (tlds.includes(tld) && servers[0]) {
          const base = servers[0].replace(/\/+$/, '');
          const candidate = `${base}/domain/${encodeURIComponent(domain)}`;
          if (!urls.includes(candidate)) urls.push(candidate);
          break;
        }
      }
    }
  } catch {
    // Fallback below
  }

  urls.push(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  return urls;
}

app.get('/api/seo/rdap', async (req, res) => {
  const domainParam = String(req.query.domain || '');
  const parsed = normalizePublicDomain(domainParam);
  if (!parsed.valid) {
    return res.status(400).json({ success: false, error: parsed.error });
  }

  try {
    const queriedDomain = parsed.rootDomain || parsed.domain;
    const candidates = await resolveAuthoritativeRdapUrls(queriedDomain);
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
          return res.json({ success: true, domain: queriedDomain, registry: new URL(targetUrl).hostname, data });
        }
      } catch {
        // Try next candidate
      }
    }

    return res.status(lastStatus === 404 ? 404 : 502).json({
      success: false,
      status: lastStatus,
      domain: queriedDomain,
      error: `RDAP registry returned HTTP ${lastStatus} for ${queriedDomain}.`,
    });
  } catch (err: any) {
    return res.status(502).json({ success: false, error: err?.message || 'RDAP query failed' });
  }
});

// Search Engine Sitemap Ping Endpoint (Google & Bing Sitemaps API)
app.post('/api/sitemap/ping', async (req, res) => {
  try {
    const { domain = 'https://tools.multipledarknews.com', sitemapUrl: customSitemap } = req.body || {};
    const cleanDomain = String(domain).replace(/\/+$/, '');
    const candidateSitemap = customSitemap || `${cleanDomain}/sitemap.xml`;

    const validated = validatePublicHttpUrl(candidateSitemap);
    if (!validated.valid) {
      return res.status(400).json({ success: false, error: validated.error });
    }
    const sitemapUrl = validated.url.toString();

    const results: {
      google: { status: number; message: string; ok: boolean };
      bing: { status: number; message: string; ok: boolean };
      timestamp: string;
      sitemapUrl: string;
    } = {
      google: { status: 0, message: '', ok: false },
      bing: { status: 0, message: '', ok: false },
      timestamp: new Date().toISOString(),
      sitemapUrl,
    };

    // 1. Ping Google Sitemaps API
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const googleRes = await fetch(googlePingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MultipleDarkNewsSitemapPinger/1.0)' },
      });
      results.google = {
        status: googleRes.status,
        message: googleRes.ok
          ? 'Google notified of updated sitemap. Re-crawl queued.'
          : `Google ping returned HTTP ${googleRes.status}.`,
        ok: googleRes.ok,
      };
    } catch (gErr: any) {
      results.google = {
        status: 0,
        message: `Google ping failed: ${gErr?.message || 'Network error'}`,
        ok: false,
      };
    }

    // 2. Ping Bing Sitemaps API
    try {
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const bingRes = await fetch(bingPingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MultipleDarkNewsSitemapPinger/1.0)' },
      });
      results.bing = {
        status: bingRes.status,
        message: bingRes.ok
          ? 'Bing notified of updated sitemap. Indexation accelerated.'
          : `Bing ping returned HTTP ${bingRes.status}.`,
        ok: bingRes.ok,
      };
    } catch (bErr: any) {
      results.bing = {
        status: 0,
        message: `Bing ping failed: ${bErr?.message || 'Network error'}`,
        ok: false,
      };
    }

    const anyOk = results.google.ok || results.bing.ok;
    return res.status(anyOk ? 200 : 502).json({
      success: anyOk,
      ...results,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to ping search engines' });
  }
});

// Legacy URL 301 Redirect: /portfolio -> /sohit-aarya
app.get(['/portfolio', '/portfolio/'], (_req, res) => {
  res.redirect(301, '/sohit-aarya');
});

// Explicit SEO routes: sitemap.xml and robots.txt
app.get('/sitemap.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (_req, res) => {
  res.header('Content-Type', 'text/plain; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Upgrade HTTP requests to WebSocket on /live
server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || `localhost:${port}`;
    const { pathname } = new URL(request.url || '/', `http://${host}`);
    if (pathname === '/live' || pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch (err) {
    console.error('WebSocket upgrade error:', err);
  }
});

// Setup Vite Dev Middlewares in development or static in production
const isProduction = process.env.NODE_ENV === 'production';

async function start() {
  if (!isProduction) {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: disableHmr ? false : true,
        ws: disableHmr ? false : { server },
        watch: disableHmr ? null : {},
      },
      appType: 'custom',
    });

    // Reject missing static assets cleanly with 404 instead of falling back to HTML
    app.use((req, res, next) => {
      const pathname = (req.path || '/').split('?')[0];
      if (
        isStaticAssetPath(pathname) &&
        !pathname.startsWith('/src/') &&
        !pathname.startsWith('/@') &&
        !pathname.startsWith('/node_modules/')
      ) {
        const publicFile = path.join(__dirname, 'public', pathname.replace(/^\/+/, ''));
        if (!fs.existsSync(publicFile) || fs.statSync(publicFile).isDirectory()) {
          return res.status(404).type('text/plain').send('Asset Not Found');
        }
      }
      return next();
    });

    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, template);
        const routeCheck = isKnownAppRoute(req.originalUrl);
        const html = injectRouteSeoIntoHtml(transformed, resolveRouteSeoMeta(routeCheck.match));
        if (!routeCheck.valid || routeCheck.view === 'admin') {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        }
        return res.status(routeCheck.valid ? 200 : 404).set({ 'Content-Type': 'text/html; charset=UTF-8' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace?.(e);
        return next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) return next();
      if (isStaticAssetPath(req.path)) {
        return res.status(404).type('text/plain').send('Asset Not Found');
      }
      const routeCheck = isKnownAppRoute(req.originalUrl);
      if (!routeCheck.valid || routeCheck.view === 'admin') {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }
      const rawHtml = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8');
      const html = injectRouteSeoIntoHtml(rawHtml, resolveRouteSeoMeta(routeCheck.match));
      return res.status(routeCheck.valid ? 200 : 404).set({ 'Content-Type': 'text/html; charset=UTF-8' }).end(html);
    });
  }

  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error(`Failed to bind server on ${host}:${port}:`, err.message);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`MultipleDarkNews Full-Stack Server running on http://${host}:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
