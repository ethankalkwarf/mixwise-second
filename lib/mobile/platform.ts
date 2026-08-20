import { Capacitor } from "@capacitor/core";

const STORAGE_KEY = "mixwise_native";
const COOKIE_NAME = "mixwise_app";

type NativeWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  androidBridge?: unknown;
  webkit?: { messageHandlers?: { bridge?: unknown } };
};

function hasNativeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${COOKIE_NAME}=1`));
}

function hasNativeQueryParam(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("mixwise_app") === "1";
  } catch {
    return false;
  }
}

function hasNativeBridge(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as NativeWindow;
  return Boolean(win.webkit?.messageHandlers?.bridge || win.androidBridge);
}

function hasNativeUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Capacitor|MixWiseNative/i.test(navigator.userAgent || "");
}

function isCapacitorRuntime(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    // Capacitor may not be initialized yet
  }
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios" || platform === "android") return true;
  } catch {
    // ignore
  }
  const win = window as NativeWindow;
  try {
    if (win.Capacitor?.isNativePlatform?.()) return true;
  } catch {
    // ignore
  }
  try {
    const platform = win.Capacitor?.getPlatform?.();
    if (platform === "ios" || platform === "android") return true;
  } catch {
    // ignore
  }
  return false;
}

function clearStaleNativeSignals(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // private mode
  }
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("native-app");
    // Expire the cookie so SSR / future visits stay on the web chrome.
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

function storedNativeFlag(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistNativeFlag(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // private mode
  }
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("native-app");
  }
}

/**
 * Hard evidence we are inside the Capacitor shell (not a polluted Safari tab).
 * Cookie / ?mixwise_app alone are not enough — those leak onto mobile web after OAuth.
 */
function hasHardNativeSignal(): boolean {
  if (typeof window === "undefined") return false;

  if (isCapacitorRuntime()) return true;
  if (hasNativeBridge()) return true;
  if (hasNativeUserAgent()) return true;

  const href = window.location.href;
  return (
    window.location.protocol === "capacitor:" ||
    href.includes("capacitor://") ||
    href.includes("ionic://")
  );
}

/** True when running inside the Capacitor iOS/Android shell. */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;

  const hard = hasHardNativeSignal();

  // Cookie / query / session flags without a real native runtime = stale web pollution.
  if (!hard) {
    if (
      storedNativeFlag() ||
      hasNativeCookie() ||
      hasNativeQueryParam() ||
      (typeof document !== "undefined" &&
        document.documentElement.classList.contains("native-app"))
    ) {
      clearStaleNativeSignals();
    }
    return false;
  }

  persistNativeFlag();
  return true;
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (!isNativeApp()) return "web";
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios" || platform === "android") return platform;
  } catch {
    // fall through
  }
  if (hasNativeBridge() && (window as NativeWindow).webkit?.messageHandlers?.bridge) {
    return "ios";
  }
  return "web";
}
