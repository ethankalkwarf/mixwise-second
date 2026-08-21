import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { debugLog } from "@/lib/debugLog";
import {
  isNativeOAuthCallbackUrl,
  NATIVE_OAUTH_BRIDGE_PATH,
  NATIVE_OAUTH_CALLBACK,
} from "@/lib/mobile/authRedirect";
import { MixwiseOAuth } from "@/lib/mobile/oauthSessionPlugin";

/** Custom-scheme host for ASWebAuthenticationSession (scheme only). */
const NATIVE_OAUTH_SCHEME = "com.getmixwise.app";

/** Capgo/ASWebAuthenticationSession sheet or watched webview is presenting OAuth. */
let oauthUiOpen = false;
/** True while our MixwiseOAuth ASWebAuthenticationSession is active. */
let mixwiseOAuthActive = false;
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
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  return (
    code === "OAUTH_CANCELLED" ||
    /cancel|dismiss|abort|ASWebAuthenticationSessionErrorDomain.*canceled|Sign-in cancelled/i.test(
      message
    )
  );
}

async function dismissOAuthUi(): Promise<void> {
  oauthUiOpen = false;

  // Our plugin can actually dismiss ASWebAuthenticationSession (Capgo close cannot).
  if (mixwiseOAuthActive || Capacitor.isPluginAvailable("MixwiseOAuth")) {
    try {
      await MixwiseOAuth.cancel();
    } catch {
      /* nothing open */
    }
    mixwiseOAuthActive = false;
  }

  try {
    const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
    await InAppBrowser.close().catch(() => {});
  } catch {
    // Plugin may be unavailable
  }

  window.setTimeout(() => {
    void import("@capgo/capacitor-inappbrowser")
      .then(({ InAppBrowser }) => InAppBrowser.close().catch(() => {}))
      .catch(() => {});
    if (Capacitor.isPluginAvailable("MixwiseOAuth")) {
      void MixwiseOAuth.cancel().catch(() => {});
    }
  }, 150);
  window.setTimeout(() => {
    void import("@capgo/capacitor-inappbrowser")
      .then(({ InAppBrowser }) => InAppBrowser.close().catch(() => {}))
      .catch(() => {});
    if (Capacitor.isPluginAvailable("MixwiseOAuth")) {
      void MixwiseOAuth.cancel().catch(() => {});
    }
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

/** Preferred path: MixWise native plugin that can cancel the auth sheet. */
async function openWithMixwiseOAuth(url: string): Promise<void> {
  if (!Capacitor.isPluginAvailable("MixwiseOAuth")) {
    throw Object.assign(new Error("MixwiseOAuth plugin unavailable"), {
      code: "OAUTH_PLUGIN_MISSING" as const,
    });
  }

  oauthUiOpen = true;
  mixwiseOAuthActive = true;
  try {
    const { url: redirectedUri } = await MixwiseOAuth.start({
      url,
      callbackScheme: NATIVE_OAUTH_SCHEME,
    });
    mixwiseOAuthActive = false;
    oauthUiOpen = false;
    debugLog("[NativeOAuth] MixwiseOAuth returned:", redirectedUri);
    if (redirectedUri) {
      await handleNativeOAuthCallback(redirectedUri);
    }
  } catch (error) {
    mixwiseOAuthActive = false;
    oauthUiOpen = false;
    throw error;
  }
}

/** Capgo openSecureWindow — cannot cancel from JS if appUrlOpen wins the race. */
async function openWithCapgoSecureWindow(url: string): Promise<void> {
  const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
  oauthUiOpen = true;
  const { redirectedUri } = await InAppBrowser.openSecureWindow({
    authEndpoint: url,
    redirectUri: NATIVE_OAUTH_CALLBACK,
  });
  oauthUiOpen = false;
  debugLog("[NativeOAuth] openSecureWindow returned:", redirectedUri);
  if (redirectedUri) {
    await handleNativeOAuthCallback(redirectedUri);
  }
}

/**
 * Opens the provider OAuth URL with ASWebAuthenticationSession so the sheet
 * auto-dismisses on the custom-scheme callback. Prefer MixwiseOAuth (cancellable);
 * Capgo and watched webview are fallbacks. Never use system Safari / Browser.
 */
export async function openNativeOAuthProvider(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw Object.assign(new Error("Native sign-in is only available in the app."), {
      code: "OAUTH_NOT_NATIVE" as const,
    });
  }

  // 1) MixWise plugin — retains session + cancel() for deep-link races
  try {
    await openWithMixwiseOAuth(url);
    return;
  } catch (error) {
    // Deep link often wins: cancel() dismisses the sheet and rejects start(),
    // but exchange may already be in flight / done via appUrlOpen.
    if (pendingOAuthHandled) {
      const handled = await pendingOAuthHandled.catch(() => false);
      if (handled) {
        debugLog("[NativeOAuth] Callback already handled via appUrlOpen");
        await dismissOAuthUi();
        return;
      }
    }

    if (isUserCancelError(error)) {
      debugLog("[NativeOAuth] Auth session cancelled by user");
      throw Object.assign(new Error("Sign-in cancelled"), { code: "OAUTH_CANCELLED" as const });
    }

    const missing =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "OAUTH_PLUGIN_MISSING";

    if (!missing) {
      console.warn("[NativeOAuth] MixwiseOAuth failed, trying Capgo:", error);
    }
  }

  // 2) Capgo secure window (older builds / plugin not linked yet)
  try {
    await openWithCapgoSecureWindow(url);
    return;
  } catch (error) {
    if (isUserCancelError(error)) {
      throw Object.assign(new Error("Sign-in cancelled"), { code: "OAUTH_CANCELLED" as const });
    }

    if (pendingOAuthHandled) {
      const handled = await pendingOAuthHandled.catch(() => false);
      if (handled) {
        await dismissOAuthUi();
        return;
      }
    }

    console.warn("[NativeOAuth] openSecureWindow failed, trying webview watch:", error);
  }

  // 3) Watched Capgo webview only — never Safari
  try {
    await openNativeOAuthWithUrlWatch(url);
  } catch (watchError) {
    await dismissOAuthUi();
    console.error("[NativeOAuth] webview watch failed — not opening Safari:", watchError);
    throw Object.assign(new Error("Couldn’t open Google sign-in. Please try again."), {
      code: "OAUTH_UI_FAILED" as const,
    });
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

  if (pendingOAuthHandled) {
    debugLog("[NativeOAuth] Joining in-flight OAuth callback");
    await dismissOAuthUi();
    return pendingOAuthHandled;
  }

  const run = (async (): Promise<boolean> => {
    // Dismiss FIRST — this is what was missing when appUrlOpen won the race.
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
    // Always try to kill the auth sheet immediately on OAuth deep links.
    if (isOAuthReturnUrl(url)) {
      void dismissOAuthUi();
    }
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
