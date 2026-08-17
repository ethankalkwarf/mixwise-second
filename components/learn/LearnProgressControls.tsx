"use client";

import { useEffect, useRef } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import type { LearnLessonKind } from "@/lib/learnProgress";

type Props = {
  kind: Exclude<LearnLessonKind, "path">;
  slug: string;
};

/**
 * Marks the lesson started on view, and offers a saved complete state.
 */
export function LearnProgressControls({ kind, slug }: Props) {
  const { isAuthenticated, isComplete, markStarted, completeLesson, isLoading } =
    useLearnProgress();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();
  const started = useRef(false);
  const done = isComplete(kind, slug);

  useEffect(() => {
    if (!isAuthenticated || started.current || isLoading) return;
    started.current = true;
    void markStarted(kind, slug);
  }, [isAuthenticated, isLoading, kind, slug, markStarted]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-dashed border-mist px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage">Sign in to save this lesson and earn XP.</p>
        <div className="flex gap-4 text-sm">
          <button
            type="button"
            onClick={() =>
              openLoginDialog({
                title: "Save Learn progress",
                subtitle: "Pick up where you left off and earn XP.",
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
                subtitle: "Track lessons, paths, and badges.",
              })
            }
            className="font-medium text-forest hover:text-terracotta"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-olive/30 bg-olive/10 px-5 py-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-forest">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-forest">Lesson complete</p>
          <p className="text-sm text-sage">Saved to your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void completeLesson(kind, slug)}
      className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
    >
      Mark complete · earn XP
    </button>
  );
}
