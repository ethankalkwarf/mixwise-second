import { Capacitor } from "@capacitor/core";

const STORAGE_KEY = "mixwise_native";

type NativeWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean };
  androidBridge?: unknown;
  webkit?: { messageHandlers?: { bridge?: unknown } };
};

function hasNativeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith("mixwise_app=1"));
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

/** True when running inside the Capacitor iOS/Android shell. */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;

  if (storedNativeFlag()) return true;

  if (hasNativeCookie()) {
    persistNativeFlag();
    return true;
  }

  if (hasNativeQueryParam()) {
    persistNativeFlag();
    return true;
  }

  if (typeof document !== "undefined" && document.documentElement.classList.contains("native-app")) {
    persistNativeFlag();
    return true;
  }

  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios" || platform === "android") {
      persistNativeFlag();
      return true;
    }
  } catch {
    // Capacitor may not be initialized yet
  }

  try {
    if (Capacitor.isNativePlatform()) {
      persistNativeFlag();
      return true;
    }
  } catch {
    // Capacitor may not be initialized on web
  }

  const win = window as NativeWindow;
  try {
    if (win.Capacitor?.isNativePlatform?.()) {
      persistNativeFlag();
      return true;
    }
  } catch {
    // ignore
  }

  const href = window.location.href;
  const native =
    hasNativeBridge() ||
    hasNativeUserAgent() ||
    window.location.protocol === "capacitor:" ||
    href.includes("capacitor://") ||
    href.includes("ionic://");

  if (native) persistNativeFlag();
  return native;
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
