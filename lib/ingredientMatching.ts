/**
 * Utility functions for matching ingredient text to database ingredient IDs
 * Used for shopping list and other features that need to match ingredient names
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';
import { debugLog } from "@/lib/debugLog";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { publishedIngredientSlug } from "@/lib/ingredientContent";

// Create a Supabase client for server-side operations
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

export interface MatchedIngredient {
  id: string;
  name: string;
  category?: string;
  originalText: string;
  slug?: string;
  /** Canonical published guide URL slug, if this bottle has a finished page. */
  guideSlug?: string;
}

type IngredientData = { id: string; name: string; type?: string };

/**
 * Match ingredient text to database ingredient IDs
 * This function parses ingredient text (e.g., "1.5 oz amontillado sherry") 
 * and matches it to actual ingredient IDs from the database
 */
export async function matchIngredientTextToIds(
  ingredientTexts: string[]
): Promise<MatchedIngredient[]> {
  const supabase = createServerSupabaseClient();

  // Get all ingredients from database.
  // Be defensive: some environments may have slightly different column names.
  // Prefer `type`, but fall back to `category`, and finally to just `id,name`.
  let ingredients:
    | Array<{ id: string; name: string | null; type?: string | null; category?: string | null }>
    | null = null;
  let ingError: any = null;

  // Attempt 1: id, name, type (canonical schema)
  {
    const res = await supabase.from("ingredients").select("id, name, type");
    if (!res.error) {
      ingredients = res.data as any;
    } else {
      ingError = res.error;
    }
  }

  // Attempt 2: id, name, category (legacy / compatibility schema)
  if (!ingredients) {
    const res = await supabase.from("ingredients").select("id, name, category");
    if (!res.error) {
      ingredients = res.data as any;
      ingError = null;
    } else {
      ingError = res.error;
    }
  }

  // Attempt 3: id, name only
  if (!ingredients) {
    const res = await supabase.from("ingredients").select("id, name");
    if (!res.error) {
      ingredients = res.data as any;
      ingError = null;
    } else {
      ingError = res.error;
    }
  }

  if (ingError || !ingredients || ingredients.length === 0) {
    console.error("Error fetching ingredients for matching:", ingError || "No ingredients found");
    console.warn("[ingredientMatching] Falling back to fake IDs - ingredient matching will not work correctly");
    return ingredientTexts.map(text => ({
      id: generateFallbackId(text),
      name: extractIngredientName(text),
      category: undefined,
      originalText: text,
    }));
  }

  debugLog(`[ingredientMatching] Successfully loaded ${ingredients.length} ingredients from database`);

  // Build lookup maps
  const nameToIngredient = new Map<string, IngredientData>();
  (ingredients || []).forEach((ing) => {
    const name = ing?.name ?? null;
    if (!name) return;
    nameToIngredient.set(name.toLowerCase(), {
      id: ing.id,
      name,
      type: (ing as any).type || (ing as any).category || undefined,
    });
  });

  // Match each ingredient text
  return ingredientTexts.map(text => {
    const cleanedName = extractIngredientName(text);
    const matched = matchIngredientName(cleanedName, nameToIngredient);
    
    const slug = matched ? slugifyIngredientName(matched.name) : undefined;
    return {
      id: matched?.id || generateFallbackId(cleanedName),
      name: matched?.name || cleanedName,
      category: matched?.type,
      originalText: text,
      slug,
      guideSlug: slug ? publishedIngredientSlug(slug) || undefined : undefined,
    };
  });
}

/**
 * Extract ingredient name from full text (removes measurements)
 * Examples: "1.5 oz amontillado sherry" → "amontillado sherry"
 *           "2 dashes orange bitters" → "orange bitters"
 */
export function extractIngredientName(fullText: string): string {
  return fullText
    .trim()
    // Remove amounts with units: "1.5 oz", "2 dashes", "1/2 cup", etc.
    .replace(/^\d+(\/\d+)?\.?\s*(oz|cup|cups|tbsp|tsp|dash|dashes|drop|drops|ml|cl|shot|jigger|part|parts|slice|slices|wheel|wheels|twist|twists|peel|peels|wedge|wedges|sprig|sprigs|leaf|leaves|piece|pieces)\s+/i, '')
    // Remove just numbers at the start: "2 orange twists" → "orange twists"
    .replace(/^\d+\s+/, '')
    .replace(/\s+optional$/i, '')
    .trim();
}

const IGNORE_TOKENS = new Set([
  "a",
  "an",
  "and",
  "aged",
  "blanco",
  "bottled",
  "dark",
  "dry",
  "extra",
  "fresh",
  "gold",
  "golden",
  "light",
  "of",
  "optional",
  "or",
  "reposado",
  "silver",
  "spiced",
  "sweet",
  "the",
  "white",
]);

function tokenizeIngredient(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isContiguousPhrase(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    if (needle.every((token, offset) => haystack[i + offset] === token)) {
      return true;
    }
  }
  return false;
}

function leftoverTokensAreIgnorable(query: string[], dbTokens: string[]): boolean {
  const dbSet = new Set(dbTokens);
  return query.filter((token) => !dbSet.has(token)).every((token) => IGNORE_TOKENS.has(token));
}

/**
 * Match cleaned ingredient name to database ingredient.
 * Uses whole-token phrases so "ginger ale" never matches "gin".
 */
export function matchIngredientName(
  cleanedName: string,
  nameToIngredient: Map<string, IngredientData>
): IngredientData | null {
  const queryTokens = tokenizeIngredient(cleanedName);
  if (queryTokens.length === 0) return null;

  const exactMatch = nameToIngredient.get(queryTokens.join(" "));
  if (exactMatch) return exactMatch;

  const stripped = queryTokens.filter((token) => !IGNORE_TOKENS.has(token));
  if (stripped.length > 0 && stripped.length < queryTokens.length) {
    const strippedMatch = nameToIngredient.get(stripped.join(" "));
    if (strippedMatch) return strippedMatch;
  }

  let best: { ingredient: IngredientData; score: number } | null = null;

  for (const [dbName, ingredient] of nameToIngredient.entries()) {
    const dbTokens = tokenizeIngredient(dbName);
    if (dbTokens.length === 0) continue;

    const queryInDb = isContiguousPhrase(dbTokens, queryTokens);
    const dbInQuery = isContiguousPhrase(queryTokens, dbTokens);
    if (!queryInDb && !dbInQuery) continue;

    if (
      dbInQuery &&
      !queryInDb &&
      dbTokens.length < queryTokens.length &&
      !leftoverTokensAreIgnorable(queryTokens, dbTokens)
    ) {
      continue;
    }

    const score = dbTokens.length * 100 + dbName.length;
    if (!best || score > best.score) {
      best = { ingredient, score };
    }
  }

  return best?.ingredient ?? null;
}

export function findWholePhraseIndex(text: string, phrase: string): number {
  if (!text || !phrase) return -1;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "i"));
  return match?.index ?? -1;
}

/** True if `token` is a whole word in the ingredient name ("gin" does not match "ginger ale"). */
export function nameHasToken(name: string | null | undefined, token: string): boolean {
  if (!name || !token) return false;
  return tokenizeIngredient(name).includes(token.toLowerCase().trim());
}

/** Resolve a label like "Gin" or "Lime Juice" against a catalog without substring false hits. */
export function lookupIngredient<T extends { id: string; name: string | null }>(
  label: string,
  ingredients: T[]
): T | undefined {
  const nameToIngredient = new Map<string, IngredientData>();
  const byId = new Map<string, T>();
  for (const ingredient of ingredients) {
    if (!ingredient.name) continue;
    nameToIngredient.set(ingredient.name.toLowerCase(), {
      id: ingredient.id,
      name: ingredient.name,
    });
    byId.set(ingredient.id, ingredient);
  }
  const matched = matchIngredientName(label, nameToIngredient);
  return matched ? byId.get(matched.id) : undefined;
}

/**
 * Generate a fallback ID when ingredient cannot be matched
 * Uses a consistent format based on the ingredient name
 */
function generateFallbackId(ingredientName: string): string {
  return ingredientName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    || 'unknown-ingredient';
}

