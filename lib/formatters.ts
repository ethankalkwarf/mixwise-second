/**
 * Formatting utilities for display text
 */

/** Cocktails added within this many days show a "NEW" label. */
export const NEW_COCKTAIL_DAYS = 30;

/**
 * Whether a cocktail should show the "NEW" label based on when it was added.
 */
export function isNewCocktail(
  createdAt: string | Date | null | undefined,
  days: number = NEW_COCKTAIL_DAYS
): boolean {
  if (!createdAt) return false;
  const createdMs =
    createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return false;
  return Date.now() - createdMs < days * 24 * 60 * 60 * 1000;
}

/**
 * Formats a cocktail name with proper title casing
 * Capitalizes every word except filler words (the, and, a, of) unless they're the first word.
 * Preserves all-caps acronyms from the source (e.g. VDC in "The Yoozh (aka VDC)").
 *
 * Examples:
 * - "tom collins" → "Tom Collins"
 * - "the last word" → "The Last Word"
 * - "gin and tonic" → "Gin and Tonic"
 * - "death of a salesman" → "Death of a Salesman"
 * - "The Yoozh (aka VDC)" → "The Yoozh (aka VDC)"
 */
export function formatCocktailName(name: string): string {
  if (!name) return name;

  // Filler words that should remain lowercase (unless first word)
  const fillerWords = new Set(['the', 'and', 'a', 'of', 'aka']);

  // Preserve source all-caps acronyms (2+ letters), ignoring surrounding punctuation
  const acronyms = new Set<string>();
  for (const token of name.split(/[\s-]+/)) {
    const letters = token.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 2 && letters === letters.toUpperCase()) {
      acronyms.add(letters.toLowerCase());
    }
  }

  return name
    .toLowerCase()
    .split(/[\s-]+/) // Split on spaces and hyphens
    .map((word, index) => {
      const match = word.match(/^([^a-z]*)([a-z]+)([^a-z]*)$/);
      if (!match) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      const [, prefix, letters, suffix] = match;

      if (acronyms.has(letters)) {
        return prefix + letters.toUpperCase() + suffix;
      }

      // Always capitalize first word; otherwise skip filler words
      if (index === 0 || !fillerWords.has(letters)) {
        return prefix + letters.charAt(0).toUpperCase() + letters.slice(1) + suffix;
      }

      return prefix + letters + suffix;
    })
    .join(' '); // Rejoin with spaces
}

/**
 * Formats an ingredient category label for display (pluralized).
 *
 * Note: category keys in the data model remain singular (e.g. "Spirit"),
 * but UI should display plural labels (e.g. "Spirits").
 */
export function formatIngredientCategory(category: string): string {
  if (!category) return category;

  const normalized = category.trim();
  const map: Record<string, string> = {
    Spirit: "Spirits",
    Liqueur: "Liqueurs",
    Amaro: "Amaro",
    "Wine & Beer": "Wine & Beer",
    Mixer: "Mixers",
    Citrus: "Citrus",
    Syrup: "Syrups",
    Bitters: "Bitters",
    Garnish: "Garnishes",
    Other: "Others",
  };

  return map[normalized] || normalized;
}


