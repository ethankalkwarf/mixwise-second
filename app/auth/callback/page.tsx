"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
  return new URLSearchParams(hash);
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

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

      const next = sanitizeNext(searchParams.get("next"));
      const code = searchParams.get("code");

      const hashParams = getHashParams();
      const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");

      try {
        // Failsafe: if anything hangs, but a session exists, redirect anyway.
        failSafeTimer = setTimeout(async () => {
          if (cancelled) return;
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            scrubUrl();
            router.replace(next === "/" ? "/onboarding" : next);
          } else {
            setStatus("error");
            setError("We couldn't finish signing you in. Please try again.");
          }
        }, 12000);

        // If we already have a valid session cookie/session, just continue (avoids confusing "Sign-in failed")
        const { data: existingSession } = await withTimeout(supabase.auth.getSession(), 8000, "getSession");
        if (existingSession.session) {
          scrubUrl();
          const { data } = await withTimeout(supabase.auth.getUser(), 8000, "getUser");
          const user = data.user;
          if (user && !cancelled) {
            router.replace(next === "/" ? "/onboarding" : next);
            return;
          }
        }

        // Establish session (supports both PKCE code flow and implicit hash token flow)
        if (code) {
          const { error: exchangeError } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
            10000,
            "exchangeCodeForSession"
          );
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await withTimeout(
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }),
            10000,
            "setSession"
          );
          if (sessionError) throw sessionError;
        } else {
          // No params — try session again (some providers set cookies without hash/code visible)
          const { data: fallbackSession } = await withTimeout(supabase.auth.getSession(), 8000, "getSession(fallback)");
          if (!fallbackSession.session) throw new Error("Missing auth callback parameters.");
        }

        // Remove sensitive tokens from the URL
        scrubUrl();

        const { data } = await withTimeout(supabase.auth.getUser(), 8000, "getUser(after session)");
        const user = data.user;

        if (user) {
          // If the caller explicitly asked for onboarding, don't block on DB checks — go immediately.
          if (!cancelled && next === "/onboarding") {
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
            router.replace(target);
          }
          return;
        }

        // No user after successful exchange/session set? Send to login.
        if (!cancelled) router.replace("/");
      } catch (err) {
        console.error("[AuthCallbackPage] error:", err);
        if (cancelled) return;

        // If session exists anyway, proceed without showing an error screen
        const { data: sessionAfterError } = await withTimeout(supabase.auth.getSession(), 8000, "getSession(after error)");
        if (sessionAfterError.session) {
          scrubUrl();
          router.replace(next === "/" ? "/onboarding" : next);
          return;
        }

        setStatus("error");
        setError("We couldn't finish signing you in. Please try again.");
      } finally {
        if (failSafeTimer) clearTimeout(failSafeTimer);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (failSafeTimer) clearTimeout(failSafeTimer);
    };
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-8 text-center">
        <div className="text-3xl font-display font-bold text-forest mb-4">mixwise.</div>
        {status === "loading" ? (
          <>
            <h1 className="text-xl font-display font-bold text-forest mb-2">Signing you in…</h1>
            <p className="text-sage">Just a moment while we confirm your account.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-display font-bold text-forest mb-2">Sign-in failed</h1>
            <p className="text-sage mb-6">{error}</p>
            <button
              onClick={() => router.replace("/")}
              className="px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  );
}


