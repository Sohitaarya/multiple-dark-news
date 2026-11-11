import React, { useState, useEffect, useCallback } from 'react';
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
import { NotFoundPage } from './components/pages/NotFoundPage';
import { SEOHead } from './components/common/SEOHead';
import { GoogleAdsenseScript } from './components/common/GoogleAdsense';
import { getToolBySlug } from './data/toolsRegistry';
import { getCategoryById } from './data/categories';
import { ToolCategory } from './types/tools';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('tools');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Robust URL Route Parser supporting HTML5 Clean Paths (/pdf-compressor), Hash (#tool/pdf-compressor), and Query Params
  const parseCurrentLocation = useCallback(() => {
    let rawPath = window.location.pathname;
    try {
      rawPath = decodeURIComponent(rawPath);
    } catch {
      // fallback
    }
    let pathname = rawPath.toLowerCase().replace(/\/+$/, '');
    let hashStr = window.location.hash.toLowerCase().replace(/^#\/?/, '');

    // Check query params fallback
    const searchParams = new URLSearchParams(window.location.search);
    const queryTool = searchParams.get('tool');
    const queryCategory = searchParams.get('category');
    const queryView = searchParams.get('view');

    if (queryTool) {
      const toolMatch = getToolBySlug(queryTool);
      const targetSlug = toolMatch ? toolMatch.slug : queryTool;
      setCurrentView('tool');
      setCurrentParam(targetSlug);
      if (window.history && window.history.replaceState) {
        window.history.replaceState({ view: 'tool', param: targetSlug }, '', `/${targetSlug}`);
      }
      return;
    }
    if (queryCategory) {
      setCurrentView('category');
      setCurrentParam(queryCategory);
      if (window.history && window.history.replaceState) {
        window.history.replaceState({ view: 'category', param: queryCategory }, '', `/category/${queryCategory}`);
      }
      return;
    }
    if (queryView) {
      const effective = queryView === 'seo-hub' ? 'sitemap' : queryView;
      setCurrentView(effective);
      setCurrentParam(undefined);
      if (window.history && window.history.replaceState) {
        window.history.replaceState({ view: effective }, '', `/${effective}`);
      }
      return;
    }

    // 1. Check Hash Routing (e.g. #tool/pdf-compressor, #category/pdf, #portfolio, #admin)
    if (hashStr) {
      const parts = hashStr.split('/');
      if (parts[0] === 'tool' && parts[1]) {
        const toolMatch = getToolBySlug(parts[1]);
        const targetSlug = toolMatch ? toolMatch.slug : parts[1];
        setCurrentView('tool');
        setCurrentParam(targetSlug);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'tool', param: targetSlug }, '', `/${targetSlug}`);
        }
        return;
      }
      if (parts[0] === 'category' && parts[1]) {
        setCurrentView('category');
        setCurrentParam(parts[1]);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'category', param: parts[1] }, '', `/category/${parts[1]}`);
        }
        return;
      }
      if (parts[0] === 'portfolio') {
        setCurrentView('portfolio');
        setCurrentParam(undefined);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'portfolio' }, '', `/portfolio`);
        }
        if (parts[1]) {
          setTimeout(() => {
            const el = document.getElementById(parts[1]);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
        return;
      }
      if (['about', 'services', 'tools-ecosystem', 'projects', 'progress', 'social', 'journey', 'contact', 'faq'].includes(parts[0])) {
        setCurrentView('portfolio');
        setCurrentParam(undefined);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'portfolio' }, '', `/portfolio#${parts[0]}`);
        }
        setTimeout(() => {
          const el = document.getElementById(parts[0]);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
      if (parts[0] === 'tools' || parts[0] === 'home') {
        setCurrentView('tools');
        setCurrentParam(undefined);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'tools' }, '', `/`);
        }
        return;
      }
      if (['admin', 'audit', 'privacy', 'terms', 'sitemap', 'seo-hub', 'integration', 'embed', 'add-to-website'].includes(parts[0])) {
        const v = parts[0];
        const effective = v === 'seo-hub' ? 'sitemap' : (v === 'embed' || v === 'add-to-website') ? 'integration' : v;
        setCurrentView(effective);
        setCurrentParam(undefined);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: effective }, '', `/${effective}`);
        }
        return;
      }
      // Check if hash matches a direct tool slug (e.g. #pdf-compressor or #study-timetable-maker)
      const toolMatch = getToolBySlug(parts[0]);
      if (toolMatch) {
        setCurrentView('tool');
        setCurrentParam(toolMatch.slug);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({ view: 'tool', param: toolMatch.slug }, '', `/${toolMatch.slug}`);
        }
        return;
      }
    }

    // 2. Check Clean Path Routing (e.g. /portfolio, /pdf-compressor, /study-timetable-maker, /category/pdf)
    if (pathname && pathname !== '' && pathname !== '/') {
      const pathParts = pathname.split('/').filter(Boolean);

      if (pathParts[0] === 'portfolio') {
        setCurrentView('portfolio');
        setCurrentParam(undefined);
        return;
      }
      if (pathParts[0] === 'tools' || pathParts[0] === 'home') {
        setCurrentView('tools');
        setCurrentParam(undefined);
        return;
      }
      if (pathParts[0] === 'category' && pathParts[1]) {
        setCurrentView('category');
        setCurrentParam(pathParts[1]);
        return;
      }
      if (pathParts[0] === 'tool' && pathParts[1]) {
        const toolMatch = getToolBySlug(pathParts[1]);
        const targetSlug = toolMatch ? toolMatch.slug : pathParts[1];
        setCurrentView('tool');
        setCurrentParam(targetSlug);
        return;
      }
      if (['admin', 'audit', 'privacy', 'terms', 'sitemap', 'seo-hub', 'integration', 'embed', 'add-to-website'].includes(pathParts[0])) {
        const v = pathParts[0];
        if (v === 'seo-hub') setCurrentView('sitemap');
        else if (v === 'embed' || v === 'add-to-website') setCurrentView('integration');
        else setCurrentView(v);
        setCurrentParam(undefined);
        return;
      }

      // Root path tool matching (e.g. /pdf-compressor, /study-timetable-maker, /image-resizer, /word-counter)
      const directTool = getToolBySlug(pathParts[0]);
      if (directTool) {
        setCurrentView('tool');
        setCurrentParam(directTool.slug);
        return;
      }

      // Root path category matching (e.g. /pdf, /image, /developer, /calculators, /education)
      const directCategory = getCategoryById(pathParts[0] as ToolCategory);
      if (directCategory) {
        setCurrentView('category');
        setCurrentParam(directCategory.id);
        return;
      }

      // Unrecognized Route -> Render 404 Page
      setCurrentView('404');
      setCurrentParam(pathParts[0]);
      return;
    }

    // Default Root View: 331 Tools Suite
    setCurrentView('tools');
    setCurrentParam(undefined);
  }, []);

  // Listen for browser popstate and hashchange events for Back & Forward button support
  useEffect(() => {
    parseCurrentLocation();

    const handlePopState = () => parseCurrentLocation();
    const handleHashChange = () => parseCurrentLocation();
    const handleRouteMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MDN_HASH_SYNC' && e.data.hash) {
        if (window.location.hash !== e.data.hash) {
          window.location.hash = e.data.hash;
          parseCurrentLocation();
        }
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

  // Handle User Navigation: Updates HTML5 History PushState + Hash + Location Sync
  const handleNavigate = (view: string, param?: string) => {
    const effectiveView = view === 'seo-hub' ? 'sitemap' : view;
    setCurrentView(effectiveView);
    setCurrentParam(param);

    let cleanPath = '/';
    let targetHash = `#${effectiveView}`;

    if (effectiveView === 'portfolio') {
      cleanPath = '/portfolio';
      targetHash = '#portfolio';
    } else if (effectiveView === 'tool' && param) {
      cleanPath = `/${param}`;
      targetHash = `#tool/${param}`;
    } else if (effectiveView === 'category' && param) {
      cleanPath = `/category/${param}`;
      targetHash = `#category/${param}`;
    } else if (effectiveView === 'tools' || effectiveView === 'home') {
      cleanPath = '/';
      targetHash = '#tools';
    } else if (['admin', 'audit', 'privacy', 'terms', 'sitemap', 'integration'].includes(effectiveView)) {
      cleanPath = `/${effectiveView}`;
      targetHash = `#${effectiveView}`;
    }

    // Update HTML5 History pushState so browser address bar displays clean, readable, unique URL
    try {
      if (window.location.pathname !== cleanPath) {
        window.history.pushState({ view: effectiveView, param }, '', cleanPath);
      }
    } catch (e) {
      // Fallback to hash update
    }

    // Update window.location.hash for backwards compatibility and bookmarking
    window.location.hash = targetHash;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve current tool or category
  const currentTool = currentView === 'tool' && currentParam ? getToolBySlug(currentParam) : undefined;
  const currentCategory = currentView === 'category' && currentParam ? getCategoryById(currentParam as ToolCategory) : undefined;

  // Compute dynamic SEO metadata and canonical URLs optimized for #1 Google Indexing
  let seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
  let seoDescription = 'Official personal portfolio of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
  let canonicalUrl = 'https://tools.multipledarknews.com';
  let keywords = ['sohit aarya', 'sohit aarya portfolio', 'web developer', 'multipledarknews', '331 tools', 'digital creator'];
  let breadcrumbs = [{ name: 'Home', url: 'https://tools.multipledarknews.com' }];

  if (currentView === 'portfolio') {
    seoTitle = 'Sohit Aarya — Developer, Creator & Founder | 331 Online Tools Ecosystem';
    seoDescription = 'Official personal portfolio of Sohit Aarya. Full-stack developer, digital creator, and founder of MultipleDarkNews and the 331 in-browser tools platform.';
    canonicalUrl = 'https://tools.multipledarknews.com/portfolio';
    keywords = ['sohit aarya', 'sohit aarya portfolio', 'full-stack developer', 'creative technologist', '331 tools', 'multipledarknews'];
  } else if (currentView === 'tools' || currentView === 'home') {
    seoTitle = 'MultipleDarkNews Tools — 331+ Free Online PDF, Image, Developer & SEO Tools';
    seoDescription = 'Fast, 100% private online tools platform by Sohit Aarya & MultipleDarkNews. Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud uploads.';
    canonicalUrl = 'https://tools.multipledarknews.com';
    keywords = ['free online tools', 'pdf tools', 'image editor', 'developer tools', 'seo tools', 'multipledarknews', '331 tools'];
    breadcrumbs = [
      { name: 'Portfolio', url: 'https://tools.multipledarknews.com/portfolio' },
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
  } else if (currentView === 'sitemap') {
    seoTitle = 'XML Sitemap & Google Indexation Directory | MultipleDarkNews Tools';
    seoDescription = 'Complete XML sitemap index containing all 331+ online tools for search engine submission and verification.';
    canonicalUrl = 'https://tools.multipledarknews.com/sitemap';
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

            {currentView === '404' && (
              <NotFoundPage onNavigate={handleNavigate} requestedSlug={currentParam} />
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
