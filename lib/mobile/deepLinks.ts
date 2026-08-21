"use client";

import { trackDeepLinkOpened } from "@/lib/analytics";

export const NATIVE_NAV_EVENT = "mixwise:native-nav";
export const PENDING_DEEP_LINK_KEY = "mixwise_pending_deep_link";

const UNIVERSAL_LINK_HOSTS = new Set([
  "www.getmixwise.com",
  "getmixwise.com",
]);

/** Paths we intentionally open inside the native shell via Universal Links. */
const IN_APP_PATH_PREFIXES = [
  "/bar/",
  "/invite/",
  "/friends",
  "/cocktails/",
  "/ingredients/",
  "/learn",
  "/mix",
  "/dashboard",
  "/saved",
  "/account",
  "/badges",
  "/occasions",
  "/make-with/",
];

function isAllowedInAppPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/mix" || pathname === "/friends") return true;
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

  // Persist so cold-start links survive until NativeNavigationBridge mounts.
  try {
    sessionStorage.setItem(
      PENDING_DEEP_LINK_KEY,
      JSON.stringify({ href, origin, at: Date.now() })
    );
  } catch {
    /* private mode */
  }

  window.dispatchEvent(new CustomEvent(NATIVE_NAV_EVENT, { detail: { href, origin } }));
}

/** Consume a pending deep link (once) after the native shell is ready. */
export function consumePendingDeepLink(): { href: string; origin: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_DEEP_LINK_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_DEEP_LINK_KEY);
    const parsed = JSON.parse(raw) as { href?: string; origin?: string; at?: number };
    if (!parsed.href || !parsed.href.startsWith("/")) return null;
    // Ignore stale links older than 2 minutes.
    if (parsed.at && Date.now() - parsed.at > 120_000) return null;
    return { href: parsed.href, origin: parsed.origin || "deep_link" };
  } catch {
    return null;
  }
}
