"use client";

import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

type Props = {
  teaserLabel?: string;
  children: React.ReactNode;
};

/**
 * Soft content gate: signed-in users see children; guests get a clear continue CTA.
 */
export function LearnContentGate({
  teaserLabel = "Continue with a free account",
  children,
}: Props) {
  const { isAuthenticated, isLoading } = useUser();
  const { openSignupDialog } = useAuthDialog();

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
    <aside className="rounded-3xl border border-mist bg-gradient-to-br from-forest to-forest/90 px-6 py-8 sm:px-8 text-cream">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive font-bold mb-2">
        Free preview ended
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">{teaserLabel}</h2>
      <p className="text-cream/80 text-sm leading-relaxed max-w-lg mb-5">
        Unlock the rest of this lesson, learning checks, practice recipes, and the full Learn library — free forever for your account.
      </p>
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
        Continue free →
      </button>
    </aside>
  );
}
