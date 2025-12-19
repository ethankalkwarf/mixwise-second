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

// Create a Supabase client for server-side operations that works during build time
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Get a single cocktail by slug (server-side)
 */
export async function getCocktailBySlug(slug: string): Promise<Cocktail | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('cocktails')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Cocktail;
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
    .select(selectFields)
    .order('name');

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
  ingredients: Array<{ id: string; name: string; amount?: string | null; isOptional?: boolean; notes?: string | null }>;
}>> {
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

    console.log('[SERVER] First 3 cocktails ingredients data:');
    cocktailData.slice(0, 3).forEach((cocktail, i) => {
      console.log(`[SERVER] Cocktail ${i+1} (${cocktail.name}): ingredients =`, cocktail.ingredients);
    });

    const result = cocktailData.map(cocktail => {
      // Process ingredients from JSON field
      let ingredients = [];
      try {
        console.log(`[SERVER] Processing ${cocktail.name}, ingredients type:`, typeof cocktail.ingredients, 'isArray:', Array.isArray(cocktail.ingredients), 'raw value:', JSON.stringify(cocktail.ingredients));

        if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
          ingredients = cocktail.ingredients.map((ing: any) => ({
            id: String(ing.ingredient?.id || ing.id || 'unknown'),
            name: ing.ingredient?.name || 'Unknown',
            amount: ing.amount || ing.measure || null,
            isOptional: ing.isOptional || false,
            notes: ing.notes || null
          }));
          console.log(`[SERVER] Mapped ${ingredients.length} ingredients for ${cocktail.name}`);
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
            }
          } catch (fallbackError) {
            console.error(`[SERVER] Fallback failed for ${cocktail.name}:`, fallbackError);
          }
        } else {
          console.log(`[SERVER] No ingredients field for ${cocktail.name}`);
        }
      } catch (error) {
        console.error(`Error processing ingredients for cocktail ${cocktail.name}:`, error);
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
        ingredients: ingredients
      };
    });

    console.log('[SERVER] Final result: first cocktail has ingredients:', result[0]?.ingredients?.length || 0);
    return result;
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
 * Get user's bar ingredients with fallback logic
 * First tries inventories/inventory_items tables, then falls back to bar_ingredients
 * Returns numeric ingredient IDs that match the ingredients table
 */
export async function getUserBarIngredients(userId: string): Promise<Array<{
  id: string;
  ingredient_id: number;
  ingredient_name: string | null;
  inventory_id?: string;
}>> {
  const supabase = createServerSupabaseClient();

  // First, fetch all ingredients to create name-to-ID mapping
  const { data: allIngredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id, name');

  if (ingredientsError) {
    console.error('Error fetching ingredients list:', ingredientsError);
    return [];
  }

  // Create mapping from lowercased name to ID
  const nameToIdMap = new Map<string, number>();
  // Create mapping from numeric ID to ingredient name for lookup
  const idToNameMap = new Map<number, string>();
  (allIngredients || []).forEach(ing => {
    if (ing.name) {
      nameToIdMap.set(ing.name.toLowerCase(), ing.id);
      idToNameMap.set(ing.id, ing.name);
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

  // First try the old inventories table structure (if it exists)
  try {
    // Check if inventories table exists and has data for this user
    const { data: inventories, error: inventoriesError } = await supabase
      .from('inventories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!inventoriesError && inventories && inventories.length > 0) {
      // Use old table structure
      const inventoryId = inventories[0].id;
      const { data: inventoryItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, ingredient_id, ingredient_name')
        .eq('inventory_id', inventoryId);

      if (!itemsError && inventoryItems) {
        return inventoryItems
          .map(item => {
            const numericId = convertToNumericId(item.ingredient_id, item.ingredient_name);
            if (!numericId) {
              console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID`);
              return null;
            }

            // Get the proper ingredient name from the ingredients table
            const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

            return {
              id: item.id.toString(),
              ingredient_id: numericId,
              ingredient_name: properName,
              inventory_id: inventoryId,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      }
    }
  } catch (error) {
    // inventories/inventory_items tables don't exist or are empty, continue to fallback
  }

  // Fallback to bar_ingredients table
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
      if (!numericId) {
        console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID, skipping`);
        return null;
      }

      // Get the proper ingredient name from the ingredients table
      const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

      return {
        id: item.id.toString(),
        ingredient_id: numericId,
        ingredient_name: properName,
        // No inventory_id for bar_ingredients
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
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
