"use client";

import { FeaturedCocktails } from "./FeaturedCocktails";
import { ImagePreloader } from "@/components/common/ImagePreloader";
import { getImageUrl } from "@/lib/sanityImage";
import { isSupabaseStorageUrl, toOptimizedImagePath } from "@/lib/mediaDelivery";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface FeaturedCocktailsWrapperProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktailsWrapper({ cocktails }: FeaturedCocktailsWrapperProps) {
  // Prefer Sanity URLs; rewrite Supabase catalog URLs through /_next/image so
  // preloads don't hotlink Storage (counts as cached egress).
  const preloadImageUrls = cocktails
    .slice(0, 3)
    .map((cocktail) => {
      const sanityUrl = getImageUrl(cocktail.image, {
        width: 800,
        height: 600,
        quality: 90,
        auto: "format",
      });
      if (sanityUrl) return sanityUrl;
      if (!cocktail.externalImageUrl) return null;
      if (isSupabaseStorageUrl(cocktail.externalImageUrl)) {
        return toOptimizedImagePath(cocktail.externalImageUrl, "email");
      }
      return cocktail.externalImageUrl;
    })
    .filter(Boolean) as string[];

  return (
    <>
      <ImagePreloader imageUrls={preloadImageUrls} priority />
      <FeaturedCocktails cocktails={cocktails} />
    </>
  );
}
