import { cookies } from 'next/headers';

/**
 * Cookie name for storing the cocktails randomization seed
 */
const COCKTAILS_SEED_COOKIE = 'mw_cocktails_seed';

/**
 * Get or generate a stable seed for cocktails randomization.
 * Uses a session cookie to ensure consistent ordering within a browser session.
 * @returns A UUID string to use as seed
 */
export function getCocktailsRandomizationSeed(): string {
  try {
    // On server side, use cookies
    const cookieStore = cookies();
    let seed = cookieStore.get(COCKTAILS_SEED_COOKIE)?.value;

    if (!seed) {
      // Generate a new UUID v4 as seed
      seed = generateUUID();
      // NOTE (Next.js 14+): cookies can only be modified in a Server Action or Route Handler.
      // We intentionally do NOT set cookies here to avoid runtime errors in Server Components.
      // If we want true session-stable ordering later, we can set this cookie in middleware
      // or an API route and read it here.
    }

    return seed;
  } catch (error) {
    // Fallback to a simple seed if cookies fail
    console.warn('Failed to get/set randomization seed cookie, using fallback:', error);
    return 'fallback-seed-' + Date.now().toString();
  }
}

/**
 * Generate a UUID v4 string for use as randomization seed
 */
function generateUUID(): string {
  // Simple UUID v4 generator (not cryptographically secure, but fine for ordering)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a deterministic pseudo-random number between 0 and 1
 * using a seed and input string. Uses a simple hash function for consistency.
 */
export function seededRandom(seed: string, input: string): number {
  try {
    const combined = (seed || 'default-seed') + (input || 'default-input');
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash | 0; // Convert to 32-bit integer
    }

    // Convert hash to a number between 0 and 1
    // Use absolute value and ensure positive result
    const positiveHash = Math.abs(hash);
    const result = (positiveHash % 1000000) / 1000000;

    // Ensure result is a valid number between 0 and 1
    return Math.max(0, Math.min(1, result || 0.5));
  } catch (error) {
    console.warn('Error in seededRandom, using fallback:', error);
    // Fallback to Math.random() if something goes wrong
    return Math.random();
  }
}
