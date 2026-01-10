/**
 * SearchModal - Full-site search powered by Pagefind
 *
 * Opens via header button or ⌘/Ctrl+K keyboard shortcut.
 * Uses Pagefind's static index for fast, offline-capable search.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { buttonClasses, cx } from '../ui/classes';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta?: { title?: string };
    excerpt: string;
  }>;
}

interface PagefindAPI {
  search: (query: string) => Promise<{
    results: PagefindResult[];
  }>;
}

interface SearchModalProps {
  siteName: string;
  enabled: boolean;
}

declare global {
  interface Window {
    pagefind?: PagefindAPI;
  }
}

export function SearchModal({ siteName, enabled }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagefindLoaded, setPagefindLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const openerRef = useRef<HTMLElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Load Pagefind via script tag injection (more reliable than dynamic import)
  const loadPagefind = useCallback(async () => {
    if (window.pagefind) {
      setPagefindLoaded(true);
      return;
    }

    // Check if script is already loading
    if (scriptRef.current) {
      // Wait for existing script to load
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.pagefind) {
            clearInterval(checkInterval);
            setPagefindLoaded(true);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }

    // First, verify the script exists
    try {
      const response = await fetch('/pagefind/pagefind.js', { method: 'HEAD' });
      if (!response.ok) {
        setError('Search index not found. Run build with search enabled.');
        return;
      }
    } catch {
      setError('Search index not found. Run build with search enabled.');
      return;
    }

    // Inject script tag
    const script = document.createElement('script');
    script.src = '/pagefind/pagefind.js';
    script.type = 'module';
    script.async = true;
    scriptRef.current = script;

    script.onload = () => {
      // Pagefind exposes itself on window after loading
      if (window.pagefind) {
        setPagefindLoaded(true);
      } else {
        // Wait a bit for Pagefind to initialize
        setTimeout(() => {
          if (window.pagefind) {
            setPagefindLoaded(true);
          } else {
            setError('Search failed to initialize. Please refresh the page.');
          }
        }, 100);
      }
    };

    script.onerror = () => {
      setError('Search index not found. Run build with search enabled.');
      scriptRef.current = null;
    };

    document.head.appendChild(script);
  }, []);

  // Cleanup script tag on unmount (only if Pagefind failed to load)
  useEffect(() => {
    return () => {
      // Only remove script if it failed to load (error state)
      // If Pagefind loaded successfully, keep the script for reuse
      if (scriptRef.current && !window.pagefind) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, []);

  // Open modal
  const openModal = useCallback((opener?: HTMLElement) => {
    if (!enabled) return;
    // Store the opener element to return focus on close
    openerRef.current = opener || document.activeElement as HTMLElement;
    setIsOpen(true);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    setError(null);
    loadPagefind();
  }, [enabled, loadPagefind]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    // Return focus to the opener element
    if (openerRef.current && typeof openerRef.current.focus === 'function') {
      // Use setTimeout to ensure DOM updates complete first
      setTimeout(() => {
        openerRef.current?.focus();
        openerRef.current = null;
      }, 0);
    }
  }, []);

  // Handle search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !window.pagefind) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const search = await window.pagefind.search(searchQuery);
        const resultData = await Promise.all(
          search.results.slice(0, 8).map(async (result) => {
            const data = await result.data();
            return {
              url: data.url,
              title: data.meta?.title || 'Untitled',
              excerpt: data.excerpt,
            };
          })
        );
        setResults(resultData);
        setSelectedIndex(0);
      } catch {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (!isOpen || !pagefindLoaded) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isOpen, pagefindLoaded, performSearch]);

  // Keyboard shortcut to open (⌘/Ctrl + K)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey && event.key === 'k') {
        event.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isOpen, openModal, closeModal]);

  // Listen for search trigger button clicks
  useEffect(() => {
    if (!enabled) return;

    const handleTriggerClick = (e: Event) => {
      openModal(e.currentTarget as HTMLElement);
    };
    const triggers = document.querySelectorAll('[data-search-trigger]');
    triggers.forEach((trigger) =>
      trigger.addEventListener('click', handleTriggerClick)
    );

    return () => {
      triggers.forEach((trigger) =>
        trigger.removeEventListener('click', handleTriggerClick)
      );
    };
  }, [enabled, openModal]);

  // Focus input when modal opens (use requestAnimationFrame for reliable focus)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle keyboard navigation within modal
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
        break;
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === dialogRef.current) {
      closeModal();
    }
  };

  if (!enabled || !isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="search-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Search ${siteName}`}
      data-pagefind-ignore
    >
      <div className="search-modal">
        <div className="search-header">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search recipes"
          />
          <button
            type="button"
            className={cx(buttonClasses({ variant: 'ghost', size: 'sm' }))}
            onClick={closeModal}
            aria-label="Close search"
          >
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className="search-results">
          {error && <div className="search-error">{error}</div>}

          {isLoading && (
            <div className="search-loading">Searching...</div>
          )}

          {!isLoading && !error && query && results.length === 0 && (
            <div className="search-empty">
              No recipes found for "{query}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="results-list" role="listbox">
              {results.map((result, index) => (
                <li key={result.url} role="option" aria-selected={index === selectedIndex}>
                  <a
                    href={result.url}
                    className={cx(
                      'result-item',
                      index === selectedIndex && 'result-item--selected'
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="result-title">{result.title}</span>
                    <span
                      className="result-excerpt"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && !query && (
            <div className="search-hint">
              <p>Type to search recipes by title, ingredients, or description.</p>
              <div className="keyboard-hints">
                <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                <span><kbd>Enter</kbd> Open</span>
                <span><kbd>Esc</kbd> Close</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 10vh 1rem 1rem;
          background: var(--modal-backdrop);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .search-modal {
          width: 100%;
          max-width: 560px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--glass-shadow), var(--glass-glow);
          overflow: hidden;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .search-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .search-icon {
          color: var(--muted);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 1.125rem;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--muted);
        }

        .search-results {
          max-height: 400px;
          overflow-y: auto;
        }

        .results-list {
          list-style: none;
          margin: 0;
          padding: 0.5rem;
        }

        .result-item {
          display: block;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text);
          transition: background 0.1s ease;
        }

        .result-item:hover,
        .result-item--selected {
          background: var(--glass-bg);
        }

        .result-item--selected {
          border: 1px solid var(--glass-border);
        }

        .result-title {
          display: block;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .result-excerpt {
          display: block;
          font-size: 0.875rem;
          color: var(--muted);
          line-height: 1.5;
        }

        .result-excerpt mark {
          background: var(--accent-muted);
          color: var(--accent);
          border-radius: 2px;
          padding: 0 2px;
        }

        .search-loading,
        .search-empty,
        .search-error,
        .search-hint {
          padding: 2rem 1.25rem;
          text-align: center;
          color: var(--muted);
        }

        .search-error {
          color: var(--error);
        }

        .search-hint p {
          margin: 0 0 1rem;
        }

        .keyboard-hints {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.75rem;
        }

        .keyboard-hints span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        kbd {
          display: inline-block;
          padding: 0.15rem 0.4rem;
          font-size: 0.7rem;
          font-family: system-ui, sans-serif;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 0.25rem;
          color: var(--muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .search-modal-backdrop,
          .search-modal {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

