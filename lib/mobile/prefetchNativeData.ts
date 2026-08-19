"use client";

import { Capacitor } from "@capacitor/core";
import { getMixCocktailsClient, getMixIngredients } from "@/lib/cocktails";
import { syncOfflineCatalog } from "@/lib/mobile/offlineSync";

/** Warm session caches (and offline catalog) as soon as the native shell boots. */
export function prefetchNativeCatalog(): void {
  if (!Capacitor.isNativePlatform()) return;

  void getMixIngredients()
    .then(() => getMixCocktailsClient())
    .then((cocktails) => syncOfflineCatalog(cocktails))
    .catch((error) => {
      console.warn("[NativePrefetch] Catalog prefetch failed:", error);
    });
}
