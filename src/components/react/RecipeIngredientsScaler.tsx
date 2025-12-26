import { useEffect, useState } from 'react';
import { buttonClasses } from '../ui/classes';

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
}

/**
 * Formats a number cleanly:
 * - Rounds to max 2 decimals
 * - Strips trailing zeros after decimal point (1.50 → 1.5, 2.00 → 2)
 * - Avoids showing -0
 */
function formatAmount(amount: number): string {
  if (amount === 0) return '';
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toString();
  // Only strip trailing zeros after a decimal point
  // This handles both "2.00" → "2" and "1.50" → "1.5"
  return formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

/**
 * RecipeIngredientsScaler - Interactive ingredient scaling component
 * Allows users to adjust servings and see ingredient amounts scale in real-time
 */
export function RecipeIngredientsScaler({
  slug,
  baseServings,
  ingredients,
  minServings = 1,
  maxServings = 16,
}: RecipeIngredientsScalerProps) {
  const storageKey = `tsk.servings.${slug}`;

  // Initialize with baseServings to match server render (avoid hydration mismatch)
  const [servings, setServings] = useState<number>(baseServings);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= minServings && parsed <= maxServings) {
          setServings(parsed);
        }
      }
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [storageKey, minServings, maxServings]);

  // Persist servings to localStorage when changed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, servings.toString());
    } catch (error) {
      // localStorage may be unavailable, ignore
    }
  }, [servings, storageKey]);

  const scaleFactor = servings / baseServings;

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

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium uppercase tracking-wider text-[color:var(--muted)] m-0">
          Ingredients
        </h2>
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
      </div>

      <div className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-xl p-6 backdrop-blur-sm">
        <ul className="list-none m-0 p-0 flex flex-col gap-3">
          {ingredients.map((ingredient, index) => {
            const scaledAmount = ingredient.amount * scaleFactor;
            const formattedAmount = formatAmount(scaledAmount);

            return (
              <li key={index} className="flex flex-wrap items-baseline gap-2 text-[color:var(--text)] leading-relaxed text-lg">
                {ingredient.amount === 0 ? (
                  <span className="font-semibold text-[color:var(--text)] min-w-[80px]">—</span>
                ) : (
                  <span className="font-semibold text-[color:var(--text)] min-w-[80px]">
                    {formattedAmount}
                    {ingredient.unit && ` ${ingredient.unit}`}
                  </span>
                )}
                <span className="flex-1 min-w-[200px]">{ingredient.name}</span>
                {ingredient.note && (
                  <span className="text-[color:var(--muted)] text-[0.9375rem] italic">
                    {ingredient.note}
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

