/**
 * Utility functions for determining the daily cocktail based on browser time zone
 */

export interface CocktailWithId {
  id: string;
  slug: string;
  [key: string]: any;
}

/**
 * Get the daily cocktail index for a given date.
 * Uses a deterministic hash function so the same day always returns the same cocktail.
 *
 * IMPORTANT: This uses a UTC YYYY-MM-DD date string so all users see the same cocktail each day
 * (and server-side redirects remain consistent).
 */
export function getDailyCocktailIndex(cocktails: CocktailWithId[], date: Date): number {
  if (!cocktails.length) return 0;

  return getDailyIndexFromCount(cocktails.length, date);
}

export function getDailyIndexFromCount(count: number, date: Date): number {
  if (!count) return 0;

  // Use the UTC date in YYYY-MM-DD format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  // Simple hash function for the date
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  return Math.abs(hash) % count;
}

/**
 * Get the daily cocktail for a given date using browser time zone
 */
export function getDailyCocktail(cocktails: CocktailWithId[], date: Date): CocktailWithId | null {
  if (!cocktails.length) return null;
  const index = getDailyCocktailIndex(cocktails, date);
  return cocktails[index];
}

/**
 * Get the daily cocktail for today using browser time zone
 */
export function getTodaysDailyCocktail(cocktails: CocktailWithId[]): CocktailWithId | null {
  return getDailyCocktail(cocktails, new Date());
}

/**
 * Check if a cocktail is today's daily cocktail using browser time zone
 */
export function isTodaysDailyCocktail(cocktailId: string, cocktails: CocktailWithId[]): boolean {
  const todaysCocktail = getTodaysDailyCocktail(cocktails);
  return todaysCocktail?.id === cocktailId;
}

/**
 * Get a formatted local date string for debugging
 */
export function getCurrentLocalDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
