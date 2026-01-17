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
  const [isBarPage, setIsBarPage] = useState(false);
  
  // Check if we're on a bar page (only activate refresh logic there)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      setIsBarPage(pathname.startsWith('/bar/'));
    }
  }, []);
  
  // Helper to trigger page refresh
  const triggerRefresh = () => {
    console.log("[BarProfileRefresh] Triggering page refresh...");
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Use router.refresh() first (faster, no flash)
    router.refresh();
    
    // If that doesn't work after 1 second, do a hard reload
    setTimeout(() => {
      console.log("[BarProfileRefresh] Fallback to hard reload...");
      window.location.reload();
    }, 1000);
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
      });
      // Delay to ensure database write has completed
      refreshTimeoutRef.current = setTimeout(() => {
        triggerRefresh();
      }, 500); // Longer delay for database consistency
    }
    
    // Update the ref for next comparison
    previousFavoritesRef.current = currentFavorites;
  }, [favorites, isBarPage, router]);
  
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
        triggerRefresh();
      }, 500); // Longer delay for database consistency
    }
    
    // Update the ref for next comparison
    previousIngredientsRef.current = currentIngredients;
    hasMountedRef.current = true;
  }, [ingredientIds, isBarPage, router]);
  
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
