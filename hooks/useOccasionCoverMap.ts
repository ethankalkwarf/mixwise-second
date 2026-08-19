"use client";

import { useEffect, useState } from "react";
import { getMixCocktailsClient } from "@/lib/cocktails";
import { buildOccasionCoverMap } from "@/lib/mobile/collectionCovers";

/**
 * Loads catalog cocktail photos for collection cover tiles (native home + search).
 */
export function useOccasionCoverMap(slugs: readonly string[]): Record<string, string | null> {
  const [covers, setCovers] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    void getMixCocktailsClient()
      .then((catalog) => {
        if (cancelled) return;
        setCovers(buildOccasionCoverMap(slugs, catalog));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slugs]);

  return covers;
}
