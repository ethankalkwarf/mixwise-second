"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { isLearnPublic } from "@/lib/learnAccess";

type Props = {
  /** Unique per lesson — used for session lock persistence */
  gateId: string;
  teaserLabel?: string;
  /** Free reading time before blur (ms). Default 60s. */
  delayMs?: number;
  children: React.ReactNode;
};

const storageKey = (gateId: string) => `mixwise-learn-gate:${gateId}`;

/**
 * Show the full lesson first. After ~1 minute (guests only), blur and ask to sign in / register.
 * Signed-in users never see the gate. Disabled while Learn is unpublished (direct-URL preview).
 */
export function LearnContentGate({
  gateId,
  teaserLabel = "Keep reading free",
  delayMs = 60_000,
  children,
}: Props) {
  const { isAuthenticated, isLoading } = useUser();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();
  const [locked, setLocked] = useState(false);
  const gatingEnabled = isLearnPublic();

  useEffect(() => {
    if (!gatingEnabled || isLoading || isAuthenticated) {
      setLocked(false);
      return;
    }

    try {
      if (sessionStorage.getItem(storageKey(gateId)) === "1") {
        setLocked(true);
        return;
      }
    } catch {
      /* private mode */
    }

    const started = Date.now();
    const tick = window.setInterval(() => {
      if (Date.now() - started >= delayMs) {
        setLocked(true);
        try {
          sessionStorage.setItem(storageKey(gateId), "1");
        } catch {
          /* ignore */
        }
        window.clearInterval(tick);
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [gatingEnabled, isAuthenticated, isLoading, gateId, delayMs]);

  if (!gatingEnabled || isLoading || isAuthenticated || !locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none select-none blur-[2.5px] opacity-60 max-h-[min(70vh,640px)] overflow-hidden"
        aria-hidden
      >
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 to-cream/25" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-0">
        <div className="mx-auto max-w-lg rounded-3xl border border-mist bg-white/95 backdrop-blur-md shadow-card-hover px-6 py-7 sm:px-8 text-center sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-2">
            Free preview pause
          </p>
          <h2 className="!text-charcoal font-display text-2xl sm:text-3xl font-bold mb-2">
            {teaserLabel}
          </h2>
          <p className="text-charcoal/75 text-sm leading-relaxed mb-5">
            Create a free account or sign in to finish this lesson, run learning checks, and save path
            progress.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <button
              type="button"
              onClick={() =>
                openSignupDialog({
                  title: "Unlock Learn",
                  subtitle: "Free account — keep reading and save your bar.",
                })
              }
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
            >
              Create free account →
            </button>
            <button
              type="button"
              onClick={() =>
                openLoginDialog({
                  title: "Sign in to continue",
                  subtitle: "Pick up this lesson where you left off.",
                })
              }
              className="inline-flex items-center justify-center rounded-full border border-mist bg-cream px-6 py-3 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
