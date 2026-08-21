"use client";

import { useEffect, useState } from "react";

export type LayoutTier = "phone" | "tablet" | "desktop";

function readTier(): LayoutTier {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(min-width: 768px)").matches) return "tablet";
  return "phone";
}

/** Tailwind-aligned: phone <768, tablet 768–1023, desktop ≥1024. */
export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = useState<LayoutTier>("desktop");

  useEffect(() => {
    const update = () => setTier(readTier());
    update();
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqMd = window.matchMedia("(min-width: 768px)");
    mqLg.addEventListener("change", update);
    mqMd.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqMd.removeEventListener("change", update);
    };
  }, []);

  return tier;
}
