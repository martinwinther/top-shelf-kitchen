/**
 * Consent Management Library
 *
 * Provides functions for reading/writing user consent preferences.
 * Stores in both cookie (for server-readable, pre-hydration) and localStorage (convenience).
 *
 * This module runs in the browser only; guards are in place for SSR safety.
 */

// ============================================================================
// Types
// ============================================================================

export interface ConsentState {
  necessary: true; // Always true
  ads: boolean;
  analytics: boolean;
  version: string;
  updatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

export const CONSENT_COOKIE = 'tsk_consent';
export const CONSENT_STORAGE = 'tsk.consent';
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 year

// ============================================================================
// Helper Functions
// ============================================================================

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...valueParts] = cookie.split('=');
    if (cookieName.trim() === name) {
      const value = valueParts.join('=');
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) return;

  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getLocalStorage(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorage(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage might be full or disabled
  }
}

function removeLocalStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

function isValidConsentState(obj: unknown, version: string): obj is ConsentState {
  if (typeof obj !== 'object' || obj === null) return false;

  const consent = obj as Record<string, unknown>;

  return (
    consent.necessary === true &&
    typeof consent.ads === 'boolean' &&
    typeof consent.analytics === 'boolean' &&
    consent.version === version &&
    typeof consent.updatedAt === 'string'
  );
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Returns default consent state (necessary only)
 */
export function getDefaultConsent(version: string): ConsentState {
  return {
    necessary: true,
    ads: false,
    analytics: false,
    version,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reads consent from cookie (priority) or localStorage.
 * Returns null if no valid consent found or version mismatch.
 */
export function readConsent(version: string): ConsentState | null {
  if (!isBrowser()) return null;

  // Try cookie first
  const cookieValue = getCookie(CONSENT_COOKIE);
  if (cookieValue) {
    const parsed = safeJsonParse<ConsentState>(cookieValue);
    if (parsed && isValidConsentState(parsed, version)) {
      return parsed;
    }
  }

  // Fallback to localStorage
  const storageValue = getLocalStorage(CONSENT_STORAGE);
  if (storageValue) {
    const parsed = safeJsonParse<ConsentState>(storageValue);
    if (parsed && isValidConsentState(parsed, version)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Writes consent to both cookie and localStorage.
 */
export function writeConsent(consent: ConsentState): void {
  if (!isBrowser()) return;

  const json = JSON.stringify(consent);

  // Write to cookie (1 year expiry)
  setCookie(CONSENT_COOKIE, json, COOKIE_MAX_AGE_SECONDS);

  // Mirror to localStorage
  setLocalStorage(CONSENT_STORAGE, json);
}

/**
 * Clears all consent data (for debugging/testing).
 */
export function clearConsent(): void {
  if (!isBrowser()) return;

  deleteCookie(CONSENT_COOKIE);
  removeLocalStorage(CONSENT_STORAGE);
}

/**
 * Checks if consent is granted for a specific category.
 * Returns false if no consent found or version mismatch.
 */
export function hasConsent(version: string, key: 'ads' | 'analytics'): boolean {
  const consent = readConsent(version);
  if (!consent) return false;
  return consent[key] === true;
}

/**
 * Checks if ads consent is granted.
 * Returns false if no consent found.
 */
export function hasAdsConsent(version: string): boolean {
  return hasConsent(version, 'ads');
}

/**
 * Checks if analytics consent is granted.
 * Returns false if no consent found.
 */
export function hasAnalyticsConsent(version: string): boolean {
  return hasConsent(version, 'analytics');
}

/**
 * Opens the consent preferences modal by dispatching a custom event.
 * The ConsentBanner component listens for this event.
 */
export function openConsentModal(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event('tsk:open-consent'));
}

/**
 * Navigates to the privacy page with manage-consent hash.
 * Useful for links that want to open the modal on the privacy page.
 */
export function navigateToManageConsent(): void {
  if (!isBrowser()) return;
  window.location.href = '/privacy#manage-consent';
}

