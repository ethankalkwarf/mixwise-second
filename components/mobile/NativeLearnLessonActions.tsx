"use client";

import { useNativeShell } from "@/hooks/useIsNativeApp";
import {
  LearnLessonChallengeButton,
  useLearnLessonChallengeVisibility,
} from "@/components/learn/LearnLessonChallenge";
import type { LearnLessonKind } from "@/lib/learnProgress";

type Props = {
  kind: Exclude<LearnLessonKind, "path">;
  slug: string;
  /** Inline controls shown on web; hidden on native when sticky bar is used. */
  inline?: boolean;
};

export function NativeLearnLessonActions({ kind: _kind, slug: _slug, inline = false }: Props) {
  const nativeShell = useNativeShell();
  const visible = useLearnLessonChallengeVisibility();

  if (nativeShell && inline) {
    return <div className="hidden" aria-hidden />;
  }

  if (nativeShell && !inline) {
    if (!visible) return null;
    return (
      <div className="native-learn-lesson-actions learn-lesson-cta-enter">
        <LearnLessonChallengeButton />
      </div>
    );
  }

  if (!inline) return null;

  return <LearnLessonChallengeButton />;
}
