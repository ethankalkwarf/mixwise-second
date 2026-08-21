import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { debugLog } from "@/lib/debugLog";
import {
  isNativeOAuthCallbackUrl,
  NATIVE_OAUTH_BRIDGE_PATH,
  NATIVE_OAUTH_BRIDGE_URL,
  NATIVE_OAUTH_CALLBACK,
} from "@/lib/mobile/authRedirect";
import { MixwiseOAuth } from "@/lib/mobile/oauthSessionPlugin";

/** Custom-scheme host for ASWebAuthenticationSession (pre–iOS 17.4). */
const NATIVE_OAUTH_SCHEME = "com.getmixwise.app";

let oauthUiOpen = false;
let mixwiseOAuthActive = false;
let oauthExchangeInFlight: string | null = null;
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

async function dismissOAuthUi(options?: { cancelAuthSession?: boolean }): Promise<void> {
  const cancelAuthSession = options?.cancelAuthSession === true;
  oauthUiOpen = false;

  if (cancelAuthSession && mixwiseOAuthActive) {
    mixwiseOAuthActive = false;
    try {
      await MixwiseOAuth.cancel();
    } catch {
      /* nothing open */
    }
  }

  try {
    const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
    await InAppBrowser.close().catch(() => {});
  } catch {
    /* Plugin may be unavailable */
  }

  window.setTimeout(() => {
    void import("@capgo/capacitor-inappbrowser")
      .then(({ InAppBrowser }) => InAppBrowser.close().catch(() => {}))
      .catch(() => {});
  }, 150);
}

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

async function openWithCapgoSecureWindow(url: string): Promise<void> {
  const { InAppBrowser } = await import("@capgo/capacitor-inappbrowser");
  oauthUiOpen = true;
  // Watch for the custom scheme the HTTPS bridge bounces to.
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
 * Opens Google/Apple OAuth inside ASWebAuthenticationSession only.
 * Never falls through to WKWebView / Safari — that path strands users in Safari.
 */
export async function openNativeOAuthProvider(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw Object.assign(new Error("Native sign-in is only available in the app."), {
      code: "OAUTH_NOT_NATIVE" as const,
    });
  }

  try {
    await openWithMixwiseOAuth(url);
    return;
  } catch (error) {
    if (pendingOAuthHandled) {
      const handled = await pendingOAuthHandled.catch(() => false);
      if (handled) {
        debugLog("[NativeOAuth] Callback already handled via appUrlOpen");
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

  try {
    await openWithCapgoSecureWindow(url);
    return;
  } catch (error) {
    if (pendingOAuthHandled) {
      const handled = await pendingOAuthHandled.catch(() => false);
      if (handled) return;
    }

    if (isUserCancelError(error)) {
      throw Object.assign(new Error("Sign-in cancelled"), { code: "OAUTH_CANCELLED" as const });
    }

    console.error("[NativeOAuth] Secure auth window failed — not opening Safari:", error);
    throw Object.assign(
      new Error("Couldn’t open Google sign-in. Please try again."),
      { code: "OAUTH_UI_FAILED" as const }
    );
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

export async function handleNativeOAuthCallback(url: string): Promise<boolean> {
  if (!isOAuthReturnUrl(url)) {
    return false;
  }

  if (pendingOAuthHandled) {
    debugLog("[NativeOAuth] Joining in-flight OAuth callback");
    await dismissOAuthUi({ cancelAuthSession: mixwiseOAuthActive });
    return pendingOAuthHandled;
  }

  const run = (async (): Promise<boolean> => {
    const params = collectOAuthParams(url);
    const code = params.get("code");
    const oauthError = params.get("error");

    if (mixwiseOAuthActive) {
      await dismissOAuthUi({ cancelAuthSession: true });
    } else {
      await dismissOAuthUi({ cancelAuthSession: false });
    }

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

    navigateHomeAfterNativeOAuth();
    return true;
  })();

  pendingOAuthHandled = run.finally(() => {
    pendingOAuthHandled = null;
  });
  return pendingOAuthHandled;
}

export function registerNativeOAuthListener(): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const urlHandle = App.addListener("appUrlOpen", ({ url }) => {
    debugLog("[NativeOAuth] appUrlOpen:", url);
    void handleNativeOAuthCallback(url)
      .then((handled) => {
        if (handled) return;
        if (url.startsWith("http") && !url.includes(NATIVE_OAUTH_BRIDGE_PATH)) {
          window.location.href = url;
        }
      })
      .catch((error) => {
        console.error("[NativeOAuth] appUrlOpen handler failed:", error);
        void dismissOAuthUi({ cancelAuthSession: mixwiseOAuthActive });
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

  return () => {
    void urlHandle.then((h) => h.remove());
  };
}
