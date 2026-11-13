/**
 * Advanced Developer Tools Engine covering ALL 41 Developer Tools
 * Pure TypeScript implementations, 100% browser & Node testable.
 */
import jsQR from 'jsqr';

export function encodeUrlPayload(input: string, mode: 'component' | 'fullUri' = 'component'): string {
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrlPayload(input: string, plusAsSpace = true): string {
  const prepped = plusAsSpace ? input.replace(/\+/g, ' ') : input;
  return decodeURIComponent(prepped);
}

export interface RegexMatchDetail {
  fullMatch: string;
  index: number;
  groups: string[];
}

export function runRegexTest(pattern: string, flags: string, text: string): {
  valid: boolean;
  error?: string;
  matches: RegexMatchDetail[];
  highlightedSegments: { text: string; isMatch: boolean }[];
} {
  if (!pattern) {
    return { valid: true, matches: [], highlightedSegments: [{ text, isMatch: false }] };
  }
  try {
    const safeFlags = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, safeFlags);
    const matches: RegexMatchDetail[] = [];
    const highlightedSegments: { text: string; isMatch: boolean }[] = [];
    let lastIdx = 0;
    let guard = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null && guard < 1000) {
      guard++;
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      if (m.index > lastIdx) {
        highlightedSegments.push({ text: text.slice(lastIdx, m.index), isMatch: false });
      }
      highlightedSegments.push({ text: m[0], isMatch: true });
      matches.push({ fullMatch: m[0], index: m.index, groups: m.slice(1) });
      lastIdx = m.index + m[0].length;
    }

    if (lastIdx < text.length) {
      highlightedSegments.push({ text: text.slice(lastIdx), isMatch: false });
    }

    return { valid: true, matches, highlightedSegments };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Invalid Regular Expression',
      matches: [],
      highlightedSegments: [{ text, isMatch: false }],
    };
  }
}

export function parseAndConvertColor(rawColor: string): {
  valid: boolean;
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
  r: number;
  g: number;
  b: number;
  contrastWhite: number;
  contrastBlack: number;
} {
  const s = rawColor.trim();
  let r = 244;
  let g = 63;
  let b = 94;
  let valid = false;

  const hexMatch = s.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
  const rgbMatch = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  const hslMatch = s.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/i);

  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    valid = true;
  } else if (rgbMatch) {
    r = Math.min(255, Number(rgbMatch[1]));
    g = Math.min(255, Number(rgbMatch[2]));
    b = Math.min(255, Number(rgbMatch[3]));
    valid = true;
  } else if (hslMatch) {
    const H = (Number(hslMatch[1]) % 360) / 360;
    const S = Math.min(100, Number(hslMatch[2])) / 100;
    const L = Math.min(100, Number(hslMatch[3])) / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    const p = 2 * L - q;
    r = Math.round(hue2rgb(p, q, H + 1 / 3) * 255);
    g = Math.round(hue2rgb(p, q, H) * 255);
    b = Math.round(hue2rgb(p, q, H - 1 / 3) * 255);
    valid = true;
  }

  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

  // RGB -> HSL & HSV
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const satL = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const satV = max === 0 ? 0 : d / max;

  // CMYK
  const k = 1 - max;
  const c = k === 1 ? 0 : (1 - rn - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - gn - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - bn - k) / (1 - k);

  // WCAG Relative Luminance
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * lin(rn) + 0.7152 * lin(gn) + 0.0722 * lin(bn);
  const contrastWhite = Number(((1.05) / (lum + 0.05)).toFixed(2));
  const contrastBlack = Number(((lum + 0.05) / 0.05).toFixed(2));

  return {
    valid,
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${Math.round(satL * 100)}%, ${Math.round(l * 100)}%)`,
    hsv: `hsv(${h}, ${Math.round(satV * 100)}%, ${Math.round(max * 100)}%)`,
    cmyk: `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`,
    r,
    g,
    b,
    contrastWhite,
    contrastBlack,
  };
}

export function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function formatHtml(html: string, indent = 2): string {
  const pad = ' '.repeat(indent);
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tokens = html.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) || [];
  let level = 0;
  const out: string[] = [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1);
      out.push(pad.repeat(level) + trimmed);
    } else if (trimmed.startsWith('<')) {
      out.push(pad.repeat(level) + trimmed);
      const tagMatch = trimmed.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      const selfClosing = trimmed.endsWith('/>') || trimmed.startsWith('<!') || trimmed.startsWith('<?') || voidTags.has(tagName);
      if (!selfClosing) level++;
    } else {
      out.push(pad.repeat(level) + trimmed);
    }
  }
  return out.join('\n');
}

export function formatCss(css: string, indent = 2): string {
  const pad = ' '.repeat(indent);
  const cleaned = css.replace(/\s+/g, ' ').replace(/\s*([{};:])\s*/g, '$1').trim();
  let out = '';
  let level = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') {
      level++;
      out += ' {\n' + pad.repeat(level);
    } else if (ch === '}') {
      level = Math.max(0, level - 1);
      out = out.trimEnd() + '\n' + pad.repeat(level) + '}\n' + (level === 0 ? '\n' : pad.repeat(level));
    } else if (ch === ';') {
      out += ';\n' + pad.repeat(level);
    } else if (ch === ':') {
      out += ': ';
    } else {
      out += ch;
    }
  }
  return out.trim();
}

export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export function formatJs(code: string, indent = 2): string {
  const pad = ' '.repeat(indent);
  let level = 0;
  let inSingle = false;
  let inDouble = false;
  let inTick = false;
  let out = '';

  const normalized = code.replace(/\r\n/g, '\n').trim();
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const prev = normalized[i - 1];
    if (ch === "'" && !inDouble && !inTick && prev !== '\\') inSingle = !inSingle;
    else if (ch === '"' && !inSingle && !inTick && prev !== '\\') inDouble = !inDouble;
    else if (ch === '`' && !inSingle && !inDouble && prev !== '\\') inTick = !inTick;

    if (inSingle || inDouble || inTick) {
      out += ch;
      continue;
    }
    if (ch === '{') {
      level++;
      out = out.trimEnd() + ' {\n' + pad.repeat(level);
    } else if (ch === '}') {
      level = Math.max(0, level - 1);
      out = out.trimEnd() + '\n' + pad.repeat(level) + '}';
    } else if (ch === ';') {
      out += ';\n' + pad.repeat(level);
    } else if (ch === '\n') {
      if (!out.endsWith('\n' + pad.repeat(level))) {
        out += '\n' + pad.repeat(level);
      }
    } else {
      out += ch;
    }
  }
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

export function minifyJs(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,=:+\-*<>])\s*/g, '$1')
    .trim();
}

export function formatSql(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'JOIN',
    'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'AND', 'OR', 'UNION ALL', 'UNION',
  ];
  let out = sql.replace(/\s+/g, ' ').trim();
  // Uppercase keywords
  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    out = out.replace(re, `\n${kw}`);
  }
  return out
    .replace(/^\n+/, '')
    .replace(/\n(AND|OR)\b/g, '\n  $1')
    .replace(/,\s*/g, ',\n  ');
}

export function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function xmlEscape(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function jsonToXml(jsonText: string, rootName = 'root'): string {
  const obj = JSON.parse(jsonText);
  const toXmlNode = (val: any, tag: string, depth: number): string => {
    const pad = '  '.repeat(depth);
    const safeTag = tag.replace(/[^a-zA-Z0-9_-]/g, '_') || 'item';
    if (val === null || val === undefined) return `${pad}<${safeTag} />`;
    if (Array.isArray(val)) {
      return val.map((item) => toXmlNode(item, safeTag, depth)).join('\n');
    }
    if (typeof val === 'object') {
      const inner = Object.entries(val)
        .map(([k, v]) => toXmlNode(v, k, depth + 1))
        .join('\n');
      return `${pad}<${safeTag}>\n${inner}\n${pad}</${safeTag}>`;
    }
    return `${pad}<${safeTag}>${xmlEscape(String(val))}</${safeTag}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXmlNode(obj, rootName, 0)}`;
}

export function xmlToJson(xmlText: string): string {
  // Pure JS recursive tag parser (works cleanly in both Node and Browser)
  const clean = xmlText.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!clean.startsWith('<')) throw new Error('Invalid XML markup.');

  let pos = 0;
  const parseNode = (): { name: string; value: any } | null => {
    while (pos < clean.length && clean[pos] !== '<') pos++;
    if (pos >= clean.length || clean.startsWith('</', pos)) return null;

    const closeIdx = clean.indexOf('>', pos);
    if (closeIdx === -1) throw new Error('Unclosed XML tag');
    const tagContent = clean.slice(pos + 1, closeIdx).trim();
    pos = closeIdx + 1;

    const selfClosing = tagContent.endsWith('/');
    const header = selfClosing ? tagContent.slice(0, -1).trim() : tagContent;
    const parts = header.match(/^([^\s]+)(.*)$/);
    if (!parts) throw new Error('Malformed XML tag');
    const name = parts[1];
    const attrStr = parts[2].trim();

    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z0-9_:-]+)\s*=\s*["']([^"']*)["']/g;
    let am: RegExpExecArray | null;
    while ((am = attrRe.exec(attrStr)) !== null) {
      attrs['@' + am[1]] = am[2];
    }

    if (selfClosing) {
      return { name, value: Object.keys(attrs).length ? attrs : null };
    }

    const children: Record<string, any> = { ...attrs };
    let hasChildElements = false;
    let textBuffer = '';

    while (pos < clean.length) {
      if (clean.startsWith(`</${name}>`, pos)) {
        pos += name.length + 3;
        break;
      }
      if (clean[pos] === '<') {
        if (clean.startsWith('</', pos)) {
          throw new Error(`Mismatched closing tag near ${clean.slice(pos, pos + 20)}`);
        }
        const child = parseNode();
        if (child) {
          hasChildElements = true;
          if (children[child.name] !== undefined) {
            if (!Array.isArray(children[child.name])) children[child.name] = [children[child.name]];
            children[child.name].push(child.value);
          } else {
            children[child.name] = child.value;
          }
        }
      } else {
        const nextTag = clean.indexOf('<', pos);
        const end = nextTag === -1 ? clean.length : nextTag;
        textBuffer += clean.slice(pos, end);
        pos = end;
      }
    }

    const trimmedText = textBuffer.trim();
    if (!hasChildElements && Object.keys(attrs).length === 0) {
      return { name, value: trimmedText };
    }
    if (!hasChildElements && trimmedText) {
      children['#text'] = trimmedText;
    }
    return { name, value: children };
  };

  const root = parseNode();
  if (!root) throw new Error('No root XML element found');
  return JSON.stringify({ [root.name]: root.value }, null, 2);
}

/**
 * Pure TypeScript YAML Parser & Validator (supports nested maps, lists, scalars, comments, strict tab checks)
 */
export function parseYamlSafe(yamlText: string): { valid: boolean; data?: any; error?: string } {
  const lines = yamlText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^\t+/.test(lines[i])) {
      return { valid: false, error: `Line ${i + 1}: YAML forbids leading tabs for indentation. Use spaces.` };
    }
  }

  const parseScalar = (val: string): any => {
    const v = val.trim();
    if (v === '' || v === 'null' || v === '~') return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    if (v.startsWith('[') && v.endsWith(']')) {
      return v
        .slice(1, -1)
        .split(',')
        .map((x) => parseScalar(x))
        .filter((x) => x !== '');
    }
    return v;
  };

  interface Frame {
    indent: number;
    container: any;
  }

  try {
    const root: Record<string, any> = {};
    const stack: Frame[] = [{ indent: -1, container: root }];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].replace(/#.*$/, '');
      if (!raw.trim() || raw.trim() === '---') continue;
      const indent = raw.search(/\S/);
      const trimmed = raw.trim();

      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].container;

      if (trimmed.startsWith('- ')) {
        const itemContent = trimmed.slice(2).trim();
        if (!Array.isArray(parent)) {
          throw new Error(`Line ${i + 1}: List item outside array context.`);
        }
        const colonIdx = itemContent.indexOf(':');
        if (colonIdx > 0 && !itemContent.startsWith('"') && !itemContent.startsWith("'")) {
          const obj: Record<string, any> = {};
          const k = itemContent.slice(0, colonIdx).trim();
          const v = itemContent.slice(colonIdx + 1).trim();
          obj[k] = parseScalar(v);
          parent.push(obj);
          stack.push({ indent, container: obj });
        } else {
          parent.push(parseScalar(itemContent));
        }
      } else {
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) {
          throw new Error(`Line ${i + 1}: Expected "key: value" syntax.`);
        }
        const key = trimmed.slice(0, colonIdx).trim();
        const rest = trimmed.slice(colonIdx + 1).trim();
        if (rest === '') {
          // Peek next non-empty line to see if it's an array or object
          let nextLine = '';
          for (let j = i + 1; j < lines.length; j++) {
            const c = lines[j].replace(/#.*$/, '').trim();
            if (c) {
              nextLine = c;
              break;
            }
          }
          const child = nextLine.startsWith('- ') ? [] : {};
          parent[key] = child;
          stack.push({ indent, container: child });
        } else {
          parent[key] = parseScalar(rest);
        }
      }
    }
    return { valid: true, data: root };
  } catch (err: any) {
    return { valid: false, error: err.message || 'YAML parse error' };
  }
}

export function decodeQrFromRgba(data: Uint8ClampedArray, width: number, height: number): string | null {
  const result = jsQR(data, width, height);
  return result ? result.data : null;
}

export const HTTP_STATUS_CODES: { code: number; title: string; category: string; description: string }[] = [
  { code: 200, title: 'OK', category: '2xx Success', description: 'Standard response for successful HTTP requests.' },
  { code: 201, title: 'Created', category: '2xx Success', description: 'Request succeeded and led to creation of one or more new resources.' },
  { code: 204, title: 'No Content', category: '2xx Success', description: 'Server processed request successfully and returns no body.' },
  { code: 301, title: 'Moved Permanently', category: '3xx Redirect', description: 'URL of requested resource has been permanently changed; passes SEO equity.' },
  { code: 302, title: 'Found (Temporary Redirect)', category: '3xx Redirect', description: 'URI of requested resource has been changed temporarily.' },
  { code: 304, title: 'Not Modified', category: '3xx Redirect', description: 'Client cached version is still valid; saves bandwidth.' },
  { code: 400, title: 'Bad Request', category: '4xx Client Error', description: 'Server cannot process request due to malformed syntax or invalid framing.' },
  { code: 401, title: 'Unauthorized', category: '4xx Client Error', description: 'Authentication credentials are missing or invalid.' },
  { code: 403, title: 'Forbidden', category: '4xx Client Error', description: 'Client identity is known, but lacks permission to access content.' },
  { code: 404, title: 'Not Found', category: '4xx Client Error', description: 'Server cannot find the requested resource.' },
  { code: 405, title: 'Method Not Allowed', category: '4xx Client Error', description: 'HTTP method (GET/POST/PUT) is not supported for the target endpoint.' },
  { code: 429, title: 'Too Many Requests', category: '4xx Client Error', description: 'Rate limit exceeded within given timeframe.' },
  { code: 500, title: 'Internal Server Error', category: '5xx Server Error', description: 'Server encountered an unexpected condition preventing fulfillment.' },
  { code: 502, title: 'Bad Gateway', category: '5xx Server Error', description: 'Gateway/proxy received an invalid response from upstream origin.' },
  { code: 503, title: 'Service Unavailable', category: '5xx Server Error', description: 'Server is overloaded or down for maintenance.' },
  { code: 504, title: 'Gateway Timeout', category: '5xx Server Error', description: 'Upstream server failed to respond in time.' },
];

export function parseUserAgentString(ua: string) {
  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Microsoft Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] || '');
  else if (/OPR\//.test(ua)) browser = 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] || '');
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Google Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '');
  else if (/Firefox\//.test(ua)) browser = 'Mozilla Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] || '');
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Apple Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] || '');

  let os = 'Unknown OS';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10 / 11';
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS / iPadOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  const deviceType = /Mobile|Android|iPhone/.test(ua) ? 'Mobile' : /iPad|Tablet/.test(ua) ? 'Tablet' : /bot|crawl|spider|googlebot|bingbot/i.test(ua) ? 'Search Crawler / Bot' : 'Desktop / Workstation';
  const engine = /Gecko\//.test(ua) && /Firefox/.test(ua) ? 'Gecko' : /AppleWebKit/.test(ua) ? (/Chrome|Edg/.test(ua) ? 'Blink' : 'WebKit') : 'Other';

  return { browser: browser.trim(), os: os.trim(), deviceType, engine, raw: ua };
}

export function describeCronExpression(expr: string): { valid: boolean; summary: string; nextRuns: string[] } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, summary: 'Cron expression must have exactly 5 fields: minute hour day month weekday.', nextRuns: [] };
  }
  const [min, hour, dom, mon, dow] = parts;
  let summary = '';
  if (expr.trim() === '* * * * *') summary = 'Runs every minute';
  else if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    summary = `Runs every ${min.slice(2)} minutes`;
  } else if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && dow === '*') {
    summary = `Runs daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} UTC`;
  } else {
    summary = `Minute (${min}), Hour (${hour}), Day (${dom}), Month (${mon}), Weekday (${dow})`;
  }

  // Simulate next 5 runs (scanning up to 48h in 1-min steps for accuracy, fallback to daily steps)
  const matchField = (field: string, val: number) => {
    if (field === '*') return true;
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10);
      return step > 0 && val % step === 0;
    }
    return field.split(',').some((seg) => {
      if (seg.includes('-')) {
        const [a, b] = seg.split('-').map(Number);
        return val >= a && val <= b;
      }
      return Number(seg) === val;
    });
  };

  const nextRuns: string[] = [];
  const cursor = new Date();
  cursor.setUTCSeconds(0, 0);
  for (let m = 1; m <= 60 * 24 * 14 && nextRuns.length < 5; m++) {
    const d = new Date(cursor.getTime() + m * 60000);
    if (
      matchField(min, d.getUTCMinutes()) &&
      matchField(hour, d.getUTCHours()) &&
      matchField(dom, d.getUTCDate()) &&
      matchField(mon, d.getUTCMonth() + 1) &&
      matchField(dow, d.getUTCDay())
    ) {
      nextRuns.push(d.toUTCString());
    }
  }

  return { valid: true, summary, nextRuns };
}

export function generateHtaccessRules(opts: {
  forceHttps: boolean;
  canonicalHost: 'none' | 'non-www' | 'www';
  domain: string;
  enableGzip: boolean;
  enableBrowserCache: boolean;
  spaFallback: boolean;
}): string {
  const cleanDomain = (opts.domain || 'example.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const lines: string[] = ['# Generated by MultipleDarkNews .htaccess Builder', '<IfModule mod_rewrite.c>', '  RewriteEngine On'];
  if (opts.forceHttps) {
    lines.push('  RewriteCond %{HTTPS} !=on');
    lines.push('  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
  }
  if (opts.canonicalHost === 'non-www') {
    lines.push(`  RewriteCond %{HTTP_HOST} ^www\\.${cleanDomain.replace(/\./g, '\\.')} [NC]`);
    lines.push(`  RewriteRule ^(.*)$ https://${cleanDomain}/$1 [L,R=301]`);
  } else if (opts.canonicalHost === 'www') {
    lines.push(`  RewriteCond %{HTTP_HOST} ^${cleanDomain.replace(/\./g, '\\.')} [NC]`);
    lines.push(`  RewriteRule ^(.*)$ https://www.${cleanDomain}/$1 [L,R=301]`);
  }
  if (opts.spaFallback) {
    lines.push('  RewriteCond %{REQUEST_FILENAME} !-f');
    lines.push('  RewriteCond %{REQUEST_FILENAME} !-d');
    lines.push('  RewriteRule . /index.html [L]');
  }
  lines.push('</IfModule>');
  if (opts.enableGzip) {
    lines.push('', '<IfModule mod_deflate.c>', '  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json', '</IfModule>');
  }
  if (opts.enableBrowserCache) {
    lines.push('', '<IfModule mod_expires.c>', '  ExpiresActive On', '  ExpiresByType image/webp "access plus 1 year"', '  ExpiresByType text/css "access plus 1 month"', '  ExpiresByType application/javascript "access plus 1 month"', '</IfModule>');
  }
  return lines.join('\n');
}

export function generateHtmlTableCode(headers: string[], rows: string[][], striped = true): string {
  const ths = headers.map((h) => `      <th style="padding:10px;border:1px solid #cbd5e1;text-align:left;background:#0f172a;color:#fff;">${xmlEscape(h)}</th>`).join('\n');
  const trs = rows
    .map((r, idx) => {
      const bg = striped && idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      const tds = r.map((c) => `      <td style="padding:10px;border:1px solid #cbd5e1;">${xmlEscape(c)}</td>`).join('\n');
      return `    <tr style="background:${bg};">\n${tds}\n    </tr>`;
    })
    .join('\n');
  return `<table style="width:100%;border-collapse:collapse;font-family:sans-serif;">\n  <thead>\n    <tr>\n${ths}\n    </tr>\n  </thead>\n  <tbody>\n${trs}\n  </tbody>\n</table>`;
}
