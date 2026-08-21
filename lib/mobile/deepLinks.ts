"use client";

import { trackDeepLinkOpened } from "@/lib/analytics";

export const NATIVE_NAV_EVENT = "mixwise:native-nav";

const UNIVERSAL_LINK_HOSTS = new Set([
  "www.getmixwise.com",
  "getmixwise.com",
]);

/** Paths we intentionally open inside the native shell via Universal Links. */
const IN_APP_PATH_PREFIXES = [
  "/bar/",
  "/cocktails/",
  "/ingredients/",
  "/learn",
  "/mix",
  "/dashboard",
  "/saved",
  "/account",
  "/occasions",
  "/make-with/",
];

function isAllowedInAppPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/mix") return true;
  return IN_APP_PATH_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  );
}

/**
 * Extract an in-app path from a Universal Link / custom scheme URL.
 * Returns null for OAuth callbacks, foreign hosts, or disallowed paths.
 */
export function pathFromUniversalLink(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const isHttp = url.protocol === "https:" || url.protocol === "http:";
    const isAppScheme =
      url.protocol === "com.getmixwise.app:" ||
      url.protocol === "capacitor:" ||
      url.protocol === "ionic:";

    if (isHttp) {
      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".vercel.app");
      if (!UNIVERSAL_LINK_HOSTS.has(host) && !isLocal) return null;
    } else if (!isAppScheme) {
      return null;
    }

    const pathname = url.pathname || "/";
    if (pathname.startsWith("/auth/")) return null;
    if (!isAllowedInAppPath(pathname)) return null;

    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

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
