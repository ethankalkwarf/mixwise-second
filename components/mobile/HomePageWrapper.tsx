"use client";

import { MobileHomePage } from "./MobileHomePageModern";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface HomePageWrapperProps {
  featuredCocktails: SanityCocktail[];
  allCocktails: SanityCocktail[];
  occasionCovers?: Record<string, string | null>;
  children: React.ReactNode;
}

export function HomePageWrapper({
  featuredCocktails,
  allCocktails,
  occasionCovers,
  children,
}: HomePageWrapperProps) {
  const nativeShell = useNativeShell();

  if (nativeShell) {
    return (
      <MobileHomePage
        featuredCocktails={featuredCocktails}
        allCocktails={allCocktails}
        occasionCovers={occasionCovers}
      />
    );
  }

  return <>{children}</>;
}
