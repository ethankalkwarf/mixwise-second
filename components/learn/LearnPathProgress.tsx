"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import type { LearnPathStep } from "@/lib/learnLibrary";

const storageKey = (pathSlug: string, userId: string) =>
  `mixwise-learn-path:${userId}:${pathSlug}`;

type Props = {
  pathSlug: string;
  steps: LearnPathStep[];
  done?: boolean[];
};

/** Quiet progress strip — not a white dashboard card. */
export function LearnPathProgress({ steps, done: controlledDone }: Props) {
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
            <>
              <span className="font-semibold !text-charcoal">{completed}</span>
              <span className="text-sage"> of {steps.length} done</span>
            </>
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

export function useLearnPathDone(pathSlug: string, stepCount: number) {
  const { user, isAuthenticated } = useUser();
  const [done, setDone] = useState<boolean[]>(() => Array(stepCount).fill(false));

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const raw = localStorage.getItem(storageKey(pathSlug, user.id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as boolean[];
      if (Array.isArray(parsed) && parsed.length === stepCount) setDone(parsed);
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, user?.id, pathSlug, stepCount]);

  const toggle = useCallback(
    (index: number) => {
      setDone((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        if (user?.id) {
          localStorage.setItem(storageKey(pathSlug, user.id), JSON.stringify(next));
        }
        return next;
      });
    },
    [pathSlug, user?.id]
  );

  return { done, toggle, isAuthenticated };
}
