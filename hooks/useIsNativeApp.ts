"use client";

import { useSyncExternalStore } from "react";
import { isNativeShell } from "@/lib/mobile/nativeShell";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("focus", callback);
  document.addEventListener("visibilitychange", callback);

  let interval: number | null = null;
  if (!isNativeShell()) {
    let attempts = 0;
    interval = window.setInterval(() => {
      attempts += 1;
      callback();
      if (isNativeShell() || attempts >= 20) {
        if (interval) window.clearInterval(interval);
        interval = null;
      }
    }, 100);
  }

  return () => {
    if (interval) window.clearInterval(interval);
    window.removeEventListener("focus", callback);
    document.removeEventListener("visibilitychange", callback);
  };
}

function getNativeSnapshot(): boolean {
  return isNativeShell();
}

/** Client-only native detection. Polls briefly until the Capacitor bridge or app cookie is ready. */
export function useIsNativeApp(): { isNative: boolean; ready: boolean } {
  const isNative = useSyncExternalStore(subscribe, getNativeSnapshot, () => false);
  const ready = useSyncExternalStore(
    subscribe,
    () => typeof window !== "undefined",
    () => false
  );

  return { isNative, ready };
}

/** True when the native tab-bar shell should render instead of the marketing site. */
export function useNativeShell(): boolean {
  return useIsNativeApp().isNative;
}
