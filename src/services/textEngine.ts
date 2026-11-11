export interface TextStatistics {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

/**
 * Calculate comprehensive text statistics
 */
export function analyzeText(text: string): TextStatistics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  // 225 wpm reading speed, 140 wpm speaking speed
  const readingTimeMinutes = Math.max(0.1, Number((words / 225).toFixed(1)));
  const speakingTimeMinutes = Math.max(0.1, Number((words / 140).toFixed(1)));

  return {
    words,
    characters,
    charactersWithoutSpaces,
    sentences,
    paragraphs: Math.max(1, paragraphs),
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

/**
 * Case conversion utilities
 */
export function toTitleCase(str: string): string {
  const minorWords = new Set(['and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via']);
  return str.replace(/\b\w+/g, (word, index) => {
    const lower = word.toLowerCase();
    if (index > 0 && minorWords.has(lower)) {
      return lower;
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

export function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
}

export function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Text difference checker (line by line diff)
 */
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNumberA?: number;
  lineNumberB?: number;
}

export function computeTextDiff(original: string, modified: string): DiffLine[] {
  const linesA = original.split(/\r?\n/);
  const linesB = modified.split(/\r?\n/);
  const diffs: DiffLine[] = [];

  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];

    if (a === undefined) {
      diffs.push({ type: 'added', text: b, lineNumberB: i + 1 });
    } else if (b === undefined) {
      diffs.push({ type: 'removed', text: a, lineNumberA: i + 1 });
    } else if (a === b) {
      diffs.push({ type: 'unchanged', text: a, lineNumberA: i + 1, lineNumberB: i + 1 });
    } else {
      diffs.push({ type: 'removed', text: a, lineNumberA: i + 1 });
      diffs.push({ type: 'added', text: b, lineNumberB: i + 1 });
    }
  }

  return diffs;
}

/**
 * Remove duplicate lines with options
 */
export function removeDuplicateLines(text: string, caseSensitive = true): string {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLines.push(line);
    }
  }

  return uniqueLines.join('\n');
}

/**
 * Clean text: strip HTML, fix spaces, normalize quotes
 */
export function cleanText(text: string, options = { stripHtml: true, normalizeWhitespace: true }): string {
  let res = text;
  if (options.stripHtml) {
    res = res.replace(/<[^>]*>/g, '');
  }
  if (options.normalizeWhitespace) {
    res = res.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
  }
  // Smart quotes to straight
  res = res
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014]/g, '--');
  return res;
}

/**
 * Generate Lorem Ipsum paragraphs
 */
export function generateLoremIpsum(paragraphsCount = 3): string {
  const standardIpsum = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.',
    'Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.',
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor. Donec laoreet nonummy augue.',
  ];

  const result: string[] = [];
  for (let i = 0; i < paragraphsCount; i++) {
    result.push(standardIpsum[i % standardIpsum.length]);
  }
  return result.join('\n\n');
}

/**
 * Simple CommonMark to HTML converter
 */
export function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2 text-slate-100">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-3 text-slate-100">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black my-4 text-slate-100">$1</h1>')
    // Bold & Italics
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // Code blocks & inline
    .replace(/`([^`]+)`/gim, '<code class="bg-slate-800 text-rose-400 px-1 py-0.5 rounded text-sm">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-rose-400 underline hover:text-rose-300" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="my-2 leading-relaxed text-slate-300">');

  return `<div class="prose prose-invert max-w-none text-slate-300"><p class="my-2 leading-relaxed text-slate-300">${html}</p></div>`;
}
