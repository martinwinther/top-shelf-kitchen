/**
 * Shared class utilities for consistent UI styling
 * Dependency-free, works with Tailwind CSS
 */

/**
 * Simple class name joiner (handles undefined/null/empty strings)
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Button class generator
 * Returns Tailwind class strings for consistent button styling
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
}: {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
} = {}): string {
  const base = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-150',
    'rounded-lg',
    'focus-visible:outline',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-[color:var(--accent)]',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ];

  const variants = {
    primary: [
      'bg-[color:var(--glass-bg)]',
      'border',
      'border-[color:var(--glass-border)]',
      'text-[color:var(--text)]',
      'hover:bg-[rgba(255,255,255,0.1)]',
      'hover:border-[rgba(255,255,255,0.18)]',
      'active:scale-[0.98]',
    ],
    secondary: [
      'bg-transparent',
      'border',
      'border-[color:var(--glass-border)]',
      'text-[color:var(--muted)]',
      'hover:bg-[color:var(--glass-bg)]',
      'hover:text-[color:var(--text)]',
      'active:scale-[0.98]',
    ],
    ghost: [
      'bg-transparent',
      'text-[color:var(--muted)]',
      'hover:bg-[color:var(--glass-bg)]',
      'hover:text-[color:var(--text)]',
      'active:scale-[0.98]',
    ],
  };

  const sizes = {
    sm: ['text-sm', 'px-3', 'py-1.5', 'gap-1.5'],
    md: ['text-base', 'px-4', 'py-2', 'gap-2'],
    lg: ['text-lg', 'px-6', 'py-3', 'gap-2.5'],
  };

  return cx(...base, ...variants[variant], ...sizes[size]);
}

/**
 * Badge class generator
 * Returns Tailwind class strings for badge styling
 */
export function badgeClasses({
  tone = 'neutral',
}: {
  tone?: 'neutral' | 'accent' | 'muted';
} = {}): string {
  const base = [
    'inline-flex',
    'items-center',
    'px-2',
    'py-0.5',
    'rounded-md',
    'text-xs',
    'font-medium',
    'leading-tight',
  ];

  const tones = {
    neutral: [
      'bg-[color:var(--glass-bg)]',
      'border',
      'border-[color:var(--glass-border)]',
      'text-[color:var(--text)]',
    ],
    accent: [
      'bg-[color:var(--accent)]',
      'bg-opacity-15',
      'text-[color:var(--accent)]',
      'border',
      'border-[color:var(--accent)]',
      'border-opacity-30',
    ],
    muted: [
      'bg-transparent',
      'text-[color:var(--muted)]',
    ],
  };

  return cx(...base, ...tones[tone]);
}

