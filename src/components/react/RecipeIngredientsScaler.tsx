import { useEffect, useState } from 'react';
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

interface RecipeIngredientsScalerProps {
  slug: string;
  baseServings: number;
  ingredients: Ingredient[];
  minServings?: number;
  maxServings?: number;
  scalingEnabled?: boolean;
  unitToggleEnabled?: boolean;
  defaultUnitSystem?: UnitSystem;
}

/**
 * RecipeIngredientsScaler - Interactive ingredient scaling and unit conversion component
 * Allows users to adjust servings and toggle between metric/US units
 */
export function RecipeIngredientsScaler({
  slug,
  baseServings,
  ingredients,
  minServings = 1,
  maxServings = 16,
  scalingEnabled = true,
  unitToggleEnabled = false,
  defaultUnitSystem = 'metric',
}: RecipeIngredientsScalerProps) {
  const servingsStorageKey = `tsk.servings.${slug}`;
  const unitsStorageKey = 'tsk.units';

  // Initialize with baseServings to match server render (avoid hydration mismatch)
  const [servings, setServings] = useState<number>(baseServings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(defaultUnitSystem);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Load servings (per recipe)
      if (scalingEnabled) {
        const storedServings = localStorage.getItem(servingsStorageKey);
        if (storedServings) {
          const parsed = parseInt(storedServings, 10);
          if (!isNaN(parsed) && parsed >= minServings && parsed <= maxServings) {
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
  }, [servingsStorageKey, unitsStorageKey, minServings, maxServings, scalingEnabled, unitToggleEnabled]);

  // Persist servings to localStorage when changed
  useEffect(() => {
    if (typeof window === 'undefined' || !scalingEnabled) return;
    
    try {
      localStorage.setItem(servingsStorageKey, servings.toString());
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [servings, servingsStorageKey, scalingEnabled]);

  // Persist unit system to localStorage when changed
  useEffect(() => {
    if (typeof window === 'undefined' || !unitToggleEnabled) return;
    
    try {
      localStorage.setItem(unitsStorageKey, unitSystem);
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [unitSystem, unitsStorageKey, unitToggleEnabled]);

  const scaleFactor = scalingEnabled ? servings / baseServings : 1;

  const handleDecrement = () => {
    setServings((prev) => Math.max(minServings, prev - 1));
  };

  const handleIncrement = () => {
    setServings((prev) => Math.min(maxServings, prev + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setServings(minServings);
      return;
    }
    
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(minServings, Math.min(maxServings, num));
      setServings(clamped);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || isNaN(parseInt(value, 10))) {
      setServings(baseServings);
    }
  };

  const handleUnitSystemChange = (system: UnitSystem) => {
    setUnitSystem(system);
  };

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium uppercase tracking-wider text-[color:var(--muted)] m-0">
          Ingredients
        </h2>
        <div className="flex items-center gap-4">
          {scalingEnabled && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="servings-input"
                className="text-xs uppercase tracking-wider text-[color:var(--muted)] font-medium"
              >
                Servings
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={servings <= minServings}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  aria-label="Decrease servings"
                >
                  −
                </button>
                <input
                  id="servings-input"
                  type="number"
                  min={minServings}
                  max={maxServings}
                  value={servings}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-16 text-center bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-lg text-[color:var(--text)] text-base font-medium px-2 py-1.5 focus:outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_rgba(255,107,53,0.2)] transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={servings >= maxServings}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  aria-label="Increase servings"
                >
                  +
                </button>
              </div>
            </div>
          )}
          {unitToggleEnabled && (
            <div className="inline-flex items-center bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-full p-0.5">
              <button
                type="button"
                onClick={() => handleUnitSystemChange('metric')}
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
                onClick={() => handleUnitSystemChange('us')}
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
        </div>
      </div>

      <div className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-xl p-6 backdrop-blur-sm">
        <ul className="list-none m-0 p-0 flex flex-col gap-3">
          {ingredients.map((ingredient, index) => {
            // Step 1: Apply scaling if enabled
            let amount = ingredient.amount * scaleFactor;
            let unit = ingredient.unit;

            // Step 2: Apply unit conversion if enabled and unit is convertible
            if (unitToggleEnabled && unit && amount !== 0) {
              const converted = convertIngredient(amount, unit, unitSystem);
              if (converted) {
                amount = converted.amount;
                unit = converted.unit;
              }
            }

            // Step 3: Convert weights/volumes in note if unit toggle is enabled
            let note = ingredient.note;
            if (unitToggleEnabled && note) {
              note = convertNote(note, unitSystem);
            }

            // Step 4: Format amount
            const formattedAmount = formatAmount(amount);

            return (
              <li key={index} className="flex flex-wrap items-baseline gap-2 text-[color:var(--text)] leading-relaxed text-lg">
                {ingredient.amount === 0 ? (
                  <span className="font-semibold text-[color:var(--text)] min-w-[80px]">—</span>
                ) : (
                  <span className="font-semibold text-[color:var(--text)] min-w-[80px]">
                    {formattedAmount}
                    {unit && ` ${unit}`}
                  </span>
                )}
                <span className="flex-1 min-w-[200px]">{ingredient.name}</span>
                {note && (
                  <span className="text-[color:var(--muted)] text-[0.9375rem] italic">
                    {note}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

