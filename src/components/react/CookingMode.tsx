import { useEffect, useState, useRef, useCallback } from 'react';
import { buttonClasses } from '../ui/classes';
import { convertIngredient, convertNote, formatAmount, type UnitSystem } from '../../lib/units';

/**
 * Hook to detect prefers-reduced-motion preference
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

interface Ingredient {
  amount: number;
  unit?: string;
  name: string;
  note?: string;
}

interface CookingModeProps {
  slug: string;
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  unitToggleEnabled: boolean;
  scalingEnabled: boolean;
  defaultUnitSystem: 'metric' | 'us';
  baseServings: number;
  features: { keepAwake: boolean };
}

/**
 * CookingMode - Full-screen cooking mode overlay for step-by-step recipe navigation
 * Features: step navigation, keep-awake, ingredient scaling/unit conversion, step persistence
 */
export function CookingMode({
  slug,
  title,
  ingredients,
  steps,
  unitToggleEnabled,
  scalingEnabled,
  defaultUnitSystem,
  baseServings,
  features,
}: CookingModeProps) {
  const stepStorageKey = `tsk.step.${slug}`;
  const servingsStorageKey = `tsk.servings.${slug}`;
  const unitsStorageKey = 'tsk.units';

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState<number>(baseServings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(defaultUnitSystem);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Load persisted state after mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load last step
      const storedStep = localStorage.getItem(stepStorageKey);
      if (storedStep) {
        const parsed = parseInt(storedStep, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < steps.length) {
          setCurrentStep(parsed);
        }
      }

      // Load servings (per recipe)
      if (scalingEnabled) {
        const storedServings = localStorage.getItem(servingsStorageKey);
        if (storedServings) {
          const parsed = parseInt(storedServings, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            setServings(parsed);
          }
        }
      }

      // Load unit system (global)
      if (unitToggleEnabled) {
        const storedUnits = localStorage.getItem(unitsStorageKey);
        if (storedUnits === 'metric' || storedUnits === 'us') {
          setUnitSystem(storedUnits);
        }
      }
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [stepStorageKey, servingsStorageKey, unitsStorageKey, steps.length, scalingEnabled, unitToggleEnabled]);

  // Persist current step
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;

    try {
      localStorage.setItem(stepStorageKey, currentStep.toString());
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [currentStep, stepStorageKey, isOpen]);

  // Persist servings
  useEffect(() => {
    if (typeof window === 'undefined' || !scalingEnabled) return;

    try {
      localStorage.setItem(servingsStorageKey, servings.toString());
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [servings, servingsStorageKey, scalingEnabled]);

  // Persist unit system
  useEffect(() => {
    if (typeof window === 'undefined' || !unitToggleEnabled) return;

    try {
      localStorage.setItem(unitsStorageKey, unitSystem);
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [unitSystem, unitsStorageKey, unitToggleEnabled]);

  // Request wake lock when opened (if enabled and supported)
  useEffect(() => {
    if (!isOpen || !features.keepAwake || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        sentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLock(sentinel);

        // Reacquire on visibility change (best effort)
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible' && sentinel === null && isOpen) {
            try {
              sentinel = await (navigator as any).wakeLock.request('screen');
              setWakeLock(sentinel);
            } catch (error) {
              // Ignore errors
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } catch (error) {
        // Wake lock not supported or denied, ignore silently
      }
    };

    requestWakeLock();

    return () => {
      if (sentinel) {
        sentinel.release().catch(() => {
          // Ignore errors
        });
        setWakeLock(null);
      }
    };
  }, [isOpen, features.keepAwake]);

  // Release wake lock on close
  useEffect(() => {
    if (!isOpen && wakeLock) {
      wakeLock.release().catch(() => {
        // Ignore errors
      });
      setWakeLock(null);
    }
  }, [isOpen, wakeLock]);

  // Lock body scroll when open (with iOS Safari support)
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // iOS Safari requires position:fixed + width:100% to prevent background scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Focus overlay for keyboard navigation
      overlayRef.current?.focus();
      
      return () => {
        // Restore scroll position on close
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Prevent default for arrow keys to avoid scrolling
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleDecrementServings = () => {
    setServings((prev) => Math.max(1, prev - 1));
  };

  const handleIncrementServings = () => {
    setServings((prev) => Math.min(16, prev + 1));
  };

  // Calculate scaled and converted ingredients
  const scaleFactor = scalingEnabled ? servings / baseServings : 1;
  const displayIngredients = ingredients.map((ingredient) => {
    let amount = ingredient.amount * scaleFactor;
    let unit = ingredient.unit;

    // Apply unit conversion if enabled
    if (unitToggleEnabled && unit && amount !== 0) {
      const converted = convertIngredient(amount, unit, unitSystem);
      if (converted) {
        amount = converted.amount;
        unit = converted.unit;
      }
    }

    // Convert note if unit toggle is enabled
    let note = ingredient.note;
    if (unitToggleEnabled && note) {
      note = convertNote(note, unitSystem);
    }

    const formattedAmount = formatAmount(amount);

    return {
      ...ingredient,
      displayAmount: formattedAmount,
      displayUnit: unit,
      displayNote: note,
    };
  });

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClasses({ variant: 'primary', size: 'md' })}
        aria-label="Open cooking mode"
      >
        Cooking Mode
      </button>
    );
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[color:var(--bg)] overflow-y-auto focus:outline-none"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Cooking mode"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[color:var(--bg)] border-b border-[color:var(--glass-border)] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-[color:var(--text)] truncate pr-4">
            {title}
          </h1>
          <button
            type="button"
            onClick={handleClose}
            className={buttonClasses({ variant: 'ghost', size: 'md' })}
            aria-label="Close cooking mode"
          >
            Close
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Controls Row */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Servings Control */}
          {scalingEnabled && (
            <div className="flex items-center gap-2">
              <label className="text-sm uppercase tracking-wider text-[color:var(--muted)] font-medium">
                Servings
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDecrementServings}
                  disabled={servings <= 1}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  aria-label="Decrease servings"
                >
                  −
                </button>
                <span className="w-12 text-center text-lg font-semibold text-[color:var(--text)]">
                  {servings}
                </span>
                <button
                  type="button"
                  onClick={handleIncrementServings}
                  disabled={servings >= 16}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  aria-label="Increase servings"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Unit Toggle */}
          {unitToggleEnabled && (
            <div className="inline-flex items-center bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1 text-xs uppercase tracking-wider font-medium ${prefersReducedMotion ? '' : 'transition-all duration-150'} rounded-full ${
                  unitSystem === 'metric'
                    ? 'bg-[color:var(--accent)] text-[color:var(--bg)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                }`}
                aria-label="Use metric units"
                aria-pressed={unitSystem === 'metric'}
              >
                g
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('us')}
                className={`px-3 py-1 text-xs uppercase tracking-wider font-medium ${prefersReducedMotion ? '' : 'transition-all duration-150'} rounded-full ${
                  unitSystem === 'us'
                    ? 'bg-[color:var(--accent)] text-[color:var(--bg)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                }`}
                aria-label="Use US units"
                aria-pressed={unitSystem === 'us'}
              >
                oz
              </button>
            </div>
          )}

          {/* Step Counter */}
          <div className="ml-auto text-sm uppercase tracking-wider text-[color:var(--muted)] font-medium">
            Step {currentStep + 1} / {steps.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingredients Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-xl p-4 sm:p-6 backdrop-blur-sm">
              <h2 className="text-sm uppercase tracking-wider text-[color:var(--muted)] font-medium mb-4">
                Ingredients
              </h2>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {displayIngredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex flex-wrap items-baseline gap-1.5 text-[color:var(--text)] leading-relaxed text-sm sm:text-base"
                  >
                    {ingredient.amount === 0 ? (
                      <span className="font-semibold text-[color:var(--text)] min-w-[60px]">—</span>
                    ) : (
                      <span className="font-semibold text-[color:var(--text)] min-w-[60px]">
                        {ingredient.displayAmount}
                        {ingredient.displayUnit && ` ${ingredient.displayUnit}`}
                      </span>
                    )}
                    <span className="flex-1 min-w-[120px]">{ingredient.name}</span>
                    {ingredient.displayNote && (
                      <span className="text-[color:var(--muted)] text-xs sm:text-sm italic">
                        {ingredient.displayNote}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Step Content */}
          <main className="lg:col-span-2">
            <div className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-xl p-6 sm:p-8 lg:p-12 backdrop-blur-sm min-h-[400px] flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[color:var(--text)] leading-relaxed text-center max-w-3xl">
                  {steps[currentStep]}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={buttonClasses({ variant: 'primary', size: 'lg' })}
                  aria-label="Previous step"
                >
                  ← Previous
                </button>

                {/* Step List (compact) */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleStepClick(index)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium ${prefersReducedMotion ? '' : 'transition-all duration-150'} ${
                        index === currentStep
                          ? 'bg-[color:var(--accent)] bg-opacity-20 text-[color:var(--accent)] border border-[color:var(--accent)] border-opacity-40'
                          : 'bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] text-[color:var(--muted)] hover:text-[color:var(--text)] hover:border-[rgba(255,255,255,0.18)]'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                      aria-current={index === currentStep ? 'step' : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className={buttonClasses({ variant: 'primary', size: 'lg' })}
                  aria-label="Next step"
                >
                  Next →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

