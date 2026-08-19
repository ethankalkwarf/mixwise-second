"use client";

/** Guest-local favorites and recent views — merged to Supabase after sign-in. */

export const GUEST_FAVORITES_KEY = "mixwise-guest-favorites";
export const GUEST_RECENT_KEY = "mixwise-guest-recent";
export const CABINET_READY_COUNT_KEY = "mixwise-cabinet-ready-count";
export const HOME_SESSION_KEY = "mixwise-home-session";

export type HomeSessionHint = {
  signedIn: boolean;
  firstName: string | null;
  barCount: number;
  heroName?: string | null;
  heroSlug?: string | null;
  heroImageUrl?: string | null;
};

export function readHomeSessionHint(): HomeSessionHint | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(HOME_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomeSessionHint;
    if (!parsed || typeof parsed.signedIn !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeHomeSessionHint(hint: HomeSessionHint): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(HOME_SESSION_KEY, JSON.stringify(hint));
  } catch {
    /* private mode */
  }
}

export type GuestFavorite = {
  cocktail_id: string;
  cocktail_name: string;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
  created_at: string;
};

export type GuestRecent = {
  cocktail_id: string;
  cocktail_name: string;
  cocktail_slug: string | null;
  cocktail_image_url: string | null;
  viewed_at: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function loadGuestFavorites(): GuestFavorite[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestFavorites(items: GuestFavorite[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    /* private mode */
  }
}

export function clearGuestFavorites(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(GUEST_FAVORITES_KEY);
  } catch {
    /* ignore */
  }
}

export function loadGuestRecent(): GuestRecent[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(GUEST_RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestRecent(items: GuestRecent[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(GUEST_RECENT_KEY, JSON.stringify(items.slice(0, 20)));
  } catch {
    /* private mode */
  }
}

export function clearGuestRecent(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(GUEST_RECENT_KEY);
  } catch {
    /* ignore */
  }
}

export function cacheCabinetReadyCount(count: number): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(CABINET_READY_COUNT_KEY, String(Math.max(0, count)));
  } catch {
    /* ignore */
  }
}

export function readCabinetReadyCount(): number {
  if (!canUseStorage()) return 0;
  try {
    const n = Number(localStorage.getItem(CABINET_READY_COUNT_KEY) || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
