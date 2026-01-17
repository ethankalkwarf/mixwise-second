"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";

/**
 * Client component wrapper that refreshes the page when favorites change
 * This ensures the server-rendered bar page shows updated favorites immediately
 */
export function BarProfileRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { favorites } = useFavorites();
  const previousFavoritesRef = useRef<string>("");
  const hasMountedRef = useRef(false);
  
  // Track favorite IDs to detect any changes (not just count)
  useEffect(() => {
    // Create a sorted string of favorite IDs for comparison
    const currentFavorites = favorites
      .map(f => f.cocktail_id)
      .sort()
      .join(",");
    
    // Only refresh if favorites actually changed (not on initial mount)
    if (hasMountedRef.current && previousFavoritesRef.current !== currentFavorites) {
      console.log("[BarProfileRefresh] Favorites changed, refreshing page...");
      // Small delay to ensure database write has completed
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
    
    // Update the ref for next comparison
    previousFavoritesRef.current = currentFavorites;
    hasMountedRef.current = true;
  }, [favorites, router]);
  
  // Also refresh when page becomes visible (user navigated back from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[BarProfileRefresh] Page became visible, refreshing...");
        router.refresh();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);
  
  return <>{children}</>;
}
