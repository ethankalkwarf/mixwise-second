/**
 * Deterministic cocktail-directory shuffle seed.
 * Uses UTC calendar day so /cocktails can stay ISR-friendly (no cookies()).
 */
export function getCocktailsRandomizationSeed(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `cocktails-${year}-${month}-${day}`;
}

/** Fresh seed for pull-to-refresh — new browse order on each pull. */
export function getBrowseRefreshSeed(): string {
  return `cocktails-refresh-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function seededRandom(seed: string, input: string): number {
  try {
    const combined = (seed || "default-seed") + (input || "default-input");
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash | 0;
    }

    const positiveHash = Math.abs(hash);
    const result = (positiveHash % 1000000) / 1000000;
    return Math.max(0, Math.min(1, result || 0.5));
  } catch {
    return Math.random();
  }
}

/** Fisher–Yates shuffle with a stable seed (same seed → same order). */
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
  try {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValue = seededRandom(seed + i.toString(), "shuffle");
      const j = Math.floor(randomValue * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  } catch {
    return [...array];
  }
}

/** Non-deterministic Fisher–Yates — new order every call (home Ready to pour, etc.). */
export function randomShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
