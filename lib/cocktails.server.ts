/**
 * Server-side cocktail helper functions for Supabase
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';
import type {
  Cocktail,
  CocktailListItem,
  CocktailFilters,
  CocktailIngredient,
} from './cocktailTypes';
import type {
  MixCocktail,
  MixIngredient,
  MixCocktailIngredient
} from './mixTypes';
import { getCurrentLocalDateString } from "./dailyCocktail";
import { resolveDailyCocktailSlug } from "./dailyCocktailCalendar.server";
import { debugLog } from "@/lib/debugLog";
import { extractCocktailIngredientNames } from "@/lib/cocktailIngredientNames";
import { extractIngredientName, matchIngredientName } from "@/lib/ingredientMatching";
import { formatIngredientName } from "@/lib/formatters";

const COCKTAILS_CACHE_REVALIDATE_SECONDS = 300;

// Create a Supabase client for server-side operations that works during build time
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Prefer service role when available, but fall back to anon key for read-only queries.
  // This prevents server-side crashes in environments where service role isn't set.
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

type CocktailListFilterInput = CocktailFilters & { includeIngredients?: boolean };

function normalizeCocktailListFilters(filters: CocktailListFilterInput = {}) {
  return {
    base_spirit: filters.base_spirit ?? null,
    category_primary: filters.category_primary ?? null,
    difficulty: filters.difficulty ?? null,
    tags: filters.tags ? [...filters.tags].sort() : null,
    categories_all: filters.categories_all ? [...filters.categories_all].sort() : null,
    search: filters.search ?? null,
    limit: filters.limit ?? null,
    offset: filters.offset ?? null,
    includeIngredients: Boolean(filters.includeIngredients),
  };
}

async function fetchCocktailBySlug(slug: string): Promise<Cocktail | null> {
  const supabase = createServerSupabaseClient();

  debugLog('[getCocktailBySlug] Looking for slug:', slug);

  const { data, error } = await supabase
    .from('cocktails')
    .select('*')
    .eq('slug', slug)
    .single();

  debugLog('[getCocktailBySlug] Slug lookup result:', { data: !!data, error: error?.message });

  if (data) {
    return data as unknown as Cocktail;
  }

  debugLog('[getCocktailBySlug] Slug lookup failed, trying ID lookup for:', slug);
  const { data: idData, error: idError } = await supabase
    .from('cocktails')
    .select('*')
    .eq('id', slug)
    .single();

  debugLog('[getCocktailBySlug] ID lookup result:', { data: !!idData, error: idError?.message });

  if (idData) {
    return idData as unknown as Cocktail;
  }

  return null;
}

const getCachedCocktailBySlug = unstable_cache(
  async (slug: string) => fetchCocktailBySlug(slug),
  ["cocktail-by-slug"],
  { revalidate: COCKTAILS_CACHE_REVALIDATE_SECONDS, tags: ["cocktails"] }
);

/**
 * Get a single cocktail by slug (server-side)
 */
export const getCocktailBySlug = cache(async (slug: string): Promise<Cocktail | null> => {
  return getCachedCocktailBySlug(slug);
});

async function fetchCocktailsList(filtersKey: string): Promise<CocktailListItem[]> {
  const filters = JSON.parse(filtersKey) as ReturnType<typeof normalizeCocktailListFilters>;
  const supabase = createServerSupabaseClient();

  // Build select fields
  let selectFields = `
    id,
    slug,
    name,
    short_description,
    base_spirit,
    category_primary,
    difficulty,
    tags,
    categories_all,
    image_url,
    image_alt,
    glassware,
    flavor_strength,
    flavor_sweetness,
    flavor_tartness,
    flavor_bitterness,
    flavor_aroma,
    flavor_texture,
    created_at
  `;

  if (filters.includeIngredients) {
    selectFields += `,
    ingredients
    `;
  }

  let query = supabase
    .from('cocktails')
    .select(selectFields);

  // Default alphabetical ordering (we'll shuffle client-side for randomization)
  query = query.order('name');

  // Apply filters
  if (filters.base_spirit) {
    query = query.eq('base_spirit', filters.base_spirit);
  }

  if (filters.category_primary) {
    query = query.eq('category_primary', filters.category_primary);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  if (filters.categories_all && filters.categories_all.length > 0) {
    query = query.overlaps('categories_all', filters.categories_all);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cocktails list:', error);
    return [];
  }

  return (data || []).map((row) => {
    const record = row as unknown as Record<string, unknown>;
    const item: CocktailListItem = {
      id: String(record.id),
      slug: String(record.slug ?? ""),
      name: String(record.name ?? ""),
      short_description: (record.short_description as string | undefined) ?? undefined,
      base_spirit: (record.base_spirit as string | undefined) ?? undefined,
      category_primary: (record.category_primary as string | undefined) ?? undefined,
      difficulty: (record.difficulty as string | undefined) ?? undefined,
      tags: (record.tags as string[] | undefined) ?? undefined,
      image_url: (record.image_url as string | undefined) ?? undefined,
      image_alt: (record.image_alt as string | undefined) ?? undefined,
      categories_all: (record.categories_all as string[] | undefined) ?? undefined,
      glassware: (record.glassware as string | undefined) ?? undefined,
      flavor_strength: (record.flavor_strength as number | undefined) ?? undefined,
      flavor_sweetness: (record.flavor_sweetness as number | undefined) ?? undefined,
      flavor_tartness: (record.flavor_tartness as number | undefined) ?? undefined,
      flavor_bitterness: (record.flavor_bitterness as number | undefined) ?? undefined,
      flavor_aroma: (record.flavor_aroma as number | undefined) ?? undefined,
      flavor_texture: (record.flavor_texture as number | undefined) ?? undefined,
      created_at: (record.created_at as string | undefined) ?? undefined,
    };

    if (filters.includeIngredients) {
      item.ingredientNames = extractCocktailIngredientNames(record.ingredients);
    }

    return item;
  });
}

const getCachedCocktailsList = unstable_cache(
  async (filtersKey: string) => fetchCocktailsList(filtersKey),
  ["cocktails-list"],
  { revalidate: COCKTAILS_CACHE_REVALIDATE_SECONDS, tags: ["cocktails"] }
);

const getCocktailsListByKey = cache(async (filtersKey: string) => {
  return getCachedCocktailsList(filtersKey);
});

/**
 * Get cocktails list with optional filters (server-side)
 * Use includeIngredients: true for bar matching logic
 */
export async function getCocktailsList(
  filters: CocktailListFilterInput = {}
): Promise<CocktailListItem[]> {
  const filtersKey = JSON.stringify(normalizeCocktailListFilters(filters));
  return getCocktailsListByKey(filtersKey);
}

/**
 * Get all cocktails for mix logic (server-side)
 */
export async function getMixCocktails(): Promise<MixCocktail[]> {
  const cocktailsWithIngredients = await getCocktailsWithIngredients();

  return cocktailsWithIngredients.map(cocktail => ({
    id: cocktail.id,
    name: cocktail.name,
    slug: cocktail.slug,
    description: cocktail.description,
    instructions: cocktail.instructions,
    category: cocktail.category,
    imageUrl: cocktail.imageUrl,
    glass: cocktail.glass,
    method: cocktail.method,
    primarySpirit: cocktail.primarySpirit,
    difficulty: cocktail.difficulty,
    isPopular: cocktail.isPopular,
    isFavorite: cocktail.isFavorite,
    isTrending: cocktail.isTrending,
    createdAt: cocktail.createdAt ?? undefined,
    drinkCategories: cocktail.drinkCategories,
    tags: cocktail.tags,
    garnish: cocktail.garnish,
    ingredients: cocktail.ingredientsWithIds
  }));
}

/**
 * Get unique values for a field (e.g., base_spirits, categories)
 */
export async function getUniqueValues(field: 'base_spirit' | 'category_primary' | 'difficulty' | 'glassware' | 'technique'): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('cocktails')
    .select(field)
    .not(field, 'is', null);

  if (error) {
    console.error(`Error fetching unique ${field} values:`, error);
    return [];
  }

  const rows = (data || []) as Array<Record<string, string | null>>;
  const uniqueValues = [...new Set(rows.map((item) => item[field]).filter((value): value is string => Boolean(value)))];
  return uniqueValues.sort();
}

type CocktailWithIngredientsRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  category: string | null;
  imageUrl: string | null;
  glass: string | null;
  method: string | null;
  primarySpirit: string | null;
  difficulty: string | null;
  isPopular: boolean;
  isFavorite: boolean;
  isTrending: boolean;
  createdAt: string | null;
  drinkCategories: string[];
  tags: string[];
  garnish: string | null;
  ingredientsWithIds: Array<{
    id: string;
    name: string;
    amount?: string | null;
    isOptional?: boolean;
    notes?: string | null;
  }>;
};

/**
 * Get cocktails with ingredients from cocktail_ingredients table
 * Returns cocktails with ingredientsWithIds array containing numeric ingredient IDs and names
 */
async function fetchCocktailsWithIngredients(): Promise<CocktailWithIngredientsRow[]> {
  try {
    debugLog('[SERVER] getCocktailsWithIngredients starting...');
    const supabase = createServerSupabaseClient();

    // Get all cocktails WITH ingredients JSON field
    debugLog('[SERVER] Querying cocktails table with ingredients...');
    const { data: cocktailData, error: cocktailError } = await supabase
      .from('cocktails')
      .select(`
        id,
        name,
        slug,
        short_description,
        instructions,
        category_primary,
        image_url,
        glassware,
        technique,
        base_spirit,
        difficulty,
        categories_all,
        tags,
        garnish,
        metadata_json,
        ingredients,
        created_at
      `)
      .order('name');

    debugLog('[SERVER] Cocktails query result:', {
      error: cocktailError,
      dataLength: cocktailData?.length,
      firstFew: cocktailData?.slice(0, 3)?.map(c => ({ id: c.id, name: c.name }))
    });

    if (cocktailError) {
      console.error('Error fetching cocktails:', cocktailError);
      return [];
    }

    if (!cocktailData) return [];

    // Get ingredient name mapping
    const { data: ingredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name');

    if (ingError) {
      console.error('Error fetching ingredients:', ingError);
      return [];
    }

    // Exact lookup by normalized name; shared matcher handles close variants
    const ingredientByNormalizedName = new Map<string, { id: string; name: string }>();
    (ingredients || []).forEach((ing) => {
      if (!ing.name) return;
      const id = String(ing.id);
      const name = ing.name;
      ingredientByNormalizedName.set(name.toLowerCase().trim(), { id, name });
    });

    debugLog('[SERVER] Processing cocktails with JSON ingredients...');

    // Track excluded cocktails for diagnostics
    const excludedCocktails: Array<{
      id: string;
      name: string;
      reason: string;
    }> = [];

    const result = cocktailData.map(cocktail => {
      // Process ingredients from JSON field
      let mappedIngredients: CocktailWithIngredientsRow["ingredientsWithIds"] = [];

      try {
        if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
          mappedIngredients = cocktail.ingredients.map((ing: any) => {
            // The ingredients JSON has a 'text' field with measurement + ingredient name
            const fullText = ing.text || ing.name;

            if (!fullText) {
              return null;
            }

            const ingredientText = extractIngredientName(fullText);
            if (!ingredientText) {
              return null;
            }

            const matchedFromName = matchIngredientName(ingredientText, ingredientByNormalizedName);
            const matchedIngredient = matchedFromName
              ? { id: matchedFromName.id, name: matchedFromName.name }
              : null;

            const ingredientId = matchedIngredient ? String(matchedIngredient.id) : 'unknown';
            const ingredientName = formatIngredientName(
              matchedIngredient ? matchedIngredient.name : ingredientText || fullText
            );
            const textLooksOptional =
              Boolean(ing.isOptional) ||
              /\boptional\b/i.test(fullText) ||
              /\boptional\b/i.test(ingredientText);

            return {
              id: ingredientId,
              name: ingredientName,
              amount: ing.amount || ing.measure || null,
              isOptional: textLooksOptional,
              notes: ing.notes || null
            };
          }).filter(Boolean) as CocktailWithIngredientsRow["ingredientsWithIds"];
        } else if (cocktail.ingredients) {
          try {
            const parsed = typeof cocktail.ingredients === 'string' ? JSON.parse(cocktail.ingredients) : cocktail.ingredients;
            if (Array.isArray(parsed)) {
              mappedIngredients = parsed.map((ing: any) => ({
                id: String(ing.ingredient?.id || ing.id || 'unknown'),
                name: formatIngredientName(ing.ingredient?.name || 'Unknown'),
                amount: ing.amount || ing.measure || null,
                isOptional: ing.isOptional || false,
                notes: ing.notes || null
              }));
            }
          } catch (fallbackError) {
            console.error(`[SERVER] Fallback failed for ${cocktail.name}:`, fallbackError);
            excludedCocktails.push({
              id: cocktail.id,
              name: cocktail.name,
              reason: `Fallback parsing failed: ${fallbackError}`,
            });
          }
        } else {
          excludedCocktails.push({
            id: cocktail.id,
            name: cocktail.name,
            reason: 'No ingredients field in database',
          });
        }
      } catch (error) {
        console.error(`Error processing ingredients for cocktail ${cocktail.name}:`, error);
        excludedCocktails.push({
          id: cocktail.id,
          name: cocktail.name,
          reason: `Processing error: ${error}`,
        });
      }

      return {
        id: cocktail.id,
        name: cocktail.name,
        slug: cocktail.slug,
        description: cocktail.short_description || null,
        instructions: cocktail.instructions || null,
        category: cocktail.category_primary || null,
        imageUrl: cocktail.image_url || null,
        glass: cocktail.glassware || null,
        method: cocktail.technique || null,
        primarySpirit: cocktail.base_spirit || null,
        difficulty: cocktail.difficulty || null,
        isPopular: Boolean((cocktail.metadata_json as { isPopular?: boolean } | null)?.isPopular),
        isFavorite: Boolean((cocktail.metadata_json as { isFavorite?: boolean } | null)?.isFavorite),
        isTrending: Boolean((cocktail.metadata_json as { isTrending?: boolean } | null)?.isTrending),
        createdAt: cocktail.created_at || null,
        drinkCategories: cocktail.categories_all || [],
        tags: cocktail.tags || [],
        garnish: cocktail.garnish || null,
        ingredientsWithIds: mappedIngredients
      };
    });

    const validCocktails = result.filter(c => c.ingredientsWithIds && c.ingredientsWithIds.length > 0);

    debugLog(`[SERVER] Returning ${validCocktails.length} valid cocktails to client`);
    return validCocktails;
  } catch (error) {
    console.error('[SERVER] Error in getCocktailsWithIngredients:', error);
    return [];
  }
}

const getCachedCocktailsWithIngredients = unstable_cache(
  async () => fetchCocktailsWithIngredients(),
  ["cocktails-with-ingredients-v3"],
  { revalidate: COCKTAILS_CACHE_REVALIDATE_SECONDS, tags: ["cocktails"] }
);

export const getCocktailsWithIngredients = cache(async (): Promise<CocktailWithIngredientsRow[]> => {
  return getCachedCocktailsWithIngredients();
});

/**
 * Get cocktail count
 */
export async function getCocktailCount(): Promise<number> {
  const supabase = createServerSupabaseClient();

  const { count, error } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting cocktail count:', error);
    return 0;
  }

  return count || 0;
}

async function fetchTodaysDailyCocktailSlug(dateKey: string): Promise<string | null> {
  // Locked calendar row wins; missing days are computed then persisted so catalog
  // growth cannot reshuffle already-assigned (or pre-scheduled) dates.
  return resolveDailyCocktailSlug(dateKey);
}

const getCachedTodaysDailyCocktailSlug = unstable_cache(
  async (dateKey: string) => fetchTodaysDailyCocktailSlug(dateKey),
  ["daily-cocktail-slug"],
  { revalidate: 3600, tags: ["cocktails"] }
);

/**
 * Get today's cocktail slug (server-side).
 * Backed by daily_cocktail_calendar so the pick stays stable as the catalog grows.
 */
export const getTodaysDailyCocktailSlug = cache(async (): Promise<string | null> => {
  const dateKey = getCurrentLocalDateString();
  return getCachedTodaysDailyCocktailSlug(dateKey);
});

export type DailyCocktailCover = {
  slug: string;
  name: string;
  imageUrl: string | null;
};

async function fetchTodaysDailyCocktailCover(): Promise<DailyCocktailCover | null> {
  const dateKey = getCurrentLocalDateString();
  const slug = await fetchTodaysDailyCocktailSlug(dateKey);
  if (!slug) return null;

  const cocktail = await fetchCocktailBySlug(slug);
  if (!cocktail) return null;

  return {
    slug: cocktail.slug,
    name: cocktail.name,
    imageUrl: cocktail.image_url || null,
  };
}

const getCachedTodaysDailyCocktailCover = unstable_cache(
  fetchTodaysDailyCocktailCover,
  ["daily-cocktail-cover"],
  { revalidate: 3600, tags: ["cocktails"] }
);

/** Today's drink of the day — name + photo for the nav mega menu. Cached for the UTC hour. */
export const getTodaysDailyCocktailCover = cache(async (): Promise<DailyCocktailCover | null> => {
  return getCachedTodaysDailyCocktailCover();
});

/**
 * Get user's bar ingredients with fallback logic
 * First tries inventories/inventory_items tables, then falls back to bar_ingredients
 * Returns numeric ingredient IDs that match the ingredients table
 */
export async function getUserBarIngredients(userId: string): Promise<Array<{
  id: string;
  ingredient_id: string; // Changed from number to string (UUID)
  ingredient_name: string | null;
  ingredient_category?: string | null;
  inventory_id?: string;
}>> {
  const supabase = createServerSupabaseClient();

  // First, fetch all ingredients to create name-to-ID mapping
  const { data: allIngredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id, name, category')
    .not('id', 'is', null)
    .not('name', 'is', null);

  if (ingredientsError) {
    console.error('Error fetching ingredients list:', ingredientsError);
    // Return empty array to prevent crashes, but log the issue
    console.warn('Returning empty bar ingredients due to ingredients fetch failure');
    return [];
  }

  // Create mapping from lowercased name to UUID ID
  const nameToIdMap = new Map<string, string>();
  // Create mapping from UUID ID to ingredient name for lookup
  const idToNameMap = new Map<string, string>();
  const idToCategoryMap = new Map<string, string | null>();
  (allIngredients || []).forEach(ing => {
    if (ing.name) {
      const uuidId = String(ing.id); // ingredients.id is UUID, convert to string
      nameToIdMap.set(ing.name.toLowerCase(), uuidId);
      idToNameMap.set(uuidId, ing.name);
      idToCategoryMap.set(uuidId, (ing as any).category ?? null);
    }
  });

  // Helper function to convert any ID format to UUID string
  const convertToUuidId = (stringId: string, name?: string | null): string | null => {
    // If it's already a valid UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(stringId)) {
      return stringId;
    }

    // Handle ingredient- prefixed IDs (could be UUID or numeric)
    if (stringId.startsWith('ingredient-')) {
      const idPart = stringId.substring('ingredient-'.length);
      if (uuidRegex.test(idPart)) {
        return idPart;
      }
    }

    // Create synonym mapping for brand-specific names
    const createSynonyms = (input: string): string[] => {
      const synonyms = [input.toLowerCase()];

      // Remove common brand prefixes/suffixes
      const brandPatterns = [
        /\b(absolut|grey goose|smirnoff|ketel one|tito's)\s+/gi, // Vodka brands
        /\b(bombay|beefeater|tanqueray|hendrick's|plymouth)\s+/gi, // Gin brands
        /\b(jameson|jack daniel's|jim beam|crown royal)\s+/gi, // Whiskey brands
        /\b(jose cuervo|patron|clase azul)\s+/gi, // Tequila brands
        /\b(baileys|kahlua|tia maria)\s+/gi, // Liqueur brands
        /\b(cointreau|grand marnier|triple sec)\s+/gi, // Triple sec brands
        /\b(campbell|fee brothers|angostura)\s+/gi, // Bitters brands
        /\s+(vodka|gin|rum|whiskey|bourbon|scotch|tequila|brandy|cognac|liqueur|wine|beer|juice|soda|syrup|bitters|vermouth|amaro)\b/gi, // Generic terms
      ];

      brandPatterns.forEach(pattern => {
        const cleaned = input.replace(pattern, '').trim();
        if (cleaned && cleaned !== input.toLowerCase()) {
          synonyms.push(cleaned.toLowerCase());
        }
      });

      // Split on common separators and try base terms
      const parts = input.toLowerCase().split(/\s+|\-|_/);
      if (parts.length > 1) {
        // Try the last part (often the generic term)
        synonyms.push(parts[parts.length - 1]);
        // Try the first part
        synonyms.push(parts[0]);
      }

      return [...new Set(synonyms)]; // Remove duplicates
    };

    // Try to find by name (either provided name or the string ID itself)
    const lookupNames = name ? createSynonyms(name) : createSynonyms(stringId);

    for (const lookupName of lookupNames) {
      const found = nameToIdMap.get(lookupName);
      if (found) {
        return found;
      }
    }

    return null;
  };

  // Load from bar_ingredients table
  const { data: barIngredients, error } = await supabase
    .from('bar_ingredients')
    .select('id, ingredient_id, ingredient_name')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching bar ingredients:', error);
    return [];
  }

  return (barIngredients || [])
    .map(item => {
      const uuidId = convertToUuidId(item.ingredient_id, item.ingredient_name);
      
      // IMPORTANT: Don't drop items we can't convert - preserve them with original ID
      // This prevents data loss when IDs can't be mapped
      if (!uuidId) {
        console.warn(`[getUserBarIngredients] Could not convert ingredient ID "${item.ingredient_id}" to UUID, using original ID`);
        // Use the original ID as-is (might be a UUID already or a name)
        return {
          id: item.id.toString(),
          ingredient_id: item.ingredient_id, // Keep as string
          ingredient_name: item.ingredient_name || item.ingredient_id,
          ingredient_category: null,
        };
      }

      // Get the proper ingredient name from the ingredients table
      const properName = idToNameMap.get(uuidId) || item.ingredient_name || item.ingredient_id;

      return {
        id: item.id.toString(),
        ingredient_id: uuidId, // Now returns UUID string
        ingredient_name: properName,
        ingredient_category: idToCategoryMap.get(uuidId) ?? null,
        // No inventory_id for bar_ingredients
      };
    });
}

/**
 * Get staple ingredient IDs (server-side)
 * Mirrors the Mix/Dashboard staple logic: DB staples + manual ice/water.
 */
export async function getStapleIngredientIds(): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("ingredients")
    .select("id")
    .eq("is_staple", true);

  if (error) {
    console.error("Error fetching staple ingredient IDs:", error);
    return ["ice", "water"];
  }

  const dbStaples = (data || []).map((r: any) => String(r.id)).filter(Boolean);
  const manualStaples = ["ice", "water"];
  return [...new Set([...dbStaples, ...manualStaples])];
}

/**
 * Get a user's favorites (server-side).
 * Used for public bar profile rendering (service-role context).
 */
export async function getUserFavorites(userId: string): Promise<Array<{
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
}>> {
  const supabase = createServerSupabaseClient();

  // Only expose favorites for users who have enabled public bar.
  const { data: pref, error: prefError } = await supabase
    .from("user_preferences")
    .select("public_bar_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefError) {
    console.error("Error checking public_bar_enabled for favorites:", prefError);
    return [];
  }

  if (!pref?.public_bar_enabled) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }

  return (data || []) as any;
}

/**
 * Get a user's featured drinks (up to 3) for public bar hero.
 */
export async function getUserFeaturedDrinks(userId: string): Promise<Array<{
  cocktail_id: string;
  cocktail_name: string | null;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
}>> {
  const supabase = createServerSupabaseClient();

  const { data: pref, error: prefError } = await supabase
    .from("user_preferences")
    .select("public_bar_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefError || !pref?.public_bar_enabled) return [];

  const { data, error } = await supabase
    .from("profile_featured_drinks")
    .select("cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url")
    .eq("user_id", userId)
    .order("rank", { ascending: true })
    .limit(3);

  if (error) {
    console.error("Error fetching featured drinks:", error);
    return [];
  }

  return (data || []) as any;
}

/**
 * Get user's bar ingredient IDs only (for quick checks)
 * First tries inventories/inventory_items tables, then falls back to bar_ingredients
 * Returns UUID strings that match ingredients.id
 */
export async function getUserBarIngredientIds(userId: string): Promise<string[]> {
  const ingredients = await getUserBarIngredients(userId);
  return ingredients.map(item => item.ingredient_id);
}
