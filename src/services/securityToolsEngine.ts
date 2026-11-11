/**
 * MultipleDarkNews Security & Cryptography Engine
 * 100% In-Browser client-side cryptographic and security algorithms
 */

/**
 * Generate Cryptographically Secure Strong Password
 */
export function generateStrongPassword(options: {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
}): { password: string; entropyBits: number; strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' } {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = true,
  } = options;

  let upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let lower = 'abcdefghjkmnpqrstuvwxyz';
  let numbers = '23456789';
  let symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (!excludeAmbiguous) {
    upper += 'IO';
    lower += 'ilo';
    numbers += '01';
  }

  let charset = '';
  if (includeUppercase) charset += upper;
  if (includeLowercase) charset += lower;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (!charset) charset = lower + numbers;

  // Use crypto.getRandomValues for true cryptographic randomness
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  // Calculate Shannon entropy bits = length * log2(charset.length)
  const poolSize = charset.length;
  const entropyBits = Math.round(length * (Math.log(poolSize) / Math.log(2)));

  let strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
  if (entropyBits >= 100) strength = 'Very Strong';
  else if (entropyBits >= 65) strength = 'Strong';
  else if (entropyBits >= 45) strength = 'Medium';

  return {
    password,
    entropyBits,
    strength,
  };
}

/**
 * Evaluate Password Strength and Entropy
 */
export function checkPasswordStrength(password: string): {
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Unbreakable';
  crackTimeEstimate: string;
  entropyBits: number;
  feedback: string[];
} {
  if (!password) {
    return {
      score: 0,
      strength: 'Very Weak',
      crackTimeEstimate: 'Instant',
      entropyBits: 0,
      feedback: ['Please enter a password to analyze.'],
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  const entropyBits = Math.round(password.length * (Math.log(Math.max(2, poolSize)) / Math.log(2)));

  const feedback: string[] = [];
  if (password.length < 8) feedback.push('Password is critically short (< 8 characters).');
  else if (password.length < 12) feedback.push('Consider using at least 12-16 characters.');

  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters (A-Z).');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters (a-z).');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers (0-9).');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special symbols (!@#$%^&*).');

  // Estimate crack time assuming 10 billion guesses/sec
  const combinations = Math.pow(poolSize || 2, password.length);
  const seconds = combinations / (10 * 1e9);

  let crackTimeEstimate = 'Instant';
  if (seconds > 31536000 * 1000000) crackTimeEstimate = 'Centuries (Unbreakable)';
  else if (seconds > 31536000 * 100) crackTimeEstimate = 'Thousands of years';
  else if (seconds > 31536000) crackTimeEstimate = `${Math.round(seconds / 31536000)} years`;
  else if (seconds > 86400 * 30) crackTimeEstimate = `${Math.round(seconds / (86400 * 30))} months`;
  else if (seconds > 86400) crackTimeEstimate = `${Math.round(seconds / 86400)} days`;
  else if (seconds > 3600) crackTimeEstimate = `${Math.round(seconds / 3600)} hours`;
  else if (seconds > 60) crackTimeEstimate = `${Math.round(seconds / 60)} minutes`;
  else if (seconds > 1) crackTimeEstimate = `${Math.round(seconds)} seconds`;

  let strength: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Unbreakable' = 'Very Weak';
  let score = 20;

  if (entropyBits >= 90) {
    strength = 'Unbreakable';
    score = 100;
  } else if (entropyBits >= 65) {
    strength = 'Strong';
    score = 85;
  } else if (entropyBits >= 45) {
    strength = 'Moderate';
    score = 60;
  } else if (entropyBits >= 30) {
    strength = 'Weak';
    score = 40;
  }

  return {
    score,
    strength,
    crackTimeEstimate,
    entropyBits,
    feedback: feedback.length > 0 ? feedback : ['Excellent entropy and complexity!'],
  };
}

/**
 * Compute Web Crypto SHA-1, SHA-256, SHA-384, SHA-512 hashes
 */
export async function computeCryptoHash(
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  input: string
): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ROT13 / Caesar Cipher
 */
export function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

/**
 * Simple 2FA / TOTP RFC 6238 Simulation
 */
export function generateTotpCode(secret: string = 'JBSWY3DPEHPK3PXP'): { code: string; secondsRemaining: number } {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep);
  const secondsRemaining = timeStep - (epoch % timeStep);

  // Hash counter with secret seed
  let hash = 0;
  const combined = secret + counter.toString();
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 1000000).toString().padStart(6, '0');

  return {
    code,
    secondsRemaining,
  };
}
