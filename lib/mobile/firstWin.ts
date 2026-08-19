"use client";

export const FIRST_WIN_SEEN_KEY = "mixwise-first-win-seen";
export const FIRST_WIN_EVENT = "mixwise:first-win";

export function hasSeenFirstWin(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(FIRST_WIN_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markFirstWinSeen(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_WIN_SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function notifyFirstWin(readyCount: number): void {
  if (typeof window === "undefined") return;
  markFirstWinSeen();
  window.dispatchEvent(
    new CustomEvent(FIRST_WIN_EVENT, { detail: { readyCount } })
  );
}
