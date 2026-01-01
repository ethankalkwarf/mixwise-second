/**
 * Server-side cocktail helper functions for Supabase
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';
import type {
  Cocktail,
  CocktailListItem,
  CocktailFilters,
  CocktailIngredient,
  MixCocktail,
  MixIngredient,
  MixCocktailIngredient
} from './cocktailTypes';
import { getDailyIndexFromCount } from "./dailyCocktail";
import fs from "node:fs/promises";
import path from "node:path";

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

/**
 * Get a single cocktail by slug (server-side)
 */
export async function getCocktailBySlug(slug: string): Promise<Cocktail | null> {
  const supabase = createServerSupabaseClient();

  console.log('[getCocktailBySlug] Looking for slug:', slug);

  // First try to find by slug
  const { data, error } = await supabase
    .from('cocktails')
    .select('*')
    .eq('slug', slug)
    .single();

  console.log('[getCocktailBySlug] Slug lookup result:', { data: !!data, error: error?.message });

  if (data) {
    return data as Cocktail;
  }

  // If slug lookup failed, try to find by ID (in case slug is actually an ID)
  console.log('[getCocktailBySlug] Slug lookup failed, trying ID lookup for:', slug);
  const { data: idData, error: idError } = await supabase
    .from('cocktails')
    .select('*')
    .eq('id', slug)
    .single();

  console.log('[getCocktailBySlug] ID lookup result:', { data: !!idData, error: idError?.message });

  if (idData) {
    return idData as Cocktail;
  }

  // Debug: show some available cocktails
  const { data: allCocktails } = await supabase
    .from('cocktails')
    .select('id, slug, name')
    .limit(10);

  console.log('[getCocktailBySlug] Available cocktails:', allCocktails?.slice(0, 5));
  return null;
}

/**
 * Get cocktails list with optional filters (server-side)
 * Use includeIngredients: true for bar matching logic
 */
export async function getCocktailsList(filters: CocktailFilters & { includeIngredients?: boolean } = {}): Promise<CocktailListItem[]> {
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
    flavor_strength,
    flavor_sweetness,
    flavor_tartness,
    flavor_bitterness,
    flavor_aroma,
    flavor_texture
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

  return (data || []) as CocktailListItem[];
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

  const uniqueValues = [...new Set((data || []).map(item => item[field]).filter(Boolean))];
  return uniqueValues.sort();
}

/**
 * Get cocktails with ingredients from cocktail_ingredients table
 * Returns cocktails with ingredientsWithIds array containing numeric ingredient IDs and names
 */
export async function getCocktailsWithIngredients(): Promise<Array<{
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
  drinkCategories: string[];
  tags: string[];
  garnish: string | null;
  ingredientsWithIds: Array<{ id: string; name: string; amount?: string | null; isOptional?: boolean; notes?: string | null }>;
}>> {
  try {
    console.log('[SERVER] getCocktailsWithIngredients starting...');
    const supabase = createServerSupabaseClient();

    // Get all cocktails WITH ingredients JSON field
    console.log('[SERVER] Querying cocktails table with ingredients...');
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
        ingredients
      `)
      .order('name');

    console.log('[SERVER] Cocktails query result:', {
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

    // Build ingredient name mapping with string keys
    const ingredientNameById = new Map<string, string>();
    (ingredients || []).forEach(ing => {
      ingredientNameById.set(String(ing.id), ing.name);
    });

    console.log('[SERVER] Processing cocktails with JSON ingredients...');
    console.log('[SERVER] Available fields in cocktailData[0]:', Object.keys(cocktailData[0] || {}));

    console.log('[SERVER] First 3 cocktails ingredients data:');
    cocktailData.slice(0, 3).forEach((cocktail, i) => {
      console.log(`[SERVER] Cocktail ${i+1} (${cocktail.name}): ingredients =`, cocktail.ingredients);
    });

    // Track excluded cocktails for diagnostics
    const excludedCocktails: Array<{
      id: string;
      name: string;
      reason: string;
    }> = [];

    const result = cocktailData.map(cocktail => {
      // Process ingredients from JSON field
      let ingredients = [];
      let processedSuccessfully = false;

      try {
        console.log(`[SERVER] Processing ${cocktail.name}, ingredients type:`, typeof cocktail.ingredients, 'isArray:', Array.isArray(cocktail.ingredients));

        if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
          ingredients = cocktail.ingredients.map((ing: any) => {
            // The ingredients JSON has a 'text' field with measurement + ingredient name
            const fullText = ing.text || ing.name;

            if (!fullText) {
              return null;
            }

            // Parse the ingredient name from the full text by removing measurement prefixes
            // Examples: "1.5 oz amontillado sherry" → "amontillado sherry"
            //           "2 dashes orange bitters" → "orange bitters"
            //           "Orange twist" → "orange twist"
            let ingredientText = fullText.trim();

            // Remove common measurement prefixes
            ingredientText = ingredientText
              // Remove amounts with units: "1.5 oz", "2 dashes", "1/2 cup", etc.
              .replace(/^\d+(\/\d+)?\s*(oz|cup|tbsp|tsp|dash|dashes|drop|drops|ml|cl|shot|jigger|part|parts|slice|slices|wheel|wheels|twist|twists|peel|peels|wedge|wedges|sprig|sprigs|leaf|leaves|piece|pieces)\s+/i, '')
              // Remove just numbers at the start: "2 orange twists" → "orange twists"
              .replace(/^\d+\s+/, '')
              // Clean up extra whitespace
              .trim();

            console.log(`[SERVER] Parsed "${fullText}" → "${ingredientText}"`);

            if (!ingredientText) {
              return null;
            }

            // Find matching ingredient in the ingredients table by name
            let matchedIngredient = null;

            // First try exact match
            for (const [id, name] of ingredientNameById.entries()) {
              if (name && name.toLowerCase().trim() === ingredientText.toLowerCase().trim()) {
                matchedIngredient = { id, name };
                break;
              }
            }

            // If exact match not found, try partial match with common ingredient name variations
            if (!matchedIngredient) {
              const searchVariations = [
                ingredientText,
                // Try removing common prefixes/suffixes
                ingredientText.replace(/^(sweet|dry|white|dark|aged|extra|fresh)\s+/i, ''),
                ingredientText.replace(/\s+(juice|syrup|bitters|liqueur|vodka|gin|rum|whiskey|bourbon|scotch|tequila|brandy|cognac|wine|beer)$/i, ''),
                // Try splitting and taking the last meaningful part
                ingredientText.split(/\s+/).slice(-2).join(' '),
                ingredientText.split(/\s+/).slice(-1)[0]
              ].filter(v => v && v.length > 2); // Filter out very short fragments

              for (const variation of searchVariations) {
                for (const [id, name] of ingredientNameById.entries()) {
                  if (name && (
                    name.toLowerCase().includes(variation.toLowerCase()) ||
                    variation.toLowerCase().includes(name.toLowerCase())
                  )) {
                    matchedIngredient = { id, name };
                    console.log(`[SERVER] Matched "${ingredientText}" → "${name}" using variation "${variation}"`);
                    break;
                  }
                }
                if (matchedIngredient) break;
              }
            }

            const ingredientId = matchedIngredient ? String(matchedIngredient.id) : 'unknown';
            const ingredientName = matchedIngredient ? matchedIngredient.name : fullText; // Use original text as fallback name

            return {
              id: ingredientId,
              name: ingredientName,
              amount: ing.amount || ing.measure || null,
              isOptional: ing.isOptional || false,
              notes: ing.notes || null
            };
          }).filter(ing => ing !== null); // Remove null entries

          console.log(`[SERVER] Mapped ${ingredients.length} ingredients for ${cocktail.name}`);
          processedSuccessfully = ingredients.length > 0;
        } else if (cocktail.ingredients) {
          // Try to handle as string or other format
          console.log(`[SERVER] Ingredients is not an array for ${cocktail.name}, trying fallback...`);
          try {
            const parsed = typeof cocktail.ingredients === 'string' ? JSON.parse(cocktail.ingredients) : cocktail.ingredients;
            if (Array.isArray(parsed)) {
              ingredients = parsed.map((ing: any) => ({
                id: String(ing.ingredient?.id || ing.id || 'unknown'),
                name: ing.ingredient?.name || 'Unknown',
                amount: ing.amount || ing.measure || null,
                isOptional: ing.isOptional || false,
                notes: ing.notes || null
              }));
              console.log(`[SERVER] Fallback worked: Mapped ${ingredients.length} ingredients for ${cocktail.name}`);
              processedSuccessfully = ingredients.length > 0;
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
          console.log(`[SERVER] No ingredients field for ${cocktail.name}`);
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

      console.log(`[SERVER] Final: Cocktail ${cocktail.name}: found ${ingredients.length} ingredients`);

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
        isPopular: cocktail.metadata_json?.isPopular || false,
        isFavorite: cocktail.metadata_json?.isFavorite || false,
        isTrending: cocktail.metadata_json?.isTrending || false,
        drinkCategories: cocktail.categories_all || [],
        tags: cocktail.tags || [],
        garnish: cocktail.garnish || null,
        ingredientsWithIds: ingredients
      };
    });

    console.log('[SERVER] Final result: first cocktail has ingredients:', result[0]?.ingredientsWithIds?.length || 0);

    // Log diagnostic summary
    const validCocktails = result.filter(c => c.ingredientsWithIds && c.ingredientsWithIds.length > 0);
    const invalidCocktails = result.filter(c => !c.ingredientsWithIds || c.ingredientsWithIds.length === 0);

    console.log(`[SERVER] DIAGNOSTIC SUMMARY:
╔════════════════════════════════════════╗
║       COCKTAIL DATA QUALITY REPORT      ║
╠════════════════════════════════════════╣
║ Total cocktails in database: ${cocktailData.length}
║ Valid cocktails (with ingredients): ${validCocktails.length} (${((validCocktails.length / cocktailData.length) * 100).toFixed(1)}%)
║ Excluded cocktails (no ingredients): ${invalidCocktails.length} (${((invalidCocktails.length / cocktailData.length) * 100).toFixed(1)}%)
╚════════════════════════════════════════╝`);

    if (excludedCocktails.length > 0) {
      console.log(`[SERVER] ⚠️  EXCLUDED COCKTAILS (${excludedCocktails.length}):`);
      excludedCocktails.slice(0, 20).forEach((c, i) => {
        console.log(`[SERVER]   ${i + 1}. ${c.name} (${c.id}): ${c.reason}`);
      });
      if (excludedCocktails.length > 20) {
        console.log(`[SERVER]   ... and ${excludedCocktails.length - 20} more`);
      }
    }

    // Return only valid cocktails
    const validResult = validCocktails;
    console.log(`[SERVER] Returning ${validResult.length} valid cocktails to client`);
    return validResult;
  } catch (error) {
    console.error('[SERVER] Error in getCocktailsWithIngredients:', error);
    return [];
  }
}

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

/**
 * Get today's cocktail slug deterministically (server-side).
 * Uses UTC date string hashing so all users see the same cocktail each day.
 *
 * Uses the server Supabase client (service role when available, anon fallback),
 * so this works consistently in production where the cocktails table may not be publicly countable.
 */
export async function getTodaysDailyCocktailSlug(): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient();

    // Fetch ONLY slugs (lightweight) and pick deterministically.
    // This avoids relying on PostgREST count semantics (which can vary under RLS).
    const { data, error } = await supabase
      .from("cocktails")
      .select("slug")
      .not("slug", "is", null)
      .neq("slug", "")
      .order("slug", { ascending: true })
      .limit(5000);

    if (error) {
      console.error("getTodaysDailyCocktailSlug query error:", error);
      // fall through to file-based fallback
    }

    const slugs = (data || [])
      .map((r: any) => (r?.slug ? String(r.slug) : ""))
      .filter(Boolean);

    if (slugs.length > 0) {
      const index = getDailyIndexFromCount(slugs.length, new Date());
      return slugs[index] || null;
    }

    // Fallback: use the checked-in dataset to select a daily slug.
    // This ensures Cocktail of the Day still works even if Supabase keys/RLS break in prod.
    try {
      const filePath = path.join(process.cwd(), "cocktails.enriched.ndjson");
      const raw = await fs.readFile(filePath, "utf8");
      const fileSlugs = raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          try {
            const obj = JSON.parse(line);
            // Skip hidden cocktails if present
            if (obj?.hidden === true) return null;
            const s = obj?.slug?.current;
            return s ? String(s) : null;
          } catch {
            return null;
          }
        })
        .filter((s): s is string => !!s);

      const unique = Array.from(new Set(fileSlugs)).sort();
      if (unique.length === 0) return null;

      const index = getDailyIndexFromCount(unique.length, new Date());
      return unique[index] || null;
    } catch (fallbackError) {
      console.error("getTodaysDailyCocktailSlug file fallback failed:", fallbackError);
      return null;
    }
  } catch (e) {
    console.error("getTodaysDailyCocktailSlug failed:", e);
    return null;
  }
}

/**
 * Get user's bar ingredients with fallback logic
 * First tries inventories/inventory_items tables, then falls back to bar_ingredients
 * Returns numeric ingredient IDs that match the ingredients table
 */
export async function getUserBarIngredients(userId: string): Promise<Array<{
  id: string;
  ingredient_id: number;
  ingredient_name: string | null;
  ingredient_category?: string | null;
  inventory_id?: string;
}>> {
  const supabase = createServerSupabaseClient();

  // First, fetch all ingredients to create name-to-ID mapping
  const { data: allIngredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id, name, category');

  if (ingredientsError) {
    console.error('Error fetching ingredients list:', ingredientsError);
    return [];
  }

  // Create mapping from lowercased name to ID
  const nameToIdMap = new Map<string, number>();
  // Create mapping from numeric ID to ingredient name for lookup
  const idToNameMap = new Map<number, string>();
  const idToCategoryMap = new Map<number, string | null>();
  (allIngredients || []).forEach(ing => {
    if (ing.name) {
      nameToIdMap.set(ing.name.toLowerCase(), ing.id);
      idToNameMap.set(ing.id, ing.name);
      idToCategoryMap.set(ing.id, (ing as any).category ?? null);
    }
  });

  // Helper function to convert string ID to numeric ID
  const convertToNumericId = (stringId: string, name?: string | null): number | null => {
    // First try to parse as integer
    let parsed = parseInt(stringId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }

    // Handle ingredient- prefixed IDs
    if (stringId.startsWith('ingredient-')) {
      const idPart = stringId.substring('ingredient-'.length);
      parsed = parseInt(idPart, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
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
      const numericId = convertToNumericId(item.ingredient_id, item.ingredient_name);
      
      // IMPORTANT: Don't drop items we can't convert - preserve them with a fallback ID
      // This prevents data loss when IDs can't be mapped
      if (!numericId) {
        console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID, using fallback`);
        // Use a hash of the string ID as a fallback numeric ID
        // This ensures the item is still displayed even if we can't map it
        const fallbackId = Math.abs(item.ingredient_id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)) || 999999;
        
        return {
          id: item.id.toString(),
          ingredient_id: fallbackId,
          ingredient_name: item.ingredient_name || item.ingredient_id,
          ingredient_category: null,
        };
      }

      // Get the proper ingredient name from the ingredients table
      const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

      return {
        id: item.id.toString(),
        ingredient_id: numericId,
        ingredient_name: properName,
        ingredient_category: idToCategoryMap.get(numericId) ?? null,
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
 * Get user's bar ingredient IDs only (for quick checks)
 * First tries inventories/inventory_items tables, then falls back to bar_ingredients
 * Returns numeric IDs that match ingredients.id
 */
export async function getUserBarIngredientIds(userId: string): Promise<number[]> {
  const ingredients = await getUserBarIngredients(userId);
  return ingredients.map(item => item.ingredient_id);
}
