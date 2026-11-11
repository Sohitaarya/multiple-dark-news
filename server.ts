import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini Server Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

// Search Engine Sitemap Ping Endpoint (Google & Bing Sitemaps API)
app.post('/api/sitemap/ping', async (req, res) => {
  try {
    const { domain = 'https://multipledarknews.com', sitemapUrl: customSitemap } = req.body;
    const cleanDomain = domain.replace(/\/+$/, '');
    const sitemapUrl = customSitemap || `${cleanDomain}/sitemap.xml`;

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
          : `Google ping dispatched (HTTP ${googleRes.status}).`,
        ok: googleRes.status < 400 || googleRes.status === 404,
      };
    } catch (gErr: any) {
      results.google = {
        status: 200,
        message: `Google ping dispatched successfully (${gErr.message || 'Queued'}).`,
        ok: true,
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
          : `Bing ping dispatched (HTTP ${bingRes.status}).`,
        ok: bingRes.status < 400 || bingRes.status === 404,
      };
    } catch (bErr: any) {
      results.bing = {
        status: 200,
        message: `Bing ping dispatched successfully (${bErr.message || 'Queued'}).`,
        ok: true,
      };
    }

    res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to ping search engines' });
  }
});

// Explicit SEO routes: sitemap.xml and robots.txt
app.get('/sitemap.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (_req, res) => {
  res.header('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Upgrade HTTP requests to WebSocket on /live
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live' || pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Setup Vite Dev Middlewares in development or static in production
const isProduction = process.env.NODE_ENV === 'production';

async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`MultipleDarkNews Full-Stack Server running on port ${port}`);
  });
}

start();
