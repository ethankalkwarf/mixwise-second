"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { trackCocktailView } from "@/lib/analytics";
import type { RecentlyViewed } from "@/lib/supabase/database.types";

const MAX_RECENT_ITEMS = 20;

interface UseRecentlyViewedResult {
  recentlyViewed: RecentlyViewed[];
  isLoading: boolean;
  recordView: (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => Promise<void>;
  clearHistory: () => Promise<void>;
}

/**
 * Hook to manage recently viewed cocktails
 * 
 * Only tracks for authenticated users.
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 * 
 * CRITICAL FIX: Uses refs to prevent duplicate fetches on auth state updates
 */
export function useRecentlyViewed(): UseRecentlyViewedResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track the last fetched user ID to prevent duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  // Load recently viewed from server
  const loadRecentlyViewed = useCallback(async (userId: string) => {
    // Prevent duplicate fetches
    if (isFetching.current || lastFetchedUserId.current === userId) {
      return;
    }
    
    isFetching.current = true;
    
    const { data, error } = await supabase
      .from("recently_viewed_cocktails")
      .select("*")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(MAX_RECENT_ITEMS);
    
    if (error) {
      console.error("Error loading recently viewed:", error);
    } else {
      setRecentlyViewed(data || []);
      lastFetchedUserId.current = userId;
    }
    
    isFetching.current = false;
  }, [supabase]);

  // Initialize recently viewed - only fetch when user ID changes
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      setRecentlyViewed([]);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }
    
    // Only fetch if user ID changed
    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      loadRecentlyViewed(user.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadRecentlyViewed]);

  // Record a view
  const recordView = useCallback(async (cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  }) => {
    // Track for analytics regardless of auth state
    trackCocktailView(user?.id || null, cocktail.id, cocktail.name);
    
    // Only save to database for authenticated users
    if (!isAuthenticated || !user) return;
    
    // Optimistically update local state
    const newEntry: RecentlyViewed = {
      id: Date.now(), // Temporary ID
      user_id: user.id,
      cocktail_id: cocktail.id,
      cocktail_name: cocktail.name,
      cocktail_slug: cocktail.slug || null,
      cocktail_image_url: cocktail.imageUrl || null,
      viewed_at: new Date().toISOString(),
    };
    
    setRecentlyViewed(prev => {
      // Remove existing entry for this cocktail and add new one at top
      const filtered = prev.filter(v => v.cocktail_id !== cocktail.id);
      return [newEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
    
    // Use the RPC function to upsert
    const { error } = await supabase.rpc("upsert_recently_viewed", {
      p_user_id: user.id,
      p_cocktail_id: cocktail.id,
      p_cocktail_name: cocktail.name,
      p_cocktail_slug: cocktail.slug,
      p_cocktail_image_url: cocktail.imageUrl,
    });
    
    if (error) {
      console.error("Error recording view:", error);
      // Fallback: try regular upsert
      await supabase
        .from("recently_viewed_cocktails")
        .upsert({
          user_id: user.id,
          cocktail_id: cocktail.id,
          cocktail_name: cocktail.name,
          cocktail_slug: cocktail.slug,
          cocktail_image_url: cocktail.imageUrl,
          viewed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,cocktail_id",
        });
    }
  }, [isAuthenticated, user, supabase]);

  // Clear history
  const clearHistory = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setRecentlyViewed([]);
    lastFetchedUserId.current = null; // Allow re-fetch after clear
    
    const { error } = await supabase
      .from("recently_viewed_cocktails")
      .delete()
      .eq("user_id", user.id);
    
    if (error) {
      console.error("Error clearing history:", error);
      loadRecentlyViewed(user.id);
    }
  }, [isAuthenticated, user, supabase, loadRecentlyViewed]);

  return {
    recentlyViewed,
    isLoading,
    recordView,
    clearHistory,
  };
}

