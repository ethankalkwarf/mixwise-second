/**
 * Drink of the Day date helpers.
 *
 * All users share the same daily cocktail. The day boundary is US Pacific
 * midnight (America/Los_Angeles) so the flip lands overnight across the
 * continental US (3am Eastern → midnight Pacific). Hawaii sees it at 10pm.
 */

export interface CocktailWithId {
  id: string;
  slug: string;
  [key: string]: any;
}

/** Shared calendar timezone for Drink of the Day (not the device locale). */
export const DRINK_OF_THE_DAY_TIMEZONE = "America/Los_Angeles";

/**
 * YYYY-MM-DD for an instant in the Drink of the Day timezone.
 */
export function getDotdDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DRINK_OF_THE_DAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** @deprecated Use getDotdDateString */
export function getUtcDateString(date: Date = new Date()): string {
  return getDotdDateString(date);
}

/** @deprecated Use getDotdDateString — not device-local; Pacific calendar day. */
export function getCurrentLocalDateString(): string {
  return getDotdDateString(new Date());
}

/**
 * Add calendar days to a YYYY-MM-DD Drink of the Day date key.
 */
export function addDotdDateDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @deprecated Use addDotdDateDays */
export function addUtcDateDays(dateKey: string, days: number): string {
  return addDotdDateDays(dateKey, days);
}

/**
 * Get the daily cocktail index for a given date.
 * Uses a deterministic hash so the same Drink of the Day date always maps
 * to the same cocktail (until the catalog calendar locks an assignment).
 */
export function getDailyCocktailIndex(cocktails: CocktailWithId[], date: Date): number {
  if (!cocktails.length) return 0;

  return getDailyIndexFromCount(cocktails.length, date);
}

export function getDailyIndexFromCount(count: number, date: Date): number {
  if (!count) return 0;
  return getDailyIndexForDateKey(count, getDotdDateString(date));
}

/** Hash a YYYY-MM-DD Drink of the Day key directly (no timezone reinterpretation). */
export function getDailyIndexForDateKey(count: number, dateKey: string): number {
  if (!count) return 0;

  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    const char = dateKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash) % count;
}

/**
 * Get the daily cocktail for a given date (Drink of the Day timezone).
 */
export function getDailyCocktail(cocktails: CocktailWithId[], date: Date): CocktailWithId | null {
  if (!cocktails.length) return null;
  const index = getDailyCocktailIndex(cocktails, date);
  return cocktails[index];
}

/**
 * Get today's daily cocktail (Drink of the Day timezone).
 */
export function getTodaysDailyCocktail(cocktails: CocktailWithId[]): CocktailWithId | null {
  return getDailyCocktail(cocktails, new Date());
}

/**
 * Check if a cocktail is today's daily cocktail (Drink of the Day timezone).
 */
export function isTodaysDailyCocktail(cocktailId: string, cocktails: CocktailWithId[]): boolean {
  const todaysCocktail = getTodaysDailyCocktail(cocktails);
  return todaysCocktail?.id === cocktailId;
}
