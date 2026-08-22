"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { hasMixedAny, POUR_STREAK_EVENT } from "@/lib/mobile/pourStreak";
import {
  canDismissChecklist,
  CHECKLIST_ITEMS,
  CHECKLIST_UPDATE_EVENT,
  dismissChecklist,
  getChecklistCompletion,
  incompleteChecklistIds,
  isChecklistComplete,
  isChecklistDismissed,
  type ChecklistItemId,
} from "@/lib/onboardingChecklist";

export function useOnboardingChecklist() {
  const { user } = useUser();
  const { recentlyViewed } = useRecentlyViewed();
  const { favorites } = useFavorites();
  const { hasStarted } = useLearnProgress();
  const [mixedAny, setMixedAny] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);

  const bump = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    setMixedAny(hasMixedAny());
    setDismissed(isChecklistDismissed(user?.id));

    const onPour = () => {
      setMixedAny(hasMixedAny());
      bump();
    };
    const onChecklist = () => {
      setDismissed(isChecklistDismissed(user?.id));
      bump();
    };

    window.addEventListener(POUR_STREAK_EVENT, onPour);
    window.addEventListener(CHECKLIST_UPDATE_EVENT, onChecklist);
    return () => {
      window.removeEventListener(POUR_STREAK_EVENT, onPour);
      window.removeEventListener(CHECKLIST_UPDATE_EVENT, onChecklist);
    };
  }, [user?.id, bump]);

  const completion = useMemo(
    () =>
      getChecklistCompletion({
        viewedRecipe: recentlyViewed.length > 0,
        savedDrink: favorites.length > 0,
        startedLesson: hasStarted,
        mixedAny,
      }),
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick refreshes localStorage flags
    [recentlyViewed.length, favorites.length, hasStarted, mixedAny, tick]
  );

  const incomplete = useMemo(() => incompleteChecklistIds(completion), [completion]);
  const complete = useMemo(() => isChecklistComplete(completion), [completion]);
  const canDismiss = useMemo(() => canDismissChecklist(completion), [completion]);

  const visible = !dismissed && !complete;

  const dismiss = useCallback(() => {
    if (!canDismiss) return;
    dismissChecklist(user?.id);
    setDismissed(true);
  }, [canDismiss, user?.id]);

  const completedCount = CHECKLIST_ITEMS.length - incomplete.length;

  return {
    completion,
    incomplete,
    complete,
    canDismiss,
    visible,
    dismiss,
    completedCount,
    totalCount: CHECKLIST_ITEMS.length,
    isComplete: (id: ChecklistItemId) => completion[id],
  };
}
