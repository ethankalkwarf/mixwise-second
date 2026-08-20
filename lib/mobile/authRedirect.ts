import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/mobile/platform";

/** Deep-link target registered in Info.plist — ASWebAuthenticationSession catches this. */
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
  // Require a real Capacitor runtime — sticky web cookies must not trigger
  // custom-scheme OAuth (which strands mobile Safari on the bridge page).
  return isCapacitorNativeRuntime();
}

/**
 * Supabase redirectTo for Capacitor OAuth.
 *
 * Use the custom scheme directly so ASWebAuthenticationSession can dismiss on
 * the final hop. An HTTPS bridge page often leaves users stranded in Safari /
 * SFSafariViewController after Google finishes.
 *
 * Both of these must be allowlisted in Supabase Redirect URLs:
 * - com.getmixwise.app://auth/callback
 * - https://www.getmixwise.com/auth/native-callback (kept as a manual fallback)
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
