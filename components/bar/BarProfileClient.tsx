"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useBarIngredients } from "@/hooks/useBarIngredients";

/**
 * Client component wrapper that refreshes the page when favorites or ingredients change
 * This ensures the server-rendered bar page shows updated data immediately
 * Uses hard reload to bypass all Next.js caches
 */
export function BarProfileRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { ingredientIds } = useBarIngredients();
  const previousFavoritesRef = useRef<string>("");
  const previousIngredientsRef = useRef<string>("");
  const hasMountedRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper to trigger hard page reload (bypasses all caches)
  const hardReload = () => {
    console.log("[BarProfileRefresh] Triggering hard page reload...");
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    // Use hard reload to ensure fresh data from server
    window.location.reload();
  };
  
  // Track favorite IDs to detect any changes (not just count)
  useEffect(() => {
    // Create a sorted string of favorite IDs for comparison
    const currentFavorites = favorites
      .map(f => f.cocktail_id)
      .sort()
      .join(",");
    
    // Only refresh if favorites actually changed (not on initial mount)
    if (hasMountedRef.current && previousFavoritesRef.current !== currentFavorites) {
      console.log("[BarProfileRefresh] Favorites changed:", {
        previous: previousFavoritesRef.current.split(",").length,
        current: currentFavorites.split(",").length,
      });
      // Delay to ensure database write has completed
      refreshTimeoutRef.current = setTimeout(() => {
        hardReload();
      }, 200);
    }
    
    // Update the ref for next comparison
    previousFavoritesRef.current = currentFavorites;
  }, [favorites]);
  
  // Track ingredient IDs to detect changes
  useEffect(() => {
    const currentIngredients = [...ingredientIds].sort().join(",");
    
    // Only refresh if ingredients actually changed (not on initial mount)
    if (hasMountedRef.current && previousIngredientsRef.current !== currentIngredients) {
      console.log("[BarProfileRefresh] Ingredients changed:", {
        previous: previousIngredientsRef.current.split(",").length,
        current: currentIngredients.split(",").length,
      });
      // Delay to ensure database write has completed
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        hardReload();
      }, 200);
    }
    
    // Update the ref for next comparison
    previousIngredientsRef.current = currentIngredients;
    hasMountedRef.current = true;
  }, [ingredientIds]);
  
  // Also refresh when page becomes visible (user navigated back from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[BarProfileRefresh] Page became visible, refreshing...");
        // Small delay to ensure user has finished navigating
        setTimeout(() => {
          hardReload();
        }, 300);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return <>{children}</>;
}
