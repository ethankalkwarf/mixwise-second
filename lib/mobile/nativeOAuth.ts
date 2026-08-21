import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { debugLog } from "@/lib/debugLog";
import {
  isNativeOAuthCallbackUrl,
  NATIVE_OAUTH_BRIDGE_PATH,
  NATIVE_OAUTH_CALLBACK,
} from "@/lib/mobile/authRedirect";

/** Capgo/ASWebAuthenticationSession sheet or watched webview is presenting OAuth. */
let oauthUiOpen = false;
let oauthExchangeInFlight: string | null = null;
/** Resolves when a deep-link / secure-window callback finishes exchange. */
let pendingOAuthHandled: Promise<boolean> | null = null;

function isOAuthReturnUrl(url: string): boolean {
  return (
    isNativeOAuthCallbackUrl(url) ||
    (url.includes(NATIVE_OAUTH_BRIDGE_PATH) &&
      (url.startsWith("http://") || url.startsWith("https://")))
  );
}

function isUserCancelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancel|dismiss|abort|ASWebAuthenticationSessionErrorDomain.*canceled/i.test(
    message
  );
}

/** Pull a callback URL out of Capgo reject strings when match checks fail. */
function callbackUrlFromError(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/but got\s+(\S+)/i);
  if (!match?.[1]) return null;
  const candidate = match[1].trim();
  return isOAuthReturnUrl(candidate) ? candidate : null;
}

async function dismissOAuthUi(): Promise<void> {
  oauthUiOpen = false;
  try {
    const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
    await InAppBrowser.close().catch(() => {});
  } catch {
    // Plugin may be unavailable
  }

  // Capgo / SFSafari leftovers sometimes need a short beat after the deep link.
  window.setTimeout(() => {
    void import("@capgo/capacitor-inappbrowser")
      .then(({ InAppBrowser }) => InAppBrowser.close().catch(() => {}))
      .catch(() => {});
  }, 150);
  window.setTimeout(() => {
    void import("@capgo/capacitor-inappbrowser")
      .then(({ InAppBrowser }) => InAppBrowser.close().catch(() => {}))
      .catch(() => {});
  }, 600);
}

/**
 * Fallback when ASWebAuthenticationSession isn't available — in-app webview that
 * closes itself as soon as the custom scheme / bridge URL appears.
 * Never use Capacitor Browser / SFSafariViewController (it does not dismiss).
 */
async function openNativeOAuthWithUrlWatch(url: string): Promise<void> {
  const { InAppBrowser, ToolBarType } = await import("@capgo/capacitor-inappbrowser");
  oauthUiOpen = true;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = async (nextUrl: string) => {
      if (settled) return;
      settled = true;
      try {
        await urlHandle.then((h) => h.remove());
        await schemeHandle.then((h) => h.remove());
      } catch {
        /* ignore */
      }
      try {
        await InAppBrowser.close();
      } catch {
        /* ignore */
      }
      oauthUiOpen = false;
      try {
        await handleNativeOAuthCallback(nextUrl);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const urlHandle = InAppBrowser.addListener("urlChangeEvent", ({ url: next }) => {
      if (isOAuthReturnUrl(next)) {
        void finish(next);
      }
    });

    const schemeHandle = InAppBrowser.addListener("customSchemeIntercepted", ({ url: next }) => {
      if (isOAuthReturnUrl(next) || isNativeOAuthCallbackUrl(next)) {
        void finish(next);
      }
    });

    void InAppBrowser.openWebView({
      url,
      toolbarType: ToolBarType.COMPACT,
      title: "Sign in",
    }).catch((error: unknown) => {
      if (settled) return;
      settled = true;
      oauthUiOpen = false;
      void urlHandle.then((h) => h.remove());
      void schemeHandle.then((h) => h.remove());
      reject(error);
    });
  });
}

/**
 * Opens the provider OAuth URL with ASWebAuthenticationSession (iOS) so the
 * sheet auto-dismisses when the custom-scheme deep link fires.
 * Falls back only to a Capgo webview that watches for the callback — never to
 * system Safari / Capacitor Browser (that path leaves users stranded logged-in).
 */
export async function openNativeOAuthProvider(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw Object.assign(new Error("Native sign-in is only available in the app."), {
      code: "OAUTH_NOT_NATIVE" as const,
    });
  }

  try {
    // Dynamic import — a hard dependency can blank the WebView if the
    // native plugin isn't linked yet (needs a fresh cap sync / rebuild).
    const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
    oauthUiOpen = true;
    const { redirectedUri } = await InAppBrowser.openSecureWindow({
      authEndpoint: url,
      // Must match Supabase redirectTo + Info.plist scheme so the sheet dismisses.
      redirectUri: NATIVE_OAUTH_CALLBACK,
    });
    oauthUiOpen = false;
    debugLog("[NativeOAuth] openSecureWindow returned:", redirectedUri);
    if (redirectedUri) {
      await handleNativeOAuthCallback(redirectedUri);
    }
    return;
  } catch (error) {
    oauthUiOpen = false;

    if (isUserCancelError(error)) {
      debugLog("[NativeOAuth] Auth session cancelled by user");
      throw Object.assign(new Error("Sign-in cancelled"), { code: "OAUTH_CANCELLED" as const });
    }

    // Capgo may reject after the sheet already dismissed (path match quirks).
    // Prefer the URL from the error, or a deep link already handled via appUrlOpen.
    const fromError = callbackUrlFromError(error);
    if (fromError) {
      debugLog("[NativeOAuth] Recovering callback from secure-window error");
      await handleNativeOAuthCallback(fromError);
      return;
    }

    if (pendingOAuthHandled) {
      const handled = await pendingOAuthHandled.catch(() => false);
      if (handled) {
        debugLog("[NativeOAuth] Callback already handled via appUrlOpen");
        await dismissOAuthUi();
        return;
      }
    }

    console.warn("[NativeOAuth] openSecureWindow failed, trying webview watch:", error);
    try {
      await openNativeOAuthWithUrlWatch(url);
      return;
    } catch (watchError) {
      await dismissOAuthUi();
      console.error("[NativeOAuth] webview watch failed — not opening Safari:", watchError);
      throw Object.assign(
        new Error("Couldn’t open Google sign-in. Please try again."),
        { code: "OAUTH_UI_FAILED" as const }
      );
    }
  }
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

function navigateHomeAfterNativeOAuth(): void {
  if (typeof window === "undefined") return;

  // Always greet on Home after native OAuth — ignore remembered /mix return-to.
  const target = new URL("/", window.location.origin);
  if (Capacitor.isNativePlatform()) {
    target.searchParams.set("mixwise_app", "1");
  }
  debugLog("[NativeOAuth] Session established, navigating to", target.toString());
  window.location.href = target.toString();
}

/** Exchanges the PKCE code from the deep link and loads the session into the WebView. */
export async function handleNativeOAuthCallback(url: string): Promise<boolean> {
  if (!isOAuthReturnUrl(url)) {
    return false;
  }

  // openSecureWindow + appUrlOpen often deliver the same callback — share one promise.
  if (pendingOAuthHandled) {
    debugLog("[NativeOAuth] Joining in-flight OAuth callback");
    await dismissOAuthUi();
    return pendingOAuthHandled;
  }

  const run = (async (): Promise<boolean> => {
    await dismissOAuthUi();

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

    if (oauthExchangeInFlight === code) {
      debugLog("[NativeOAuth] Ignoring duplicate callback for code");
      await dismissOAuthUi();
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

    await dismissOAuthUi();
    navigateHomeAfterNativeOAuth();
    return true;
  })();

  pendingOAuthHandled = run.finally(() => {
    pendingOAuthHandled = null;
  });
  return pendingOAuthHandled;
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
          void dismissOAuthUi();
          return;
        }
        if (url.startsWith("http")) {
          window.location.href = url;
        }
      })
      .catch((error) => {
        console.error("[NativeOAuth] appUrlOpen handler failed:", error);
        void dismissOAuthUi();
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

  // If a Capgo webview is still up when we regain focus after a deep link, close it.
  const stateHandle = App.addListener("appStateChange", ({ isActive }) => {
    if (isActive && oauthUiOpen) {
      void dismissOAuthUi();
    }
  });

  return () => {
    void urlHandle.then((h) => h.remove());
    void stateHandle.then((h) => h.remove());
  };
}
