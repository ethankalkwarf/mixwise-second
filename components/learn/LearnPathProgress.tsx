"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { pathStepHref, type LearnPathStep } from "@/lib/learnLibrary";

const storageKey = (pathSlug: string, userId: string) =>
  `mixwise-learn-path:${userId}:${pathSlug}`;

type Props = {
  pathSlug: string;
  steps: LearnPathStep[];
};

export function LearnPathProgress({ pathSlug, steps }: Props) {
  const { user, isAuthenticated } = useUser();
  const { openSignupDialog } = useAuthDialog();
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const raw = localStorage.getItem(storageKey(pathSlug, user.id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as boolean[];
      if (Array.isArray(parsed) && parsed.length === steps.length) {
        setDone(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, user?.id, pathSlug, steps.length]);

  const persist = useCallback(
    (next: boolean[]) => {
      setDone(next);
      if (!user?.id) return;
      localStorage.setItem(storageKey(pathSlug, user.id), JSON.stringify(next));
    },
    [pathSlug, user?.id]
  );

  const completed = done.filter(Boolean).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-mist bg-white px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold">
            Your progress
          </p>
          <p className="text-sm text-charcoal/80 font-medium">
            {isAuthenticated
              ? `${completed} of ${steps.length} steps · ${pct}%`
              : "Sign in to save path progress on this device"}
          </p>
        </div>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() =>
              openSignupDialog({
                title: "Save your learning progress",
                subtitle: "Free account — pick up paths where you left off.",
              })
            }
            className="text-sm font-semibold text-terracotta hover:underline"
          >
            Sign in
          </button>
        )}
      </div>
      <div className="h-2 rounded-full bg-mist overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-terracotta transition-all duration-500"
          style={{ width: `${isAuthenticated ? pct : 0}%` }}
        />
      </div>
      {isAuthenticated && (
        <ul className="space-y-2">
          {steps.map((step, index) => {
            const href = pathStepHref(step);
            const checked = done[index];
            return (
              <li key={`${href}-${index}`} className="flex items-center gap-3">
                <button
                  type="button"
                  aria-pressed={checked}
                  onClick={() => {
                    const next = [...done];
                    next[index] = !next[index];
                    persist(next);
                  }}
                  className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center text-[10px] font-bold transition-colors ${
                    checked
                      ? "border-terracotta bg-terracotta text-cream"
                      : "border-mist bg-cream text-transparent hover:border-terracotta/50"
                  }`}
                >
                  ✓
                </button>
                <a href={href} className="text-sm text-forest hover:text-terracotta capitalize">
                  Step {index + 1}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
