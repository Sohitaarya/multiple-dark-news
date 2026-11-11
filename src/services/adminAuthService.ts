/**
 * MultipleDarkNews Tools - Secure Admin Authentication & Authorization Service
 * Protects administrative controls, registry manipulation, and indexation pings
 * from unauthorized visitors.
 */

const SESSION_KEY = 'mdn_admin_auth_token_v1';
const PASSKEY_HASH_KEY = 'mdn_admin_passkey_hash_v1';
const FAILED_ATTEMPTS_KEY = 'mdn_admin_auth_failed_attempts';
const LOCKOUT_KEY = 'mdn_admin_auth_lockout_until';
const AUTH_LOGS_KEY = 'mdn_admin_auth_audit_logs';

export const DEFAULT_INITIAL_PASSWORD = 'mdn@admin2025';

export interface AuthLogEntry {
  id: string;
  timestamp: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGED' | 'LOCKOUT_TRIGGERED';
  details: string;
}

// In-memory fallback for Node.js test environments or private browser tabs where storage is restricted
const memStore: Record<string, string> = {};

function getStoreItem(key: string, isSession = false): string | null {
  if (typeof window !== 'undefined') {
    try {
      if (isSession) {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
      }
      return localStorage.getItem(key);
    } catch {
      return memStore[key] || null;
    }
  }
  return memStore[key] || null;
}

function setStoreItem(key: string, val: string, isSession = false): void {
  if (typeof window !== 'undefined') {
    try {
      if (isSession) {
        sessionStorage.setItem(key, val);
      } else {
        localStorage.setItem(key, val);
      }
      return;
    } catch {
      memStore[key] = val;
      return;
    }
  }
  memStore[key] = val;
}

function removeStoreItem(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  delete memStore[key];
}

// SHA-256 hashing using Web Crypto API (Browser & Node.js 20+)
export async function sha256(message: string): Promise<string> {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as unknown as { crypto?: { subtle?: SubtleCrypto } }).crypto;
  if (cryptoObj && cryptoObj.subtle) {
    const msgBuffer = new TextEncoder().encode(message.trim());
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${Math.abs(hash)}`;
}

export const adminAuthService = {
  /**
   * Check if current session is authenticated as Admin
   */
  isAuthenticated(): boolean {
    try {
      const session = getStoreItem(SESSION_KEY, true);
      if (!session) return false;
      const parsed = JSON.parse(session);
      // Valid for 24 hours
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        this.logout();
        return false;
      }
      return parsed.authenticated === true;
    } catch {
      return false;
    }
  },

  /**
   * Check if lockout is currently active
   */
  getLockoutRemainingSeconds(): number {
    try {
      const lockoutUntil = parseInt(getStoreItem(LOCKOUT_KEY) || '0', 10);
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  },

  /**
   * Get failed attempts count
   */
  getFailedAttempts(): number {
    return parseInt(getStoreItem(FAILED_ATTEMPTS_KEY) || '0', 10);
  },

  /**
   * Get current stored password hash (or hash of default password if not customized yet)
   */
  async getCurrentPasswordHash(): Promise<string> {
    const stored = getStoreItem(PASSKEY_HASH_KEY);
    if (stored) return stored;
    const defaultHash = await sha256(DEFAULT_INITIAL_PASSWORD);
    setStoreItem(PASSKEY_HASH_KEY, defaultHash);
    return defaultHash;
  },

  /**
   * Check if user is still using the default initial setup password
   */
  async isDefaultPasswordInUse(): Promise<boolean> {
    const currentHash = await this.getCurrentPasswordHash();
    const defaultHash = await sha256(DEFAULT_INITIAL_PASSWORD);
    return currentHash === defaultHash;
  },

  /**
   * Authenticate admin with password
   */
  async login(password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> {
    const lockoutSec = this.getLockoutRemainingSeconds();
    if (lockoutSec > 0) {
      return {
        success: false,
        error: `Security lockout active due to multiple failed attempts. Please retry in ${lockoutSec}s.`
      };
    }

    const inputHash = await sha256(password);
    const storedHash = await this.getCurrentPasswordHash();

    if (inputHash === storedHash) {
      // Reset failed attempts
      removeStoreItem(FAILED_ATTEMPTS_KEY);
      removeStoreItem(LOCKOUT_KEY);

      const sessionData = JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        role: 'SUPER_ADMIN'
      });

      if (rememberMe) {
        setStoreItem(SESSION_KEY, sessionData, false);
      } else {
        setStoreItem(SESSION_KEY, sessionData, true);
      }

      this.logAction('LOGIN_SUCCESS', 'Admin authorization successfully verified');
      return { success: true };
    }

    // Handle failure and rate limiting
    const attempts = this.getFailedAttempts() + 1;
    setStoreItem(FAILED_ATTEMPTS_KEY, attempts.toString());
    this.logAction('LOGIN_FAILED', `Failed passkey attempt #${attempts}`);

    if (attempts >= 5) {
      const lockoutUntil = Date.now() + 60 * 1000; // 60s cooldown
      setStoreItem(LOCKOUT_KEY, lockoutUntil.toString());
      this.logAction('LOCKOUT_TRIGGERED', 'Rate limit hit: 5 consecutive failed attempts. 60-second cooldown imposed.');
      return {
        success: false,
        error: 'Too many incorrect attempts! For security, admin login is locked for 60 seconds.'
      };
    }

    return {
      success: false,
      error: `Invalid Administrator Password! (${5 - attempts} attempts remaining before 60s cooldown)`
    };
  },

  /**
   * Log out and lock the dashboard immediately
   */
  logout(): void {
    removeStoreItem(SESSION_KEY);
    this.logAction('LOGOUT', 'Administrator logged out and locked dashboard');
  },

  /**
   * Change admin master password
   */
  async changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const currentHash = await sha256(currentPass);
    const storedHash = await this.getCurrentPasswordHash();

    if (currentHash !== storedHash) {
      return { success: false, error: 'Current password is incorrect. Verification failed.' };
    }

    const newHash = await sha256(newPass);
    setStoreItem(PASSKEY_HASH_KEY, newHash);
    this.logAction('PASSWORD_CHANGED', 'Admin master passkey successfully updated');

    return { success: true };
  },

  /**
   * Reset password to system default (mdn@admin2025)
   */
  async resetToDefault(): Promise<void> {
    const defaultHash = await sha256(DEFAULT_INITIAL_PASSWORD);
    setStoreItem(PASSKEY_HASH_KEY, defaultHash);
    removeStoreItem(FAILED_ATTEMPTS_KEY);
    removeStoreItem(LOCKOUT_KEY);
    this.logAction('PASSWORD_CHANGED', 'Admin passkey restored to initial setup default');
  },

  /**
   * Audit trail logger
   */
  logAction(action: AuthLogEntry['action'], details: string): void {
    try {
      const logs = this.getAuthLogs();
      const newEntry: AuthLogEntry = {
        id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        action,
        details
      };
      const updated = [newEntry, ...logs.slice(0, 24)];
      setStoreItem(AUTH_LOGS_KEY, JSON.stringify(updated));
    } catch {
      // Silently catch quota issues
    }
  },

  /**
   * Retrieve security audit logs
   */
  getAuthLogs(): AuthLogEntry[] {
    try {
      const raw = getStoreItem(AUTH_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
