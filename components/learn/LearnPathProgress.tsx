"use client";

import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import type { LearnPathStep } from "@/lib/learnLibrary";

type Props = {
  steps: LearnPathStep[];
  done?: boolean[];
  /** Next incomplete lesson — signed-in continue CTA */
  nextHref?: string | null;
  allDone?: boolean;
};

/** Quiet progress strip — not a white dashboard card. */
export function LearnPathProgress({
  steps,
  done: controlledDone,
  nextHref = null,
  allDone = false,
}: Props) {
  const { isAuthenticated } = useUser();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();
  const done = controlledDone ?? steps.map(() => false);
  const completed = done.filter(Boolean).length;
  const pct = Math.round((completed / Math.max(steps.length, 1)) * 100);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-2 border-b border-mist/80">
      <div className="flex-1 min-w-0 max-w-md">
        <p className="text-sm mb-2">
          {isAuthenticated ? (
            allDone ? (
              <span className="font-semibold !text-charcoal">Path complete</span>
            ) : (
              <>
                <span className="font-semibold !text-charcoal">{completed}</span>
                <span className="text-sage"> of {steps.length} done</span>
                {completed > 0 && completed < steps.length && (
                  <span className="text-sage"> — skip ahead to what’s left</span>
                )}
              </>
            )
          ) : (
            <span className="text-sage">{steps.length} lessons in this path</span>
          )}
        </p>
        <div className="h-1 rounded-full bg-mist overflow-hidden">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${isAuthenticated ? Math.max(pct, 0) : 6}%` }}
          />
        </div>
      </div>
      {isAuthenticated && nextHref && !allDone && (
        <Link
          href={nextHref}
          className="text-sm font-semibold text-terracotta hover:underline shrink-0"
        >
          Continue path →
        </Link>
      )}
      {isAuthenticated && allDone && (
        <Link href="/learn" className="text-sm font-semibold text-terracotta hover:underline shrink-0">
          Back to Learn →
        </Link>
      )}
      {!isAuthenticated && (
        <div className="flex gap-4 text-sm shrink-0">
          <button
            type="button"
            onClick={() =>
              openLoginDialog({
                title: "Save path progress",
                subtitle: "Sign in to pick up where you left off.",
              })
            }
            className="font-semibold text-terracotta hover:underline"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() =>
              openSignupDialog({
                title: "Join MixWise free",
                subtitle: "Unlock the full path and save progress.",
              })
            }
            className="font-medium text-forest hover:text-terracotta transition-colors"
          >
            Create account
          </button>
        </div>
      )}
    </div>
  );
}
