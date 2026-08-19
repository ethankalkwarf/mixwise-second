"use client";

import { useNativeShell } from "@/hooks/useIsNativeApp";

export function NativeCollectionsIntro() {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  return (
    <div className="px-1 pb-1 pt-1">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
        Curated lists
      </p>
      <h1 className="mt-1 font-display text-[1.85rem] font-bold leading-[1.08] text-forest">
        Collections
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-sage">Seasons, holidays, and styles to pour through.</p>
    </div>
  );
}
