"use client";

import { useUser } from "@/components/auth/UserProvider";
import { FeaturedCocktails } from "./FeaturedCocktails";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface FeaturedCocktailsWrapperProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktailsWrapper({ cocktails }: FeaturedCocktailsWrapperProps) {
  const { isAuthenticated } = useUser();

  // Only show Featured Cocktails for non-authenticated users
  if (isAuthenticated) {
    return null;
  }

  return <FeaturedCocktails cocktails={cocktails} />;
}
