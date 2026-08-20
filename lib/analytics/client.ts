/**
 * PostHog client wrapper for MixWise (web + Capacitor WebView).
 * No-ops when NEXT_PUBLIC_POSTHOG_KEY is unset (local/dev).
 */

import posthog from "posthog-js";
import { nativePlatform } from "@/lib/mobile/platform";
import { debugLog } from "@/lib/debugLog";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function isAnalyticsEnabled(): boolean {
  return Boolean(KEY) && typeof window !== "undefined";
}

export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || initialized || !KEY) return;

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // App Router: we capture manually
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  posthog.register({
    app_platform: nativePlatform(),
    app_surface: nativePlatform() === "web" ? "web" : "native",
  });

  initialized = true;
  debugLog("[Analytics] PostHog initialized", { platform: nativePlatform() });
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!isAnalyticsEnabled()) {
    debugLog(`[Analytics] ${event}`, properties ?? {});
    return;
  }
  if (!initialized) initAnalytics();
  posthog.capture(event, properties);
}

export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (!isAnalyticsEnabled()) return;
  if (!initialized) initAnalytics();
  posthog.identify(userId, traits);
}

export function resetAnalyticsUser(): void {
  if (!isAnalyticsEnabled() || !initialized) return;
  posthog.reset();
}

export function capturePageview(path: string): void {
  captureEvent("$pageview", { $current_url: path });
}
