"use client";

import { useUser } from "@/components/auth/UserProvider";
import { FeaturedCocktails } from "./FeaturedCocktails";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface FeaturedCocktailsWrapperProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktailsWrapper({ cocktails }: FeaturedCocktailsWrapperProps) {
  // Show Featured Cocktails for all users
  return <FeaturedCocktails cocktails={cocktails} />;
}
