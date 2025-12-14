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
  const supabase = createServerSupabaseClient();

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
  (allIngredients || []).forEach(ing => {
    if (ing.name) {
      nameToIdMap.set(ing.name.toLowerCase(), ing.id);
    }
  });

  // Helper function to convert string ID to numeric ID
  const convertToNumericId = (stringId: string, name?: string | null): number | null => {
    // First try to parse as integer
    const parsed = parseInt(stringId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }

    // Try to find by name (either provided name or the string ID itself)
    const lookupName = (name || stringId).toLowerCase();
    return nameToIdMap.get(lookupName) || null;
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
            return {
              id: item.id.toString(),
              ingredient_id: numericId,
              ingredient_name: item.ingredient_name,
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
      return {
        id: item.id.toString(),
        ingredient_id: numericId,
        ingredient_name: item.ingredient_name,
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
