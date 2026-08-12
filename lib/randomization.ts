import { cookies } from "next/headers";

const COCKTAILS_SEED_COOKIE = "mw_cocktails_seed";

export async function getCocktailsRandomizationSeed(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const seed = cookieStore.get(COCKTAILS_SEED_COOKIE)?.value;
    if (seed) return seed;
    return generateUUID();
  } catch {
    return "fallback-seed-" + Date.now().toString();
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
