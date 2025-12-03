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
 * Fetch ingredients for mix logic (placeholder - will be implemented when ingredients migrate)
 */
export async function getMixIngredients(): Promise<MixIngredient[]> {
  // For now, return empty array - ingredients will be migrated separately
  // TODO: Implement when ingredients are migrated to Supabase
  return [];
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
