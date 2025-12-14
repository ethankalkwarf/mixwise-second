/**
 * Formatting utilities for display text
 */

/**
 * Formats a cocktail name with proper title casing
 * Capitalizes every word except filler words (the, and, a, of) unless they're the first word
 *
 * Examples:
 * - "tom collins" → "Tom Collins"
 * - "the last word" → "The Last Word"
 * - "gin and tonic" → "Gin and Tonic"
 * - "death of a salesman" → "Death of a Salesman"
 */
export function formatCocktailName(name: string): string {
  if (!name) return name;

  // Filler words that should remain lowercase (unless first word)
  const fillerWords = new Set(['the', 'and', 'a', 'of']);

  return name
    .toLowerCase()
    .split(/[\s-]+/) // Split on spaces and hyphens
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Capitalize if not a filler word
      if (!fillerWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Keep filler word lowercase
      return word;
    })
    .join(' '); // Rejoin with spaces
}
