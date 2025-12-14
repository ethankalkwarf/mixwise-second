/**
 * Cocktail helper functions for Supabase
 */

import { getSupabaseClient } from './supabase/client';
import type {
  Cocktail,
  CocktailListItem,
  CocktailFilters,
  CocktailIngredient,
  MixCocktail,
  MixIngredient,
  MixCocktailIngredient
} from './cocktailTypes';

// =========================
// SERVER FUNCTIONS
// =========================

/**
 * Get a single cocktail by slug (server-side)
 */
export async function getCocktailBySlug(slug: string): Promise<Cocktail | null> {
  const supabase = createServerClient();

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
 */
export async function getCocktailsList(filters: CocktailFilters = {}): Promise<CocktailListItem[]> {
  const supabase = createServerClient();
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

/**
 * Get all cocktails for mix logic (server-side)
 */
export async function getMixCocktails(): Promise<MixCocktail[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('cocktails')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching mix cocktails:', error);
    return [];
  }

  return (data || []).map(cocktail => ({
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
    ingredients: (cocktail.ingredients as CocktailIngredient[] || [])
      .filter(ing => ing.ingredient?.id) // Filter out null references
      .map(ing => ({
        id: ing.ingredient!.id,
        name: ing.ingredient!.name || "Unknown",
        amount: ing.amount || null,
        isOptional: ing.isOptional || false,
        notes: ing.notes || null
      }))
  }));
}

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

    return (data || []).map(ingredient => ({
      id: ingredient.id || ingredient.legacy_id || `ing-${Math.random()}`,
      name: ingredient.name,
      category: ingredient.type || ingredient.category || 'other',
      imageUrl: ingredient.image_url || null,
      isStaple: ingredient.is_staple || false,
    }));
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
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('cocktails')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching mix cocktails:', error);
    return [];
  }

  return (data || []).map(cocktail => ({
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
    ingredients: (cocktail.ingredients as CocktailIngredient[] || [])
      .filter(ing => ing.ingredient?.id) // Filter out null references
      .map(ing => ({
        id: ing.ingredient!.id,
        name: ing.ingredient!.name || "Unknown",
        amount: ing.amount || null,
        isOptional: ing.isOptional || false,
        notes: ing.notes || null
      }))
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
 * Get unique values for a field (e.g., base_spirits, categories)
 */
export async function getUniqueValues(field: 'base_spirit' | 'category_primary' | 'difficulty' | 'glassware' | 'technique'): Promise<string[]> {
  const supabase = createServerClient();

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
    const parsed = parseInt(stringId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }

    // Try to find by name (the string ID itself)
    return nameToIdMap.get(stringId.toLowerCase()) || null;
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

/**
 * Get cocktail count
 */
export async function getCocktailCount(): Promise<number> {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting cocktail count:', error);
    return 0;
  }

  return count || 0;
}
