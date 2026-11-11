import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  ogImage?: string;
  breadcrumbs?: BreadcrumbItem[];
  faq?: FaqItem[];
  howToSteps?: HowToStep[];
  toolCategory?: string;
  toolName?: string;
  ratingValue?: number;
  ratingCount?: number;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  keywords,
  ogType = 'website',
  ogImage = 'https://tools.multipledarknews.com/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
  breadcrumbs,
  faq,
  howToSteps,
  toolCategory,
  toolName,
  ratingValue = 4.9,
  ratingCount = 1420,
  noIndex = false,
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper for meta tags
    const setMeta = (nameOrProp: string, content: string, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard & Global Meta Tags
    setMeta('description', description);
    if (keywords && keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('author', 'Sohit Aarya — MultipleDarkNews & Tools');
    setMeta('coverage', 'Worldwide');
    setMeta('distribution', 'Global');
    setMeta('target', 'all');
    setMeta('rating', 'General');
    setMeta('geo.region', 'US, CA, GB, DE, IN, AE, NG, AU, Global');
    setMeta('geo.placename', 'Worldwide');

    // 3. Canonical Link & Global Hreflang Tags
    const url = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://tools.multipledarknews.com');
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', url);

    // Dynamic Hreflang Tags for Global Search Engines
    const languages = [
      { code: 'en', href: url },
      { code: 'en-us', href: `${url}?lang=en-us` },
      { code: 'en-gb', href: `${url}?lang=en-gb` },
      { code: 'en-ca', href: `${url}?lang=en-ca` },
      { code: 'en-au', href: `${url}?lang=en-au` },
      { code: 'hi', href: `${url}?lang=hi` },
      { code: 'es', href: `${url}?lang=es` },
      { code: 'fr', href: `${url}?lang=fr` },
      { code: 'ar', href: `${url}?lang=ar` },
      { code: 'x-default', href: url },
    ];

    languages.forEach((lang) => {
      let hreflangTag = document.querySelector(`link[hreflang="${lang.code}"]`);
      if (!hreflangTag) {
        hreflangTag = document.createElement('link');
        hreflangTag.setAttribute('rel', 'alternate');
        hreflangTag.setAttribute('hreflang', lang.code);
        document.head.appendChild(hreflangTag);
      }
      hreflangTag.setAttribute('href', lang.href);
    });

    // 4. OpenGraph Tags
    setMeta('og:type', ogType, true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:site_name', 'MultipleDarkNews Tools — 331+ Free Online Web Tools', true);
    setMeta('og:image', ogImage, true);
    setMeta('og:locale', 'en_US', true);

    // 5. Twitter Card Tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:site', '@MultipleDarkNews');
    setMeta('twitter:creator', '@MultipleDarkNews');

    // 6. Schema.org JSON-LD Structured Data Graph
    const schemaGraph: any[] = [
      // Person / Founder Schema
      {
        '@type': 'Person',
        '@id': 'https://tools.multipledarknews.com/#person',
        name: 'Sohit Aarya',
        url: 'https://tools.multipledarknews.com',
        email: 'sohitaarya98@gmail.com',
        jobTitle: 'Full-Stack Developer, AI Creator & Founder',
        areaServed: 'Worldwide',
        sameAs: [
          'https://youtube.com/@thynkova?si=9diIjidVgHqqTixg',
          'https://pin.it/1yvzB0klX',
          'https://www.linkedin.com/in/sohit-aarya-81704a321?utm_source=share_via&utm_content=profile&utm_medium=member_android',
          'https://www.instagram.com/sohit__aarya?dlrf=NWZsYjNsZnZ3ZWdm',
          'https://www.facebook.com/share/1A1CNnw6VY/',
          'https://github.com/Sohitaarya',
        ],
      },
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': 'https://tools.multipledarknews.com/#organization',
        name: 'MultipleDarkNews Tools',
        url: 'https://tools.multipledarknews.com',
        email: 'sohitaarya98@gmail.com',
        founder: { '@id': 'https://tools.multipledarknews.com/#person' },
        areaServed: 'Worldwide',
        logo: {
          '@type': 'ImageObject',
          url: 'https://tools.multipledarknews.com/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
        },
        sameAs: ['https://github.com/Sohitaarya'],
      },
      // WebSite with SearchAction
      {
        '@type': 'WebSite',
        '@id': 'https://tools.multipledarknews.com/#website',
        url: 'https://tools.multipledarknews.com',
        name: 'MultipleDarkNews Tools',
        description: 'Complete suite of 331+ free online PDF, image, developer, SEO, and calculation tools.',
        publisher: {
          '@id': 'https://tools.multipledarknews.com/#organization',
        },
        inLanguage: ['en', 'hi', 'es', 'fr', 'ar'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://tools.multipledarknews.com/#search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ];

    // If on a Tool Page: Add WebApplication / SoftwareApplication Schema
    if (toolName) {
      schemaGraph.push({
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: toolName,
        url: url,
        applicationCategory: toolCategory ? `${toolCategory}Application` : 'UtilityApplication',
        operatingSystem: 'All (Web Browser, Windows, macOS, Linux, iOS, Android across USA, Canada, UK, Europe, Asia, Africa, Worldwide)',
        description: description,
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Hindi', 'Spanish', 'French', 'Arabic'],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        author: { '@id': 'https://tools.multipledarknews.com/#person' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingValue.toString(),
          reviewCount: ratingCount.toString(),
          bestRating: '5',
          worstRating: '1',
        },
      });
    }

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemaGraph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url,
        })),
      });
    }

    // FAQPage Schema (for Google SERP Rich FAQ Dropdowns)
    if (faq && faq.length > 0) {
      schemaGraph.push({
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    // HowTo Schema (for Google SERP Step-by-Step Rich Guides)
    if (howToSteps && howToSteps.length > 0) {
      schemaGraph.push({
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: `How to use ${toolName || 'this tool'} online`,
        description: `Step-by-step instructions for using ${toolName || 'tool'} for free with zero installation.`,
        step: howToSteps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.name,
          text: step.text,
        })),
      });
    }

    // Inject into head
    let scriptTag = document.getElementById('seo-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': schemaGraph,
    });
  }, [
    title,
    description,
    canonicalUrl,
    keywords,
    ogType,
    ogImage,
    breadcrumbs,
    faq,
    howToSteps,
    toolCategory,
    toolName,
    ratingValue,
    ratingCount,
  ]);

  return null;
};
