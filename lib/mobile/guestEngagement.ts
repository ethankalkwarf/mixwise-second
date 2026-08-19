"use client";

const RECIPE_VIEWS_KEY = "mixwise_guest_recipe_views";
const SNOOZE_KEY = "mixwise_guest_nudge_until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export const GUEST_ENGAGEMENT_EVENT = "mixwise:guest-engagement";

export function trackGuestRecipeView(slug: string): number {
  if (!canUseStorage() || !slug) return 0;
  try {
    const raw = localStorage.getItem(RECIPE_VIEWS_KEY);
    const slugs: string[] = raw ? JSON.parse(raw) : [];
    if (!slugs.includes(slug)) {
      slugs.push(slug);
      localStorage.setItem(RECIPE_VIEWS_KEY, JSON.stringify(slugs.slice(-20)));
      window.dispatchEvent(new Event(GUEST_ENGAGEMENT_EVENT));
    }
    return slugs.length;
  } catch {
    return 0;
  }
}

export function guestRecipeViewCount(): number {
  if (!canUseStorage()) return 0;
  try {
    const raw = localStorage.getItem(RECIPE_VIEWS_KEY);
    const slugs: string[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(slugs) ? slugs.length : 0;
  } catch {
    return 0;
  }
}

export function isGuestNudgeSnoozed(): boolean {
  if (!canUseStorage()) return true;
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return true;
  }
}

export function snoozeGuestNudge(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* private mode */
  }
}

/** True once the guest has browsed enough recipes to feel the catalog. */
export function guestIsHooked(): boolean {
  return guestRecipeViewCount() >= 2;
}
