import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { debugLog } from "@/lib/debugLog";
import {
  isNativeOAuthCallbackUrl,
  NATIVE_OAUTH_BRIDGE_PATH,
  NATIVE_OAUTH_CALLBACK,
} from "@/lib/mobile/authRedirect";

let oauthBrowserOpen = false;
let oauthExchangeInFlight: string | null = null;

async function dismissOAuthBrowser(): Promise<void> {
  // Prefer closing Capgo's secure session if it is still visible, then the
  // Capacitor Browser fallback (SFSafariViewController) which does not
  // auto-dismiss on custom-scheme redirects.
  try {
    const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
    await InAppBrowser.close().catch(() => {});
  } catch {
    // Plugin may be unavailable
  }

  try {
    await Browser.close();
  } catch {
    // nothing open
  }
  oauthBrowserOpen = false;

  // SFSafariViewController sometimes needs a beat after the deep link.
  window.setTimeout(() => {
    void Browser.close().catch(() => {});
  }, 150);
  window.setTimeout(() => {
    void Browser.close().catch(() => {});
  }, 600);
}

/**
 * Opens the provider OAuth URL with ASWebAuthenticationSession (iOS) so the
 * sheet auto-dismisses when the custom-scheme deep link fires (after the
 * HTTPS bridge bounces). Falls back to Capacitor Browser only as a last resort.
 */
export async function openNativeOAuthProvider(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      // Dynamic import — a hard dependency can blank the WebView if the
      // native plugin isn't linked yet (needs a fresh cap sync / rebuild).
      const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
      // Watch for the app scheme — the HTTPS bridge page redirects there.
      const { redirectedUri } = await InAppBrowser.openSecureWindow({
        authEndpoint: url,
        redirectUri: NATIVE_OAUTH_CALLBACK,
      });
      debugLog("[NativeOAuth] openSecureWindow returned:", redirectedUri);
      if (redirectedUri) {
        await handleNativeOAuthCallback(redirectedUri);
      }
      return;
    } catch (error) {
      // User cancel is expected; don't fall through to a second browser.
      const message = error instanceof Error ? error.message : String(error);
      if (/cancel|dismiss|abort/i.test(message)) {
        debugLog("[NativeOAuth] Auth session cancelled by user");
        throw Object.assign(new Error("Sign-in cancelled"), { code: "OAUTH_CANCELLED" as const });
      }
      console.warn("[NativeOAuth] openSecureWindow failed, falling back to Browser:", error);
    }
  }

  oauthBrowserOpen = true;
  await Browser.open({ url, presentationStyle: "fullscreen" });
}

function collectOAuthParams(url: string): URLSearchParams {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);
  if (parsed.hash?.startsWith("#")) {
    const hash = new URLSearchParams(parsed.hash.slice(1));
    hash.forEach((value, key) => {
      if (value && !params.has(key)) params.set(key, value);
    });
  }
  return params;
}

/** Exchanges the PKCE code from the deep link and loads the session into the WebView. */
export async function handleNativeOAuthCallback(url: string): Promise<boolean> {
  const isDeepLink = isNativeOAuthCallbackUrl(url);
  const isBridge =
    url.includes(NATIVE_OAUTH_BRIDGE_PATH) &&
    (url.startsWith("http://") || url.startsWith("https://"));

  if (!isDeepLink && !isBridge) {
    return false;
  }

  await dismissOAuthBrowser();

  const params = collectOAuthParams(url);
  const code = params.get("code");
  const oauthError = params.get("error");

  if (oauthError) {
    console.error(
      "[NativeOAuth] Provider error:",
      oauthError,
      params.get("error_description")
    );
    throw Object.assign(
      new Error(params.get("error_description") || "Sign-in failed. Please try again."),
      { code: "OAUTH_PROVIDER_ERROR" as const }
    );
  }

  if (!code) {
    console.warn("[NativeOAuth] Callback missing code");
    throw Object.assign(new Error("Sign-in didn’t finish. Please try again."), {
      code: "OAUTH_MISSING_CODE" as const,
    });
  }

  // openSecureWindow + appUrlOpen can both deliver the same callback.
  if (oauthExchangeInFlight === code) {
    debugLog("[NativeOAuth] Ignoring duplicate callback for code");
    await dismissOAuthBrowser();
    return true;
  }
  oauthExchangeInFlight = code;

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    oauthExchangeInFlight = null;
    console.error("[NativeOAuth] exchangeCodeForSession failed:", error);
    throw Object.assign(new Error("Couldn’t complete sign-in. Please try again."), {
      code: "OAUTH_EXCHANGE_FAILED" as const,
    });
  }

  if (typeof window === "undefined") {
    return true;
  }

  // Ensure any leftover Safari / in-app browser sheet is gone before we navigate.
  await dismissOAuthBrowser();

  // Always greet on Home after native OAuth — ignore remembered /mix return-to.
  const target = new URL("/", window.location.origin);
  if (Capacitor.isNativePlatform()) {
    target.searchParams.set("mixwise_app", "1");
  }
  debugLog("[NativeOAuth] Session established, navigating to", target.toString());
  window.location.href = target.toString();
  return true;
}

/** Wire deep-link OAuth callbacks for Google / Apple sign-in. */
export function registerNativeOAuthListener(): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const urlHandle = App.addListener("appUrlOpen", ({ url }) => {
    debugLog("[NativeOAuth] appUrlOpen:", url);
    void handleNativeOAuthCallback(url)
      .then((handled) => {
        if (handled) {
          void dismissOAuthBrowser();
          return;
        }
        if (url.startsWith("http")) {
          window.location.href = url;
        }
      })
      .catch((error) => {
        console.error("[NativeOAuth] appUrlOpen handler failed:", error);
        void dismissOAuthBrowser();
        window.dispatchEvent(
          new CustomEvent("mixwise:oauthError", {
            detail: {
              message:
                error instanceof Error
                  ? error.message
                  : "Couldn’t complete sign-in. Please try again.",
            },
          })
        );
      });
  });

  // If the secure session falls back to Browser, dismiss it when we regain focus.
  const stateHandle = App.addListener("appStateChange", ({ isActive }) => {
    if (isActive && oauthBrowserOpen) {
      void dismissOAuthBrowser();
    }
  });

  return () => {
    void urlHandle.then((h) => h.remove());
    void stateHandle.then((h) => h.remove());
  };
}
