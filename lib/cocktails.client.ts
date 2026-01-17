/**
 * Client-side cocktail utilities
 * Used for fetching cocktail data from Supabase in client components
 */

import { createClient } from "./supabase/client";

/**
 * Fetch image URLs for multiple cocktails from Supabase
 * More efficient than calling getCocktailImageUrl multiple times
 * Handles both UUIDs and legacy IDs by trying multiple lookup strategies
 */
export async function getCocktailImageUrls(
  cocktailIds: string[]
): Promise<Map<string, string | null>> {
  if (cocktailIds.length === 0) {
    return new Map();
  }

  try {
    const supabase = createClient();
    const imageUrlMap = new Map<string, string | null>();
    
    // Try UUID lookup first (for new favorites using UUID IDs)
    const { data: uuidCocktails, error: uuidError } = await supabase
      .from("cocktails")
      .select("id, image_url")
      .in("id", cocktailIds);

    if (!uuidError && uuidCocktails) {
      for (const cocktail of uuidCocktails) {
        imageUrlMap.set(cocktail.id, cocktail.image_url || null);
      }
    }

    // Find IDs that weren't matched by UUID
    const unmatchedIds = cocktailIds.filter(id => !imageUrlMap.has(id));
    
    if (unmatchedIds.length > 0) {
      // Try legacy_id lookup (for old favorites using Sanity IDs)
      const { data: legacyCocktails, error: legacyError } = await supabase
        .from("cocktails")
        .select("legacy_id, image_url")
        .in("legacy_id", unmatchedIds);

      if (!legacyError && legacyCocktails) {
        for (const cocktail of legacyCocktails) {
          if (cocktail.legacy_id) {
            // Map the legacy_id back to the original ID from favorites
            const originalId = unmatchedIds.find(id => id === cocktail.legacy_id);
            if (originalId) {
              imageUrlMap.set(originalId, cocktail.image_url || null);
            }
          }
        }
      }
    }

    // Set null for cocktails that weren't found by any method
    for (const id of cocktailIds) {
      if (!imageUrlMap.has(id)) {
        imageUrlMap.set(id, null);
      }
    }

    return imageUrlMap;
  } catch (error) {
    console.error("Error fetching cocktail image URLs:", error);
    // Return map with null values for all IDs on error
    return new Map(cocktailIds.map((id) => [id, null]));
  }
}
