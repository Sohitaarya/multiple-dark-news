import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  Filter,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { getCategoryById } from '../../data/categories';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { ToolCategory, ToolStatus } from '../../types/tools';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const category = getCategoryById(categorySlug as ToolCategory);
  const tools = getToolsByCategory((category?.id || 'pdf') as ToolCategory);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'READY'
        ? tool.status === 'PRODUCTION_READY' || tool.status === 'FUNCTIONAL'
        : tool.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-200 transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-rose-400 font-semibold">{category?.name || 'Category'}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
            {tools.length} Tools Cataloged
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {category?.name || 'Category Tools'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {category?.shortDescription}
          </p>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search within ${category?.name}...`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['ALL', 'READY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === mode
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mode === 'ALL' ? `All (${tools.length})` : 'Ready to Use'}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate('tool', tool.slug)}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {tool.inputFormats.length > 0 ? tool.inputFormats.join(', ') : 'Direct'}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    tool.status === 'PRODUCTION_READY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {tool.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Max {tool.maxFileSizeMB} MB</span>
              <span className="text-rose-400 group-hover:text-rose-300 font-semibold flex items-center gap-1">
                Open Tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No tools match your search query in this category.</p>
        </div>
      )}
    </div>
  );
};
