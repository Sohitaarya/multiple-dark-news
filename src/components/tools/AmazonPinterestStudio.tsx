import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FolderPlus,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Loader2,
  LogIn,
  LogOut,
  Palette,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  UserCheck,
} from 'lucide-react';
import {
  AmazonMarketplace,
  buildAmazonAffiliateLink,
  CURATED_AMAZON_DEALS,
  CuratedAmazonDeal,
  generatePinterestPinCopy,
  PinCopyLanguage,
  PinPosterTemplate,
  renderPinPosterCanvas,
  validateAssociateTag,
} from '../../services/amazonPinterestEngine';
import { copyTextSafe } from '../../utils/clipboard';

interface PinterestBoard {
  id: string;
  name: string;
  privacy: string;
  pinCount: number;
}

interface PinterestUser {
  username: string;
  businessName?: string;
  profileImage?: string;
  accountType?: string;
}

interface PublishedPinEntry {
  id: string;
  url: string;
  title: string;
  boardName: string;
  affiliateUrl: string;
  createdAt: string;
}

const MARKETPLACE_OPTIONS: Array<{ value: AmazonMarketplace; label: string; currency: string }> = [
  { value: 'amazon.in', label: 'Amazon India (amazon.in)', currency: '₹' },
  { value: 'amazon.com', label: 'Amazon US (amazon.com)', currency: '$' },
  { value: 'amazon.co.uk', label: 'Amazon UK (amazon.co.uk)', currency: '£' },
  { value: 'amazon.ae', label: 'Amazon UAE (amazon.ae)', currency: 'AED ' },
  { value: 'amazon.ca', label: 'Amazon Canada (amazon.ca)', currency: 'CA$' },
  { value: 'amazon.de', label: 'Amazon Germany (amazon.de)', currency: '€' },
  { value: 'amazon.com.au', label: 'Amazon Australia (amazon.com.au)', currency: 'A$' },
];

const TEMPLATE_OPTIONS: Array<{ id: PinPosterTemplate; label: string; desc: string }> = [
  { id: 'dark-luxury', label: 'Dark Deal Card', desc: 'High-contrast luxury look' },
  { id: 'deal-spotlight', label: 'Spotlight Offer', desc: 'Bold promo gradient' },
  { id: 'editorial-light', label: 'Minimal Light', desc: 'Clean editorial cream' },
  { id: 'original', label: 'Original Photo', desc: 'Clean photo only' },
];

const ACCENT_PRESETS = [
  { name: 'Crimson', hex: '#e11d48', bgClass: 'bg-rose-600' },
  { name: 'Amber', hex: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Emerald', hex: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Indigo', hex: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Rose', hex: '#db2777', bgClass: 'bg-pink-600' },
];

function isTrustedMessageOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.origin === window.location.origin) return true;
    if (u.hostname === 'tools.multipledarknews.com') return true;
    if (u.hostname.endsWith('.run.app') || u.hostname.endsWith('.workers.dev')) return true;
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
}

function apiEndpoint(path: string): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'tools.multipledarknews.com') {
    return `https://multiple-dark-news.sohitprakash970.workers.dev${path}`;
  }
  return path;
}

function createSampleProductDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="band" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#g1)"/>
    <circle cx="400" cy="400" r="245" fill="#ffffff" stroke="#cbd5e1" stroke-width="6"/>
    <rect x="330" y="105" width="140" height="125" rx="22" fill="url(#band)"/>
    <rect x="330" y="570" width="140" height="125" rx="22" fill="url(#band)"/>
    <circle cx="400" cy="400" r="185" fill="#09090d" stroke="#475569" stroke-width="14"/>
    <circle cx="400" cy="400" r="150" fill="#111827"/>
    <text x="400" y="375" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="68" font-weight="900">10:09</text>
    <text x="400" y="435" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="26" font-weight="700">AMOLED PRO • ANC</text>
    <text x="400" y="485" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="22" font-weight="600">78% BATTERY • 94 BPM</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const AmazonPinterestStudio: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. Multi-User Pinterest Auth State (Strictly in React Memory — NEVER localStorage)
  // ---------------------------------------------------------------------------
  const [bearerToken, setBearerToken] = useState<string>('');
  const [authMode, setAuthMode] = useState<'oauth' | 'token'>('token');
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [expectedRedirectUri, setExpectedRedirectUri] = useState<string>('');
  const [user, setUser] = useState<PinterestUser | null>(null);
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isAuthBusy, setIsAuthBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState<boolean>(false);
  const [newBoardName, setNewBoardName] = useState<string>('Amazon Top Finds');
  const [newBoardPrivacy, setNewBoardPrivacy] = useState<'PUBLIC' | 'SECRET'>('PUBLIC');

  // ---------------------------------------------------------------------------
  // 2. Amazon Product & Affiliate Tag State
  // ---------------------------------------------------------------------------
  const [amazonInput, setAmazonInput] = useState<string>('');
  const [marketplace, setMarketplace] = useState<AmazonMarketplace>('amazon.in');
  const [associateTag, setAssociateTag] = useState<string>('');
  const [subTag, setSubTag] = useState<string>('pinterest');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  const [productTitle, setProductTitle] = useState<string>('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [productMrp, setProductMrp] = useState<string>('');
  const [discountBadge, setDiscountBadge] = useState<string>('');
  const [productRating, setProductRating] = useState<string>('');
  const [productImageDataUrl, setProductImageDataUrl] = useState<string>('');
  const [remoteImageUrlInput, setRemoteImageUrlInput] = useState<string>('');

  // ---------------------------------------------------------------------------
  // 3. Pin Poster Designer & Copy State
  // ---------------------------------------------------------------------------
  const [template, setTemplate] = useState<PinPosterTemplate>('dark-luxury');
  const [accentColor, setAccentColor] = useState<string>('#e11d48');
  const [ctaLabel, setCtaLabel] = useState<string>('Check Price on Amazon →');
  const [showDisclosure, setShowDisclosure] = useState<boolean>(true);
  const [renderedPosterUrl, setRenderedPosterUrl] = useState<string>('');
  const [renderedPosterBase64, setRenderedPosterBase64] = useState<string>('');

  const [copyLang, setCopyLang] = useState<PinCopyLanguage>('hinglish');
  const [pinTitle, setPinTitle] = useState<string>('');
  const [pinDescription, setPinDescription] = useState<string>('');
  const [pinAltText, setPinAltText] = useState<string>('');

  // ---------------------------------------------------------------------------
  // 4. Publish & Session Log State
  // ---------------------------------------------------------------------------
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedPins, setPublishedPins] = useState<PublishedPinEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const localPhotoRef = useRef<HTMLInputElement>(null);

  // Derived Affiliate URL + Validations
  const tagValidation = useMemo(() => validateAssociateTag(associateTag), [associateTag]);

  const affiliateLinkResult = useMemo(() => {
    if (!amazonInput.trim()) {
      return { valid: false, affiliateUrl: '', asin: null, error: 'Paste an Amazon product URL or ASIN first.' };
    }
    return buildAmazonAffiliateLink({
      urlOrAsin: amazonInput,
      associateTag,
      marketplace,
      subTag,
    });
  }, [amazonInput, associateTag, marketplace, subTag]);

  // Check if server OAuth app credentials are configured on mount
  useEffect(() => {
    fetch(apiEndpoint(`/api/pinterest/auth-url?origin=${encodeURIComponent(window.location.origin)}`))
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.configured === 'boolean') setOauthConfigured(data.configured);
        if (data.redirectUri) setExpectedRedirectUri(data.redirectUri);
      })
      .catch(() => {
        setOauthConfigured(false);
      });
  }, []);

  // Listen for OAuth popup completion via secure postMessage -> redeem session token
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (!isTrustedMessageOrigin(event.origin)) return;
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'PINTEREST_OAUTH_ERROR') {
        setIsAuthBusy(false);
        setAuthError(String(msg.error || 'Pinterest login cancelled or failed.'));
        return;
      }

      if (msg.type === 'PINTEREST_OAUTH_SUCCESS' && typeof msg.exchangeToken === 'string') {
        try {
          setIsAuthBusy(true);
          setAuthError(null);
          const sessionRes = await fetch(apiEndpoint('/api/pinterest/session'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'MDN-Tools',
            },
            body: JSON.stringify({ exchangeToken: msg.exchangeToken }),
          });
          const sessionData = await sessionRes.json();
          if (!sessionRes.ok || !sessionData.sessionToken) {
            throw new Error(sessionData.error || 'Failed to verify Pinterest OAuth session.');
          }
          setBearerToken(sessionData.sessionToken);
          setUser(sessionData.user);
          await loadBoardsForToken(sessionData.sessionToken);
        } catch (err: any) {
          setAuthError(err?.message || 'Failed to finish Pinterest sign-in.');
        } finally {
          setIsAuthBusy(false);
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const loadBoardsForToken = async (token: string) => {
    const bRes = await fetch(apiEndpoint('/api/pinterest/boards'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bData = await bRes.json();
    if (!bRes.ok || !bData.success) {
      throw new Error(bData.error || 'Could not load Pinterest boards.');
    }
    const items: PinterestBoard[] = bData.boards || [];
    setBoards(items);
    if (items.length > 0) {
      setSelectedBoardId((prev) => (items.some((b) => b.id === prev) ? prev : items[0].id));
    }
  };

  // Start Pinterest OAuth Popup
  const handleOAuthPopupLogin = async () => {
    setAuthError(null);
    setIsAuthBusy(true);
    try {
      const res = await fetch(apiEndpoint(`/api/pinterest/auth-url?origin=${encodeURIComponent(window.location.origin)}`));
      const data = await res.json();
      setOauthConfigured(Boolean(data.configured));
      if (data.redirectUri) setExpectedRedirectUri(data.redirectUri);

      if (!data.configured || !data.authUrl) {
        setIsAuthBusy(false);
        setAuthMode('token');
        setAuthError(
          'Site-wide Pinterest OAuth Client ID/Secret is not configured yet. Connect immediately with your own Pinterest Developer Token below, or add OAuth keys to your server environment.'
        );
        return;
      }

      const w = 540;
      const h = 680;
      const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);
      const popup = window.open(
        data.authUrl,
        'pinterest_oauth_login',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      if (!popup) {
        setIsAuthBusy(false);
        setAuthError('Popup was blocked by your browser. Allow popups for this site and retry.');
      }
    } catch (err: any) {
      setIsAuthBusy(false);
      setAuthError(err?.message || 'Could not initiate Pinterest OAuth.');
    }
  };

  // Connect using Direct Pinterest Developer / Business Token (per-user, React memory only)
  const handleConnectManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualTokenInput.trim();
    if (cleaned.length < 20) {
      setAuthError('Enter a valid Pinterest API v5 Access Token (starts with pina_...).');
      return;
    }
    setAuthError(null);
    setIsAuthBusy(true);
    try {
      const meRes = await fetch(apiEndpoint('/api/pinterest/me'), {
        headers: { Authorization: `Bearer ${cleaned}` },
      });
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        throw new Error(meData.error || 'Token verification failed on Pinterest API v5.');
      }
      setBearerToken(cleaned);
      setUser(meData.user);
      setManualTokenInput('');
      await loadBoardsForToken(cleaned);
    } catch (err: any) {
      setAuthError(err?.message || 'Unable to verify token.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleLogoutPinterest = () => {
    setBearerToken('');
    setUser(null);
    setBoards([]);
    setSelectedBoardId('');
    setAuthError(null);
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bearerToken || !newBoardName.trim()) return;
    setIsAuthBusy(true);
    setAuthError(null);
    try {
      const res = await fetch(apiEndpoint('/api/pinterest/boards'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
          'X-Requested-With': 'MDN-Tools',
        },
        body: JSON.stringify({
          name: newBoardName.trim(),
          privacy: newBoardPrivacy,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.board) {
        throw new Error(data.error || 'Could not create board.');
      }
      const created: PinterestBoard = data.board;
      setBoards((prev) => [created, ...prev]);
      setSelectedBoardId(created.id);
      setShowCreateBoard(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Board creation failed.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  // Fetch & proxy an Amazon CDN image cleanly into un-tainted Canvas dataURL
  const proxyFetchAmazonImage = async (imgUrl: string) => {
    if (!imgUrl) return;
    try {
      const res = await fetch(apiEndpoint('/api/image/proxy-fetch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imgUrl }),
      });
      const data = await res.json();
      if (res.ok && data.dataUrl) {
        setProductImageDataUrl(data.dataUrl);
      } else {
        setExtractNotice(data.error || 'Image host blocked proxy. Upload a product photo manually.');
      }
    } catch {
      setExtractNotice('Could not load remote Amazon image. You can upload a product photo directly below.');
    }
  };

  // Extract Amazon Product Metadata
  const handleExtractAmazon = async () => {
    if (!amazonInput.trim()) {
      setExtractNotice('Paste an Amazon product URL (e.g. https://www.amazon.in/dp/...) or 10-character ASIN.');
      return;
    }
    setIsExtracting(true);
    setExtractNotice(null);
    try {
      const res = await fetch(apiEndpoint('/api/amazon/extract'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: amazonInput, marketplace }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractNotice(data.error || 'Unable to parse Amazon link.');
        return;
      }

      if (data.marketplace) setMarketplace(data.marketplace);
      if (data.title) setProductTitle(data.title);
      if (data.price) setProductPrice(data.price);
      if (data.mrp) setProductMrp(data.mrp);
      if (data.discountPercent) setDiscountBadge(`${data.discountPercent} OFF`);
      if (data.rating) setProductRating(data.rating);

      if (data.imageUrl) {
        setRemoteImageUrlInput(data.imageUrl);
        await proxyFetchAmazonImage(data.imageUrl);
      }

      if (data.botProtected) {
        setExtractNotice(
          'Amazon served a CAPTCHA check on automated scraping — your canonical ASIN & affiliate link is ready, please enter/adjust title, price & upload the product photo below.'
        );
      }
    } catch (err: any) {
      setExtractNotice(err?.message || 'Network error while reading Amazon page. Fill details manually below.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Load Instant Demo Product so users can try Pin design & Affiliate link immediately
  const handleLoadDemoProduct = () => {
    setMarketplace('amazon.in');
    setAmazonInput('https://www.amazon.in/dp/B0CX23V2ZK');
    if (!associateTag.trim()) setAssociateTag('yourtag-21');
    setProductTitle('AMOLED Smart Calling Watch Pro with 14-Day Battery & Health Tracking');
    setProductPrice('₹2,499');
    setProductMrp('₹6,999');
    setDiscountBadge('64% OFF DEAL');
    setProductRating('4.5★');
    setProductImageDataUrl(createSampleProductDataUrl());
    setExtractNotice(null);
  };

  const handleSelectCuratedDeal = (deal: CuratedAmazonDeal) => {
    setMarketplace('amazon.in');
    setAmazonInput(deal.defaultUrl);
    if (!associateTag.trim()) setAssociateTag('yourtag-21');
    setProductTitle(deal.title);
    setProductPrice(deal.price);
    setProductMrp(deal.mrp);
    setDiscountBadge(deal.discountBadge);
    setProductRating(deal.rating);
    setRemoteImageUrlInput(deal.imageUrl);
    void proxyFetchAmazonImage(deal.imageUrl);
    setExtractNotice(`Loaded curated deal: ${deal.title}`);
  };

  const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-generate SEO copy whenever product fields or language change
  useEffect(() => {
    if (!productTitle.trim()) return;
    const copy = generatePinterestPinCopy({
      title: productTitle,
      price: productPrice,
      mrp: productMrp,
      discountBadge,
      language: copyLang,
      includeDisclosure: showDisclosure,
    });
    setPinTitle(copy.title);
    setPinDescription(copy.description);
    setPinAltText(copy.altText);
  }, [productTitle, productPrice, productMrp, discountBadge, copyLang, showDisclosure]);

  // Render 1000x1500 Pin Poster in real time whenever image or design options change
  useEffect(() => {
    if (!productImageDataUrl) {
      setRenderedPosterUrl('');
      setRenderedPosterBase64('');
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = async () => {
      try {
        const result = await renderPinPosterCanvas(img, {
          template,
          title: productTitle || 'Featured Amazon Product',
          price: productPrice,
          mrp: productMrp,
          discountBadge,
          ctaLabel,
          accentColor,
          showAffiliateDisclosure: showDisclosure,
          rating: productRating,
        });
        if (!cancelled) {
          setRenderedPosterUrl(result.dataUrl);
          setRenderedPosterBase64(result.base64);
        }
      } catch {
        // Ignore transient canvas abort errors
      }
    };
    img.src = productImageDataUrl;
    return () => {
      cancelled = true;
    };
  }, [
    productImageDataUrl,
    template,
    productTitle,
    productPrice,
    productMrp,
    discountBadge,
    ctaLabel,
    accentColor,
    showDisclosure,
    productRating,
  ]);

  // Publish Pin directly to logged-in user's Pinterest Board
  const handlePublishToPinterest = async () => {
    setPublishError(null);
    if (!bearerToken || !user) {
      setPublishError('Please log into your Pinterest account in Step 1 before publishing.');
      return;
    }
    if (!selectedBoardId) {
      setPublishError('Please select or create a Pinterest board first.');
      return;
    }
    if (!affiliateLinkResult.valid) {
      setPublishError(affiliateLinkResult.error || 'Enter a valid Amazon product link and Associate Tag.');
      return;
    }
    if (!renderedPosterBase64) {
      setPublishError('Load or upload a product photo to generate your Pin poster first.');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch(apiEndpoint('/api/pinterest/pins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
          'X-Requested-With': 'MDN-Tools',
        },
        body: JSON.stringify({
          boardId: selectedBoardId,
          title: pinTitle || productTitle || 'Amazon Trending Pick',
          description: pinDescription,
          altText: pinAltText,
          link: affiliateLinkResult.affiliateUrl,
          imageBase64: renderedPosterBase64,
          contentType: 'image/jpeg',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.pin) {
        throw new Error(data.error || 'Pinterest declined the Pin publish request.');
      }
      const boardName = boards.find((b) => b.id === selectedBoardId)?.name || 'Selected Board';
      setPublishedPins((prev) => [
        {
          id: data.pin.id,
          url: data.pin.url,
          title: data.pin.title,
          boardName,
          affiliateUrl: data.pin.link,
          createdAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      setPublishError(err?.message || 'Failed to publish Pin.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    void copyTextSafe(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadPoster = () => {
    if (!renderedPosterUrl) return;
    const link = document.createElement('a');
    link.href = renderedPosterUrl;
    link.download = `pinterest-amazon-pin-${affiliateLinkResult.asin || 'poster'}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* STEP 1: Multi-User Pinterest Account Login */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Step 1 • Multi-User Account Connection
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              Connect Your Own Pinterest Account
            </h2>
            <p className="text-xs text-slate-400">
              Every user logs into their own Pinterest profile and publishes directly to their own boards with Amazon affiliate tracking links.
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/60">
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">@{user.username}</div>
                <div className="text-emerald-300 text-[11px]">Connected ({boards.length} boards)</div>
              </div>
              <button
                type="button"
                onClick={handleLogoutPinterest}
                className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
              <button
                type="button"
                onClick={() => setAuthMode('oauth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  authMode === 'oauth' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pinterest Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('token')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  authMode === 'token' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Developer Token
              </button>
            </div>
          )}
        </div>

        {!user && authMode === 'oauth' && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-rose-400" />
                <span>Sign in safely with official Pinterest OAuth 2.0</span>
              </div>
              <p className="text-slate-400">
                Tokens stay strictly in your browser memory for this session and are never saved in database or localStorage.
              </p>
              {oauthConfigured === false && expectedRedirectUri && (
                <p className="text-[11px] text-amber-300 font-mono break-all">
                  Note: Server OAuth keys not set yet. Switch to &ldquo;Developer Token&rdquo; to post now, or set PINTEREST_CLIENT_ID &amp; SECRET (Callback: {expectedRedirectUri}).
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={isAuthBusy}
              onClick={handleOAuthPopupLogin}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isAuthBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Login with Pinterest</span>
            </button>
          </div>
        )}

        {!user && authMode === 'token' && (
          <form onSubmit={handleConnectManualToken} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs text-slate-300 flex items-center gap-2 font-bold">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Instant Connect (No SESSION_SECRET Required) — Paste Pinterest v5 Token</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                aria-label="Pinterest API v5 Access Token"
                placeholder="Paste your Pinterest v5 Access Token (pina_...) — never stored on disk"
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isAuthBusy}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Verify &amp; Connect</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Need a free token? Generate one in your Pinterest Developer App (scopes: <code className="text-slate-300">boards:read, boards:write, pins:read, pins:write, user_accounts:read</code>).
            </p>
          </form>
        )}

        {/* Board Selector & Create Board when Connected */}
        {user && (
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label htmlFor="pinterest-board-select" className="block text-xs font-bold text-slate-300 mb-1">
                  Target Pinterest Board
                </label>
                <select
                  id="pinterest-board-select"
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {boards.length === 0 ? (
                    <option value="">No boards found — create one on the right</option>
                  ) : (
                    boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.privacy} • {b.pinCount} pins)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={() => bearerToken && loadBoardsForToken(bearerToken)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Boards</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateBoard((s) => !s)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-rose-400" />
                <span>New Board</span>
              </button>
            </div>

            {showCreateBoard && (
              <form onSubmit={handleCreateBoard} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="New board name..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
                <select
                  aria-label="Board Privacy"
                  value={newBoardPrivacy}
                  onChange={(e) => setNewBoardPrivacy(e.target.value === 'SECRET' ? 'SECRET' : 'PUBLIC')}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="PUBLIC">Public Board</option>
                  <option value="SECRET">Secret Board</option>
                </select>
                <button
                  type="submit"
                  disabled={isAuthBusy}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Create Board
                </button>
              </form>
            )}
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}
      </section>

      {/* STEP 2: Amazon Product Extractor & Affiliate Tag Builder */}
      <section className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Step 2 • Amazon Product &amp; Affiliate Tag
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              Import Amazon Product &amp; Attach Your Associate Tag
            </h2>
          </div>

          <button
            type="button"
            onClick={handleLoadDemoProduct}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Amazon Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <label htmlFor="amazon-url-input" className="block text-xs font-bold text-slate-300 mb-1">
              Amazon Product URL, Short Link (amzn.to), or 10-Char ASIN
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="amazon-url-input"
                type="text"
                placeholder="https://www.amazon.in/dp/B0CX23V2ZK or B0CX23V2ZK"
                value={amazonInput}
                onChange={(e) => setAmazonInput(e.target.value)}
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={isExtracting}
                onClick={handleExtractAmazon}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>Fetch Product</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="amazon-marketplace" className="block text-xs font-bold text-slate-300 mb-1">
              Marketplace
            </label>
            <select
              id="amazon-marketplace"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as AmazonMarketplace)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {MARKETPLACE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="amazon-associate-tag" className="block text-xs font-bold text-slate-300 mb-1">
              Your Amazon Associate Tag <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                id="amazon-associate-tag"
                type="text"
                placeholder="e.g. yourtag-21"
                value={associateTag}
                onChange={(e) => setAssociateTag(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Live Verified Affiliate Link Bar */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            affiliateLinkResult.valid
              ? 'bg-emerald-950/35 border-emerald-700/60'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            {affiliateLinkResult.valid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">
                {affiliateLinkResult.valid
                  ? `Verified Affiliate Destination Link (Tag: ${associateTag.trim()})`
                  : affiliateLinkResult.error || 'Enter Amazon link & your Associate Tag'}
              </div>
              {affiliateLinkResult.affiliateUrl && (
                <div className="text-[11px] font-mono text-emerald-300 truncate mt-0.5">
                  {affiliateLinkResult.affiliateUrl}
                </div>
              )}
            </div>
          </div>

          {affiliateLinkResult.valid && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy('aff-link', affiliateLinkResult.affiliateUrl)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'aff-link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'aff-link' ? 'Copied' : 'Copy Link'}</span>
              </button>
              <a
                href={affiliateLinkResult.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1"
              >
                <span>Test</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {extractNotice && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200">
            {extractNotice}
          </div>
        )}

        {/* Product Details Editor (Auto-populated from Amazon or Manually Editable Fallback) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="sm:col-span-2">
            <label htmlFor="prod-title" className="block text-xs font-bold text-slate-400 mb-1">
              Product Name (Shown on Poster &amp; Pin Title)
            </label>
            <input
              id="prod-title"
              type="text"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>
          <div>
            <label htmlFor="prod-price" className="block text-xs font-bold text-slate-400 mb-1">
              Deal Price Badge
            </label>
            <input
              id="prod-price"
              type="text"
              placeholder="e.g. ₹2,499"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>
          <div>
            <label htmlFor="prod-badge" className="block text-xs font-bold text-slate-400 mb-1">
              Top Discount Pill
            </label>
            <input
              id="prod-badge"
              type="text"
              placeholder="e.g. 50% OFF DEAL"
              value={discountBadge}
              onChange={(e) => setDiscountBadge(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        {/* Product Photo Upload / Amazon CDN Image URL Loader */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            ref={localPhotoRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLocalPhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => localPhotoRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span>Upload Product Photo</span>
          </button>

          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              aria-label="Amazon CDN Image URL"
              placeholder="Or paste https://m.media-amazon.com/images/... URL"
              value={remoteImageUrlInput}
              onChange={(e) => setRemoteImageUrlInput(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => proxyFetchAmazonImage(remoteImageUrlInput)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer shrink-0"
            >
              Load Image
            </button>
          </div>
        </div>

        {/* Curated Trending Amazon Deals Catalog (Instant 1-Click Load) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Curated Amazon Trending Deals (1-Click Load)</span>
            </div>
            <span className="text-[11px] text-slate-400">High commission &amp; conversion picks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CURATED_AMAZON_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/60 text-[10px] font-bold text-amber-300">
                      {deal.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">{deal.discountBadge}</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2">{deal.title}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-xs font-extrabold text-white">{deal.price}</div>
                    <div className="text-[10px] text-slate-400 line-through">{deal.mrp}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCuratedDeal(deal)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Load Deal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 3 & 4: Split Studio (Left: Pin Poster + Pinterest Card Preview | Right: SEO Copy + Publish) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: 2:3 Poster Designer + Authentic Pinterest Card Mockup */}
        <section className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Step 3 • 2:3 Pinterest Pin Poster &amp; Link Preview
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Poster Design &amp; Link Below Photo
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_OPTIONS.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  template === tpl.id
                    ? 'bg-rose-600/20 border-rose-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{tpl.label}</div>
                <div className="text-[10px] text-slate-400">{tpl.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              Accent Color:
            </span>
            <div className="flex items-center gap-1.5">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={`Select ${c.name} accent`}
                  onClick={() => setAccentColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${c.bgClass} ${
                    accentColor === c.hex ? 'border-white scale-110' : 'border-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              aria-label="Poster CTA Text"
              placeholder="CTA Text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
            <input
              type="text"
              aria-label="Campaign Subtag"
              placeholder="Tracking sub-tag (optional)"
              value={subTag}
              onChange={(e) => setSubTag(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showDisclosure}
              onChange={(e) => setShowDisclosure(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-rose-500"
            />
            <span>Include Amazon Associates disclosure on Pin &amp; caption</span>
          </label>

          {/* Realistic Pinterest Pin Card Preview Showing Link Directly Beneath Photo */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="aspect-[2/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {renderedPosterUrl ? (
                <img
                  src={renderedPosterUrl}
                  alt="Generated 1000x1500 Pinterest Affiliate Poster Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Fetch an Amazon product or click &ldquo;Load Sample Amazon Product&rdquo; to preview your 1000×1500 Pin poster.
                  </p>
                </div>
              )}
            </div>

            {/* Simulated Pinterest Below-Photo Clickable Product Link Bar */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900/95 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 truncate">
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {affiliateLinkResult.valid
                      ? `${marketplace}/dp/${affiliateLinkResult.asin || ''}?tag=${associateTag.trim()}`
                      : `${marketplace}/?tag=${tagValidation.cleaned || 'your-tag-21'}`}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold shrink-0">
                  Visit
                </span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">
                {pinTitle || productTitle || 'Your Product Title Appears Here'}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: SEO Copy Generator & 1-Click Publish */}
        <section className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Step 4 • Pinterest Copy &amp; 1-Click Publish
                </div>
                <h2 className="text-base font-extrabold text-white mt-0.5">
                  Multilingual Pin Copy &amp; Direct Board Upload
                </h2>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
                {([
                  { id: 'hinglish', label: 'Hinglish' },
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिंदी' },
                ] as const).map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setCopyLang(lang.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      copyLang === lang.id ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="pin-title-input" className="font-bold text-slate-300">
                  Pinterest Pin Title (max 100 chars)
                </label>
                <span className="font-mono text-slate-500">{pinTitle.length}/100</span>
              </div>
              <input
                id="pin-title-input"
                type="text"
                maxLength={100}
                value={pinTitle}
                onChange={(e) => setPinTitle(e.target.value)}
                placeholder="Pin headline shown in Pinterest feed..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="pin-desc-input" className="font-bold text-slate-300">
                  Pin Description &amp; Search Hashtags (max 500 chars)
                </label>
                <span className="font-mono text-slate-500">{pinDescription.length}/500</span>
              </div>
              <textarea
                id="pin-desc-input"
                rows={6}
                maxLength={500}
                value={pinDescription}
                onChange={(e) => setPinDescription(e.target.value)}
                placeholder="Compelling product description telling shoppers to click the Amazon link below the photo..."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label htmlFor="pin-alt-input" className="block text-xs font-bold text-slate-300 mb-1">
                Visual Alt Text (Pinterest Accessibility &amp; Visual Search SEO)
              </label>
              <input
                id="pin-alt-input"
                type="text"
                maxLength={500}
                value={pinAltText}
                onChange={(e) => setPinAltText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            {publishError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{publishError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishToPinterest}
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Pin to Pinterest...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Pin + Affiliate Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!renderedPosterUrl}
                onClick={handleDownloadPoster}
                className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Pin</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'all-copy',
                    `${pinTitle}\n\n${pinDescription}\n\nBuy on Amazon: ${affiliateLinkResult.affiliateUrl}`
                  )
                }
                className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedId === 'all-copy' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedId === 'all-copy' ? 'Copied Kit!' : 'Copy Kit'}</span>
              </button>
            </div>

            {publishedPins.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/35 border border-emerald-700/60 space-y-2">
                <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Published Pins in This Session ({publishedPins.length})</span>
                </div>
                <div className="space-y-2">
                  {publishedPins.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Board: {p.boardName} • {p.createdAt}
                        </div>
                      </div>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0"
                      >
                        <span>View Live Pin</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
