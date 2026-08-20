"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { NATIVE_OAUTH_CALLBACK } from "@/lib/mobile/authRedirect";

/**
 * HTTPS bridge for Capacitor OAuth.
 *
 * Supabase redirects here (allowlisted https URL). We immediately bounce the
 * PKCE code into the app scheme so ASWebAuthenticationSession / the app can
 * finish sign-in and dismiss the auth sheet.
 */
export default function NativeOAuthCallbackPage() {
  const [failed, setFailed] = useState(false);
  const deepLink = useMemo(() => {
    if (typeof window === "undefined") return NATIVE_OAUTH_CALLBACK;

    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(
      window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : ""
    );

    const target = new URL(NATIVE_OAUTH_CALLBACK);
    for (const source of [search, hash]) {
      source.forEach((value, key) => {
        // Never carry a web return-to into the app — native OAuth always lands on Home.
        if (key === "next") return;
        if (value) target.searchParams.set(key, value);
      });
    }
    return target.toString();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target = new URL(deepLink);
    const hasPayload =
      target.searchParams.has("code") ||
      target.searchParams.has("error") ||
      target.searchParams.has("access_token");

    if (!hasPayload) {
      setFailed(true);
      return;
    }

    // Immediate handoff — try twice in case the first navigation is swallowed.
    window.location.replace(deepLink);
    const retry = window.setTimeout(() => {
      window.location.href = deepLink;
    }, 400);

    // If iOS doesn't hand off, show a manual escape hatch with the code intact.
    const timer = window.setTimeout(() => setFailed(true), 2000);
    return () => {
      window.clearTimeout(retry);
      window.clearTimeout(timer);
    };
  }, [deepLink]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream px-6 text-center">
      <BrandLogo size="lg" variant="dark" linked={false} />
      <p className="mt-6 font-display text-xl font-bold text-forest">
        {failed ? "Open MixWise to finish signing in" : "Returning to MixWise…"}
      </p>
      <p className="mt-2 max-w-sm text-sm text-sage">
        {failed
          ? "If the app didn’t open automatically, tap below or switch back to MixWise."
          : "Hang tight — we’re handing you back to the app."}
      </p>
      {failed ? (
        <a
          href={deepLink}
          className="mt-8 inline-flex rounded-2xl bg-terracotta px-6 py-3.5 text-sm font-bold text-cream"
        >
          Open MixWise
        </a>
      ) : null}
    </div>
  );
}
