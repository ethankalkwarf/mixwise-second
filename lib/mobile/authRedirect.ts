import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/mobile/platform";

/** Deep-link target registered in Supabase redirect URLs and Info.plist. */
export const NATIVE_OAUTH_CALLBACK = "com.getmixwise.app://auth/callback";

/** Path on the current origin that bounces OAuth codes into the app scheme. */
export const NATIVE_OAUTH_BRIDGE_PATH = "/auth/native-callback";

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
  return isCapacitorNativeRuntime() || isNativeApp();
}

/**
 * OAuth redirect for Capacitor.
 *
 * Prefer the custom scheme so ASWebAuthenticationSession can catch the
 * callback and dismiss the auth sheet automatically. The https bridge at
 * `/auth/native-callback` remains as a fallback if Supabase rejects the
 * scheme (not allowlisted) or an older Browser-based flow is used.
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
