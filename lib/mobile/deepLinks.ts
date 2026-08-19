"use client";

export const NATIVE_NAV_EVENT = "mixwise:native-nav";

/** Navigate inside the WebView from non-React code (notifications, cold start). */
export function requestInAppNavigation(href: string) {
  if (typeof window === "undefined") return;
  if (!href.startsWith("/") || href.startsWith("//")) return;
  window.dispatchEvent(new CustomEvent(NATIVE_NAV_EVENT, { detail: { href } }));
}
