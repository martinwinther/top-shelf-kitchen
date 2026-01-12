/**
 * Global TypeScript declarations for browser APIs and custom globals
 */

/**
 * Wake Lock API types
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface Navigator {
  readonly wakeLock?: WakeLock;
}

/**
 * Custom global functions exposed by the consent system
 */
interface Window {
  tskOpenConsentModal?: () => void;
}
