"use client";

import { trackDeepLinkOpened } from "@/lib/analytics";

export const NATIVE_NAV_EVENT = "mixwise:native-nav";

/** Navigate inside the WebView from non-React code (notifications, cold start). */
export function requestInAppNavigation(
  href: string,
  origin: "notification" | "deep_link" | "universal_link" | "other" = "deep_link"
) {
  if (typeof window === "undefined") return;
  if (!href.startsWith("/") || href.startsWith("//")) return;
  void trackDeepLinkOpened(href, origin);
  window.dispatchEvent(new CustomEvent(NATIVE_NAV_EVENT, { detail: { href, origin } }));
}
