/**
 * Unit conversion utilities for recipe ingredients
 * Supports Metric ↔ US conversions for common cooking units
 */

export type UnitSystem = 'metric' | 'us';

/**
 * Conversion factors (US to Metric)
 */
const CONVERSIONS = {
  // Weight
  oz: { toMetric: 28.349523125, toUS: 1 / 28.349523125 }, // 1 oz = 28.349523125 g
  lb: { toMetric: 453.59237, toUS: 1 / 453.59237 }, // 1 lb = 453.59237 g
  // Volume
  'fl oz': { toMetric: 29.5735295625, toUS: 1 / 29.5735295625 }, // 1 fl oz = 29.5735295625 ml
  qt: { toMetric: 946.352946, toUS: 1 / 946.352946 }, // 1 qt = 946.352946 ml
} as const;

/**
 * Unit mappings for aliases and normalization
 */
const UNIT_ALIASES: Record<string, string> = {
  // Metric weight
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  // US weight
  ounce: 'oz',
  ounces: 'oz',
  pound: 'lb',
  pounds: 'lb',
  // Metric volume
  milliliter: 'ml',
  milliliters: 'ml',
  litre: 'l',
  liters: 'l',
  liter: 'l',
  // US volume
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  quart: 'qt',
  quarts: 'qt',
  // Spoons (keep as-is, both systems understand)
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
};

/**
 * Units that should be converted
 */
const CONVERTIBLE_UNITS = new Set([
  'g',
  'kg',
  'oz',
  'lb',
  'ml',
  'l',
  'fl oz',
  'qt',
]);

/**
 * Units that should remain unchanged (count-like)
 */
const COUNT_UNITS = new Set([
  'pcs',
  'piece',
  'pieces',
  'clove',
  'cloves',
  'egg',
  'eggs',
  'cup',
  'cups',
  'tsp',
  'tbsp',
]);

/**
 * Normalizes a unit string (trim, lowercase, resolve aliases)
 */
export function normalizeUnit(unit: string): string {
  if (!unit) return '';
  const trimmed = unit.trim().toLowerCase();
  return UNIT_ALIASES[trimmed] || trimmed;
}

/**
 * Formats a number cleanly:
 * - Rounds to max 2 decimals
 * - Strips trailing zeros after decimal point
 * - Avoids showing -0
 * - If very close to an integer (within 0.01), rounds to integer
 */
export function formatAmount(n: number): string {
  if (n === 0) return '';
  
  // Round to 2 decimals
  let rounded = Math.round(n * 100) / 100;
  
  // If very close to an integer, round to integer
  if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
    rounded = Math.round(rounded);
  }
  
  // Avoid -0
  if (rounded === 0) return '';
  
  const formatted = rounded.toString();
  // Strip trailing zeros after decimal point
  return formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

/**
 * Converts an ingredient amount and unit between metric and US systems
 * @param amount - The amount to convert
 * @param unit - The unit string (will be normalized)
 * @param to - Target unit system
 * @returns Converted amount and unit, or null if unit is not convertible
 */
export function convertIngredient(
  amount: number,
  unit: string,
  to: UnitSystem
): { amount: number; unit: string } | null {
  if (!unit || amount === 0) {
    return null;
  }

  const normalized = normalizeUnit(unit);

  // Don't convert count-like units
  if (COUNT_UNITS.has(normalized)) {
    return null;
  }

  // Don't convert if unit is not in our conversion list
  if (!CONVERTIBLE_UNITS.has(normalized)) {
    return null;
  }

  // Determine source system based on unit
  const isMetricUnit = normalized === 'g' || normalized === 'kg' || normalized === 'ml' || normalized === 'l';
  const isUSUnit = normalized === 'oz' || normalized === 'lb' || normalized === 'fl oz' || normalized === 'qt';

  // If unit doesn't match target system, convert
  if (to === 'metric' && isUSUnit) {
    // US → Metric
    const conversion = CONVERSIONS[normalized as keyof typeof CONVERSIONS];
    if (!conversion) return null;

    let convertedAmount = amount * conversion.toMetric;
    let convertedUnit: string;

    // Convert to appropriate metric unit
    if (normalized === 'oz') {
      convertedUnit = 'g';
    } else if (normalized === 'lb') {
      // If result is >= 1000g, use kg
      if (convertedAmount >= 1000) {
        convertedAmount = convertedAmount / 1000;
        convertedUnit = 'kg';
      } else {
        convertedUnit = 'g';
      }
    } else if (normalized === 'fl oz') {
      convertedUnit = 'ml';
    } else if (normalized === 'qt') {
      // If result is >= 1000ml, use l
      if (convertedAmount >= 1000) {
        convertedAmount = convertedAmount / 1000;
        convertedUnit = 'l';
      } else {
        convertedUnit = 'ml';
      }
    } else {
      return null;
    }

    return { amount: convertedAmount, unit: convertedUnit };
  } else if (to === 'us' && isMetricUnit) {
    // Metric → US
    let convertedAmount: number;
    let convertedUnit: string;

    if (normalized === 'g') {
      convertedAmount = amount * CONVERSIONS.oz.toUS;
      convertedUnit = 'oz';
    } else if (normalized === 'kg') {
      // Convert kg to g first, then to lb
      const grams = amount * 1000;
      convertedAmount = grams * CONVERSIONS.lb.toUS;
      // If result is >= 1 lb, use lb, otherwise oz
      if (convertedAmount >= 1) {
        convertedUnit = 'lb';
      } else {
        convertedAmount = grams * CONVERSIONS.oz.toUS;
        convertedUnit = 'oz';
      }
    } else if (normalized === 'ml') {
      convertedAmount = amount * CONVERSIONS['fl oz'].toUS;
      convertedUnit = 'fl oz';
    } else if (normalized === 'l') {
      // Convert l to ml first, then to fl oz or qt
      const milliliters = amount * 1000;
      const quarts = milliliters * CONVERSIONS.qt.toUS;
      // If result is >= 1 qt, use qt, otherwise fl oz
      if (quarts >= 1) {
        convertedAmount = quarts;
        convertedUnit = 'qt';
      } else {
        convertedAmount = milliliters * CONVERSIONS['fl oz'].toUS;
        convertedUnit = 'fl oz';
      }
    } else {
      return null;
    }

    return { amount: convertedAmount, unit: convertedUnit };
  }

  // Unit already matches target system, no conversion needed
  return null;
}

