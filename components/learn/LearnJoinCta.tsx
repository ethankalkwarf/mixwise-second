"use client";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useUser } from "@/components/auth/UserProvider";

/**
 * Quiet Learn conversion band — cream surface, charcoal type (global h2 is forest).
 */
export function LearnJoinCta() {
  const { isAuthenticated } = useUser();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();

  if (isAuthenticated) return null;

  return (
    <aside className="rounded-3xl border border-mist bg-white px-6 py-7 sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-2">
            Free account
          </p>
          <h2 className="!text-charcoal font-display text-2xl font-bold mb-2">
            Unlock the rest of Learn
          </h2>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Full lessons, learning checks, practice recipes, and path progress — free with an account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              openSignupDialog({
                title: "Join MixWise free",
                subtitle: "Unlock Learn and save recipes to your bar.",
              })
            }
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() =>
              openLoginDialog({
                title: "Welcome back",
                subtitle: "Sign in to continue learning.",
              })
            }
            className="inline-flex items-center justify-center rounded-full border border-mist bg-cream px-5 py-2.5 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </aside>
  );
}
