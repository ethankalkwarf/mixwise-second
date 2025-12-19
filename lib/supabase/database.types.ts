/**
 * Supabase Database Types
 * 
 * These types mirror the database schema created in the migration.
 * They provide type safety for all database operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: "free" | "paid" | "admin";
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "free" | "paid" | "admin";
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "free" | "paid" | "admin";
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      bar_ingredients: {
        Row: {
          id: number;
          user_id: string;
          ingredient_id: string;
          ingredient_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          ingredient_id: string;
          ingredient_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          ingredient_id?: string;
          ingredient_name?: string | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: number;
          user_id: string;
          cocktail_id: string;
          cocktail_name: string | null;
          cocktail_slug: string | null;
          cocktail_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          cocktail_id: string;
          cocktail_name?: string | null;
          cocktail_slug?: string | null;
          cocktail_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          cocktail_id?: string;
          cocktail_name?: string | null;
          cocktail_slug?: string | null;
          cocktail_image_url?: string | null;
          created_at?: string;
        };
      };
      recently_viewed_cocktails: {
        Row: {
          id: number;
          user_id: string;
          cocktail_id: string;
          cocktail_name: string | null;
          cocktail_slug: string | null;
          cocktail_image_url: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          cocktail_id: string;
          cocktail_name?: string | null;
          cocktail_slug?: string | null;
          cocktail_image_url?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          cocktail_id?: string;
          cocktail_name?: string | null;
          cocktail_slug?: string | null;
          cocktail_image_url?: string | null;
          viewed_at?: string;
        };
      };
      feature_usage: {
        Row: {
          id: number;
          user_id: string | null;
          feature: string;
          period_start: string;
          count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          feature: string;
          period_start: string;
          count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          feature?: string;
          period_start?: string;
          count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: number;
          user_id: string;
          cocktail_id: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          cocktail_id: string;
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          cocktail_id?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopping_list: {
        Row: {
          id: number;
          user_id: string;
          ingredient_id: string;
          ingredient_name: string;
          ingredient_category: string | null;
          is_checked: boolean;
          added_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          ingredient_id: string;
          ingredient_name: string;
          ingredient_category?: string | null;
          is_checked?: boolean;
          added_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          ingredient_id?: string;
          ingredient_name?: string;
          ingredient_category?: string | null;
          is_checked?: boolean;
          added_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_spirits: string[] | null;
          flavor_profiles: string[] | null;
          skill_level: string;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          public_bar_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_spirits?: string[] | null;
          flavor_profiles?: string[] | null;
          skill_level?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_spirits?: string[] | null;
          flavor_profiles?: string[] | null;
          skill_level?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
          metadata?: Json;
        };
      };
      email_signups: {
        Row: {
          id: number;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          source?: string;
          created_at?: string;
        };
      };
      cocktails: {
        Row: {
          id: string;
          legacy_id: string | null;
          slug: string;
          name: string;
          short_description: string | null;
          long_description: string | null;
          seo_description: string | null;
          base_spirit: string | null;
          category_primary: string | null;
          glassware: string | null;
          garnish: string | null;
          technique: string | null;
          difficulty: string | null;
          categories_all: string[] | null;
          tags: string[] | null;
          flavor_strength: number | null;
          flavor_sweetness: number | null;
          flavor_tartness: number | null;
          flavor_bitterness: number | null;
          flavor_aroma: number | null;
          flavor_texture: number | null;
          notes: string | null;
          fun_fact: string | null;
          fun_fact_source: string | null;
          metadata_json: Json;
          ingredients: Json;
          instructions: string | null;
          image_url: string | null;
          image_alt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legacy_id?: string | null;
          slug: string;
          name: string;
          short_description?: string | null;
          long_description?: string | null;
          seo_description?: string | null;
          base_spirit?: string | null;
          category_primary?: string | null;
          glassware?: string | null;
          garnish?: string | null;
          technique?: string | null;
          difficulty?: string | null;
          categories_all?: string[] | null;
          tags?: string[] | null;
          flavor_strength?: number | null;
          flavor_sweetness?: number | null;
          flavor_tartness?: number | null;
          flavor_bitterness?: number | null;
          flavor_aroma?: number | null;
          flavor_texture?: number | null;
          notes?: string | null;
          fun_fact?: string | null;
          fun_fact_source?: string | null;
          metadata_json?: Json;
          ingredients?: Json;
          instructions?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legacy_id?: string | null;
          slug?: string;
          name?: string;
          short_description?: string | null;
          long_description?: string | null;
          seo_description?: string | null;
          base_spirit?: string | null;
          category_primary?: string | null;
          glassware?: string | null;
          garnish?: string | null;
          technique?: string | null;
          difficulty?: string | null;
          categories_all?: string[] | null;
          tags?: string[] | null;
          flavor_strength?: number | null;
          flavor_sweetness?: number | null;
          flavor_tartness?: number | null;
          flavor_bitterness?: number | null;
          flavor_aroma?: number | null;
          flavor_texture?: number | null;
          notes?: string | null;
          fun_fact?: string | null;
          fun_fact_source?: string | null;
          metadata_json?: Json;
          ingredients?: Json;
          instructions?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      upsert_recently_viewed: {
        Args: {
          p_user_id: string;
          p_cocktail_id: string;
          p_cocktail_name?: string;
          p_cocktail_slug?: string;
          p_cocktail_image_url?: string;
        };
        Returns: undefined;
      };
      increment_feature_usage: {
        Args: {
          p_user_id: string;
          p_feature: string;
        };
        Returns: undefined;
      };
      upsert_rating: {
        Args: {
          p_user_id: string;
          p_cocktail_id: string;
          p_rating: number;
        };
        Returns: undefined;
      };
      get_cocktail_rating: {
        Args: {
          p_cocktail_id: string;
        };
        Returns: {
          average_rating: number;
          total_ratings: number;
        }[];
      };
      toggle_shopping_item: {
        Args: {
          p_user_id: string;
          p_ingredient_id: string;
        };
        Returns: boolean;
      };
    };
  };
}

// Convenience types for common operations
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type BarIngredient = Database["public"]["Tables"]["bar_ingredients"]["Row"];
export type BarIngredientInsert = Database["public"]["Tables"]["bar_ingredients"]["Insert"];

export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];

export type RecentlyViewed = Database["public"]["Tables"]["recently_viewed_cocktails"]["Row"];
export type RecentlyViewedInsert = Database["public"]["Tables"]["recently_viewed_cocktails"]["Insert"];

export type FeatureUsage = Database["public"]["Tables"]["feature_usage"]["Row"];

export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type RatingInsert = Database["public"]["Tables"]["ratings"]["Insert"];
export type RatingUpdate = Database["public"]["Tables"]["ratings"]["Update"];

export type ShoppingListItem = Database["public"]["Tables"]["shopping_list"]["Row"];
export type ShoppingListInsert = Database["public"]["Tables"]["shopping_list"]["Insert"];
export type ShoppingListUpdate = Database["public"]["Tables"]["shopping_list"]["Update"];

export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type UserPreferencesInsert = Database["public"]["Tables"]["user_preferences"]["Insert"];
export type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];

export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type UserBadgeInsert = Database["public"]["Tables"]["user_badges"]["Insert"];

export type EmailSignup = Database["public"]["Tables"]["email_signups"]["Row"];
export type EmailSignupInsert = Database["public"]["Tables"]["email_signups"]["Insert"];

export type CocktailRow = Database["public"]["Tables"]["cocktails"]["Row"];
export type CocktailInsert = Database["public"]["Tables"]["cocktails"]["Insert"];
export type CocktailUpdate = Database["public"]["Tables"]["cocktails"]["Update"];

// User role type
export type UserRole = "free" | "paid" | "admin";

