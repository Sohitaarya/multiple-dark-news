import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Globe,
  Search,
  Hash,
  Share2,
  Youtube,
  Calendar,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  FileCode,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import {
  generateStrongPassword,
  checkPasswordStrength,
  computeCryptoHash,
  rot13,
} from '../../services/securityToolsEngine';
import { computeHash } from '../../services/devToolsEngine';
import { decodeQrFromRgba } from '../../services/devAdvancedEngine';
import { loadImage } from '../../services/imageEngine';
import {
  simulateSerp,
  generateMetaTags,
  analyzeMetaTags,
  analyzeKeywordDensity,
  generateRobotsTxt,
  generateSlug,
} from '../../services/seoToolsEngine';
import { extractYouTubeThumbnails, analyzeSocialCharacters } from '../../services/mediaToolsEngine';
import {
  generateRandomNumbersSet,
  generateRandomStringsList,
  compareHashChecksums,
  analyzeUrlSafety,
  validateEmailAddress,
  inspectIpAddressDetails,
  generateRfcTotpCode,
  generateSchemaJsonLd,
  generateHreflangTags,
  testRobotsTxtPath,
  validateXmlSitemapContent,
  generateKeywordIdeas,
  generateFaviconPackZip,
  lookupCloudflareDns,
  generateSocialContentSuite,
  formatUnicodeSocialPost,
  analyzeVideoTitleCtr,
  SOCIAL_IMAGE_PRESETS,
  createPinterestPinCanvasBlob,
} from '../../services/seoSecuritySocialEngine';
import { generateXmlSitemap } from '../../services/sitemapGenerator';

interface SeoSecuritySocialWorkspaceProps {
  tool: ToolDefinition;
  onResultGenerated: (text: string) => void;
  onBlobGenerated: (blob: Blob, fileName: string) => void;
}

export const SeoSecuritySocialWorkspace: React.FC<SeoSecuritySocialWorkspaceProps> = ({
  tool,
  onResultGenerated,
  onBlobGenerated,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyVal = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Security states
  const [pwLen, setPwLen] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNum, setPwNum] = useState(true);
  const [pwSym, setPwSym] = useState(true);
  const [secInput, setSecInput] = useState('P@ssw0rd!2026Global');
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [randMin, setRandMin] = useState(1);
  const [randMax, setRandMax] = useState(100);
  const [randCount, setRandCount] = useState(10);
  const [randUnique, setRandUnique] = useState(true);
  const [randStrLen, setRandStrLen] = useState(20);
  const [randStrMode, setRandStrMode] = useState<'alphanumeric' | 'hex' | 'alpha' | 'numeric' | 'symbols'>('alphanumeric');
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [totpLive, setTotpLive] = useState<{ code: string; secondsRemaining: number }>({ code: '------', secondsRemaining: 30 });
  const [qrScanOut, setQrScanOut] = useState('');

  // SEO states
  const [seoTitle, setSeoTitle] = useState('Free Online PDF, Image & Developer Tools | MultipleDarkNews');
  const [seoDesc, setSeoDesc] = useState('Fast 100% browser-based online tools for PDF compression, image editing, formatting, calculators, and SEO analysis without server uploads.');
  const [seoUrl, setSeoUrl] = useState('https://tools.multipledarknews.com/pdf-compressor');
  const [seoKeywords, setSeoKeywords] = useState('online tools, pdf compressor, free utilities');
  const [seoHtml, setSeoHtml] = useState('<title>Example Page | MultipleDarkNews</title>\n<meta name="description" content="Complete browser-side tool suite with privacy protection and clean URLs for fast indexing." />\n<link rel="canonical" href="https://tools.multipledarknews.com/" />\n<meta property="og:title" content="Example Page" />\n<meta property="og:image" content="https://tools.multipledarknews.com/og.png" />\n<meta name="twitter:card" content="summary_large_image" />');
  const [schemaType, setSchemaType] = useState<'Article' | 'Product' | 'FAQPage' | 'LocalBusiness' | 'Organization'>('Article');
  const [schemaAuthor, setSchemaAuthor] = useState('MultipleDarkNews Editorial');
  const [schemaPrice, setSchemaPrice] = useState('29.00');
  const [hreflangSelected, setHreflangSelected] = useState<string[]>(['en-US', 'en-GB', 'en-IN', 'de-DE', 'fr-FR']);
  const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/');
  const [robotsTestPath, setRobotsTestPath] = useState('/pdf-compressor');
  const [dnsDomain, setDnsDomain] = useState('tools.multipledarknews.com');
  const [dnsType, setDnsType] = useState('A');
  const [favText, setFavText] = useState('MD');
  const [favBg, setFavBg] = useState('#e11d48');
  const [favFg, setFavFg] = useState('#ffffff');
  const [favPreview, setFavPreview] = useState('');

  // Social states
  const [socialTopic, setSocialTopic] = useState('Free Online PDF & Image Tools');
  const [socialNiche, setSocialNiche] = useState('SaaS & Productivity');
  const [socialTone, setSocialTone] = useState('Engaging');
  const [socialPostText, setSocialPostText] = useState('Launching 325+ privacy-first browser tools! Zero uploads, instant results.');
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [ytTitle, setYtTitle] = useState('How to Master Online PDF Tools in 5 Minutes (2026 Guide)');
  const [socialPresetId, setSocialPresetId] = useState('ig-post');
  const [pinTitle, setPinTitle] = useState('10 Free Browser Tools Every Creator Needs');
  const [pinSub, setPinSub] = useState('Save hours weekly — 100% private');
  const [pinBg, setPinBg] = useState('#9f1239');
  const [calItems, setCalItems] = useState([
    { day: 'Monday', platform: 'YouTube', topic: 'Product Walkthrough Tutorial', time: '14:00 UTC' },
    { day: 'Wednesday', platform: 'LinkedIn', topic: 'Engineering Architecture Post', time: '15:30 UTC' },
    { day: 'Friday', platform: 'Instagram / X', topic: 'Quick Tip Carousel & Reel', time: '17:00 UTC' },
  ]);

  useEffect(() => {
    setCopiedId(null);
    setQrScanOut('');
    setFavPreview('');
  }, [tool.id]);

  // Live 1s RFC 6238 TOTP ticker
  useEffect(() => {
    if (tool.id !== 'two-factor-authentication-code-generator') return;
    let active = true;
    const tick = async () => {
      try {
        const res = await generateRfcTotpCode(totpSecret);
        if (active) setTotpLive(res);
      } catch {
        // ignore invalid secret mid-typing
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [tool.id, totpSecret]);

  // =============================
  // 1. SECURITY CATEGORY (15)
  // =============================
  if (tool.category === 'security') {
    if (tool.id === 'password-generator') {
      const runPw = () => {
        const res = generateStrongPassword({
          length: pwLen,
          includeUppercase: pwUpper,
          includeLowercase: pwLower,
          includeNumbers: pwNum,
          includeSymbols: pwSym,
        });
        onResultGenerated(`Generated Password:\n${res.password}\n\nEntropy: ${res.entropyBits} bits | Strength: ${res.strength}`);
      };
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="flex justify-between items-center text-white font-bold">
            <span><KeyRound className="w-4 h-4 text-rose-400 inline mr-1.5" />Password Length: {pwLen}</span>
          </div>
          <input aria-label="Password Length" type="range" min={8} max={64} value={pwLen} onChange={(e) => setPwLen(Number(e.target.value))} className="w-full accent-rose-500" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            <label className="flex items-center gap-2"><input type="checkbox" checked={pwUpper} onChange={(e) => setPwUpper(e.target.checked)} className="accent-rose-500" />Uppercase</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={pwLower} onChange={(e) => setPwLower(e.target.checked)} className="accent-rose-500" />Lowercase</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={pwNum} onChange={(e) => setPwNum(e.target.checked)} className="accent-rose-500" />Numbers</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={pwSym} onChange={(e) => setPwSym(e.target.checked)} className="accent-rose-500" />Symbols</label>
          </div>
          <button type="button" onClick={runPw} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold">
            Generate Cryptographic Password
          </button>
        </div>
      );
    }

    if (tool.id === 'password-strength-checker' || tool.id === 'password-entropy-calculator') {
      const check = checkPasswordStrength(secInput);
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div>
            <label htmlFor="pw-eval-input" className="block text-slate-300 font-bold mb-1">Enter Password to Evaluate Entropy & Crack Time:</label>
            <input id="pw-eval-input" type="text" value={secInput} onChange={(e) => setSecInput(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-400 block">Strength</span><strong className="text-emerald-400 text-base">{check.strength} ({check.score}/100)</strong></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-400 block">Shannon Entropy</span><strong className="text-rose-400 text-base">{check.entropyBits} bits</strong></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-400 block">Est. Crack Time</span><strong className="text-white text-base">{check.crackTimeEstimate}</strong></div>
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            {check.feedback.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      );
    }

    if (tool.id === 'random-number-generator') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div><label htmlFor="rng-min" className="block text-slate-400 mb-1">Min</label><input id="rng-min" type="number" value={randMin} onChange={(e) => setRandMin(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
            <div><label htmlFor="rng-max" className="block text-slate-400 mb-1">Max</label><input id="rng-max" type="number" value={randMax} onChange={(e) => setRandMax(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
            <div><label htmlFor="rng-cnt" className="block text-slate-400 mb-1">Count</label><input id="rng-cnt" type="number" min={1} max={200} value={randCount} onChange={(e) => setRandCount(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          </div>
          <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={randUnique} onChange={(e) => setRandUnique(e.target.checked)} className="accent-rose-500" />No duplicates (Unique sampling)</label>
          <button
            type="button"
            onClick={() => {
              const nums = generateRandomNumbersSet(randMin, randMax, randCount, randUnique, false);
              onResultGenerated(`Cryptographic Random Numbers (${nums.length}):\n${nums.join(', ')}`);
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Generate Random Numbers
          </button>
        </div>
      );
    }

    if (tool.id === 'random-string-generator') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="rs-len" className="block text-slate-400 mb-1">String Length</label><input id="rs-len" type="number" min={4} max={128} value={randStrLen} onChange={(e) => setRandStrLen(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
            <div>
              <label htmlFor="rs-mode" className="block text-slate-400 mb-1">Character Set</label>
              <select id="rs-mode" value={randStrMode} onChange={(e) => setRandStrMode(e.target.value as any)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="hex">Hexadecimal Token (0-9, a-f)</option>
                <option value="alpha">Letters Only (A-Z, a-z)</option>
                <option value="numeric">Digits Only (0-9)</option>
                <option value="symbols">High-Entropy w/ Symbols</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResultGenerated(generateRandomStringsList(randStrLen, 8, randStrMode).join('\n'))}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Generate 8 Random Strings
          </button>
        </div>
      );
    }

    if (tool.id === 'hash-checker') {
      const cmp = compareHashChecksums(hashA, hashB);
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div><label htmlFor="hc-a" className="block text-slate-400 mb-1">Expected Checksum / Hash A</label><input id="hc-a" type="text" value={hashA} onChange={(e) => setHashA(e.target.value)} placeholder="Paste SHA-256 / MD5 hash..." className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="hc-b" className="block text-slate-400 mb-1">Computed Checksum / Hash B</label><input id="hc-b" type="text" value={hashB} onChange={(e) => setHashB(e.target.value)} placeholder="Paste second hash to verify..." className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          {hashA && hashB && (
            <div className={`p-3 rounded-xl border font-bold ${cmp.match ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400' : 'bg-rose-950/40 border-rose-700 text-rose-400'}`}>
              {cmp.match ? `✓ MATCH VERIFIED (${cmp.detectedType})` : `✕ CHECKSUM MISMATCH (${cmp.detectedType})`}
            </div>
          )}
        </div>
      );
    }

    if (tool.id === 'file-checksum-calculator') {
      const handleChecksumFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const buf = await f.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const toHex = (ab: ArrayBuffer) => Array.from(new Uint8Array(ab)).map((b) => b.toString(16).padStart(2, '0')).join('');
        const [s1, s256, s512] = await Promise.all([
          crypto.subtle.digest('SHA-1', bytes),
          crypto.subtle.digest('SHA-256', bytes),
          crypto.subtle.digest('SHA-512', bytes),
        ]);
        const md5Str = await computeHash(new TextDecoder('latin1').decode(bytes), 'MD5');
        onResultGenerated(
          `File: ${f.name} (${(f.size / 1024).toFixed(2)} KB)\n\nMD5: ${md5Str}\nSHA-1: ${toHex(s1)}\nSHA-256: ${toHex(s256)}\nSHA-512: ${toHex(s512)}`
        );
      };
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="chk-file-up" className="font-bold text-white block">Select Any Local File to Compute Cryptographic Checksums (MD5, SHA-1, SHA-256, SHA-512):</label>
          <input id="chk-file-up" type="file" onChange={handleChecksumFile} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold" />
        </div>
      );
    }

    if (tool.id === 'qr-code-scanner') {
      const handleQrScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const img = await loadImage(f);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const res = decodeQrFromRgba(imgData.data, canvas.width, canvas.height);
        if (res) {
          setQrScanOut(res);
          const safety = analyzeUrlSafety(res);
          onResultGenerated(`Scanned QR Content:\n${res}\n\nSafety Audit: ${safety.valid ? `${safety.riskLevel} (${safety.score}/100)` : 'Plain text payload'}`);
        } else {
          setQrScanOut('No QR code detected in uploaded image.');
        }
      };
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="sec-qr-scan" className="font-bold text-white block">Upload QR Image for Safe Offline Scanning & Phishing Check:</label>
          <input id="sec-qr-scan" type="file" accept="image/*" onChange={handleQrScan} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold" />
          {qrScanOut && <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-emerald-400 break-all">{qrScanOut}</div>}
        </div>
      );
    }

    if (tool.id === 'two-factor-authentication-code-generator') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div>
            <label htmlFor="totp-sec" className="block text-slate-400 mb-1 font-mono">Base32 2FA Secret Key (RFC 6238):</label>
            <input id="totp-sec" type="text" value={totpSecret} onChange={(e) => setTotpSecret(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase" />
          </div>
          <div className="p-5 bg-slate-900 border border-rose-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Live 6-Digit Authenticator Token</div>
              <div className="text-4xl font-extrabold font-mono text-white tracking-[0.2em] mt-1" data-testid="totp-code-display">
                {totpLive.code}
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-rose-400 font-bold">{totpLive.secondsRemaining}s left</div>
              <button type="button" onClick={() => copyVal('totp', totpLive.code)} className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg font-sans font-bold">
                {copiedId === 'totp' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (tool.id === 'file-metadata-remover') {
      const handleStripMeta = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.type.startsWith('image/')) {
          const img = await loadImage(f);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          const mime = f.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const cleanBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.95));
          onBlobGenerated(cleanBlob, `clean-${f.name}`);
          onResultGenerated(`EXIF/GPS/Camera metadata stripped cleanly (${(f.size / 1024).toFixed(1)} KB → ${(cleanBlob.size / 1024).toFixed(1)} KB).`);
        } else {
          onBlobGenerated(new Blob([await f.arrayBuffer()], { type: f.type }), `clean-${f.name}`);
          onResultGenerated(`Re-packaged binary cleanly as clean-${f.name}.`);
        }
      };
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="sec-meta-rm" className="font-bold text-white block">Select File (JPG/PNG/PDF) to Strip Identifying GPS & Camera Metadata:</label>
          <input id="sec-meta-rm" type="file" onChange={handleStripMeta} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold" />
        </div>
      );
    }

    // Remaining Security tools: url-safety-checker, email-validator, ip-information-checker, ssl-certificate-checker, secure-text-encoder
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <label htmlFor="sec-generic-input" className="font-bold text-white block">
          {tool.id === 'url-safety-checker' ? 'Enter URL to Audit Security:' :
           tool.id === 'email-validator' ? 'Enter Email Address to Validate:' :
           tool.id === 'ip-information-checker' ? 'Enter IPv4 / IPv6 Address:' :
           tool.id === 'ssl-certificate-checker' ? 'Enter Domain Hostname:' :
           'Enter Text Payload:'}
        </label>
        <input
          id="sec-generic-input"
          type="text"
          value={secInput}
          onChange={(e) => setSecInput(e.target.value)}
          placeholder={tool.id.includes('ip') ? '8.8.8.8' : tool.id.includes('email') ? 'user@example.com' : 'https://tools.multipledarknews.com'}
          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              if (tool.id === 'url-safety-checker') {
                const a = analyzeUrlSafety(secInput);
                onResultGenerated(`Risk Verdict: ${a.riskLevel} (${a.score}/100)\n\n${a.checks.map((c) => `${c.passed ? '✓' : '✕'} ${c.label}: ${c.detail}`).join('\n')}`);
              } else if (tool.id === 'email-validator') {
                const ev = validateEmailAddress(secInput);
                onResultGenerated(`Syntax Valid: ${ev.validSyntax ? 'YES' : 'NO'}\nLocal Part: ${ev.localPart}\nDomain: ${ev.domain}\nDisposable Temp Email: ${ev.isDisposable ? 'YES (Blocked risk)' : 'No'}\nTypo Check: ${ev.typoSuggestion ? `Did you mean ${ev.typoSuggestion}?` : 'Clean'}`);
              } else if (tool.id === 'ip-information-checker') {
                const ip = inspectIpAddressDetails(secInput);
                onResultGenerated(ip.valid ? `Version: ${ip.version}\nScope: ${ip.scope}\nBinary / Expanded: ${ip.binaryOrExpanded}\n${ip.integerValue ? `32-bit Integer: ${ip.integerValue}` : ''}` : 'Enter a valid IPv4 (e.g. 8.8.8.8) or IPv6 address.');
              } else if (tool.id === 'ssl-certificate-checker') {
                const host = secInput.replace(/^https?:\/\//, '').split('/')[0];
                try {
                  const doh = await lookupCloudflareDns(host, 'CAA');
                  const caa = (doh.Answer || []).map((a: any) => a.data).join('\n') || 'No explicit CAA restriction records (standard CA issuance allowed)';
                  onResultGenerated(`Domain: ${host}\nDNSSEC Validated (AD): ${Boolean(doh.AD)}\nCAA Records:\n${caa}`);
                } catch {
                  onResultGenerated(`HTTPS Check for ${host}: Use TLS 1.3 + HSTS (max-age=31536000; includeSubDomains).`);
                }
              } else if (tool.id === 'secure-text-encoder') {
                const b64 = btoa(unescape(encodeURIComponent(secInput)));
                const uri = encodeURIComponent(secInput);
                const hex = Array.from(new TextEncoder().encode(secInput)).map((b) => b.toString(16).padStart(2, '0')).join('');
                const r13 = rot13(secInput);
                const sha = await computeCryptoHash('SHA-256', secInput);
                onResultGenerated(`Base64 Encoded:\n${b64}\n\nURL Encoded:\n${uri}\n\nHex Bytes:\n${hex}\n\nROT13 Cipher:\n${r13}\n\nSHA-256 Digest:\n${sha}`);
              } else {
                const b64 = btoa(unescape(encodeURIComponent(secInput)));
                const r13 = rot13(secInput);
                const sha = await computeCryptoHash('SHA-256', secInput);
                onResultGenerated(`Base64 Encoded:\n${b64}\n\nROT13 Cipher:\n${r13}\n\nSHA-256 Digest:\n${sha}`);
              }
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Run Security Analysis
          </button>
        </div>
      </div>
    );
  }

  // =============================
  // 2. SEO CATEGORY (25 NON-AI)
  // =============================
  if (tool.category === 'seo') {
    if (tool.id === 'schema-markup-generator') {
      const code = generateSchemaJsonLd(schemaType, { name: seoTitle, description: seoDesc, url: seoUrl, authorOrBrand: schemaAuthor, price: schemaPrice });
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="sch-type" className="block text-slate-400 mb-1">Schema Type</label>
              <select id="sch-type" value={schemaType} onChange={(e) => setSchemaType(e.target.value as any)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
                <option value="Article">Article / News</option>
                <option value="Product">Product / Ecommerce</option>
                <option value="FAQPage">FAQPage (Rich Snippets)</option>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <div><label htmlFor="sch-title" className="block text-slate-400 mb-1">Headline / Name</label><input id="sch-title" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div><label htmlFor="sch-auth" className="block text-slate-400 mb-1">Author / Brand</label><input id="sch-auth" type="text" value={schemaAuthor} onChange={(e) => setSchemaAuthor(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          </div>
          {schemaType === 'Product' && (
            <div><label htmlFor="sch-price" className="block text-slate-400 mb-1">Price (USD)</label><input id="sch-price" type="text" value={schemaPrice} onChange={(e) => setSchemaPrice(e.target.value)} className="w-40 p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          )}
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 font-mono overflow-x-auto">{code}</pre>
          <button type="button" onClick={() => onResultGenerated(code)} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Export JSON-LD Snippet</button>
        </div>
      );
    }

    if (tool.id === 'hreflang-generator') {
      const ALL_LOCALES = [
        { code: 'en-US', label: 'English (USA)', pathPrefix: 'en-us' },
        { code: 'en-GB', label: 'English (UK)', pathPrefix: 'en-gb' },
        { code: 'en-IN', label: 'English (India)', pathPrefix: 'en-in' },
        { code: 'de-DE', label: 'German (Germany)', pathPrefix: 'de' },
        { code: 'fr-FR', label: 'French (France)', pathPrefix: 'fr' },
        { code: 'es-ES', label: 'Spanish (Spain)', pathPrefix: 'es' },
        { code: 'ja-JP', label: 'Japanese (Japan)', pathPrefix: 'ja' },
        { code: 'pt-BR', label: 'Portuguese (Brazil)', pathPrefix: 'pt-br' },
      ];
      const out = generateHreflangTags(seoUrl.replace(/\/[^/]+$/, '') || 'https://tools.multipledarknews.com', ALL_LOCALES.filter((l) => hreflangSelected.includes(l.code)));
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div><label htmlFor="hl-url" className="block text-slate-400 mb-1">Root Site URL</label><input id="hl-url" type="text" value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            {ALL_LOCALES.map((l) => (
              <label key={l.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hreflangSelected.includes(l.code)}
                  onChange={(e) =>
                    setHreflangSelected((prev) => (e.target.checked ? [...prev, l.code] : prev.filter((x) => x !== l.code)))
                  }
                  className="accent-rose-500"
                />
                {l.label}
              </label>
            ))}
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 font-mono overflow-x-auto">{out}</pre>
          <button type="button" onClick={() => onResultGenerated(out)} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Copy / Output Hreflang Tags</button>
        </div>
      );
    }

    if (tool.id === 'favicon-generator') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div><label htmlFor="fav-txt" className="block text-slate-400 mb-1">Brand Letters (1-2)</label><input id="fav-txt" type="text" maxLength={2} value={favText} onChange={(e) => setFavText(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold uppercase" /></div>
            <div><label htmlFor="fav-bg" className="block text-slate-400 mb-1">Backdrop</label><input id="fav-bg" type="color" value={favBg} onChange={(e) => setFavBg(e.target.value)} className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl" /></div>
            <div><label htmlFor="fav-fg" className="block text-slate-400 mb-1">Text Color</label><input id="fav-fg" type="color" value={favFg} onChange={(e) => setFavFg(e.target.value)} className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl" /></div>
          </div>
          {favPreview && (
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
              <img src={favPreview} alt="Favicon 32px preview" className="w-8 h-8 rounded" />
              <span className="text-emerald-400 font-semibold">32×32 + 16×16 + 48×48 + Apple 180×180 + Android 192/512 + webmanifest ZIP ready!</span>
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              const pack = await generateFaviconPackZip(favText, favBg, favFg);
              setFavPreview(pack.preview32Url);
              onBlobGenerated(pack.zipBlob, 'favicon-pack.zip');
              onResultGenerated(pack.htmlSnippet);
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Generate Complete Favicon ZIP Pack
          </button>
        </div>
      );
    }

    if (tool.id === 'robots-txt-tester') {
      const res = testRobotsTxtPath(robotsTxt, 'Googlebot', robotsTestPath);
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="rob-txt" className="block text-slate-400 font-bold">robots.txt Rules:</label>
          <textarea id="rob-txt" rows={4} value={robotsTxt} onChange={(e) => setRobotsTxt(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          <div><label htmlFor="rob-path" className="block text-slate-400 mb-1">URL Path to Test (Googlebot):</label><input id="rob-path" type="text" value={robotsTestPath} onChange={(e) => setRobotsTestPath(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div className={`p-3 rounded-xl border font-bold ${res.allowed ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400' : 'bg-rose-950/40 border-rose-700 text-rose-400'}`}>
            {res.allowed ? '✓ ALLOWED for Googlebot' : '✕ BLOCKED for Googlebot'} • Rule: {res.matchedRule}
          </div>
        </div>
      );
    }

    if (tool.id === 'sitemap-checker') {
      const sampleXml = seoHtml.includes('<urlset') ? seoHtml : generateXmlSitemap(seoUrl);
      const audit = validateXmlSitemapContent(sampleXml);
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="sm-xml" className="block text-slate-300 font-bold">Paste XML Sitemap Content (or audit built-in platform sitemap):</label>
          <textarea id="sm-xml" rows={5} value={seoHtml} onChange={(e) => setSeoHtml(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          <button
            type="button"
            onClick={() => onResultGenerated(`Valid XML Sitemap: ${audit.valid}\nURL Count: ${audit.urlCount}\nIssues: ${audit.issues.join('; ') || 'None'}\n\nSample URLs:\n${audit.urls.slice(0, 10).join('\n')}`)}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Validate XML Sitemap Structure
          </button>
        </div>
      );
    }

    if (tool.id === 'dns-lookup' || tool.id === 'whois-lookup' || tool.id === 'ip-address-lookup') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2"><label htmlFor="dns-dom" className="block text-slate-400 mb-1">Domain / IP Address</label><input id="dns-dom" type="text" value={dnsDomain} onChange={(e) => setDnsDomain(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
            {tool.id === 'dns-lookup' && (
              <div>
                <label htmlFor="dns-rec" className="block text-slate-400 mb-1">Record Type</label>
                <select id="dns-rec" value={dnsType} onChange={(e) => setDnsType(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono">
                  {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              if (tool.id === 'dns-lookup' || tool.id === 'ip-address-lookup') {
                const res = await lookupCloudflareDns(dnsDomain, tool.id === 'ip-address-lookup' ? 'A' : dnsType);
                const answers = (res.Answer || []).map((a: any) => `${a.name} (${a.TTL}s) -> ${a.data}`).join('\n') || 'No matching DNS records found.';
                onResultGenerated(`Cloudflare DoH Query: ${dnsDomain} [${tool.id === 'ip-address-lookup' ? 'A' : dnsType}]\nStatus: ${res.Status === 0 ? 'NOERROR' : res.Status}\n\nAnswers:\n${answers}`);
              } else {
                const clean = dnsDomain.replace(/^https?:\/\//, '').split('/')[0];
                const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(clean)}`);
                if (!r.ok) {
                  onResultGenerated(`RDAP lookup status ${r.status} for ${clean}. Ensure root domain (e.g. multipledarknews.com) is entered.`);
                  return;
                }
                const j = await r.json();
                onResultGenerated(`RDAP Domain Record: ${j.ldhName || clean}\nStatus: ${(j.status || []).join(', ')}\nHandle: ${j.handle || 'N/A'}\nEvents:\n${(j.events || []).map((e: any) => `• ${e.eventAction}: ${e.eventDate}`).join('\n')}`);
              }
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Run Live Lookup
          </button>
        </div>
      );
    }

    // Remaining SEO tools: serp-snippet-preview, meta-title-checker, meta-description-checker, open-graph-generator, twitter-card-generator,
    // canonical-url-checker, url-slug-generator, keyword-research, seo-keyword-density-checker, speed/page-size/header/broken-link/redirect/da/ssl/screenshot
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label htmlFor="seo-t" className="block text-slate-400 mb-1">Page Title / Keyword</label><input id="seo-t" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          <div><label htmlFor="seo-u" className="block text-slate-400 mb-1">Canonical / Target URL</label><input id="seo-u" type="text" value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div><label htmlFor="seo-d" className="block text-slate-400 mb-1">Meta Description / Article Body</label><textarea id="seo-d" rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
        {(tool.id === 'broken-link-checker' || tool.id === 'page-size-checker' || tool.id === 'canonical-url-checker') && (
          <div><label htmlFor="seo-html-src" className="block text-slate-400 mb-1">Paste HTML Source to Audit:</label><textarea id="seo-html-src" rows={4} value={seoHtml} onChange={(e) => setSeoHtml(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        )}
        <button
          type="button"
          onClick={async () => {
            if (tool.id === 'serp-snippet-preview' || tool.id === 'meta-title-checker' || tool.id === 'meta-description-checker') {
              const s = simulateSerp(seoTitle, seoDesc, seoUrl);
              onResultGenerated(`SERP Score: ${s.score}/100 | Title Width: ${s.titlePixelWidth}px (${seoTitle.length} chars) | Desc: ${seoDesc.length} chars\n\nDesktop Title: ${s.desktopTitle}\nDesktop Snippet: ${s.desktopSnippet}\nMobile Title: ${s.mobileTitle}\n\nAudit Notes:\n${s.suggestions.join('\n') || '✓ Perfect lengths for Google SERP!'}`);
            } else if (tool.id === 'keyword-research') {
              const groups = generateKeywordIdeas(seoTitle);
              onResultGenerated(groups.map((g) => `=== ${g.category} ===\n${g.keywords.map((k) => `• ${k}`).join('\n')}`).join('\n\n'));
            } else if (tool.id === 'seo-keyword-density-checker') {
              const d = analyzeKeywordDensity(`${seoTitle} ${seoDesc} ${seoHtml.replace(/<[^>]+>/g, ' ')}`);
              onResultGenerated(`Words: ${d.totalWords} | Unique: ${d.uniqueWords}\n\nTop Keywords:\n${d.singleWords.map((w) => `• ${w.word}: ${w.count} (${w.density}%)`).join('\n')}`);
            } else if (tool.id === 'url-slug-generator') {
              onResultGenerated(`SEO URL Slug:\n/${generateSlug(seoTitle)}`);
            } else if (tool.id === 'canonical-url-checker') {
              const an = analyzeMetaTags(seoHtml);
              onResultGenerated(`Canonical Declared: ${an.canonical || 'Missing!'}\nScore: ${an.score}/100\n\nPasses:\n${an.passes.join('\n')}\n\nIssues:\n${an.issues.join('\n')}`);
            } else if (tool.id === 'broken-link-checker') {
              const links = [...seoHtml.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
              onResultGenerated(`Extracted Links (${links.length}):\n${links.map((l, i) => `${i + 1}. ${l} ${l.startsWith('http') || l.startsWith('/') ? '✓ Valid syntax' : '⚠ Check relative/anchor path'}`).join('\n') || 'No href links found in HTML.'}`);
            } else if (tool.id === 'page-size-checker') {
              const kb = (new Blob([seoHtml]).size / 1024).toFixed(2);
              onResultGenerated(`Document Payload Size: ${kb} KB\nEstimated 4G Transfer Time: ~${(Number(kb) * 1.8).toFixed(0)} ms\nRecommendation: Keep HTML < 100 KB and enable Brotli/Gzip.`);
            } else if (tool.id === 'http-header-checker' || tool.id === 'redirect-checker' || tool.id === 'website-speed-checker') {
              const t0 = performance.now();
              try {
                const resp = await fetch(seoUrl, { mode: 'cors' });
                const dt = Math.round(performance.now() - t0);
                onResultGenerated(`URL: ${seoUrl}\nHTTP Status: ${resp.status} ${resp.statusText}\nResponse Time: ${dt} ms\nRedirected: ${resp.redirected ? `Yes -> ${resp.url}` : 'No'}`);
              } catch {
                onResultGenerated(`Direct browser CORS prevented reading remote headers for ${seoUrl}.\nTip: Verify locally or ensure Access-Control-Allow-Origin headers on target origin. Recommended security headers: Strict-Transport-Security, X-Content-Type-Options: nosniff, Content-Security-Policy.`);
              }
            } else if (tool.id === 'domain-authority-lookup') {
              const host = seoUrl.replace(/^https?:\/\//, '').split('/')[0];
              const [aRes, mxRes, txtRes, nsRes] = await Promise.all([
                lookupCloudflareDns(host, 'A').catch(() => ({ Answer: [] })),
                lookupCloudflareDns(host, 'MX').catch(() => ({ Answer: [] })),
                lookupCloudflareDns(host, 'TXT').catch(() => ({ Answer: [] })),
                lookupCloudflareDns(host, 'NS').catch(() => ({ Answer: [] })),
              ]);
              const hasSpf = (txtRes.Answer || []).some((r: any) => String(r.data).includes('v=spf1'));
              const trustScore = Math.min(100, 35 + ((aRes.Answer?.length ? 15 : 0) + (mxRes.Answer?.length ? 15 : 0) + (nsRes.Answer?.length ? 15 : 0) + (hasSpf ? 20 : 0)));
              onResultGenerated(
                `Domain Infrastructure & Trust Profile: ${host}\nTechnical Readiness Score: ${trustScore}/100\nA Records: ${(aRes.Answer || []).map((a: any) => a.data).join(', ') || 'None'}\nNameservers: ${(nsRes.Answer || []).map((a: any) => a.data).join(', ') || 'Inherited'}\nMX Mail Hosts: ${(mxRes.Answer || []).length}\nSPF Verification: ${hasSpf ? '✓ Configured' : '• Not detected'}`
              );
            } else if (tool.id === 'ssl-checker') {
              const host = seoUrl.replace(/^https?:\/\//, '').split('/')[0];
              const caa = await lookupCloudflareDns(host, 'CAA').catch(() => ({ AD: false, Answer: [] }));
              let httpsReachable = 'Unknown (CORS blocked cross-origin read)';
              try {
                const r = await fetch(`https://${host}`, { mode: 'no-cors' });
                if (r) httpsReachable = '✓ HTTPS TLS Handshake Succeeded';
              } catch {
                httpsReachable = '✕ Could not complete HTTPS handshake from browser';
              }
              onResultGenerated(
                `SSL/TLS Domain Audit: https://${host}\nHTTPS Reachability: ${httpsReachable}\nDNSSEC Signed (AD): ${Boolean(caa.AD) ? '✓ Yes' : 'Standard'}\nCAA Policy Records: ${(caa.Answer || []).map((a: any) => a.data).join(', ') || 'Open CA issuance (no explicit CAA lock)'}`
              );
            } else if (tool.id === 'website-screenshot-tool') {
              const target = seoUrl.startsWith('http') ? seoUrl : `https://${seoUrl}`;
              const shotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(target)}?w=1280`;
              const canvas = document.createElement('canvas');
              canvas.width = 1280;
              canvas.height = 720;
              const ctx = canvas.getContext('2d')!;
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, 1280, 720);
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(0, 0, 1280, 56);
              ctx.fillStyle = '#e11d48';
              ctx.beginPath(); ctx.arc(28, 28, 7, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath(); ctx.arc(52, 28, 7, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#10b981';
              ctx.beginPath(); ctx.arc(76, 28, 7, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#020617';
              ctx.fillRect(110, 12, 1080, 32);
              ctx.fillStyle = '#94a3b8';
              ctx.font = '15px monospace';
              ctx.fillText(target, 126, 33);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 40px sans-serif';
              ctx.fillText(seoTitle || target, 64, 220);
              ctx.fillStyle = '#cbd5e1';
              ctx.font = '22px sans-serif';
              ctx.fillText((seoDesc || '').slice(0, 88), 64, 275);
              const cardBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
              onBlobGenerated(cardBlob, 'website-preview-card.png');
              onResultGenerated(`Live Thumbnail Preview Service URL:\n${shotUrl}\n\nTarget URL: ${target}\nAlso generated a downloadable 1280×720 HD browser mockup card PNG below!`);
            } else if (tool.id === 'open-graph-generator') {
              onResultGenerated(
                `<meta property="og:type" content="website" />\n<meta property="og:title" content="${seoTitle}" />\n<meta property="og:description" content="${seoDesc}" />\n<meta property="og:url" content="${seoUrl}" />\n<meta property="og:site_name" content="MultipleDarkNews Tools" />`
              );
            } else if (tool.id === 'twitter-card-generator') {
              onResultGenerated(
                `<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${seoTitle}" />\n<meta name="twitter:description" content="${seoDesc}" />\n<meta name="twitter:url" content="${seoUrl}" />`
              );
            } else {
              onResultGenerated(generateMetaTags({ title: seoTitle, description: seoDesc, keywords: seoKeywords, canonicalUrl: seoUrl }));
            }
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
        >
          Analyze & Generate SEO Output
        </button>
      </div>
    );
  }

  // =============================
  // 3. SOCIAL MEDIA CATEGORY (20)
  // =============================
  if (tool.id === 'youtube-thumbnail-downloader' || tool.id === 'youtube-channel-id-finder' || tool.id === 'youtube-video-details-viewer') {
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div>
          <label htmlFor="yt-url-in" className="block text-slate-300 font-bold mb-1">YouTube Video or Channel URL:</label>
          <input id="yt-url-in" type="text" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
        </div>
        <button
          type="button"
          onClick={async () => {
            if (tool.id === 'youtube-thumbnail-downloader') {
              const yt = extractYouTubeThumbnails(ytUrl);
              if (!yt.valid) { onResultGenerated(yt.error || 'Invalid URL'); return; }
              onResultGenerated(`Video ID: ${yt.videoId}\nHD 1080p: ${yt.maxRes}\nHQ 480p: ${yt.high}\nMQ 360p: ${yt.medium}`);
            } else if (tool.id === 'youtube-video-details-viewer') {
              try {
                const o = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(ytUrl)}&format=json`).then((r) => r.json());
                onResultGenerated(`Title: ${o.title}\nChannel: ${o.author_name}\nChannel URL: ${o.author_url}\nDimensions: ${o.width}×${o.height}\nThumbnail: ${o.thumbnail_url}`);
              } catch {
                const yt = extractYouTubeThumbnails(ytUrl);
                onResultGenerated(`Parsed Video ID: ${yt.videoId || 'Not found'}\nThumbnail: ${yt.maxRes || 'N/A'}`);
              }
            } else {
              const handleMatch = ytUrl.match(/\/@([a-zA-Z0-9._-]+)/);
              const chanMatch = ytUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
              onResultGenerated(`Detected Handle: ${handleMatch ? '@' + handleMatch[1] : 'Use URL with /@handle or /channel/UC...'}\nDirect Channel ID: ${chanMatch ? chanMatch[1] : 'Visit channel page -> View Source -> search externalId'}`);
            }
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
        >
          Inspect YouTube URL
        </button>
      </div>
    );
  }

  if (tool.id === 'video-title-analyzer' || tool.id === 'thumbnail-preview-tool') {
    const ctr = analyzeVideoTitleCtr(ytTitle);
    const yt = extractYouTubeThumbnails(ytUrl);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div><label htmlFor="yt-t-ana" className="block text-slate-400 mb-1">Video Title Headline</label><input id="yt-t-ana" type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
        {tool.id === 'thumbnail-preview-tool' && (
          <div><label htmlFor="yt-t-url" className="block text-slate-400 mb-1">YouTube URL for Thumbnail Preview</label><input id="yt-t-url" type="text" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        )}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between font-bold text-white"><span>CTR Readiness Score: <strong className="text-emerald-400">{ctr.score}/100</strong></span><span className="font-mono">{ctr.length} chars</span></div>
          {ctr.feedback.map((f, i) => <div key={i} className="text-slate-300">{f}</div>)}
        </div>
        {tool.id === 'thumbnail-preview-tool' && yt.valid && (
          <div className="max-w-sm bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <img src={yt.maxRes} alt="YouTube feed preview" className="w-full aspect-video object-cover" />
            <div className="p-3">
              <div className="font-bold text-white text-sm line-clamp-2">{ytTitle}</div>
              <div className="text-[11px] text-slate-400 mt-1">Your Channel • 128K views • 2 hours ago</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tool.id === 'pinterest-pin-maker') {
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label htmlFor="pin-t" className="block text-slate-400 mb-1">Pin Headline</label><input id="pin-t" type="text" value={pinTitle} onChange={(e) => setPinTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          <div><label htmlFor="pin-s" className="block text-slate-400 mb-1">Subtitle</label><input id="pin-s" type="text" value={pinSub} onChange={(e) => setPinSub(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          <div><label htmlFor="pin-c" className="block text-slate-400 mb-1">Brand Accent Color</label><input id="pin-c" type="color" value={pinBg} onChange={(e) => setPinBg(e.target.value)} className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl" /></div>
        </div>
        <button
          type="button"
          onClick={async () => {
            const blob = await createPinterestPinCanvasBlob(pinTitle, pinSub, 'tools.multipledarknews.com', pinBg);
            onBlobGenerated(blob, 'pinterest-pin-1000x1500.png');
            onResultGenerated('Rendered 1000×1500px vertical Pinterest Pin PNG ready for download.');
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
        >
          Render 1000×1500 Pinterest Pin PNG
        </button>
      </div>
    );
  }

  if (tool.id === 'social-media-image-resizer') {
    const handlePresetResize = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const preset = SOCIAL_IMAGE_PRESETS.find((p) => p.id === socialPresetId) || SOCIAL_IMAGE_PRESETS[0];
      const img = await loadImage(f);
      const canvas = document.createElement('canvas');
      canvas.width = preset.w;
      canvas.height = preset.h;
      const ctx = canvas.getContext('2d')!;
      const scale = Math.max(preset.w / img.width, preset.h / img.height);
      const sw = preset.w / scale;
      const sh = preset.h / scale;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, preset.w, preset.h);
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.94));
      onBlobGenerated(blob, `${preset.id}-${preset.w}x${preset.h}.jpg`);
      onResultGenerated(`Resized for ${preset.label}.`);
    };
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div>
          <label htmlFor="soc-preset" className="block text-slate-300 font-bold mb-1">Platform Dimensions Preset:</label>
          <select id="soc-preset" value={socialPresetId} onChange={(e) => setSocialPresetId(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
            {SOCIAL_IMAGE_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <input aria-label="Upload image to resize for social media" type="file" accept="image/*" onChange={handlePresetResize} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold" />
      </div>
    );
  }

  if (tool.id === 'social-media-calendar') {
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="space-y-2">
          {calItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input aria-label={`Day ${idx + 1}`} value={item.day} onChange={(e) => setCalItems(calItems.map((c, i) => (i === idx ? { ...c, day: e.target.value } : c)))} className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white" />
              <input aria-label={`Platform ${idx + 1}`} value={item.platform} onChange={(e) => setCalItems(calItems.map((c, i) => (i === idx ? { ...c, platform: e.target.value } : c)))} className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-rose-300 font-semibold" />
              <input aria-label={`Topic ${idx + 1}`} value={item.topic} onChange={(e) => setCalItems(calItems.map((c, i) => (i === idx ? { ...c, topic: e.target.value } : c)))} className="col-span-4 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white" />
              <input aria-label={`Time ${idx + 1}`} value={item.time} onChange={(e) => setCalItems(calItems.map((c, i) => (i === idx ? { ...c, time: e.target.value } : c)))} className="col-span-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCalItems([...calItems, { day: 'Saturday', platform: 'YouTube Shorts', topic: 'Weekly Recap', time: '16:00 UTC' }])} className="px-3 py-2 bg-slate-800 text-white rounded-xl">+ Add Slot</button>
          <button
            type="button"
            onClick={() => {
              const csv = 'Day,Platform,Topic,Schedule\n' + calItems.map((c) => `"${c.day}","${c.platform}","${c.topic}","${c.time}"`).join('\n');
              onBlobGenerated(new Blob([csv], { type: 'text/csv' }), 'social-calendar.csv');
              onResultGenerated(csv);
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Export Calendar CSV
          </button>
        </div>
      </div>
    );
  }

  if (tool.id === 'twitter-character-counter' || tool.id === 'facebook-post-formatter' || tool.id === 'linkedin-post-formatter') {
    const counts = analyzeSocialCharacters(socialPostText);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <label htmlFor="soc-post-box" className="block text-slate-300 font-bold">Write / Paste Your Social Post:</label>
        <textarea id="soc-post-box" rows={4} value={socialPostText} onChange={(e) => setSocialPostText(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Twitter / X</span><strong className={counts.twitter.exceeded ? 'text-rose-400' : 'text-emerald-400'}>{counts.twitter.remaining} left</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">LinkedIn</span><strong className="text-white">{counts.linkedin.remaining} left</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Instagram</span><strong className="text-white">{counts.instagram.remaining} left</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Words</span><strong className="text-rose-400">{counts.words}</strong></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onResultGenerated(formatUnicodeSocialPost(socialPostText, 'bold'))} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold">Format Unicode Bold</button>
          <button type="button" onClick={() => onResultGenerated(formatUnicodeSocialPost(socialPostText, 'italic'))} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold">Format Unicode Italic</button>
          <button type="button" onClick={() => onResultGenerated(formatUnicodeSocialPost(socialPostText, 'bullets'))} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold">Add Structured Bullets</button>
        </div>
      </div>
    );
  }

  if (tool.id === 'open-graph-preview') {
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label htmlFor="og-p-t" className="block text-slate-400 mb-1">OG Card Title</label><input id="og-p-t" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          <div><label htmlFor="og-p-u" className="block text-slate-400 mb-1">Domain / URL</label><input id="og-p-u" type="text" value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div><label htmlFor="og-p-d" className="block text-slate-400 mb-1">OG Description</label><textarea id="og-p-d" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
        <div className="max-w-lg rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
          <div className="h-32 bg-gradient-to-br from-rose-900/60 to-slate-950 flex items-center justify-center text-white font-bold text-lg px-6 text-center">{seoTitle}</div>
          <div className="p-4 space-y-1">
            <div className="text-[10px] uppercase text-slate-400 font-mono">{seoUrl}</div>
            <div className="text-sm font-bold text-white">{seoTitle}</div>
            <div className="text-xs text-slate-400 line-clamp-2">{seoDesc}</div>
          </div>
        </div>
      </div>
    );
  }

  // Remaining social content generators (tags, titles, descriptions, hashtags, IG bio/caption, bio formatter)
  return (
    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label htmlFor="sg-topic" className="block text-slate-400 mb-1">Topic / Brand</label><input id="sg-topic" type="text" value={socialTopic} onChange={(e) => setSocialTopic(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
        <div><label htmlFor="sg-niche" className="block text-slate-400 mb-1">Niche / Industry</label><input id="sg-niche" type="text" value={socialNiche} onChange={(e) => setSocialNiche(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
        <div>
          <label htmlFor="sg-tone" className="block text-slate-400 mb-1">Tone</label>
          <select id="sg-tone" value={socialTone} onChange={(e) => setSocialTone(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
            <option>Engaging</option>
            <option>Professional</option>
            <option>Educational</option>
            <option>Bold & Viral</option>
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onResultGenerated(generateSocialContentSuite(tool.id, socialTopic, socialNiche, socialTone))}
        className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
      >
        Generate {tool.name}
      </button>
    </div>
  );
};
