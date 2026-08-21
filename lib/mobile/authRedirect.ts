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
 * Always the custom scheme so ASWebAuthenticationSession dismisses on the final
 * hop. Do not use the HTTPS `/auth/native-callback` bridge as redirectTo — that
 * page is only a manual recovery UI if a deep link is opened in Safari.
 *
 * Required in Supabase Redirect URLs:
 * - com.getmixwise.app://auth/callback
 * Keep the https native-callback URLs allowlisted for the bridge page itself.
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
