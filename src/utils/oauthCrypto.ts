/**
 * Pure Web Crypto (SubtleCrypto) Helpers for Stateless OAuth State & Session Tokens
 * Works identically across Node.js (server.ts) and Cloudflare Workers (src/worker.ts).
 */

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '==='.slice((b64.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, usage);
}

export async function encryptSessionPayload(payload: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(secret, ['encrypt']);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  );
  return `${toBase64Url(iv)}.${toBase64Url(ciphertext)}`;
}

export async function decryptSessionPayload<T = Record<string, unknown>>(
  token: string,
  secret: string
): Promise<T | null> {
  try {
    const parts = (token || '').trim().split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const iv = fromBase64Url(parts[0]);
    const ciphertext = fromBase64Url(parts[1]);
    if (iv.length !== 12 || ciphertext.length === 0) return null;
    const key = await deriveAesKey(secret, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    return null;
  }
}

export function generateRandomHex(byteLength = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
