import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { isSafeReturnPath } from "@/lib/auth/return-to";
import { debugLog } from "@/lib/debugLog";
import { isNativeOAuthCallbackUrl } from "@/lib/mobile/authRedirect";

/** Opens the provider OAuth URL in an in-app browser (required on iOS). */
export async function openNativeOAuthProvider(url: string): Promise<void> {
  await Browser.open({ url, presentationStyle: "popover" });
}

/** Exchanges the PKCE code from the deep link and loads the session into the WebView. */
export async function handleNativeOAuthCallback(url: string): Promise<boolean> {
  if (!isNativeOAuthCallbackUrl(url)) {
    return false;
  }

  try {
    await Browser.close();
  } catch {
    // Browser may already be dismissed
  }

  const parsed = new URL(url);
  const code = parsed.searchParams.get("code");
  const oauthError = parsed.searchParams.get("error");
  const next = parsed.searchParams.get("next");

  if (oauthError) {
    console.error(
      "[NativeOAuth] Provider error:",
      oauthError,
      parsed.searchParams.get("error_description")
    );
    return true;
  }

  if (!code) {
    console.warn("[NativeOAuth] Callback missing code");
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[NativeOAuth] exchangeCodeForSession failed:", error);
    return true;
  }

  if (typeof window === "undefined") {
    return true;
  }

  const path = isSafeReturnPath(next) ? next : "/";
  const target = new URL(path, window.location.origin);
  target.searchParams.set("mixwise_app", "1");
  debugLog("[NativeOAuth] Session established, navigating to", target.toString());
  window.location.href = target.toString();
  return true;
}

/** Wire deep-link OAuth callbacks for Google / Apple sign-in. */
export function registerNativeOAuthListener(): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const handle = App.addListener("appUrlOpen", ({ url }) => {
    debugLog("[NativeOAuth] appUrlOpen:", url);
    void handleNativeOAuthCallback(url).then((handled) => {
      if (handled) return;
      if (url.startsWith("http")) {
        window.location.href = url;
      }
    });
  });

  return () => {
    void handle.then((h) => h.remove());
  };
}
