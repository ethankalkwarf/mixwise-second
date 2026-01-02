"use client";

import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";

interface AuthError {
  code: string;
  description: string;
  isExpired: boolean;
}

function getHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
  return new URLSearchParams(hash);
}

function parseAuthError(hashParams: URLSearchParams): AuthError | null {
  const error = hashParams.get("error");
  const errorCode = hashParams.get("error_code");
  const errorDescription = hashParams.get("error_description");

  if (!error && !errorCode) return null;

  return {
    code: errorCode || error || "unknown_error",
    description: errorDescription ? decodeURIComponent(errorDescription) : error || "An error occurred",
    isExpired: errorCode === "otp_expired" || error === "access_denied",
  };
}

function scrubUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("next");
  url.searchParams.delete("type");
  url.searchParams.delete("access_token");
  url.searchParams.delete("refresh_token");
  url.hash = "";
  window.history.replaceState({}, document.title, url.toString());
}

/**
 * Wait for auth to be ready before redirecting.
 * This prevents the race condition where /onboarding loads before UserProvider has processed the new session.
 * 
 * @param authReady Promise that resolves when UserProvider is ready
 * @param timeoutMs Maximum time to wait before giving up (default 5 seconds)
 */
async function waitForAuthReady(authReady: Promise<void>, timeoutMs: number = 5000): Promise<void> {
  try {
    console.log("[AuthCallbackPage] Waiting for auth to be ready...");
    await Promise.race([
      authReady,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Auth ready timeout")), timeoutMs)
      ),
    ]);
    console.log("[AuthCallbackPage] Auth is ready, proceeding with redirect");
  } catch (err) {
    // Don't block on auth ready - just log and continue
    // This handles cases where authReady times out or rejects
    console.warn("[AuthCallbackPage] Auth ready wait failed, continuing anyway:", err);
  }
}

/**
 * Inner component that uses useSearchParams().
 * Must be a separate component to avoid "useSearchParams without Suspense" error.
 */
function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const { authReady } = useUser();

  const [status, setStatus] = useState<"loading" | "error" | "expired">("loading");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  
  // Prevent duplicate processing
  const hasProcessed = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate runs
    if (hasProcessed.current || processingRef.current) {
      console.log("[AuthCallbackPage] Already processing or processed, skipping duplicate run");
      return;
    }
    
    processingRef.current = true;
    let cancelled = false;
    let failSafeTimer: ReturnType<typeof setTimeout> | null = null;

    const sanitizeNext = (value: string | null) => {
      const next = value || "/";
      return next.startsWith("/") ? next : "/";
    };

    const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      });
      try {
        return await Promise.race([promise, timeoutPromise]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    const run = async () => {
      setStatus("loading");
      setError(null);
      setErrorCode(null);

      // Prefer explicit `next` query param, but fall back to a client-stored return URL.
      // This enables flows like: user tries "add to shopping list" while logged out → logs in with Google → returns to the recipe page.
      let storedReturnTo: string | null = null;
      try {
        if (typeof window !== "undefined") {
          storedReturnTo = sessionStorage.getItem("mixwise-auth-return-to");
          if (storedReturnTo) {
            sessionStorage.removeItem("mixwise-auth-return-to");
          }
        }
      } catch {
        // ignore storage failures
      }

      const next = sanitizeNext(searchParams.get("next") ?? storedReturnTo);
      const code = searchParams.get("code");

      const hashParams = getHashParams();
      
      // Check for auth errors in hash (e.g., otp_expired)
      const authError = parseAuthError(hashParams);
      if (authError?.isExpired) {
        console.warn("[AuthCallbackPage] Expired or invalid link detected:", {
          code: authError.code,
          description: authError.description,
        });
        setStatus("expired");
        setError(authError.description);
        setErrorCode(authError.code);
        setExpiredEmail(null); // User can enter email on the UI
        return;
      }

      if (authError && !authError.isExpired) {
        console.error("[AuthCallbackPage] Auth error detected:", {
          code: authError.code,
          description: authError.description,
        });
        setStatus("error");
        setError(authError.description);
        setErrorCode(authError.code);
        return;
      }

      const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
      
      console.log("[AuthCallbackPage] Callback params:", {
        hasCode: !!code,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        next,
      });

      try {
        // Failsafe: if anything hangs, but a session exists, redirect anyway.
        // More aggressive timeout: 3 seconds instead of 12
        failSafeTimer = setTimeout(async () => {
          if (cancelled) return;
          console.warn("[AuthCallbackPage] Failsafe timer triggered (3s) - redirecting to onboarding anyway");
          scrubUrl();
          // Wait for auth to be ready with a shorter timeout (1s) since we're already at 3s timeout
          await waitForAuthReady(authReady, 1000);
          // At this point, just go to onboarding - Supabase will handle session validation
          router.replace(next === "/" ? "/onboarding" : next);
        }, 3000);

        // If we already have a valid session cookie/session, just continue (avoids confusing "Sign-in failed")
        console.log("[AuthCallbackPage] Checking for existing session...");
        const { data: existingSession } = await withTimeout(supabase.auth.getSession(), 8000, "getSession");
        if (existingSession.session) {
          console.log("[AuthCallbackPage] Found existing session, user already authenticated");
          scrubUrl();
          const { data } = await withTimeout(supabase.auth.getUser(), 8000, "getUser");
          const user = data.user;
          if (user && !cancelled) {
            console.log("[AuthCallbackPage] Redirecting authenticated user to:", next === "/" ? "/onboarding" : next);
            await waitForAuthReady(authReady);
            router.replace(next === "/" ? "/onboarding" : next);
            return;
          }
        }

        // Establish session (supports both PKCE code flow and implicit hash token flow)
        if (code) {
          console.log("[AuthCallbackPage] Exchanging code for session...");
          const { error: exchangeError } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
            10000,
            "exchangeCodeForSession"
          );
          if (exchangeError) {
            console.error("[AuthCallbackPage] Code exchange failed:", exchangeError);
            throw exchangeError;
          }
          console.log("[AuthCallbackPage] Code exchanged successfully");
        } else if (accessToken && refreshToken) {
          console.log("[AuthCallbackPage] Setting session from tokens...");
          try {
            // Call setSession and wait for it properly
            console.log("[AuthCallbackPage] Calling setSession...");
            const { error: sessionError } = await withTimeout(
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              }),
              5000,
              "setSession"
            );
            
            if (sessionError) {
              console.error("[AuthCallbackPage] setSession failed:", sessionError);
              // Don't throw - continue anyway since we have tokens from URL
              // The tokens will be in the hash and getSession may still work
            } else {
              console.log("[AuthCallbackPage] Session set successfully");
            }
          } catch (err) {
            console.error("[AuthCallbackPage] Session setup error (non-fatal):", err);
            // Don't throw - we have tokens, keep going
          }
        } else {
          // No params — try session again (some providers set cookies without hash/code visible)
          console.log("[AuthCallbackPage] No code or tokens, checking for cookie-based session...");
          const { data: fallbackSession } = await withTimeout(supabase.auth.getSession(), 8000, "getSession(fallback)");
          if (!fallbackSession.session) {
            console.error("[AuthCallbackPage] No callback parameters and no session found");
            throw new Error("Missing auth callback parameters.");
          }
        }

        // Remove sensitive tokens from the URL
        scrubUrl();

        // If we have valid tokens, go straight to onboarding without checking user
        // This prevents hanging on getUser() calls
        if ((accessToken && refreshToken) || code) {
          const target = next === "/" ? "/onboarding" : next;
          console.log("[AuthCallbackPage] Have valid tokens, redirecting directly to:", target);
          if (!cancelled) {
            console.log("[AuthCallbackPage] Navigating to:", target);
            // Signal that email confirmation completed (for AuthDialog closure)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('mixwise:emailConfirmed', { detail: { success: true } }));
            }
            // Wait for auth to be ready before redirecting to ensure UserProvider has processed the session
            await waitForAuthReady(authReady);
            router.replace(target);
          }
          return;
        }

        const { data } = await withTimeout(supabase.auth.getUser(), 8000, "getUser(after session)");
        const user = data.user;

        if (user) {
          console.log("[AuthCallbackPage] User authenticated:", user.id);
          // If the caller explicitly asked for onboarding, don't block on DB checks — go immediately.
          if (!cancelled && next === "/onboarding") {
            console.log("[AuthCallbackPage] Explicit onboarding request, redirecting immediately");
            // Signal that email confirmation completed (for AuthDialog closure)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('mixwise:emailConfirmed', { detail: { success: true } }));
            }
            // Wait for auth to be ready before redirecting to ensure UserProvider has processed the session
            await waitForAuthReady(authReady);
            router.replace("/onboarding");
            return;
          }

          // Determine onboarding status (mirror server-side logic)
          let needsOnboarding = false;
          let isNewUser = false;

          try {
            const { data: preferences, error: prefError } = await withTimeout(
              supabase
                .from("user_preferences")
                .select("onboarding_completed")
                .eq("user_id", user.id)
                .single(),
              8000,
              "user_preferences"
            );

            if (prefError && prefError.code === "PGRST116") {
              needsOnboarding = true;
              isNewUser = true;
            } else if (prefError && prefError.code === "42P01") {
              // Table doesn't exist - skip onboarding
              needsOnboarding = false;
            } else if (!prefError && (!preferences || !preferences.onboarding_completed)) {
              needsOnboarding = true;
              isNewUser = true;
            }
          } catch {
            // If anything goes wrong, default to onboarding for safety
            needsOnboarding = true;
          }

          // Fire-and-forget welcome email for brand new users
          if (isNewUser && user.email) {
            const displayName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email.split("@")[0];

            fetch("/api/auth/send-welcome", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                displayName,
              }),
            }).catch(() => {
              // ignore
            });
          }

          if (!cancelled) {
            const target = needsOnboarding ? "/onboarding" : next;
            console.log("[AuthCallbackPage] Redirecting to:", target);
            // Signal that email confirmation completed (for AuthDialog closure)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('mixwise:emailConfirmed', { detail: { success: true } }));
            }
            // Wait for auth to be ready before redirecting to ensure UserProvider has processed the session
            await waitForAuthReady(authReady);
            router.replace(target);
          }
          return;
        }

        // No user after successful exchange/session set? Send to login.
        console.error("[AuthCallbackPage] No user found after session establishment");
        if (!cancelled) router.replace("/");
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("[AuthCallbackPage] Error during auth callback:", {
          message: errMsg,
          error: err,
        });
        if (cancelled) return;

        // If session exists anyway, proceed without showing an error screen
        const { data: sessionAfterError } = await withTimeout(supabase.auth.getSession(), 8000, "getSession(after error)");
        if (sessionAfterError.session) {
          console.log("[AuthCallbackPage] Session recovered after error, proceeding");
          scrubUrl();
          // Wait for auth to be ready before redirecting to ensure UserProvider has processed the session
          await waitForAuthReady(authReady);
          router.replace(next === "/" ? "/onboarding" : next);
          return;
        }

        setStatus("error");
        setError("We couldn't finish signing you in. Please try again.");
      } finally {
        if (failSafeTimer) clearTimeout(failSafeTimer);
        processingRef.current = false;
        hasProcessed.current = true;
      }
    };

    run();
    return () => {
      cancelled = true;
      if (failSafeTimer) clearTimeout(failSafeTimer);
      processingRef.current = false;
    };
  }, [router, searchParams, supabase, authReady]);

  const handleResendEmail = async (emailToResend?: string) => {
    const emailToUse = emailToResend || expiredEmail;
    if (!emailToUse) {
      // Prompt user to enter email
      const email = prompt("Please enter your email address:");
      if (!email) return;
      setExpiredEmail(email);
      handleResendEmail(email);
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setError("Check your email for a new confirmation link!");
        // After showing success, redirect to home or login after delay
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      } else {
        setError(data.error || "Failed to resend email. Please try again.");
      }
    } catch (err) {
      console.error("[AuthCallbackPage] Resend error:", err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-8 text-center">
        <div className="text-3xl font-display font-bold text-forest mb-4">mixwise.</div>
        {status === "loading" ? (
          <>
            <h1 className="text-xl font-display font-bold text-forest mb-2">Signing you in…</h1>
            <p className="text-sage">Just a moment while we confirm your account.</p>
          </>
        ) : status === "expired" ? (
          <>
            <h1 className="text-xl font-display font-bold text-forest mb-2">Link Expired</h1>
            <p className="text-sage mb-4">Your confirmation link has expired or is invalid.</p>
            {expiredEmail && <p className="text-sm text-sage mb-6">Resending to: {expiredEmail}</p>}
            <div className="space-y-3">
              <button
                onClick={() => handleResendEmail()}
                disabled={isResending}
                className="w-full px-4 py-3 bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-cream font-bold rounded-2xl transition-all"
              >
                {isResending ? "Sending…" : "Resend Confirmation Email"}
              </button>
              <button
                onClick={() => router.replace("/")}
                className="w-full px-4 py-3 bg-sage/10 hover:bg-sage/20 text-forest font-bold rounded-2xl transition-all"
              >
                Back to Home
              </button>
            </div>
            <p className="text-xs text-sage mt-4">
              {error && <span className="text-terracotta">{error}</span>}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-display font-bold text-forest mb-2">Sign-in failed</h1>
            <p className="text-sage mb-2">{error}</p>
            {errorCode && <p className="text-xs text-gray-500 mb-6">Error code: {errorCode}</p>}
            <div className="space-y-3">
              <button
                onClick={() => router.replace("/")}
                className="w-full px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setStatus("expired");
                  setExpiredEmail(null);
                }}
                className="w-full px-4 py-3 bg-sage/10 hover:bg-sage/20 text-forest font-bold rounded-2xl transition-all"
              >
                Resend Confirmation Email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Wrapper component that provides Suspense boundary for useSearchParams().
 * This prevents the "useSearchParams without Suspense" build error.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-8 text-center">
          <div className="text-3xl font-display font-bold text-forest mb-4">mixwise.</div>
          <h1 className="text-xl font-display font-bold text-forest mb-2">Signing you in…</h1>
          <p className="text-sage">Just a moment while we confirm your account.</p>
        </div>
      </div>
    }>
      <AuthCallbackPageContent />
    </Suspense>
  );
}

