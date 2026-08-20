"use client";

import { MobileHomePage } from "./MobileHomePageModern";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface HomePageWrapperProps {
  featuredCocktails: SanityCocktail[];
  allCocktails: SanityCocktail[];
  occasionCovers?: Record<string, string | null>;
  children: React.ReactNode;
  /** Server already detected the Capacitor shell — avoid SSR→client white flash. */
  forceNative?: boolean;
}

export function HomePageWrapper({
  featuredCocktails,
  allCocktails,
  occasionCovers,
  children,
  forceNative = false,
}: HomePageWrapperProps) {
  const nativeShell = useNativeShell();

  if (forceNative || nativeShell) {
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
