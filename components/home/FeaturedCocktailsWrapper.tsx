"use client";

import { useUser } from "@/components/auth/UserProvider";
import { FeaturedCocktails } from "./FeaturedCocktails";
import { ImagePreloader } from "@/components/common/ImagePreloader";
import { getImageUrl } from "@/lib/sanityImage";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface FeaturedCocktailsWrapperProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktailsWrapper({ cocktails }: FeaturedCocktailsWrapperProps) {
  // Generate URLs for the first few featured cocktails for preloading
  const preloadImageUrls = cocktails.slice(0, 3).map(cocktail =>
    getImageUrl(cocktail.image, {
      width: 400,
      height: 300,
      quality: 80,
      auto: 'format'
    }) || cocktail.externalImageUrl
  ).filter(Boolean) as string[];

  // Show Featured Cocktails for all users
  return (
    <>
      <ImagePreloader imageUrls={preloadImageUrls} priority />
      <FeaturedCocktails cocktails={cocktails} />
    </>
  );
}
