"use client";

const INTRO_STORAGE_KEY = "mixwise_native_intro_v2";
export const NATIVE_INTRO_EVENT = "mixwise:replay-intro";

/** @deprecated Use hasCompletedNativeIntro — kept for More sheet migration */
export const NATIVE_TOUR_STORAGE_KEY = "mixwise_native_tour_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function hasCompletedNativeIntro(): boolean {
  if (!canUseStorage()) return false;
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markNativeIntroComplete(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
    localStorage.setItem(NATIVE_TOUR_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function replayNativeIntro(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(INTRO_STORAGE_KEY);
    localStorage.removeItem(NATIVE_TOUR_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(NATIVE_INTRO_EVENT));
}
