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
      // Use ONLY ingredients.id as canonical ID, converted to string
      const id = String(ingredient.id);

      if (!id || id === 'undefined' || id === 'null') {
        console.warn('Invalid ingredient ID:', ingredient);
        return null;
      }

      return {
        id,
        name: ingredient.name,
        category: ingredient.type || ingredient.category || 'other',
        imageUrl: ingredient.image_url || null,
        isStaple: ingredient.is_staple || false,
      };
    }).filter(Boolean) as MixIngredient[];
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
  try {
    console.log('[MIX-DEBUG] getMixCocktailsClient: calling getCocktailsWithIngredientsClient...');
    const cocktailsWithIngredients = await getCocktailsWithIngredientsClient();
    console.log(`[MIX-DEBUG] getMixCocktailsClient: got ${cocktailsWithIngredients.length} cocktails with ingredients`);

    const result = cocktailsWithIngredients.map(cocktail => ({
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

    console.log(`[MIX-DEBUG] getMixCocktailsClient: returning ${result.length} cocktails`);
    return result;
  } catch (error) {
    console.error('[MIX-DEBUG] getMixCocktailsClient failed:', error);
    throw error;
  }
}

/**
 * Fetch both ingredients and cocktails for mix logic (client-side)
 */
export async function getMixDataClient(): Promise<{
  ingredients: MixIngredient[];
  cocktails: MixCocktail[];
}> {
  try {
    console.log('[MIX-DEBUG] Starting getMixDataClient...');

    const ingredientsPromise = getMixIngredients();
    const cocktailsPromise = getMixCocktailsClient();

    const [ingredients, cocktails] = await Promise.all([
      ingredientsPromise,
      cocktailsPromise
    ]);

    console.log(`[MIX-DEBUG] getMixDataClient loaded ${ingredients.length} ingredients, ${cocktails.length} cocktails`);

    // Check for data loading failures
    if (!ingredients || ingredients.length === 0) {
      throw new Error(`Failed to load ingredients (got ${ingredients?.length || 0})`);
    }
    if (!cocktails || cocktails.length === 0) {
      throw new Error(`Failed to load cocktails (got ${cocktails?.length || 0})`);
    }

    return { ingredients, cocktails };
  } catch (error) {
    console.error('[MIX-DEBUG] getMixDataClient failed:', error);
    throw error;
  }
}

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Get cocktails with ingredients from cocktail_ingredients table (client-side)
 * Returns cocktails with ingredients array containing numeric ingredient IDs and names
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
  ingredients: Array<{ id: string; name: string; amount?: string | null; isOptional?: boolean; notes?: string | null }>;
}>> {
  try {
    // Try client-side approach first with timeout
    try {
      const clientSidePromise = getCocktailsWithIngredientsClientSide();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Client-side query timed out after 5 seconds')), 5000);
      });

      return await Promise.race([clientSidePromise, timeoutPromise]);
    } catch (clientError) {
      console.warn('Client-side query failed/timed out, trying server-side fallback:', clientError.message);

      // Fallback to server-side API call
      return await getCocktailsWithIngredientsServerSide();
    }
  } catch (error) {
    console.error('getCocktailsWithIngredientsClient failed:', error);
    throw error;
  }
}

// Client-side implementation
async function getCocktailsWithIngredientsClientSide() {
  const supabase = createClient();

  // Query cocktails with ingredients
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

  if (cocktailError) {
    throw cocktailError;
  }

    if (cocktailError) {
      console.error('Error fetching cocktails:', cocktailError);
      throw cocktailError;
    }

    if (!cocktailData || cocktailData.length === 0) {
      console.log('[MIX-DEBUG] No cocktails found');
      return [];
    }

    // Get ingredient name mapping for converting IDs to names
    const { data: ingredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name');

    if (ingError) {
      console.error('Error fetching ingredients:', ingError);
      throw ingError;
    }

    // Build ingredient name mapping
    const ingredientNameById = new Map<string, string>();
    (ingredients || []).forEach(ing => {
      ingredientNameById.set(String(ing.id), ing.name);
    });

    // Process each cocktail and extract ingredients from JSON field
    const processedCocktails = cocktailData.map((cocktail, index) => {
      let ingredients: Array<{ id: string; name: string; amount?: string | null; isOptional?: boolean; notes?: string | null }> = [];

      try {
        // Parse ingredients from JSON field
        if (cocktail.ingredients) {
          let parsedIngredients: any[] = [];

          if (typeof cocktail.ingredients === 'string') {
            // Try to parse JSON string
            try {
              parsedIngredients = JSON.parse(cocktail.ingredients);
            } catch (parseError) {
              console.warn(`Failed to parse ingredients JSON for cocktail ${cocktail.id}:`, parseError);
              parsedIngredients = [];
            }
          } else if (Array.isArray(cocktail.ingredients)) {
            parsedIngredients = cocktail.ingredients;
          }


          // Convert to the expected format
          ingredients = parsedIngredients.map((ing: any) => {
            // Handle different ingredient formats
            const ingredientId = String(ing.ingredient?.id || ing.id || 'unknown');
            const ingredientName = ing.ingredient?.name || ingredientNameById.get(ingredientId) || 'Unknown';

            return {
              id: ingredientId,
              name: ingredientName,
              amount: ing.amount || ing.measure || null,
              isOptional: ing.isOptional || false,
              notes: ing.notes || null
            };
          }).filter(ing => ing.id !== 'unknown'); // Filter out unknown ingredients
        }
      } catch (error) {
        console.warn(`Error processing ingredients for cocktail ${cocktail.id}:`, error);
      }

      // Extract metadata
      const metadata = cocktail.metadata_json || {};

      return {
        id: cocktail.id,
        name: cocktail.name,
        slug: cocktail.slug,
        description: cocktail.short_description,
        instructions: cocktail.instructions,
        category: cocktail.category_primary,
        imageUrl: cocktail.image_url,
        glass: cocktail.glassware,
        method: cocktail.technique,
        primarySpirit: cocktail.base_spirit,
        difficulty: cocktail.difficulty,
        isPopular: metadata.isPopular || false,
        isFavorite: metadata.isFavorite || false,
        isTrending: metadata.isTrending || false,
        drinkCategories: Array.isArray(cocktail.categories_all) ? cocktail.categories_all : [],
        tags: Array.isArray(cocktail.tags) ? cocktail.tags : [],
        garnish: cocktail.garnish,
        ingredients
      };
    });

    // Filter out cocktails with no valid ingredients
    const validCocktails = processedCocktails.filter(cocktail => {
      const hasIngredients = cocktail.ingredients && cocktail.ingredients.length > 0;
      return hasIngredients;
    });

    return validCocktails;
}

// Server-side fallback implementation
async function getCocktailsWithIngredientsServerSide(): Promise<Array<{
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
  console.log('[MIX-DEBUG] Using server-side API fallback');

  // Make a request to our own API route
  try {
    const response = await fetch('/api/cocktails/with-ingredients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[MIX-DEBUG] Server-side API returned:', data.length, 'cocktails');

    return data;
  } catch (error) {
    console.error('[MIX-DEBUG] Server-side API fallback failed:', error);
    throw error;
  }
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

