import React, { useState, useEffect } from 'react';
import { PortfolioNavbar } from './PortfolioNavbar';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { WhatIDoSection } from './WhatIDoSection';
import { ToolsEcosystemSection } from './ToolsEcosystemSection';
import { ProjectsShowcaseSection } from './ProjectsShowcaseSection';
import { WorkInProgressSection } from './WorkInProgressSection';
import { SocialConnectSection } from './SocialConnectSection';
import { MyJourneySection } from './MyJourneySection';
import { ContactSection } from './ContactSection';
import { PortfolioFaqSection } from './PortfolioFaqSection';
import { PortfolioFooter } from './PortfolioFooter';
import { ThreeBackground } from './ThreeBackground';
import { MarqueeTicker } from './MarqueeTicker';
import { CyberDevice3D } from './CyberDevice3D';

interface SohitPortfolioPageProps {
  onOpenTool: (slug: string) => void;
  onOpenCategory: (categoryId: string) => void;
  onNavigateToolsSuite: () => void;
  onNavigateAdmin: () => void;
}

export const SohitPortfolioPage: React.FC<SohitPortfolioPageProps> = ({
  onOpenTool,
  onOpenCategory,
  onNavigateToolsSuite,
  onNavigateAdmin
}) => {
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Track active section with IntersectionObserver
  useEffect(() => {
    const sectionIds = [
      'hero',
      'projects',
      'about',
      'services',
      'tools-ecosystem',
      'progress',
      'social',
      'journey',
      'contact',
      'faq'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] text-white selection:bg-[#FF2638] selection:text-white font-sans overflow-x-hidden">
      {/* 3D Interactive Three.js Cybernetic Perspective Grid Background */}
      <ThreeBackground />

      {/* Sticky Top Navigation */}
      <PortfolioNavbar
        onNavigateTools={onNavigateToolsSuite}
        activeSection={activeSection}
      />

      {/* Hero Section with Sohit Aarya's 100% Authentic Face Locked Photograph */}
      <HeroSection
        onNavigateTools={() => scrollTo('tools-ecosystem')}
        onNavigateContact={() => scrollTo('contact')}
        onNavigateProjects={() => scrollTo('projects')}
      />

      {/* Infinite Marquee Ribbon 1: High-Energy Crimson Banner */}
      <MarqueeTicker variant="crimson" />

      {/* Interactive 3D Cyber Device Showcase (From Reference Video) */}
      <section className="relative py-12 bg-transparent z-10">
        <div className="max-w-7xl mx-auto px-4 text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#2b2b2b] text-[#FF2638] text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2638] animate-ping" />
            <span>INTERACTIVE 3D ECOSYSTEM CONSOLE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase mt-2">
            EXPERIENCE THE <span className="text-[#FF2638]">DIGITAL ENGINE</span>
          </h2>
        </div>
        <CyberDevice3D
          onOpenToolSuite={() => scrollTo('tools-ecosystem')}
          onOpenProjects={() => scrollTo('projects')}
        />
      </section>

      {/* SECTION 04: MY PROJECTS (Moved to top as requested by user) */}
      <ProjectsShowcaseSection
        onOpenTool={onOpenTool}
        onNavigateTools={onNavigateToolsSuite}
      />

      {/* Infinite Marquee Ribbon 2: Dark Cybernetic Ticker */}
      <MarqueeTicker variant="dark" reverse={true} />

      {/* Section 01: About Sohit Aarya (Cybernetic Radar Terminal) */}
      <AboutSection />

      {/* Section 02: What I Do (8 Engineering Disciplines) */}
      <WhatIDoSection
        onNavigateTools={() => scrollTo('tools-ecosystem')}
        onNavigateContact={() => scrollTo('contact')}
      />

      {/* Section 03: 331 Tools. One Digital Ecosystem (Clean Category Hub) */}
      <ToolsEcosystemSection
        onOpenTool={onOpenTool}
        onOpenCategory={onOpenCategory}
        onNavigateToolsFull={onNavigateToolsSuite}
      />

      {/* Section 05: Work In Progress */}
      <WorkInProgressSection />

      {/* Infinite Marquee Ribbon 3: Crimson Banner */}
      <MarqueeTicker variant="crimson" />

      {/* Section 06: Social Media Connect */}
      <SocialConnectSection />

      {/* Section 07: My Journey */}
      <MyJourneySection />

      {/* Section 08: Contact & Inquiries */}
      <ContactSection />

      {/* FAQ Section */}
      <PortfolioFaqSection />

      {/* Portfolio Footer */}
      <PortfolioFooter
        onNavigateTools={onNavigateToolsSuite}
        onNavigateAdmin={onNavigateAdmin}
      />
    </div>
  );
};
