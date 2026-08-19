import { isNativeApp } from "@/lib/mobile/platform";

/** Deep-link target registered in Supabase redirect URLs and Info.plist. */
export const NATIVE_OAUTH_CALLBACK = "com.getmixwise.app://auth/callback";

export function isNativeOAuthCallbackUrl(url: string): boolean {
  return url.startsWith(NATIVE_OAUTH_CALLBACK);
}

/** OAuth redirect for Capacitor — must use app scheme, not http(s). */
export function getNativeOAuthRedirectUrl(): string | null {
  if (typeof window === "undefined" || !isNativeApp()) {
    return null;
  }
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
