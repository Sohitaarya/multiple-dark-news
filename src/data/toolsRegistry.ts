import { ToolCategory, ToolDefinition, ToolStatus } from '../types/tools';
import { PDF_TOOLS } from './pdfTools';
import { IMAGE_TOOLS } from './imageTools';
import { OTHER_TOOLS } from './otherTools';

// The Centralized Tool Registry combining all categories (325+ tools)
export const ALL_TOOLS: ToolDefinition[] = [
  ...PDF_TOOLS,
  ...IMAGE_TOOLS,
  ...OTHER_TOOLS,
];

// In-memory registry with dynamic status overrides for the Admin Dashboard
let registryState: ToolDefinition[] = [...ALL_TOOLS];

export const getToolsRegistry = (): ToolDefinition[] => {
  return registryState;
};

export const updateToolInRegistry = (updated: ToolDefinition): void => {
  registryState = registryState.map((t) => (t.id === updated.id ? updated : t));
  // Also store in localStorage if available for persistence across reloads
  if (typeof window !== 'undefined') {
    try {
      const overrides = JSON.parse(localStorage.getItem('mdn_tool_status_overrides') || '{}');
      overrides[updated.id] = {
        status: updated.status,
        version: updated.version,
        maxFileSizeMB: updated.maxFileSizeMB,
        isPopular: updated.isPopular,
        isFeatured: updated.isFeatured,
      };
      localStorage.setItem('mdn_tool_status_overrides', JSON.stringify(overrides));
    } catch {
      // localStorage may fail in restricted iframes
    }
  }
};

export const resetToolsRegistry = (): void => {
  registryState = [...ALL_TOOLS];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('mdn_tool_status_overrides');
    } catch {
      // no-op
    }
  }
};

// Apply local overrides on initialization
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('mdn_tool_status_overrides');
    if (raw) {
      const overrides = JSON.parse(raw);
      registryState = registryState.map((t) => {
        if (overrides[t.id]) {
          return { ...t, ...overrides[t.id] };
        }
        return t;
      });
    }
  } catch {
    // ignore
  }
}

export const getToolBySlug = (slug: string): ToolDefinition | undefined => {
  const clean = slug.toLowerCase().trim();
  const direct = registryState.find((tool) => tool.slug === clean || tool.id === clean);
  if (direct) return direct;

  // Fuzzy fallback: e.g. "serp-preview" -> "serp-snippet-preview"
  return registryState.find((tool) => {
    return (
      tool.slug.includes(clean) ||
      clean.includes(tool.slug) ||
      tool.keywords.some((k) => k.toLowerCase() === clean.replace(/-/g, ' '))
    );
  });
};

export const getToolsByCategory = (category: ToolCategory): ToolDefinition[] => {
  return registryState.filter((tool) => tool.category === category);
};

export const getPopularTools = (limit = 12): ToolDefinition[] => {
  return registryState
    .filter((tool) => tool.isPopular || tool.status === 'PRODUCTION_READY')
    .slice(0, limit);
};

export const getFeaturedTools = (limit = 8): ToolDefinition[] => {
  return registryState
    .filter((tool) => tool.isFeatured)
    .slice(0, limit);
};

export const getTrendingTools = (limit = 8): ToolDefinition[] => {
  return registryState
    .filter((tool) => tool.isTrending || tool.isPopular)
    .slice(0, limit);
};

export const getRelatedTools = (tool: ToolDefinition, limit = 4): ToolDefinition[] => {
  const seenIds = new Set<string>([tool.id]);
  const result: ToolDefinition[] = [];

  for (const slug of tool.relatedToolSlugs) {
    const found = getToolBySlug(slug);
    if (found && !seenIds.has(found.id)) {
      seenIds.add(found.id);
      result.push(found);
      if (result.length >= limit) return result;
    }
  }

  if (result.length >= limit) return result.slice(0, limit);

  // Fallback to same category
  for (const t of registryState) {
    if (t.category === tool.category && !seenIds.has(t.id)) {
      seenIds.add(t.id);
      result.push(t);
      if (result.length >= limit) break;
    }
  }

  return result.slice(0, limit);
};

export const searchTools = (query: string): ToolDefinition[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return registryState.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });
};

export const getRegistryStats = () => {
  const total = registryState.length;
  const productionReady = registryState.filter((t) => t.status === 'PRODUCTION_READY').length;
  const functional = registryState.filter((t) => t.status === 'FUNCTIONAL').length;
  const inDevelopment = registryState.filter((t) => t.status === 'IN_DEVELOPMENT').length;
  const planned = registryState.filter((t) => t.status === 'PLANNED').length;

  return {
    total,
    productionReady,
    functional,
    inDevelopment,
    planned,
  };
};
