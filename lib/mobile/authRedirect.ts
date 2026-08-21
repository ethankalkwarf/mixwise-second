import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/mobile/platform";

/** Deep-link target registered in Info.plist — ASWebAuthenticationSession catches this. */
export const NATIVE_OAUTH_CALLBACK = "com.getmixwise.app://auth/callback";

/** Path that bounces OAuth codes into the app scheme (server route, not React page). */
export const NATIVE_OAUTH_BRIDGE_PATH = "/auth/native-callback";

/** Canonical HTTPS bridge — must match Supabase Redirect URLs exactly (no query). */
export const NATIVE_OAUTH_BRIDGE_URL = `https://www.getmixwise.com${NATIVE_OAUTH_BRIDGE_PATH}`;

export function isNativeOAuthCallbackUrl(url: string): boolean {
  return url.startsWith(NATIVE_OAUTH_CALLBACK);
}

function isCapacitorNativeRuntime(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    // Capacitor may not be ready yet
  }
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios" || platform === "android") return true;
  } catch {
    // ignore
  }
  if (typeof navigator !== "undefined" && /Capacitor|MixWiseNative/i.test(navigator.userAgent || "")) {
    return true;
  }
  return false;
}

/** True when OAuth must leave the WebView (in-app browser + deep link). */
export function shouldUseNativeOAuthFlow(): boolean {
  if (typeof window === "undefined") return false;
  return isCapacitorNativeRuntime();
}

/**
 * Supabase redirectTo for Capacitor OAuth.
 *
 * Use the custom scheme directly. An HTTPS bridge that 302s into the scheme
 * often escapes ASWebAuthenticationSession into system Safari (app logs in,
 * user left in Safari). With the scheme allowlisted in Supabase, the auth
 * session can catch the final hop and dismiss itself.
 */
export function getNativeOAuthRedirectUrl(): string | null {
  if (typeof window === "undefined") return null;
  if (!shouldUseNativeOAuthFlow()) return null;

  return NATIVE_OAUTH_CALLBACK;
}

/**
 * @deprecated Email/magic-link callbacks may still use the WebView origin.
 * OAuth must use {@link getNativeOAuthRedirectUrl}.
 */
export function getNativeAuthCallbackBase(): string | null {
  if (typeof window === "undefined" || !isNativeApp()) {
    return null;
  }
  return `${window.location.origin}/auth/callback`;
}
