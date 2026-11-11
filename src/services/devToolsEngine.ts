import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Format JSON with custom indentation
 */
export function formatJson(jsonString: string, indent = 2): { success: boolean; result: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      success: true,
      result: JSON.stringify(parsed, null, indent),
    };
  } catch (err: any) {
    return {
      success: false,
      result: jsonString,
      error: err.message || 'Invalid JSON syntax.',
    };
  }
}

/**
 * Minify JSON
 */
export function minifyJson(jsonString: string): { success: boolean; result: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      success: true,
      result: JSON.stringify(parsed),
    };
  } catch (err: any) {
    return {
      success: false,
      result: jsonString,
      error: err.message || 'Invalid JSON syntax.',
    };
  }
}

/**
 * Encode / Decode Base64 with full UTF-8 support
 */
export function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

export function decodeBase64(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Decode JWT Token payload without sending to servers
 */
export function decodeJwt(token: string) {
  try {
    const parts = token.trim().split('.');
    if (parts.length < 2) throw new Error('Invalid JWT token structure.');
    const header = JSON.parse(decodeBase64(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(decodeBase64(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return {
      valid: true,
      header,
      payload,
      signature: parts[2] || '',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Unable to decode JWT token.',
    };
  }
}

/**
 * Compute cryptographic hash (SHA-256, SHA-512, SHA-1, MD5)
 */
export async function computeHash(
  text: string,
  algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5' = 'SHA-256'
): Promise<string> {
  if (algorithm === 'MD5') {
    return simpleMd5(text);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pure JS MD5 implementation for standard checksums
function simpleMd5(string: string): string {
  function md5cycle(x: any, k: any) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  var n = string.length, state = [1732584193, -271733879, -1732584194, 271733878], i: number;
  var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 64; i <= n; i += 64) {
    var words = [];
    for (var j = 0; j < 64; j += 4) {
      words.push(
        string.charCodeAt(i - 64 + j) |
        (string.charCodeAt(i - 64 + j + 1) << 8) |
        (string.charCodeAt(i - 64 + j + 2) << 16) |
        (string.charCodeAt(i - 64 + j + 3) << 24)
      );
    }
    md5cycle(state, words);
  }
  string = string.substring(i - 64);
  var len = string.length;
  for (var j = 0; j < len; j++) {
    tail[j >> 2] |= string.charCodeAt(j) << ((j % 4) << 3);
  }
  tail[len >> 2] |= 0x80 << ((len % 4) << 3);
  if (len > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  var hex = '';
  for (i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var b = (state[i] >>> (j * 8)) & 0xff;
      hex += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return hex;
}

/**
 * Generate cryptographically secure UUID v4
 */
export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate QR code as data URL
 */
export async function generateQrCode(text: string, size = 300): Promise<string> {
  return await QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Render Barcode into Canvas
 */
export function renderBarcode(canvas: HTMLCanvasElement, text: string, format = 'CODE128'): void {
  JsBarcode(canvas, text, {
    format,
    lineColor: '#0f172a',
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 14,
    font: 'monospace',
  });
}

/**
 * Epoch converter
 */
export function convertTimestamp(ts: number | string) {
  const num = typeof ts === 'string' ? parseInt(ts.trim(), 10) : ts;
  // Detect if seconds or milliseconds
  const ms = num < 10000000000 ? num * 1000 : num;
  const d = new Date(ms);

  return {
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    iso: d.toISOString(),
    epochSeconds: Math.floor(ms / 1000),
    epochMs: ms,
  };
}
