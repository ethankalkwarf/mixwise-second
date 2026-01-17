"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useBarIngredients } from "@/hooks/useBarIngredients";

/**
 * Client component wrapper that refreshes the page when favorites or ingredients change
 * This ensures the server-rendered bar page shows updated data immediately
 * 
 * IMPORTANT: This component is ONLY active on /bar/[slug] pages
 * It will NOT trigger reloads on other pages like /mix or /cocktails
 */
export function BarProfileRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { ingredientIds } = useBarIngredients();
  const previousFavoritesRef = useRef<string>("");
  const previousIngredientsRef = useRef<string>("");
  const hasMountedRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef(0);
  const [isBarPage, setIsBarPage] = useState(false);
  
  // Check if we're on a bar page (only activate refresh logic there)
  // Use useEffect to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBarPage(window.location.pathname.startsWith('/bar/'));
    }
  }, []);
  
  // Helper to trigger page refresh
  const triggerRefresh = (reason: string) => {
    const now = Date.now();
    // Prevent rapid refreshes (max once per second)
    if (now - lastRefreshTimeRef.current < 1000) {
      console.log(`[BarProfileRefresh] Skipping refresh (${reason}) - rate limited`);
      return;
    }
    
    console.log(`[BarProfileRefresh] Triggering refresh (${reason})...`);
    lastRefreshTimeRef.current = now;
    
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Force a hard reload to bypass all Next.js caching
    // router.refresh() was not reliably clearing server component cache
    window.location.reload();
  };
  
  // Track favorite IDs to detect any changes (not just count)
  useEffect(() => {
    if (!isBarPage) return; // Only refresh on bar pages
    
    // Create a sorted string of favorite IDs for comparison
    const currentFavorites = favorites
      .map(f => f.cocktail_id)
      .sort()
      .join(",");
    
    // Only refresh if favorites actually changed (not on initial mount)
    if (hasMountedRef.current && previousFavoritesRef.current !== currentFavorites) {
      console.log("[BarProfileRefresh] Favorites changed:", {
        previous: previousFavoritesRef.current.split(",").filter(Boolean).length,
        current: currentFavorites.split(",").filter(Boolean).length,
        previousIds: previousFavoritesRef.current,
        currentIds: currentFavorites,
      });
      // Delay to ensure database write has completed
      refreshTimeoutRef.current = setTimeout(() => {
        triggerRefresh('favorites-changed');
      }, 800); // Longer delay for database consistency
    }
    
    // Update the ref for next comparison
    previousFavoritesRef.current = currentFavorites;
  }, [favorites, isBarPage]);
  
  // Track ingredient IDs to detect changes
  useEffect(() => {
    if (!isBarPage) return; // Only refresh on bar pages
    
    const currentIngredients = [...ingredientIds].sort().join(",");
    
    // Only refresh if ingredients actually changed (not on initial mount)
    if (hasMountedRef.current && previousIngredientsRef.current !== currentIngredients) {
      console.log("[BarProfileRefresh] Ingredients changed:", {
        previous: previousIngredientsRef.current.split(",").filter(Boolean).length,
        current: currentIngredients.split(",").filter(Boolean).length,
      });
      // Delay to ensure database write has completed
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        triggerRefresh('ingredients-changed');
      }, 800); // Longer delay for database consistency
    }
    
    // Update the ref for next comparison
    previousIngredientsRef.current = currentIngredients;
    hasMountedRef.current = true;
  }, [ingredientIds, isBarPage]);
  
  // Also refresh when user navigates back to the bar page
  useEffect(() => {
    if (!isBarPage) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[BarProfileRefresh] Page became visible, triggering refresh');
        triggerRefresh('visibility-change');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isBarPage]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return <>{children}</>;
}
