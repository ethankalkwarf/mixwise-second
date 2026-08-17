"use client";

import { useEffect, useState } from "react";

const HAS_ACCOUNT_KEY = "mixwise-has-account";
const LAST_EMAIL_KEY = "mixwise-last-email";

export type PreferredAuthMode = "login" | "signup";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

/** Persist that this browser has successfully signed in. Survives logout. */
export function markHasAccount(email?: string | null): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(HAS_ACCOUNT_KEY, "1");
    const trimmed = email?.trim();
    if (trimmed) {
      localStorage.setItem(LAST_EMAIL_KEY, trimmed);
    }
  } catch {
    /* private mode / storage blocked */
  }
}

export function hasLikelyAccount(): boolean {
  if (!canUseStorage()) return false;
  try {
    return localStorage.getItem(HAS_ACCOUNT_KEY) === "1";
  } catch {
    return false;
  }
}

export function getLastAuthEmail(): string {
  if (!canUseStorage()) return "";
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

/** Drop local “this browser has an account” hints after a reset. */
export function clearReturningUserHints(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(HAS_ACCOUNT_KEY);
    localStorage.removeItem(LAST_EMAIL_KEY);
  } catch {
    /* private mode / storage blocked */
  }
}

export function getPreferredAuthMode(): PreferredAuthMode {
  return hasLikelyAccount() ? "login" : "signup";
}

export function preferredAuthCopy(mode: PreferredAuthMode = getPreferredAuthMode()): {
  title: string;
  subtitle: string;
} {
  if (mode === "login") {
    return {
      title: "Welcome back to MixWise",
      subtitle: "Sign in to access your saved cocktails, notes, bar inventory, and more.",
    };
  }
  return {
    title: "Create your free MixWise account",
    subtitle: "Save your bar, favorite cocktails, tasting notes, and get personalized recommendations.",
  };
}

/**
 * Client hook so labels can swap after mount without SSR mismatch.
 * Defaults to signup until localStorage is read.
 */
export function usePreferredAuthMode(): PreferredAuthMode {
  const [mode, setMode] = useState<PreferredAuthMode>("signup");

  useEffect(() => {
    setMode(getPreferredAuthMode());
  }, []);

  return mode;
}
