"use client";

export const FIRST_POUR_SHARE_SEEN_KEY = "mixwise-first-pour-share-seen";

export function hasSeenFirstPourShare(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(FIRST_POUR_SHARE_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markFirstPourShareSeen(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_POUR_SHARE_SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
}
