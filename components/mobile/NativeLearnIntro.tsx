"use client";

import { NativePageHero } from "@/components/mobile/NativePageHero";
import { useNativeShell } from "@/hooks/useIsNativeApp";

export function NativeLearnIntro() {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  return (
    <NativePageHero
      eyebrow="Education"
      title="Learn to make better drinks"
      description="Practical mixology for the home bar — templates, methods, and the small habits that change a drink."
      className="px-1 pt-1"
    />
  );
}
