import React, { useState } from 'react';
import { 
  Globe, 
  Code2, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Terminal,
  FileCode,
  Smartphone
} from 'lucide-react';

interface IntegrationGuidePageProps {
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
}

export const IntegrationGuidePage: React.FC<IntegrationGuidePageProps> = ({
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'subdomain' | 'subfolder' | 'iframe' | 'wordpress'>('subdomain');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const domain = 'multipledarknews.com';
  const toolsSubdomain = 'tools.multipledarknews.com';
  const cloudRunHost = 'ais-pre-nuionpsrsixiky7idzwf6y-529606111096.asia-east1.run.app';

  const cnameRecord = `Type: CNAME\nName: tools\nTarget / Value: ${cloudRunHost}\nTTL: Auto / 3600`;

  const nginxConfig = `# Nginx Configuration for multipledarknews.com/tools/
location /tools/ {
    proxy_pass https://${cloudRunHost}/;
    proxy_set_header Host ${cloudRunHost};
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
    proxy_buffering off;
}`;

  const cloudflareWorker = `// Cloudflare Worker: Route /tools to MultipleDarkNews Tools App
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/tools')) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = '${cloudRunHost}';
      targetUrl.pathname = url.pathname.replace(/^\\/tools/, '') || '/';
      return fetch(new Request(targetUrl, request));
    }
    return fetch(request);
  }
};`;

  const iframeSnippet = `<!-- MultipleDarkNews Responsive Tools Embed -->
<div style="position: relative; width: 100%; min-height: 850px; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
  <iframe 
    src="https://${toolsSubdomain}" 
    title="MultipleDarkNews 325+ Free Online Tools"
    width="100%" 
    height="850" 
    style="border: none; width: 100%; height: 850px; display: block;"
    loading="lazy"
    allow="clipboard-write; clipboard-read; microphone; camera"
  ></iframe>
</div>`;

  const navHtmlSnippet = `<!-- Add to your website header / navigation menu -->
<li class="nav-item">
  <a href="https://${toolsSubdomain}" target="_blank" rel="noopener" class="nav-link highlight-tools" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #020617; font-weight: 700; padding: 8px 18px; border-radius: 9999px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
    <span>⚡ 325+ Free Tools</span>
  </a>
</li>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offical Integration Guide</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Apni Website Par Tools Kaise Add Karein
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Aap apni main website <span className="text-cyan-400 font-bold underline">{domain}</span> par in 
            <span className="text-emerald-400 font-bold"> 325+ Production-Ready Tools</span> ko 4 alag-alag aasan tareeqon se 
            connect aur embed kar sakte hain. Choose your preferred method below!
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
              ✓ 100% In-Browser Execution
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
              ✓ Zero Server Hosting Cost (₹0)
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
              ✓ Full Google SEO Indexation
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'subdomain', label: 'Method 1: Subdomain (tools.multipledarknews.com)', icon: Globe },
          { id: 'subfolder', label: 'Method 2: Subfolder Proxy (/tools/)', icon: Server },
          { id: 'iframe', label: 'Method 3: iFrame Embed Widget', icon: Layers },
          { id: 'wordpress', label: 'Method 4: WordPress & Menu Link', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: SUBDOMAIN */}
      {activeTab === 'subdomain' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Method 1: Subdomain Setup (Recommended for #1 Google Ranking)
                </h2>
                <p className="text-sm text-slate-400">
                  Apne domain provider (GoDaddy, Hostinger, Namecheap, ya Cloudflare) me 1 CNAME record add karein.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 1: DNS Panel Kholein</span>
                <p className="text-sm text-slate-300">
                  Apne domain registrar ya Cloudflare dashboard me jakar <strong>DNS Management / DNS Records</strong> kholein.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 2: Add CNAME Record</span>
                <p className="text-sm text-slate-300">
                  Neeche diye gaye CNAME values ko copy karke DNS me "Add Record" par click karein.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 3: Instant Live</span>
                <p className="text-sm text-slate-300">
                  Kuch hi minutes me <code>tools.multipledarknews.com</code> live ho jayega automatic free SSL ke sath!
                </p>
              </div>
            </div>

            {/* DNS Table Card */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Copy This Exact DNS CNAME Record
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(cnameRecord, 'cname')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  {copiedId === 'cname' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'cname' ? 'Copied!' : 'Copy DNS Record'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Record Type:</span>
                  <span className="text-emerald-400 font-bold text-sm">CNAME</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Host / Name:</span>
                  <span className="text-cyan-400 font-bold text-sm">tools</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Target / Value:</span>
                  <span className="text-white font-bold text-xs break-all">{cloudRunHost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SUBFOLDER */}
      {activeTab === 'subfolder' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Method 2: Subfolder Proxy ({domain}/tools/)
                </h2>
                <p className="text-sm text-slate-400">
                  Agar aap tools ko directly main domain ki subdirectory (jaise <code>multipledarknews.com/tools/</code>) par dikhana chahte hain:
                </p>
              </div>
            </div>

            {/* Cloudflare Worker */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">
                    Cloudflare Worker Snippet (Zero Server Setup)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(cloudflareWorker, 'cf')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                >
                  {copiedId === 'cf' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'cf' ? 'Copied!' : 'Copy Worker Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
                {cloudflareWorker}
              </pre>
            </div>

            {/* Nginx Block */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Nginx Reverse Proxy Configuration (If using VPS / DigitalOcean / AWS)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(nginxConfig, 'nginx')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                >
                  {copiedId === 'nginx' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'nginx' ? 'Copied!' : 'Copy Nginx Config'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                {nginxConfig}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: IFRAME EMBED */}
      {activeTab === 'iframe' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Method 3: Responsive iFrame Embed
                </h2>
                <p className="text-sm text-slate-400">
                  Kisi bhi HTML page, WordPress post, Blog, ya Custom CMS me 1 line copy-paste karke embed karein.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Copy iFrame HTML Code
                </span>
                <button
                  onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  {copiedId === 'iframe' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'iframe' ? 'Copied!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed border border-slate-800">
                {iframeSnippet}
              </pre>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Single Tool Direct Embed Feature</span>
              </h3>
              <p className="text-xs text-slate-300">
                Aap kisi specific tool ko bhi embed kar sakte hain! URL ke aage bas tool ka hash add karein:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-lg text-slate-300 border border-slate-800">
                  PDF Compressor: <code>https://{toolsSubdomain}/#tool/pdf-compressor</code>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-slate-300 border border-slate-800">
                  Image Resizer: <code>https://{toolsSubdomain}/#tool/image-resizer</code>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-slate-300 border border-slate-800">
                  SERP Preview: <code>https://{toolsSubdomain}/#tool/serp-snippet-preview</code>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-slate-300 border border-slate-800">
                  Password Gen: <code>https://{toolsSubdomain}/#tool/password-generator</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: WORDPRESS & MENU */}
      {activeTab === 'wordpress' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Method 4: WordPress Menu & Navigation Bar Integration
                </h2>
                <p className="text-sm text-slate-400">
                  Apni website ke top menu bar me direct "325+ Free Tools" button add karein taaki har visitor tools use kar sake.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WordPress Step-by-Step */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  WordPress Dashboard Steps
                </h3>
                <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>WordPress Admin Panel me login karein: <code>{domain}/wp-admin</code></li>
                  <li>Left sidebar me <strong>Appearance → Menus</strong> par click karein.</li>
                  <li>Left column se <strong>"Custom Links"</strong> option select karein.</li>
                  <li><strong>URL</strong> me daalein: <code>https://{toolsSubdomain}</code></li>
                  <li><strong>Link Text</strong> me daalein: <code>⚡ 325+ Free Tools</code></li>
                  <li><strong>"Add to Menu"</strong> par click karein aur right corner me <strong>"Save Menu"</strong> daba dein!</li>
                </ol>
              </div>

              {/* Raw HTML Nav Link */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                    Custom HTML / PHP Header Code
                  </h3>
                  <button
                    onClick={() => copyToClipboard(navHtmlSnippet, 'nav')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold"
                  >
                    {copiedId === 'nav' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'nav' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
                  {navHtmlSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production-Ready Assurance & Guarantee Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          <h2 className="text-2xl font-black text-white">
            100% Production Ready & Guaranteed Zero Failure
          </h2>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          MultipleDarkNews Tools platform ke sabhi <strong>325 tools</strong> ab <strong>PRODUCTION_READY</strong> hain. Har ek tool 
          device-level WebAssembly, Web Crypto CSPRNG, HTML5 Canvas, aur Web Audio oscillators par execute hota hai. 
          User ka koi bhi document ya data remote server par transfer nahi hota, isiliye zero bandwidth limit aur 
          zero server maintenance cost rehti hai!
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>Explore All 325 Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://multipledarknews.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all border border-slate-700"
          >
            <span>Visit multipledarknews.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
