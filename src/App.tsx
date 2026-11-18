import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { CategoryPage } from './components/pages/CategoryPage';
import { ToolRunner } from './components/tools/ToolRunner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditReportPage } from './components/pages/AuditReportPage';
import { LegalPage } from './components/pages/LegalPage';
import { IntegrationGuidePage } from './components/pages/IntegrationGuidePage';
import { SohitPortfolioPage } from './components/portfolio/SohitPortfolioPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { SEOHead } from './components/common/SEOHead';
import { GoogleAdsenseScript } from './components/common/GoogleAdsense';
import { getToolBySlug } from './data/toolsRegistry';
import { getCategoryById } from './data/categories';
import { ToolCategory } from './types/tools';
import { resolveAppRoute } from './utils/routing';
import {
  I18nContext,
  SUPPORTED_LANGUAGES,
  SupportedLangCode,
  detectPreferredLanguage,
  getTranslations,
} from './utils/i18n';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('tools');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);
  const [lang, setLangState] = useState<SupportedLangCode>(() => detectPreferredLanguage());

  const setLang = useCallback((nextLang: SupportedLangCode) => {
    setLangState(nextLang);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mdn_preferred_lang', nextLang);
      }
    } catch {
      // ignore storage restrictions
    }
  }, []);

  const langMeta = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0],
    [lang]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = langMeta.rtl ? 'rtl' : 'ltr';
    }
  }, [lang, langMeta.rtl]);

  const i18nValue = useMemo(
    () => ({
      lang,
      setLang,
      t: getTranslations(lang),
      langMeta,
    }),
    [lang, setLang, langMeta]
  );

  // Robust URL Route Parser supporting Clean Paths (/study-timetable-maker, /sohit-aarya), Query Params, Legacy Hash migration, and strict 404s
  const parseCurrentLocation = useCallback(() => {
    const resolved = resolveAppRoute(
      window.location.pathname,
      window.location.search,
      window.location.hash,
      {
        findToolBySlug: (slug) => getToolBySlug(slug),
        hasCategory: (catId) => Boolean(getCategoryById(catId as ToolCategory)),
      }
    );

    setCurrentView(resolved.view);
    setCurrentParam(resolved.param);

    if (resolved.shouldReplaceUrl && window.history && window.history.replaceState) {
      try {
        window.history.replaceState({ view: resolved.view, param: resolved.param }, '', resolved.cleanPath);
      } catch {}
    }

    if (window.location.hash && !resolved.is404) {
      try {
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'MDN_ROUTE_CHANGE',
            path: resolved.cleanPath,
            slug: resolved.param,
            view: resolved.view,
          }, '*');
        }
      } catch {}
    }
  }, []);

  // Listen for browser popstate and hashchange events for Back & Forward button support
  useEffect(() => {
    parseCurrentLocation();

    const handlePopState = () => parseCurrentLocation();
    const handleHashChange = () => parseCurrentLocation();
    const handleRouteMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MDN_ROUTE_CHANGE' && e.data.path) {
        parseCurrentLocation();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('message', handleRouteMessage);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('message', handleRouteMessage);
    };
  }, [parseCurrentLocation]);

  // Synchronize parent iframe window address bar whenever currentView or currentParam updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      let cleanPath = '/';
      if (currentView === 'portfolio') {
        cleanPath = '/sohit-aarya';
      } else if (currentView === 'tool' && currentParam) {
        const toolMatch = getToolBySlug(currentParam);
        const targetSlug = toolMatch ? toolMatch.slug : currentParam;
        cleanPath = `/${targetSlug}`;
      } else if (currentView === 'category' && currentParam) {
        cleanPath = `/category/${currentParam}`;
      } else if (currentView === 'tools' || currentView === 'home') {
        cleanPath = '/';
      } else if (['admin', 'audit', 'privacy', 'terms', 'integration'].includes(currentView)) {
        cleanPath = `/${currentView}`;
      }

      try {
        window.parent.postMessage({
          type: 'MDN_ROUTE_CHANGE',
          path: cleanPath,
          slug: currentParam,
          view: currentView
        }, '*');
      } catch (e) {
        // ignore cross-origin restrictions
      }
    }
  }, [currentView, currentParam]);

  // Handle User Navigation: Updates HTML5 History PushState + Parent Iframe Bridge
  const handleNavigate = (view: string, param?: string) => {
    const effectiveView = view;
    setCurrentView(effectiveView);
    setCurrentParam(param);

    let cleanPath = '/';

    if (effectiveView === 'portfolio') {
      cleanPath = '/sohit-aarya';
    } else if (effectiveView === 'tool' && param) {
      const toolMatch = getToolBySlug(param);
      const targetSlug = toolMatch ? toolMatch.slug : param;
      cleanPath = `/${targetSlug}`;
    } else if (effectiveView === 'category' && param) {
      cleanPath = `/category/${param}`;
    } else if (effectiveView === 'tools' || effectiveView === 'home') {
      cleanPath = '/';
    } else if (['admin', 'audit', 'privacy', 'terms', 'integration'].includes(effectiveView)) {
      cleanPath = `/${effectiveView}`;
    }

    // 1. Update HTML5 History pushState so browser address bar displays clean, readable, unique URL without hash symbols
    try {
      if (window.history && window.history.pushState) {
        window.history.pushState({ view: effectiveView, param }, '', cleanPath);
      }
    } catch (e) {
      // fallback
    }

    // 2. Synchronize parent window address bar if embedded in an iframe (e.g. Hostinger wrapper)
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'MDN_ROUTE_CHANGE',
          path: cleanPath,
          slug: param,
          view: effectiveView
        }, '*');
        try {
          window.parent.history.pushState({ view: effectiveView, param }, '', cleanPath);
        } catch {}
      }
    } catch (e) {
      // ignore cross-origin restrictions
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve current tool or category
  const currentTool = currentView === 'tool' && currentParam ? getToolBySlug(currentParam) : undefined;
  const currentCategory = currentView === 'category' && currentParam ? getCategoryById(currentParam as ToolCategory) : undefined;

  // Compute dynamic SEO metadata and canonical URLs optimized for #1 Google Indexing
  let seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
  let seoDescription = 'Official personal profile of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
  let canonicalUrl = 'https://tools.multipledarknews.com';
  let keywords = ['sohit aarya', 'sohit aarya portfolio', 'web developer', 'multipledarknews', '331 tools', 'digital creator'];
  let breadcrumbs = [{ name: 'Home', url: 'https://tools.multipledarknews.com' }];

  if (currentView === 'portfolio') {
    seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
    seoDescription = 'Official profile of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
    canonicalUrl = 'https://tools.multipledarknews.com/sohit-aarya';
    keywords = ['sohit aarya', 'sohit aarya developer', 'full-stack developer', 'creative technologist', '331 tools', 'multipledarknews'];
  } else if (currentView === 'tools' || currentView === 'home') {
    seoTitle = 'MultipleDarkNews Tools — 331+ Free Online PDF, Image, Developer & SEO Tools';
    seoDescription = 'Fast, 100% private online tools platform by Sohit Aarya & MultipleDarkNews. Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud uploads.';
    canonicalUrl = 'https://tools.multipledarknews.com';
    keywords = ['free online tools', 'pdf tools', 'image editor', 'developer tools', 'seo tools', 'multipledarknews', '331 tools'];
    breadcrumbs = [
      { name: 'Sohit Aarya', url: 'https://tools.multipledarknews.com/sohit-aarya' },
      { name: '331 Tools Suite', url: 'https://tools.multipledarknews.com' }
    ];
  } else if (currentTool) {
    seoTitle = currentTool.seoTitle || `${currentTool.name} Online - Free & Private | MultipleDarkNews Tools`;
    seoDescription = currentTool.seoDescription || currentTool.description;
    canonicalUrl = `https://tools.multipledarknews.com/${currentTool.slug}`;
    keywords = currentTool.keywords || [currentTool.name.toLowerCase(), 'free online tool'];
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: `${currentTool.category.toUpperCase()} Tools`, url: `https://tools.multipledarknews.com/category/${currentTool.category}` },
      { name: currentTool.name, url: `https://tools.multipledarknews.com/${currentTool.slug}` },
    ];
  } else if (currentCategory) {
    seoTitle = `${currentCategory.name} Online — 100% Free Client-Side Tools Suite | MultipleDarkNews`;
    seoDescription = `${currentCategory.shortDescription} Access all ${currentCategory.toolCount} free tools with zero file uploads and instant in-browser execution.`;
    canonicalUrl = `https://tools.multipledarknews.com/category/${currentCategory.id}`;
    keywords = [currentCategory.name.toLowerCase(), `${currentCategory.name.toLowerCase()} online`, 'free browser tools'];
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: currentCategory.name, url: `https://tools.multipledarknews.com/category/${currentCategory.id}` },
    ];
  } else if (currentView === 'admin') {
    seoTitle = 'Admin Dashboard & Central Tool Registry | MultipleDarkNews Tools';
    seoDescription = 'Platform governance and real-time monitoring dashboard for MultipleDarkNews central tool registry.';
    canonicalUrl = 'https://tools.multipledarknews.com/admin';
  } else if (currentView === 'audit') {
    seoTitle = 'Technical Audit Report & Verification | MultipleDarkNews Tools';
    seoDescription = 'Comprehensive engineering audit, test coverage verification, and privacy compliance report.';
    canonicalUrl = 'https://tools.multipledarknews.com/audit';
  } else if (currentView === 'integration') {
    seoTitle = 'Website Integration Guide — Add 331+ Tools to Your Website | MultipleDarkNews';
    seoDescription = 'Step-by-step guide to connect 331+ free tools to multipledarknews.com via Subdomain CNAME, Subfolder proxy, or embed.';
    canonicalUrl = 'https://tools.multipledarknews.com/integration';
    breadcrumbs = [
      { name: 'Home', url: 'https://tools.multipledarknews.com' },
      { name: 'Website Integration Guide', url: 'https://tools.multipledarknews.com/integration' },
    ];
  } else if (currentView === '404') {
    seoTitle = '404 Page Not Found | MultipleDarkNews Tools Ecosystem';
    seoDescription = 'The requested tool or page route was not found in the 331-tool registry.';
    canonicalUrl = 'https://tools.multipledarknews.com';
  }

  return (
    <I18nContext.Provider value={i18nValue}>
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
          ogLocale={langMeta.ogLocale}
          inLanguage={lang}
          noIndex={currentView === 'admin' || currentView === '404'}
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

        {/* Flagship View: Sohit Aarya Official Profile */}
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

              {currentView === 'category' && currentCategory && (
                <CategoryPage key={currentCategory.id} categorySlug={currentCategory.id} onNavigate={handleNavigate} />
              )}

              {currentView === 'category' && !currentCategory && (
                <NotFoundPage onNavigate={handleNavigate} requestedSlug={currentParam ? `category/${currentParam}` : 'category'} />
              )}

              {currentView === 'tool' && currentTool && (
                <ToolRunner key={currentTool.id} tool={currentTool} onNavigate={handleNavigate} />
              )}

              {currentView === 'tool' && !currentTool && (
                <NotFoundPage onNavigate={handleNavigate} requestedSlug={currentParam ? `tool/${currentParam}` : 'tool'} />
              )}

              {currentView === '404' && (
                <NotFoundPage onNavigate={handleNavigate} requestedSlug={currentParam} />
              )}

              {currentView === 'admin' && (
                <AdminDashboard onNavigateHome={() => handleNavigate('portfolio')} />
              )}

              {currentView === 'audit' && <AuditReportPage />}

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
    </I18nContext.Provider>
  );
}
