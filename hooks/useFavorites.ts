"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { trackCocktailFavorited } from "@/lib/analytics";
import { checkFavoritesBadges } from "@/lib/badgeEngine";
import type { Favorite } from "@/lib/supabase/database.types";

interface UseFavoritesResult {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (cocktailId: string) => boolean;
  toggleFavorite: (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => Promise<void>;
  removeFavorite: (cocktailId: string) => Promise<void>;
}

/**
 * Hook to manage user's favorite cocktails
 * 
 * Only works for authenticated users.
 * Anonymous users are prompted to sign in.
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 */
export function useFavorites(): UseFavoritesResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track the last fetched user ID to prevent duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  // CRITICAL FIX: Memoize the Set to prevent new object reference on every render
  // This was causing cascading re-renders throughout the app
  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.cocktail_id)), [favorites]);

  // Load favorites from server
  const loadFavorites = useCallback(async (userId: string) => {
    // Prevent duplicate fetches
    if (isFetching.current) {
      return;
    }
    
    isFetching.current = true;
    
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading favorites:", error);
    } else {
      setFavorites(data || []);
      lastFetchedUserId.current = userId;
    }
    
    isFetching.current = false;
  }, [supabase]);

  // Initialize favorites - only fetch when user ID changes
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }
    
    // Only fetch if user ID changed
    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      loadFavorites(user.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadFavorites]);

  // Check if a cocktail is favorited
  const isFavorite = useCallback((cocktailId: string) => {
    return favoriteIds.has(cocktailId);
  }, [favoriteIds]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => {
    // Require authentication
    if (!isAuthenticated || !user) {
      openAuthDialog({
        mode: "signup",
        title: "Save your favorites",
        subtitle: "Log in or create a free account to save favorite cocktails and access them anytime.",
      });
      return;
    }

    const isCurrentlyFavorite = favoriteIds.has(cocktail.id);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      setFavorites(prev => prev.filter(f => f.cocktail_id !== cocktail.id));
      
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("cocktail_id", cocktail.id);
      
      if (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to remove from favorites");
        // Reload to get accurate state
        if (user) {
          lastFetchedUserId.current = null;
          await loadFavorites(user.id);
        }
      } else {
        toast.info("Removed from favorites");
      }
    } else {
      // Add to favorites
      const newFavorite: Omit<Favorite, "id"> = {
        user_id: user.id,
        cocktail_id: cocktail.id,
        cocktail_name: cocktail.name,
        cocktail_slug: cocktail.slug || null,
        cocktail_image_url: cocktail.imageUrl || null,
        created_at: new Date().toISOString(),
      };
      
      // Optimistically update UI
      setFavorites(prev => [newFavorite as Favorite, ...prev]);
      
      const { data, error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          cocktail_id: cocktail.id,
          cocktail_name: cocktail.name,
          cocktail_slug: cocktail.slug,
          cocktail_image_url: cocktail.imageUrl,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding favorite:", error);
        toast.error("Failed to add to favorites");
        // Reload to get accurate state
        if (user) {
          lastFetchedUserId.current = null;
          await loadFavorites(user.id);
        }
      } else if (data) {
        // Update with real data from server
        setFavorites(prev => [data, ...prev.filter(f => f.cocktail_id !== cocktail.id)]);
        trackCocktailFavorited(user.id, cocktail.id, cocktail.name);
        toast.success("Added to favorites");

        // Check for badge unlocks
        try {
          await checkFavoritesBadges(supabase, user.id, favorites.length + 1);
        } catch (badgeError) {
          console.error("Error checking favorites badges:", badgeError);
        }
      }
    }
  }, [isAuthenticated, user, favoriteIds, openAuthDialog, supabase, loadFavorites, toast]);

  // Remove favorite
  const removeFavorite = useCallback(async (cocktailId: string) => {
    if (!isAuthenticated || !user) return;
    
    setFavorites(prev => prev.filter(f => f.cocktail_id !== cocktailId));
    
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("cocktail_id", cocktailId);
    
    if (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
      if (user) {
        lastFetchedUserId.current = null;
        loadFavorites(user.id);
      }
    } else {
      toast.info("Removed from favorites");
    }
  }, [isAuthenticated, user, supabase, loadFavorites, toast]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}

