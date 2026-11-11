import React from 'react';
import {
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Code2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { SOHIT_AARYA_DATA, ProjectItem } from '../../data/sohitPortfolioData';

interface ProjectsShowcaseSectionProps {
  onOpenTool: (slug: string) => void;
  onNavigateTools: () => void;
}

export const ProjectsShowcaseSection: React.FC<ProjectsShowcaseSectionProps> = ({
  onOpenTool,
  onNavigateTools
}) => {
  const projects = SOHIT_AARYA_DATA.projects;

  return (
    <section id="projects" className="relative py-28 bg-[#080808] border-t border-[#1a1a1a] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#FF2638]/6 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 04</span>
              <span className="text-neutral-600">/</span>
              <span>FEATURED WORKS &amp; SYSTEMS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              MY <span className="text-[#FF2638]">PROJECTS</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            DIGITAL PRODUCTS &amp; ECOSYSTEMS
          </div>
        </div>

        {/* Large Editorial Project Cards */}
        <div className="space-y-12">
          {projects.map((project, index) => {
            const isEven = index % 2 === 1;

            return (
              <div
                key={project.id}
                className="p-8 sm:p-10 rounded-3xl bg-[#101010] border border-[#222222] hover:border-[#FF2638]/40 transition-all duration-300 shadow-2xl relative overflow-hidden group"
              >
                {/* Subtle card background accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF2638]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Visual / Screenshot / Graphic Preview Column */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-black border border-[#262626] p-4 shadow-xl group-hover:border-[#FF2638]/30 transition-colors aspect-video sm:aspect-[4/3] flex flex-col justify-between">
                      {/* Top Bar inside card preview */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF2638]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                          <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                          {project.year} • {project.category}
                        </span>
                      </div>

                      {/* Center Graphic */}
                      <div className="my-auto text-center space-y-2 p-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF2638]/10 border border-[#FF2638]/30 text-[#FF2638] flex items-center justify-center font-mono font-black text-xl shadow-lg">
                          {project.number}
                        </div>
                        <div className="text-lg font-black text-white uppercase tracking-tight">
                          {project.title}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono">
                          {project.subtitle}
                        </div>
                      </div>

                      {/* Bottom Status Tag */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            project.status === 'COMPLETED'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : project.status === 'BETA_ACTIVE'
                              ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>{project.status.replace('_', ' ')}</span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Production Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Details Column */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#FF2638] tracking-widest uppercase">
                          PROJECT {project.number}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-xs font-mono text-neutral-400 uppercase">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                        {project.title}
                      </h3>
                      <div className="text-sm font-semibold text-neutral-400">
                        {project.subtitle}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-medium">
                      {project.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                        Core Innovations:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2638] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                        Architecture &amp; Stacks:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#181818] text-neutral-300 border border-[#262626]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Action Links */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {project.toolSlug && (
                        <button
                          onClick={() => onOpenTool(project.toolSlug!)}
                          className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] to-[#cc0016] hover:from-[#ff3d4e] hover:to-[#e6001a] shadow-lg shadow-[#FF2638]/25 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>Launch Live In-Browser</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {project.liveUrl && project.liveUrl.startsWith('http') && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white bg-[#1a1a1a] hover:bg-[#222222] border border-[#2b2b2b] transition-all flex items-center gap-1.5"
                        >
                          <span>Visit External Website</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#FF2638]" />
                        </a>
                      )}

                      <button
                        onClick={onNavigateTools}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                      >
                        Explore 331 Tools Suite →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
