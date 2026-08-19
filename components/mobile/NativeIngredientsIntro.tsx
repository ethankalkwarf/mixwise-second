"use client";

import { NativePageHero } from "@/components/mobile/NativePageHero";
import { useNativeShell } from "@/hooks/useIsNativeApp";

export function NativeIngredientsIntro({ count }: { count: number }) {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  return (
    <NativePageHero
      eyebrow="Cocktail ingredients"
      title="The bottles behind the drinks"
      description="What each spirit, aperitivo, and mixer actually is — and the MixWise recipes that use it."
      meta={`${count} guide${count === 1 ? "" : "s"}`}
      className="px-1 pt-1"
    />
  );
}
