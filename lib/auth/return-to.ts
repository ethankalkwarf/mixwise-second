import { isNativeApp } from "@/lib/mobile/platform";

const RETURN_TO_KEY = "mixwise-auth-return-to";

const AUTH_PREFIXES = ["/auth/", "/reset-password"];
const GENERIC_LANDING = new Set(["/", "/join"]);
/** Native app: treat Mix as a soft landing so sign-in greets on Home. */
const NATIVE_SOFT_LANDING = new Set(["/", "/join", "/mix", "/saved"]);

/** Same-origin path only. Reject protocol-relative and auth callback URLs. */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  if (AUTH_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  return true;
}

export function currentReturnPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  return `${window.location.pathname}${window.location.search}`;
}

export function rememberAuthReturnTo(path?: string): void {
  if (typeof window === "undefined") return;
  const value = path ?? currentReturnPath();
  try {
    const pathname = value.split("?")[0] || value;
    const soft =
      GENERIC_LANDING.has(pathname) ||
      (isNativeApp() && NATIVE_SOFT_LANDING.has(pathname));
    if (isSafeReturnPath(value) && !soft) {
      sessionStorage.setItem(RETURN_TO_KEY, value);
    } else {
      sessionStorage.removeItem(RETURN_TO_KEY);
    }
  } catch {
    /* private mode / storage blocked */
  }
}

export function consumeAuthReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(RETURN_TO_KEY);
    if (value) sessionStorage.removeItem(RETURN_TO_KEY);
    return value;
  } catch {
    return null;
  }
}

/**
 * Where to send someone after login.
 * Recipe pages stay put. Home/join (and native Mix/You) fall through to the
 * native home or web dashboard.
 */
export function resolvePostAuthPath(
  next: string | null | undefined,
  _options?: { isNewUser?: boolean }
): string {
  const path = isSafeReturnPath(next) ? next : "/";
  const pathname = path.split("?")[0] || path;
  const native = typeof window !== "undefined" && isNativeApp();

  if (pathname === "/onboarding") {
    return native ? "/" : "/dashboard";
  }
  // Native app: always greet on Home unless returning to a specific content page.
  if (native) {
    if (NATIVE_SOFT_LANDING.has(pathname)) return "/";
    if (
      pathname.startsWith("/cocktails/") ||
      pathname.startsWith("/learn/") ||
      pathname.startsWith("/ingredients/") ||
      pathname.startsWith("/account")
    ) {
      return path;
    }
    return "/";
  }
  if (!GENERIC_LANDING.has(pathname)) return path;
  return "/dashboard";
}

export function authCallbackUrlWithNext(baseCallback: string, nextPath?: string | null): string {
  const next = resolvePostAuthPath(nextPath ?? currentReturnPath());

  // Custom app scheme (Capacitor OAuth deep link)
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(baseCallback) && !baseCallback.startsWith("http")) {
    const url = new URL(baseCallback);
    url.searchParams.set("next", next);
    return url.toString();
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.getmixwise.com";
  const url = new URL(baseCallback, origin);
  url.searchParams.set("next", next);
  return url.toString();
}
