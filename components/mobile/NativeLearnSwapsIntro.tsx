"use client";

import { NativePageHero } from "@/components/mobile/NativePageHero";
import { useNativeShell } from "@/hooks/useIsNativeApp";

export function NativeLearnSwapsIntro() {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  return (
    <NativePageHero
      eyebrow="Reference"
      title="Smart swaps"
      description="Reach for this mid-shop or mid-mix when a bottle is missing. Keep the role of the ingredient; adjust sweetness if the swap is richer."
    />
  );
}
