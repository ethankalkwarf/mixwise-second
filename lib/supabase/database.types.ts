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

// User role type
export type UserRole = "free" | "paid" | "admin";

