/**
 * Theme System - Dark/Light/System theme management
 * 
 * Handles theme preference storage, resolution, and application.
 * Guards against SSR by checking for browser environment.
 */

export type ThemeChoice = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'tsk.theme';

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get the initial theme choice from localStorage or return the default
 */
export function getInitialThemeChoice(defaultChoice: ThemeChoice): ThemeChoice {
  if (!isBrowser()) {
    return defaultChoice;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }

  return defaultChoice;
}

/**
 * Resolve "system" theme choice to actual dark/light based on OS preference
 */
export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') {
    if (!isBrowser()) {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return choice;
}

/**
 * Apply the theme by setting data-theme attribute on document element
 */
export function applyTheme(choice: ThemeChoice): void {
  if (!isBrowser()) {
    return;
  }

  const resolved = resolveTheme(choice);
  document.documentElement.dataset.theme = resolved;
  
  // Update color-scheme for native elements
  document.documentElement.style.colorScheme = resolved;
}

/**
 * Persist theme choice to localStorage
 */
export function persistThemeChoice(choice: ThemeChoice): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get the currently persisted theme choice (or null if none)
 */
export function getPersistedThemeChoice(): ThemeChoice | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }

  return null;
}
