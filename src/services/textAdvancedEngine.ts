/**
 * Advanced Text Engine covering ALL 30 Text Tools
 * Includes readability indices, AES-GCM Web Crypto encryption/decryption,
 * n-gram similarity/plagiarism scoring, Unicode fancy fonts, and grammar rules.
 */

export function analyzeTextDeep(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const sentences = trimmed
    ? trimmed
        .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|etc|e\.g|i\.e)\./gi, '$1')
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0).length
    : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
  const uniqueWords = new Set(
    trimmed
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  ).size;

  return {
    words,
    uniqueWords,
    characters,
    charactersWithoutSpaces,
    letters,
    digits,
    spaces,
    sentences,
    paragraphs,
    avgWordLength: words > 0 ? Number((charactersWithoutSpaces / words).toFixed(2)) : 0,
    avgWordsPerSentence: sentences > 0 ? Number((words / sentences).toFixed(1)) : 0,
    readingTimeMinutes: words > 0 ? Math.max(0.1, Number((words / 225).toFixed(1))) : 0,
    speakingTimeMinutes: words > 0 ? Math.max(0.1, Number((words / 140).toFixed(1))) : 0,
  };
}

export function sortTextLines(
  text: string,
  mode: 'az' | 'za' | 'length-asc' | 'length-desc' | 'numeric' | 'reverse' | 'shuffle',
  removeEmpty = false
): string {
  let lines = text.split(/\r?\n/);
  if (removeEmpty) lines = lines.filter((l) => l.trim().length > 0);

  if (mode === 'az') lines.sort((a, b) => a.localeCompare(b));
  else if (mode === 'za') lines.sort((a, b) => b.localeCompare(a));
  else if (mode === 'length-asc') lines.sort((a, b) => a.length - b.length);
  else if (mode === 'length-desc') lines.sort((a, b) => b.length - a.length);
  else if (mode === 'numeric') lines.sort((a, b) => parseFloat(a) - parseFloat(b));
  else if (mode === 'reverse') lines.reverse();
  else if (mode === 'shuffle') {
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
  }
  return lines.join('\n');
}

export function reverseTextMode(text: string, mode: 'chars' | 'words' | 'lines'): string {
  if (mode === 'chars') return Array.from(text).reverse().join('');
  if (mode === 'words') return text.split(/(\s+)/).reverse().join('');
  return text.split(/\r?\n/).reverse().join('\n');
}

export function findAndReplaceText(
  text: string,
  find: string,
  replace: string,
  options: { caseSensitive?: boolean; useRegex?: boolean; wholeWord?: boolean } = {}
): { result: string; count: number } {
  if (!find) return { result: text, count: 0 };
  const flags = options.caseSensitive ? 'g' : 'gi';
  const escaped = options.useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped;
  const regex = new RegExp(pattern, flags);
  let count = 0;
  const result = text.replace(regex, (match) => {
    count++;
    void match;
    return replace;
  });
  return { result, count };
}

export function removeExtraSpaces(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function removeLineBreaks(text: string, joinWith = ' '): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(joinWith);
}

export function removeEmojis(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const stripped = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function calculateReadabilityMetrics(text: string) {
  const stats = analyzeTextDeep(text);
  const rawWords = text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter(Boolean);

  const wordCount = Math.max(1, rawWords.length);
  const sentenceCount = Math.max(1, stats.sentences || 1);
  let totalSyllables = 0;
  let complexWords = 0;

  for (const w of rawWords) {
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWords++;
  }

  const fleschReadingEase = Number(
    (206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount)).toFixed(1)
  );
  const fleschKincaidGrade = Number(
    Math.max(0, 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59).toFixed(1)
  );
  const gunningFog = Number(
    (0.4 * (wordCount / sentenceCount + 100 * (complexWords / wordCount))).toFixed(1)
  );

  let level = 'Standard (8th–9th Grade)';
  if (fleschReadingEase >= 80) level = 'Easy to Read (5th–6th Grade)';
  else if (fleschReadingEase >= 60) level = 'Plain English (7th–9th Grade)';
  else if (fleschReadingEase >= 40) level = 'Academic / College';
  else if (fleschReadingEase < 40) level = 'Technical / Graduate Level';

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    totalSyllables,
    complexWords,
    level,
  };
}

export function convertToUnicodeRepresentations(text: string) {
  const jsEscaped = Array.from(text)
    .map((ch) => {
      const code = ch.codePointAt(0) || 0;
      return code > 0xffff ? `\\u{${code.toString(16).toUpperCase()}}` : `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
    })
    .join('');

  const htmlEntities = Array.from(text)
    .map((ch) => `&#${ch.codePointAt(0)};`)
    .join('');

  const utf8Hex = Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');

  const binary = Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');

  return { jsEscaped, htmlEntities, utf8Hex, binary };
}

function mapAlphabet(text: string, upperStart: number, lowerStart: number): string {
  return Array.from(text)
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return String.fromCodePoint(upperStart + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(lowerStart + (c - 97));
      return ch;
    })
    .join('');
}

export function generateFancyTextVariants(text: string): { style: string; value: string }[] {
  const sample = text || 'MultipleDarkNews';
  return [
    { style: 'Sans Bold', value: mapAlphabet(sample, 0x1d5d4, 0x1d5ee) },
    { style: 'Serif Bold', value: mapAlphabet(sample, 0x1d400, 0x1d41a) },
    { style: 'Bold Italic', value: mapAlphabet(sample, 0x1d468, 0x1d482) },
    { style: 'Monospace Code', value: mapAlphabet(sample, 0x1d670, 0x1d68a) },
    { style: 'Double-Struck', value: mapAlphabet(sample, 0x1d538, 0x1d552) },
    { style: 'Script / Cursive', value: mapAlphabet(sample, 0x1d4d0, 0x1d4ea) },
    { style: 'Gothic / Fraktur', value: mapAlphabet(sample, 0x1d56c, 0x1d586) },
    { style: 'Fullwidth Aesthetic', value: Array.from(sample).map((c) => {
      const code = c.charCodeAt(0);
      return code >= 33 && code <= 126 ? String.fromCodePoint(code + 0xfee0) : c;
    }).join('') },
  ];
}

export async function encryptTextAesGcm(plaintext: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error('Passphrase is required to encrypt text.');
  const enc = new TextEncoder();
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const cipherBuf = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(cipherBuf), salt.length + iv.length);

  let bin = '';
  for (let i = 0; i < combined.length; i++) bin += String.fromCharCode(combined[i]);
  return 'MDN-AES256:' + btoa(bin);
}

export async function decryptTextAesGcm(encryptedPayload: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error('Passphrase is required to decrypt text.');
  const cleanB64 = encryptedPayload.trim().replace(/^MDN-AES256:/, '');
  const bin = atob(cleanB64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes.length < 29) throw new Error('Invalid encrypted payload format.');

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);
  const enc = new TextEncoder();

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  try {
    const plainBuf = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(plainBuf);
  } catch {
    throw new Error('Decryption failed: incorrect passphrase or corrupted ciphertext.');
  }
}

export function checkGrammarAndStyle(text: string): {
  score: number;
  issues: { type: string; snippet: string; suggestion: string }[];
} {
  const issues: { type: string; snippet: string; suggestion: string }[] = [];

  // Duplicate consecutive words
  const dupRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let m: RegExpExecArray | null;
  while ((m = dupRegex.exec(text)) !== null) {
    issues.push({
      type: 'Repeated Word',
      snippet: m[0],
      suggestion: `Remove duplicate "${m[1]}"`,
    });
  }

  // Common typos
  const commonTypos: Record<string, string> = {
    teh: 'the',
    recieve: 'receive',
    seperate: 'separate',
    occured: 'occurred',
    untill: 'until',
    definately: 'definitely',
    alot: 'a lot',
    wierd: 'weird',
    wich: 'which',
    becuase: 'because',
  };
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (commonTypos[lower]) {
      issues.push({
        type: 'Spelling',
        snippet: w,
        suggestion: `Did you mean "${commonTypos[lower]}"?`,
      });
    }
  }

  // Double spaces
  if (/[^\n] {2,}[^\n]/.test(text)) {
    issues.push({
      type: 'Spacing',
      snippet: 'Multiple spaces detected',
      suggestion: 'Collapse multiple spaces into a single space.',
    });
  }

  // Passive voice indicator
  const passiveMatches = text.match(/\b(?:is|are|was|were|been|being)\s+[a-z]+(?:ed|en)\b/gi) || [];
  for (const pm of passiveMatches.slice(0, 5)) {
    issues.push({
      type: 'Style (Passive Voice)',
      snippet: pm,
      suggestion: 'Consider rewriting in active voice for stronger clarity.',
    });
  }

  // Uncapitalized sentence starts
  const lowerStart = text.match(/(?:^|[.!?]\s+)[a-z][a-z]+/g) || [];
  for (const ls of lowerStart.slice(0, 5)) {
    issues.push({
      type: 'Capitalization',
      snippet: ls.trim(),
      suggestion: 'Capitalize the first letter of the sentence.',
    });
  }

  const score = Math.max(25, 100 - issues.length * 8);
  return { score, issues };
}

export function comparePlagiarismSimilarity(sourceText: string, referenceText: string): {
  similarityPercent: number;
  uniquenessPercent: number;
  matchingPhrases: string[];
  verdict: string;
} {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const wordsA = normalize(sourceText);
  const wordsB = normalize(referenceText);

  if (wordsA.length < 3 || wordsB.length < 3) {
    return {
      similarityPercent: 0,
      uniquenessPercent: 100,
      matchingPhrases: [],
      verdict: 'Provide at least 3 words in both texts to run 3-gram overlap analysis.',
    };
  }

  const getShingles = (words: string[], k = 3) => {
    const set = new Set<string>();
    for (let i = 0; i <= words.length - k; i++) {
      set.add(words.slice(i, i + k).join(' '));
    }
    return set;
  };

  const shA = getShingles(wordsA, 3);
  const shB = getShingles(wordsB, 3);
  const matchingPhrases: string[] = [];
  shA.forEach((gram) => {
    if (shB.has(gram)) matchingPhrases.push(gram);
  });

  const unionSize = new Set([...shA, ...shB]).size;
  const similarityPercent = unionSize > 0 ? Number(((matchingPhrases.length / Math.min(shA.size, shB.size)) * 100).toFixed(1)) : 0;
  const clamped = Math.min(100, similarityPercent);

  let verdict = 'Unique Content (Low Overlap)';
  if (clamped >= 70) verdict = 'High Overlap / Duplicate Detected';
  else if (clamped >= 30) verdict = 'Moderate Phrase Overlap Detected';

  return {
    similarityPercent: clamped,
    uniquenessPercent: Number((100 - clamped).toFixed(1)),
    matchingPhrases: matchingPhrases.slice(0, 15),
    verdict,
  };
}
