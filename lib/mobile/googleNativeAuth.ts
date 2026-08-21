import { Capacitor } from "@capacitor/core";
import {
  SocialLogin,
  type GoogleLoginOptions,
  type GoogleLoginResponseOnline,
} from "@capgo/capacitor-social-login";
import { createClient } from "@/lib/supabase/client";
import { debugLog } from "@/lib/debugLog";

/** Web OAuth client used by Supabase Google provider (token audience). */
const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  "200787084084-p94m1d02kjnjgdc7o56ggimo4rg1c6ns.apps.googleusercontent.com";

/** iOS OAuth client — required for native GIDSignIn (never opens Safari). */
const GOOGLE_IOS_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ||
  "200787084084-kq7af34h07boo7mntltcqpa09uve1ce9.apps.googleusercontent.com";

function getUrlSafeNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hash(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );
}

async function getNonce(): Promise<{ rawNonce: string; nonceDigest: string }> {
  const rawNonce = getUrlSafeNonce();
  const nonceDigest = await sha256Hash(rawNonce);
  return { rawNonce, nonceDigest };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validateIdToken(
  idToken: string,
  expectedNonceDigest: string
): { valid: boolean; error?: string } {
  const payload = decodeJwtPayload(idToken);
  if (!payload) {
    return { valid: false, error: "Failed to decode Google ID token" };
  }

  const allowedAudiences = [GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID].filter(Boolean);
  const audience = payload.aud;
  const audOk =
    typeof audience === "string"
      ? allowedAudiences.includes(audience)
      : Array.isArray(audience) && audience.some((a) => allowedAudiences.includes(String(a)));

  if (!audOk) {
    return {
      valid: false,
      error: `Unexpected Google token audience: ${String(audience)}`,
    };
  }

  const tokenNonce = payload.nonce;
  if (typeof tokenNonce === "string" && tokenNonce !== expectedNonceDigest) {
    return { valid: false, error: "Google token nonce mismatch" };
  }

  return { valid: true };
}

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (!GOOGLE_IOS_CLIENT_ID) {
    throw Object.assign(
      new Error(
        "Native Google Sign-In isn’t configured yet. Add NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID and rebuild."
      ),
      { code: "GOOGLE_IOS_CLIENT_MISSING" as const }
    );
  }

  if (initialized) return;

  await SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
      // Request ID tokens whose `aud` is the web client (matches Supabase Google provider).
      iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
      mode: "online",
    },
  });
  initialized = true;
}

/**
 * Native Google Sign-In → Supabase session via ID token.
 * Never opens Safari / ASWebAuthenticationSession.
 */
export async function signInWithGoogleNative(retry = false): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw Object.assign(new Error("Native Google Sign-In is only available in the app."), {
      code: "OAUTH_NOT_NATIVE" as const,
    });
  }

  await ensureInitialized();

  const { rawNonce, nonceDigest } = await getNonce();

  const response = await SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["email", "profile"],
      nonce: nonceDigest,
    } as GoogleLoginOptions,
  });

  if (response.result.responseType !== "online") {
    throw Object.assign(new Error("Google Sign-In returned an unexpected response."), {
      code: "GOOGLE_OFFLINE_UNSUPPORTED" as const,
    });
  }

  const google = response.result as GoogleLoginResponseOnline;
  if (!google.idToken) {
    throw Object.assign(new Error("Google Sign-In didn’t return an ID token."), {
      code: "GOOGLE_MISSING_ID_TOKEN" as const,
    });
  }

  const validation = validateIdToken(google.idToken, nonceDigest);
  if (!validation.valid) {
    console.warn("[GoogleNativeAuth] JWT validation failed:", validation.error);
    if (!retry) {
      try {
        await SocialLogin.logout({ provider: "google" });
      } catch {
        /* clear cache best-effort */
      }
      initialized = false;
      return signInWithGoogleNative(true);
    }
    throw Object.assign(new Error(validation.error || "Google token validation failed."), {
      code: "GOOGLE_TOKEN_INVALID" as const,
    });
  }

  const payload = decodeJwtPayload(google.idToken);
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: google.idToken,
    ...(typeof payload?.nonce === "string" ? { nonce: rawNonce } : {}),
  });

  if (error) {
    console.error("[GoogleNativeAuth] signInWithIdToken failed:", error);
    throw Object.assign(new Error(error.message || "Couldn’t complete Google sign-in."), {
      code: "GOOGLE_SUPABASE_FAILED" as const,
    });
  }

  debugLog("[GoogleNativeAuth] Signed in with native Google ID token");

  if (typeof window !== "undefined") {
    const target = new URL("/", window.location.origin);
    target.searchParams.set("mixwise_app", "1");
    window.location.href = target.toString();
  }
}

export function isNativeGoogleSignInConfigured(): boolean {
  return Boolean(GOOGLE_IOS_CLIENT_ID);
}
