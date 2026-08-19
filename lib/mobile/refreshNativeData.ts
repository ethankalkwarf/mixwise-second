"use client";

import {
  getMixCocktailsClient,
  getMixIngredients,
  invalidateMixClientCaches,
} from "@/lib/cocktails";

/** Refresh client-side mix caches without a full RSC round-trip. */
export async function refreshNativeShellData(): Promise<void> {
  invalidateMixClientCaches();
  await Promise.all([getMixIngredients(), getMixCocktailsClient()]);
}
