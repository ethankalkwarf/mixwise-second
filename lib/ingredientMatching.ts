/**
 * Utility functions for matching ingredient text to database ingredient IDs
 * Used for shopping list and other features that need to match ingredient names
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';

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
}

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

  console.log(`[ingredientMatching] Successfully loaded ${ingredients.length} ingredients from database`);

  // Build lookup maps
  type IngredientData = { id: string; name: string; type?: string };
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
    
    return {
      id: matched?.id || generateFallbackId(cleanedName),
      name: matched?.name || cleanedName,
      category: matched?.type,
      originalText: text,
    };
  });
}

/**
 * Extract ingredient name from full text (removes measurements)
 * Examples: "1.5 oz amontillado sherry" → "amontillado sherry"
 *           "2 dashes orange bitters" → "orange bitters"
 */
function extractIngredientName(fullText: string): string {
  return fullText
    .trim()
    // Remove amounts with units: "1.5 oz", "2 dashes", "1/2 cup", etc.
    .replace(/^\d+(\/\d+)?\.?\s*(oz|cup|cups|tbsp|tsp|dash|dashes|drop|drops|ml|cl|shot|jigger|part|parts|slice|slices|wheel|wheels|twist|twists|peel|peels|wedge|wedges|sprig|sprigs|leaf|leaves|piece|pieces)\s+/i, '')
    // Remove just numbers at the start: "2 orange twists" → "orange twists"
    .replace(/^\d+\s+/, '')
    // Clean up extra whitespace
    .trim();
}

/**
 * Match cleaned ingredient name to database ingredient
 */
type IngredientData = { id: string; name: string; type?: string };
function matchIngredientName(
  cleanedName: string,
  nameToIngredient: Map<string, IngredientData>
): IngredientData | null {
  const lowerName = cleanedName.toLowerCase();

  // Try exact match first
  const exactMatch = nameToIngredient.get(lowerName);
  if (exactMatch) return exactMatch;

  // Try partial matching
  const searchVariations = [
    cleanedName,
    // Remove common prefixes
    cleanedName.replace(/^(sweet|dry|white|dark|aged|extra|fresh)\s+/i, ''),
    // Remove common suffixes
    cleanedName.replace(/\s+(juice|syrup|bitters|liqueur|vodka|gin|rum|whiskey|bourbon|scotch|tequila|brandy|cognac|wine|beer)$/i, ''),
    // Try last two words
    cleanedName.split(/\s+/).slice(-2).join(' '),
    // Try last word
    cleanedName.split(/\s+/).slice(-1)[0],
  ].filter(v => v && v.length > 2);

  for (const variation of searchVariations) {
    for (const [dbName, ingredient] of Array.from(nameToIngredient.entries())) {
      if (
        dbName.includes(variation.toLowerCase()) ||
        variation.toLowerCase().includes(dbName)
      ) {
        return ingredient;
      }
    }
  }

  return null;
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

