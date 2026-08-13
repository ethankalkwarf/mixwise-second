"use client";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useUser } from "@/components/auth/UserProvider";

/**
 * Soft conversion for Learn — taste is free; account unlocks saved progress later.
 */
export function LearnJoinCta() {
  const { isAuthenticated } = useUser();
  const { openSignupDialog } = useAuthDialog();

  if (isAuthenticated) return null;

  return (
    <aside className="rounded-3xl border border-mist bg-gradient-to-br from-forest to-forest/90 px-6 py-8 sm:px-8 text-cream">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive font-bold mb-2">
        Free account
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Keep training on MixWise</h2>
      <p className="text-cream/80 text-sm leading-relaxed max-w-lg mb-5">
        Create a free account to unlock full lessons, learning checks, practice recipes, and saved path progress on this device.
      </p>
      <button
        type="button"
        onClick={() =>
          openSignupDialog({
            title: "Join MixWise free",
            subtitle: "Save recipes and keep your home bar training in one place.",
          })
        }
        className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
      >
        Create free account
      </button>
    </aside>
  );
}
