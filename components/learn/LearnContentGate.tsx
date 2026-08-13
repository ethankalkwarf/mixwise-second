"use client";

import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

type Props = {
  teaserLabel?: string;
  children: React.ReactNode;
};

/**
 * Soft content gate: signed-in users see children; guests see content
 * fade into a login / signup CTA (readable on cream, not forest-on-forest).
 */
export function LearnContentGate({
  teaserLabel = "Continue with a free account",
  children,
}: Props) {
  const { isAuthenticated, isLoading } = useUser();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-mist bg-white/70 px-5 py-10 text-center text-sm text-sage">
        Loading lesson…
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <aside className="relative overflow-hidden rounded-3xl border border-mist bg-cream">
      {/* Peek of the locked content, then fade */}
      <div
        className="pointer-events-none select-none max-h-56 overflow-hidden opacity-50 blur-[1.5px] px-1"
        aria-hidden
      >
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/92 to-cream/40" />
      <div className="relative z-10 px-6 pb-8 pt-2 sm:px-8 sm:pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-2">
          Free preview ended
        </p>
        <h2 className="!text-charcoal font-display text-2xl sm:text-3xl font-bold mb-2">
          {teaserLabel}
        </h2>
        <p className="text-charcoal/75 text-sm leading-relaxed max-w-lg mb-5">
          Sign in or create a free account to unlock the rest of this lesson, learning checks,
          practice recipes, and the full Learn library.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              openSignupDialog({
                title: "Unlock the Learn library",
                subtitle: "Free account — keep training, save recipes, and track your bar.",
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
                subtitle: "Pick up this lesson and save your progress.",
              })
            }
            className="inline-flex items-center justify-center rounded-full border border-forest/20 bg-white px-6 py-3 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </aside>
  );
}
