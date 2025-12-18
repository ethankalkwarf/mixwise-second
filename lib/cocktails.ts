/**
 * Client-side cocktail helper functions for Supabase
 *
 * These functions run in the browser and use the client Supabase instance.
 * No server-only imports allowed.
 */

import { getSupabaseClient, createClient } from './supabase/client';
import type {
  Cocktail,
  CocktailListItem,
  CocktailFilters,
  MixCocktail,
  MixIngredient,
  MixCocktailIngredient
} from './cocktailTypes';

// =========================
// CLIENT FUNCTIONS
// =========================

/**
 * Get a single cocktail by slug (client-side)
 */
export async function getCocktailBySlugClient(slug: string): Promise<Cocktail | null> {
  const supabase = getSupabaseClient();

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
 * Get cocktails list with optional filters (client-side)
 */
export async function getCocktailsListClient(filters: CocktailFilters = {}): Promise<CocktailListItem[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('cocktails')
    .select(`
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
    `)
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

// =========================
// MIX LOGIC HELPERS
// =========================

/**
 * Fetch ingredients for mix logic (client-side)
 */
export async function getMixIngredients(): Promise<MixIngredient[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching mix ingredients from Supabase:', error);
      // Fallback: return some basic ingredients for the wizard to work
      return getFallbackIngredients();
    }

    if (!data || data.length === 0) {
      console.warn('No ingredients found in Supabase, using fallback');
      return getFallbackIngredients();
    }

    return (data || []).map(ingredient => {
      // Force id to be a string - normalize all IDs to string type
      let id = String(ingredient.id ?? ingredient.legacy_id ?? ingredient.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));

      if (!id) {
        // Only use random ID as absolute last resort
        console.warn('Could not generate stable ID for ingredient:', ingredient);
        id = `fallback-${Math.random()}`;
      }

      return {
        id,
        name: ingredient.name,
        category: ingredient.type || ingredient.category || 'other',
        imageUrl: ingredient.image_url || null,
        isStaple: ingredient.is_staple || false,
      };
    });
  } catch (error) {
    console.error('Error in getMixIngredients:', error);
    return getFallbackIngredients();
  }
}

/**
 * Fallback ingredients for when the database is not available
 */
function getFallbackIngredients(): MixIngredient[] {
  return [
    { id: 'whiskey', name: 'Whiskey', category: 'spirit' },
    { id: 'vodka', name: 'Vodka', category: 'spirit' },
    { id: 'gin', name: 'Gin', category: 'spirit' },
    { id: 'rum', name: 'Rum', category: 'spirit' },
    { id: 'tequila', name: 'Tequila', category: 'spirit' },
    { id: 'vermouth', name: 'Vermouth', category: 'liqueur' },
    { id: 'triple-sec', name: 'Triple Sec', category: 'liqueur' },
    { id: 'lime-juice', name: 'Lime Juice', category: 'citrus' },
    { id: 'lemon-juice', name: 'Lemon Juice', category: 'citrus' },
    { id: 'simple-syrup', name: 'Simple Syrup', category: 'syrup' },
    { id: 'bitters', name: 'Bitters', category: 'bitters' },
    { id: 'club-soda', name: 'Club Soda', category: 'mixer' },
    { id: 'tonic', name: 'Tonic Water', category: 'mixer' },
    { id: 'ice', name: 'Ice', category: 'other', isStaple: true },
  ];
}

/**
 * Fetch cocktails for mix logic (client-side)
 */
export async function getMixCocktailsClient(): Promise<MixCocktail[]> {
  const cocktailsWithIngredients = await getCocktailsWithIngredientsClient();

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
 * Fetch both ingredients and cocktails for mix logic (client-side)
 */
export async function getMixDataClient(): Promise<{
  ingredients: MixIngredient[];
  cocktails: MixCocktail[];
}> {
  const [ingredients, cocktails] = await Promise.all([
    getMixIngredients(),
    getMixCocktailsClient()
  ]);


  return { ingredients, cocktails };
}

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Get cocktails with ingredients from cocktail_ingredients table (client-side)
 * Returns cocktails with ingredientsWithIds array containing numeric ingredient IDs and names
 */
export async function getCocktailsWithIngredientsClient(): Promise<Array<{
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
  const supabase = createClient();

  // Get all cocktails
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
      metadata_json
    `)
    .order('name');

  if (cocktailError) {
    console.error('Error fetching cocktails:', cocktailError);
    return [];
  }

  if (!cocktailData) return [];

  // Get cocktail ingredients from cocktail_ingredients_uuid table
  const { data: cocktailIngredients, error: ingredientsError } = await supabase
    .from('cocktail_ingredients_uuid')
    .select('cocktail_id, ingredient_id, raw_text, amount, is_optional, notes');

  if (ingredientsError) {
    console.error('Error fetching cocktail ingredients:', ingredientsError);
    return [];
  }

  // Get ingredient name mapping
  const { data: ingredients, error: ingError } = await supabase
    .from('ingredients')
    .select('id, name');

  if (ingError) {
    console.error('Error fetching ingredients:', ingError);
    return [];
  }

  // Build ingredient name mapping
  const ingredientNameById = new Map<number, string>();
  (ingredients || []).forEach(ing => {
    ingredientNameById.set(ing.id, ing.name);
  });

  // Group ingredients by cocktail_id (UUID)
  const ingredientsByCocktail = new Map<string, Array<{ id: string; name: string; amount?: string | null; isOptional?: boolean; notes?: string | null }>>();
  (cocktailIngredients || []).forEach((ci: any) => {
    const cocktailId = ci.cocktail_id;
    const ingredientId = String(ci.ingredient_id);
    const name = ingredientNameById.get(ci.ingredient_id) ?? 'Unknown';

    const ingredient = {
      id: ingredientId,
      name,
      amount: ci.amount ?? ci.raw_text ?? null,
      isOptional: ci.is_optional ?? false,
      notes: ci.notes ?? null
    };

    if (!ingredientsByCocktail.has(cocktailId)) {
      ingredientsByCocktail.set(cocktailId, []);
    }
    ingredientsByCocktail.get(cocktailId)!.push(ingredient);
  });

  // Process cocktails and attach their ingredients
  return cocktailData.map(cocktail => {
    const ingredientsWithIds = ingredientsByCocktail.get(cocktail.id) || [];


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
      ingredientsWithIds
    };
  });
}


/**
 * Get user's bar ingredient IDs (client-side)
 * Uses server action for consistency with fallback logic
 * Returns numeric IDs that match ingredients.id
 */
export async function getUserBarIngredientIdsClient(userId: string): Promise<number[]> {
  const supabase = createClient();

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
  (allIngredients || []).forEach(ing => {
    if (ing.name) {
      nameToIdMap.set(ing.name.toLowerCase(), ing.id);
    }
  });

  // Helper function to convert string ID to numeric ID
  const convertToNumericId = (stringId: string): number | null => {
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

    // Try to find by name variations
    const lookupNames = createSynonyms(stringId);

    for (const lookupName of lookupNames) {
      const found = nameToIdMap.get(lookupName);
      if (found) {
        return found;
      }
    }

    return null;
  };

  // First try old inventories table structure
  try {
    const { data: inventories, error: inventoriesError } = await supabase
      .from('inventories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!inventoriesError && inventories && inventories.length > 0) {
      const inventoryId = inventories[0].id;
      const { data: inventoryItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('ingredient_id, ingredient_name')
        .eq('inventory_id', inventoryId);

      if (!itemsError && inventoryItems) {
        return inventoryItems
          .map(item => convertToNumericId(item.ingredient_id))
          .filter((id): id is number => id !== null);
      }
    }
  } catch (error) {
    // Continue to fallback
  }

  // Fallback to bar_ingredients
  const { data: barIngredients, error } = await supabase
    .from('bar_ingredients')
    .select('ingredient_id, ingredient_name')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching bar ingredient IDs:', error);
    return [];
  }

  return (barIngredients || [])
    .map(item => convertToNumericId(item.ingredient_id))
    .filter((id): id is number => id !== null);
}

