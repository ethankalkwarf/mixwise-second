"use client";

import type { MixCocktail } from "@/lib/mixTypes";
import { cacheCocktails, getCachedCocktails, getLastSyncTime } from "@/lib/mobile/offline";

export async function syncOfflineCatalog(cocktails: MixCocktail[]): Promise<void> {
  if (!cocktails.length) return;
  await cacheCocktails(cocktails);
}

export async function getOfflineCatalog(): Promise<MixCocktail[]> {
  const cached = await getCachedCocktails();
  return cached as MixCocktail[];
}

export async function cacheRecipeDetail(slug: string, data: unknown): Promise<void> {
  const { cacheUserData } = await import("@/lib/mobile/offline");
  await cacheUserData(`recipe:${slug}`, data);
}

export async function getCachedRecipeDetail<T>(slug: string): Promise<T | null> {
  const { getCachedUserData } = await import("@/lib/mobile/offline");
  return (await getCachedUserData(`recipe:${slug}`)) as T | null;
}

export function formatOfflineSyncLabel(): string | null {
  const ts = getLastSyncTime();
  if (!ts) return null;
  const hours = Math.round((Date.now() - ts) / (1000 * 60 * 60));
  if (hours < 1) return "Saved for offline · just now";
  if (hours < 24) return `Saved for offline · ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Saved for offline · ${days}d ago`;
}
