/**
 * SEO helper functions
 */

/**
 * Convert minutes to ISO 8601 duration format (e.g., PT15M)
 */
export function minutesToIso8601(minutes: number): string {
  return `PT${minutes}M`;
}

/**
 * Format ingredient for JSON-LD recipe schema
 * Handles cases like "0 salt (to taste)" by omitting amount when 0
 */
export function formatIngredientForJsonLd(
  amount: number,
  unit: string | undefined,
  name: string,
  note: string | undefined
): string {
  let parts: string[] = [];

  if (amount > 0) {
    const amountStr = amount.toString();
    if (unit) {
      parts.push(`${amountStr} ${unit}`);
    } else {
      parts.push(amountStr);
    }
  }

  parts.push(name);

  if (note) {
    parts.push(`(${note})`);
  }

  return parts.join(' ');
}




