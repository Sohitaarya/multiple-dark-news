import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { CategoryPage } from './components/pages/CategoryPage';
import { ToolRunner } from './components/tools/ToolRunner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditReportPage } from './components/pages/AuditReportPage';
import { LegalPage } from './components/pages/LegalPage';
import { SitemapPage } from './components/pages/SitemapPage';
import { IntegrationGuidePage } from './components/pages/IntegrationGuidePage';
import { SohitPortfolioPage } from './components/portfolio/SohitPortfolioPage';
import { SEOHead } from './components/common/SEOHead';
import { GoogleAdsenseScript } from './components/common/GoogleAdsense';
import { getToolBySlug } from './data/toolsRegistry';
import { getCategoryById } from './data/categories';
import { ToolCategory } from './types/tools';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('tools');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Read URL hash on load for deep linking and iframe address bar synchronization
  useEffect(() => {
    const parseHash = () => {
      let rawHash = window.location.hash;
      
      // If running inside Hostinger iframe, attempt reading parent address bar hash
      try {
        if (window.parent && window.parent !== window && window.parent.location.hash) {
          rawHash = window.parent.location.hash;
        }
      } catch (e) {
        // Cross-origin fallback check query string
      }

      const hash = rawHash.replace(/^#\/?/, '');
      if (hash) {
        const parts = hash.split('/');
        if (parts[0] === 'tool' && parts[1]) {
          setCurrentView('tool');
          setCurrentParam(parts[1]);
          return;
        } else if (parts[0] === 'category' && parts[1]) {
          setCurrentView('category');
          setCurrentParam(parts[1]);
          return;
        } else if (parts[0] === 'portfolio') {
          setCurrentView('portfolio');
          setCurrentParam(undefined);
          if (parts[1]) {
            setTimeout(() => {
              const el = document.getElementById(parts[1]);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          return;
        } else if (['about', 'services', 'tools-ecosystem', 'projects', 'progress', 'social', 'journey', 'contact', 'faq'].includes(parts[0])) {
          setCurrentView('portfolio');
          setCurrentParam(undefined);
          setTimeout(() => {
            const el = document.getElementById(parts[0]);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        } else if (parts[0] === 'tools' || parts[0] === 'home') {
          setCurrentView('tools');
          setCurrentParam(undefined);
          return;
        } else if (['admin', 'audit', 'privacy', 'terms', 'sitemap', 'seo-hub', 'integration', 'embed', 'add-to-website'].includes(parts[0])) {
          const v = parts[0];
          if (v === 'seo-hub') setCurrentView('sitemap');
          else if (v === 'embed' || v === 'add-to-website') setCurrentView('integration');
          else setCurrentView(v);
          setCurrentParam(undefined);
          return;
        }
      } else {
        setCurrentView('tools');
        setCurrentParam(undefined);
        return;
      }

      // Check query params
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('tool')) {
        setCurrentView('tool');
        setCurrentParam(searchParams.get('tool')!);
      } else if (searchParams.get('category')) {
        setCurrentView('category');
        setCurrentParam(searchParams.get('category')!);
      } else if (searchParams.get('view')) {
        const v = searchParams.get('view')!;
        setCurrentView(v === 'seo-hub' ? 'sitemap' : v);
      }
    };

    parseHash();

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MDN_HASH_SYNC' && e.data.hash) {
        if (window.location.hash !== e.data.hash) {
          window.location.hash = e.data.hash;
          parseHash();
        }
      }
    };

    window.addEventListener('hashchange', parseHash);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    const effectiveView = view === 'seo-hub' ? 'sitemap' : view;
    setCurrentView(effectiveView);
    setCurrentParam(param);

    let targetHash = `#${effectiveView}`;
    if (param) {
      targetHash = `#${effectiveView}/${param}`;
    } else if (effectiveView === 'portfolio') {
      targetHash = '#portfolio';
    }

    // Update local location hash
    window.location.hash = targetHash;

    // Synchronize parent browser address bar if running inside Hostinger iframe
    try {
      if (window.parent && window.parent !== window) {
        window.parent.location.hash = targetHash;
        if (window.parent.history && window.parent.history.replaceState) {
          window.parent.history.replaceState(null, '', targetHash);
        }
      }
    } catch (e) {
      // Cross-origin security boundary fallback
    }

    // Always post message to parent container for URL address bar sync
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'MDN_ROUTE_CHANGE', hash: targetHash }, '*');
      }
    } catch (e) {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve current tool if in tool view
  const currentTool = currentView === 'tool' && currentParam ? getToolBySlug(currentParam) : undefined;
  const currentCategory = currentView === 'category' && currentParam ? getCategoryById(currentParam as ToolCategory) : undefined;

  // Compute dynamic SEO metadata optimized for #1 Google Ranking
  let seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
  let seoDescription = 'Official personal portfolio of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
  let canonicalUrl = 'https://tools.multipledarknews.com';
  let keywords = ['sohit aarya', 'sohit aarya portfolio', 'web developer', 'multipledarknews', '331 tools', 'digital creator'];
  let breadcrumbs = [{ name: 'Home', url: 'https://tools.multipledarknews.com' }];

  if (currentView === 'portfolio') {
    seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
    seoDescription = 'Official personal portfolio of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
    canonicalUrl = 'https://tools.multipledarknews.com/#portfolio';
    keywords = ['sohit aarya', 'sohit aarya portfolio', 'full-stack developer', 'creative technologist', '331 tools', 'multipledarknews'];
  } else if (currentView === 'tools' || currentView === 'home') {
    seoTitle = 'MultipleDarkNews Tools — 331+ Free Online PDF, Image, Developer & SEO Tools';
    seoDescription = 'Fast, 100% private online tools platform by Sohit Aarya & MultipleDarkNews. Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud uploads.';
    canonicalUrl = 'https://tools.multipledarknews.com/#tools';
    keywords = ['free online tools', 'pdf tools', 'image editor', 'developer tools', 'seo tools', 'multipledarknews', '331 tools'];
    breadcrumbs = [
      { name: 'Portfolio', url: 'https://tools.multipledarknews.com/#portfolio' },
      { name: '331 Tools Suite', url: 'https://tools.multipledarknews.com/#tools' }
    ];
  } else if (currentTool) {
    seoTitle = currentTool.seoTitle || `${currentTool.name} Online - Free & Private | MultipleDarkNews Tools`;
    seoDescription = currentTool.seoDescription || currentTool.description;
    canonicalUrl = `https://tools.multipledarknews.com/#tool/${currentTool.slug}`;
    keywords = currentTool.keywords || [currentTool.name.toLowerCase(), 'free online tool'];
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: `${currentTool.category.toUpperCase()} Tools`, url: `https://tools.multipledarknews.com/#category/${currentTool.category}` },
      { name: currentTool.name, url: `https://tools.multipledarknews.com/#tool/${currentTool.slug}` },
    ];
  } else if (currentCategory) {
    seoTitle = `${currentCategory.name} Online — 100% Free Client-Side Tools Suite | MultipleDarkNews`;
    seoDescription = `${currentCategory.shortDescription} Access all ${currentCategory.toolCount} free tools with zero file uploads and instant in-browser execution.`;
    canonicalUrl = `https://tools.multipledarknews.com/#category/${currentCategory.id}`;
    keywords = [currentCategory.name.toLowerCase(), `${currentCategory.name.toLowerCase()} online`, 'free browser tools'];
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: currentCategory.name, url: `https://tools.multipledarknews.com/#category/${currentCategory.id}` },
    ];
  } else if (currentView === 'admin') {
    seoTitle = 'Admin Dashboard & Central Tool Registry | MultipleDarkNews Tools';
    seoDescription = 'Platform governance and real-time monitoring dashboard for MultipleDarkNews central tool registry.';
    canonicalUrl = 'https://tools.multipledarknews.com/#admin';
  } else if (currentView === 'audit') {
    seoTitle = 'Technical Audit Report & Verification | MultipleDarkNews Tools';
    seoDescription = 'Comprehensive Phase 0 and Phase 8 engineering audit, test coverage verification, and privacy compliance report.';
    canonicalUrl = 'https://tools.multipledarknews.com/#audit';
  } else if (currentView === 'sitemap') {
    seoTitle = 'XML Sitemap & Google Indexation Directory | MultipleDarkNews Tools';
    seoDescription = 'Complete XML sitemap index containing all 331+ online tools for search engine submission and verification.';
    canonicalUrl = 'https://tools.multipledarknews.com/#sitemap';
  } else if (currentView === 'integration') {
    seoTitle = 'Website Integration Guide — Add 331+ Tools to Your Website | MultipleDarkNews';
    seoDescription = 'Step-by-step guide to connect 331+ free tools to multipledarknews.com via Subdomain CNAME, Subfolder Nginx/Cloudflare proxy, or responsive iFrame embed.';
    canonicalUrl = 'https://tools.multipledarknews.com/#integration';
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: 'Website Integration Guide', url: 'https://tools.multipledarknews.com/#integration' },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-100 selection:bg-[#FF2638] selection:text-white">
      {/* Global Google AdSense Auto-Ads Injector */}
      <GoogleAdsenseScript />

      {/* Dynamic SEO Meta Tags & Schema.org JSON-LD */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        keywords={keywords}
        breadcrumbs={breadcrumbs}
        noIndex={currentView === 'admin'}
        faq={currentTool ? currentTool.faq : undefined}
        howToSteps={
          currentTool
            ? [
                { name: 'Select or Input', text: `Upload file or provide string input into the ${currentTool.name} workspace.` },
                { name: 'Configure Options', text: 'Adjust desired transformation parameters, quality, or formatting.' },
                { name: 'Execute & Download', text: 'Click execute to generate instant unwatermarked results in browser memory.' },
              ]
            : undefined
        }
        toolCategory={currentTool ? currentTool.category : undefined}
        toolName={currentTool ? currentTool.name : undefined}
      />

      {/* Flagship View: Sohit Aarya Personal Portfolio */}
      {currentView === 'portfolio' ? (
        <SohitPortfolioPage
          onOpenTool={(slug) => handleNavigate('tool', slug)}
          onOpenCategory={(cat) => handleNavigate('category', cat)}
          onNavigateToolsSuite={() => handleNavigate('tools')}
          onNavigateAdmin={() => handleNavigate('admin')}
        />
      ) : (
        <>
          {/* Main Top Header for Tools Suite & Sub-Pages */}
          <Header currentView={currentView} onNavigate={handleNavigate} />

          {/* Main Content Router */}
          <main className="flex-1">
            {(currentView === 'tools' || currentView === 'home') && (
              <HomePage onNavigate={handleNavigate} />
            )}

            {currentView === 'category' && currentParam && (
              <CategoryPage key={currentParam} categorySlug={currentParam} onNavigate={handleNavigate} />
            )}

            {currentView === 'tool' && currentTool && (
              <ToolRunner key={currentTool.id} tool={currentTool} onNavigate={handleNavigate} />
            )}

            {currentView === 'tool' && !currentTool && (
              <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-3xl bg-rose-500/10 text-rose-400 font-mono font-extrabold text-2xl">
                  404
                </div>
                <h1 className="text-2xl font-bold text-white">Tool Not Found</h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                  The tool URL you requested could not be located in the 331-tool registry.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleNavigate('portfolio')}
                    className="px-5 py-2.5 rounded-xl bg-[#FF2638] hover:bg-[#e0192b] text-white text-xs font-bold transition-colors"
                  >
                    Go to Sohit Aarya Portfolio
                  </button>
                  <button
                    onClick={() => handleNavigate('tools')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    View All 331 Tools
                  </button>
                </div>
              </div>
            )}

            {currentView === 'admin' && (
              <AdminDashboard onNavigateHome={() => handleNavigate('portfolio')} />
            )}

            {currentView === 'audit' && <AuditReportPage />}

            {currentView === 'sitemap' && <SitemapPage onNavigate={handleNavigate} />}

            {currentView === 'integration' && (
              <IntegrationGuidePage
                onNavigateHome={() => handleNavigate('portfolio')}
                onNavigateCategory={(cat) => handleNavigate('category', cat)}
              />
            )}

            {(currentView === 'privacy' || currentView === 'terms') && (
              <LegalPage key={currentView} type={currentView as 'privacy' | 'terms'} />
            )}
          </main>

          {/* Global Footer */}
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}
