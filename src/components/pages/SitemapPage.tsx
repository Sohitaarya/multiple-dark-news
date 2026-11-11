import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { generateXmlSitemap, getSitemapEntries, SitemapEntry } from '../../services/sitemapGenerator';
import { generateRobotsTxt } from '../../services/seoToolsEngine';

interface SitemapPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ onNavigate }) => {
  const [domain, setDomain] = useState('https://multipledarknews.com');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const entries = getSitemapEntries(domain);
  const filteredEntries = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.loc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const xmlContent = generateXmlSitemap(domain);
  const robotsContent = generateRobotsTxt({ siteUrl: domain });

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownload = (content: string, filename: string, type = 'application/xml') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Google Search Console & SEO Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            XML Sitemap & Google Indexation Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            All 325+ online tools and 12 category directories are indexed with Schema.org specifications,
            high-priority sitemap entries, and robots.txt directives ready for instant Google Search Console submission.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleCopy(xmlContent, 'xml')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center gap-2"
          >
            {copiedType === 'xml' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedType === 'xml' ? 'Copied sitemap.xml!' : 'Copy sitemap.xml'}
          </button>
          <button
            onClick={() => handleDownload(xmlContent, 'sitemap.xml')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download sitemap.xml
          </button>
          <button
            onClick={() => handleCopy(robotsContent, 'robots')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
          >
            {copiedType === 'robots' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedType === 'robots' ? 'Copied robots.txt!' : 'Copy robots.txt'}
          </button>
          <button
            onClick={() => handleDownload(robotsContent, 'robots.txt', 'text/plain')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download robots.txt
          </button>
        </div>
      </div>

      {/* SEO Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Indexed URLs</div>
          <div className="text-2xl font-black text-white mt-1">{entries.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">100% Valid XML format</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tool Directories</div>
          <div className="text-2xl font-black text-rose-400 mt-1">325 Tools</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 12 categories</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Index Priority</div>
          <div className="text-2xl font-black text-amber-400 mt-1">1.0 / 0.9</div>
          <div className="text-[11px] text-slate-400 mt-1">Daily / weekly crawl rate</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schema Coverage</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">6 Schemas</div>
          <div className="text-[11px] text-slate-400 mt-1">WebApps, FAQs, HowTo</div>
        </div>
      </div>

      {/* Search & URL Directory Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter indexed tools by keyword, slug, category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredEntries.length}</span> of {entries.length} URLs
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Page Name / Title</th>
                <th className="p-3">Indexed URL</th>
                <th className="p-3">Changefreq</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEntries.slice(0, 100).map((entry, idx) => (
                <tr key={`${entry.loc}-${idx}`} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-sans font-bold text-white max-w-xs truncate">
                    {entry.name}
                  </td>
                  <td className="p-3 text-rose-400 hover:text-rose-300 transition-colors max-w-sm truncate">
                    <a href={entry.loc} target="_blank" rel="noopener noreferrer">
                      {entry.loc}
                    </a>
                  </td>
                  <td className="p-3 text-slate-400">{entry.changefreq}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        Number(entry.priority) >= 0.9
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {entry.priority}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        const path = entry.loc.split('#')[1];
                        if (path) {
                          const parts = path.split('/');
                          onNavigate(parts[0], parts[1]);
                        } else {
                          onNavigate('home');
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEntries.length > 100 && (
          <div className="text-center text-xs text-slate-500 py-2">
            Showing first 100 entries. Use the search filter above to narrow results.
          </div>
        )}
      </div>

      {/* Google Submission Guidelines */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          How to Submit MultipleDarkNews Tools to Google for #1 Ranking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-rose-400 font-bold uppercase tracking-wider">Step 1: Google Search Console</div>
            <p>
              Log into <strong className="text-white">search.google.com/search-console</strong> with your Google account and select property <strong className="text-white">multipledarknews.com</strong>.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-rose-400 font-bold uppercase tracking-wider">Step 2: Submit Sitemap</div>
            <p>
              In the left sidebar, click <strong className="text-white">Sitemaps</strong>. Enter <code className="text-rose-400">sitemap.xml</code> and click Submit. All 325+ URLs will be crawled by Googlebot.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-rose-400 font-bold uppercase tracking-wider">Step 3: Rich Snippets & Indexation</div>
            <p>
              Google detects our embedded <strong className="text-white">Schema.org WebApplication</strong> and <strong className="text-white">FAQPage</strong> JSON-LD to rank with rich star ratings and FAQ dropdowns!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
