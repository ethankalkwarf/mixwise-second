/**
 * TypeScript types for cocktail data from Supabase
 */

export interface CocktailIngredient {
  ingredient: {
    id: string;
    name: string;
    slug: string;
    type: string;
    abv?: number;
  } | null;
  amount?: string;
  isOptional?: boolean;
  notes?: string;
}

export interface CocktailFlavorProfile {
  strength: number; // 1-10
  sweetness: number; // 1-10
  tartness: number; // 1-10
  bitterness: number; // 1-10
  aroma: number; // 1-10
  texture: number; // 1-10
}

export interface CocktailMetadata {
  isPopular?: boolean;
  isFavorite?: boolean;
  isTrending?: boolean;
  bestFor?: string[];
  seoTitle?: string;
  metaDescription?: string;
  imageAltOverride?: string;
  history?: string;
  tips?: string;
  funFactSources?: Array<{ label: string; url: string }>;
  [key: string]: any;
}

export interface Cocktail {
  id: string;
  legacy_id?: string;
  slug: string;
  name: string;
  short_description?: string;
  long_description?: string;
  seo_description?: string;
  base_spirit?: string;
  category_primary?: string;
  glassware?: string;
  garnish?: string;
  technique?: string;
  difficulty?: string;
  categories_all?: string[];
  tags?: string[];
  flavor_strength?: number;
  flavor_sweetness?: number;
  flavor_tartness?: number;
  flavor_bitterness?: number;
  flavor_aroma?: number;
  flavor_texture?: number;
  notes?: string;
  fun_fact?: string;
  fun_fact_source?: string;
  metadata_json?: CocktailMetadata;
  ingredients?: CocktailIngredient[];
  instructions?: string;
  image_url?: string;
  image_alt?: string;
  created_at: string;
  updated_at: string;
}

// Convenience types for operations
export type CocktailInsert = Omit<Cocktail, 'id' | 'created_at' | 'updated_at'>;
export type CocktailUpdate = Partial<CocktailInsert>;

// Filter types for cocktail queries
export interface CocktailFilters {
  base_spirit?: string;
  category_primary?: string;
  difficulty?: string;
  tags?: string[];
  categories_all?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

// Result type for cocktail listings
export interface CocktailListItem {
  id: string;
  slug: string;
  name: string;
  short_description?: string;
  base_spirit?: string;
  category_primary?: string;
  difficulty?: string;
  tags?: string[];
  image_url?: string;
  image_alt?: string;
  flavor_strength?: number;
  flavor_sweetness?: number;
  flavor_tartness?: number;
  flavor_bitterness?: number;
  flavor_aroma?: number;
  flavor_texture?: number;
}

