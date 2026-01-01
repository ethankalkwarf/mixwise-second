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

    const run = async () => {
      setStatus("loading");
      setError(null);

      const next = searchParams.get("next") || "/";
      const code = searchParams.get("code");

      const hashParams = getHashParams();
      const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");

      try {
        // Establish session (supports both PKCE code flow and implicit hash token flow)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          throw new Error("Missing auth callback parameters.");
        }

        // Remove sensitive tokens from the URL
        scrubUrl();

        const { data } = await supabase.auth.getUser();
        const user = data.user;

        if (user) {
          // Determine onboarding status (mirror server-side logic)
          let needsOnboarding = false;
          let isNewUser = false;

          try {
            const { data: preferences, error: prefError } = await supabase
              .from("user_preferences")
              .select("onboarding_completed")
              .eq("user_id", user.id)
              .single();

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
            const target = needsOnboarding ? "/onboarding" : (next.startsWith("/") ? next : "/");
            router.replace(target);
          }
          return;
        }

        // No user after successful exchange/session set? Send to login.
        if (!cancelled) router.replace("/");
      } catch (err) {
        console.error("[AuthCallbackPage] error:", err);
        if (cancelled) return;
        setStatus("error");
        setError("We couldn't finish signing you in. Please try again.");
      }
    };

    run();
    return () => {
      cancelled = true;
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


