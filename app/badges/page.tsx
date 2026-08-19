"use client";

import { useMemo } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { getNextBadgeQuest } from "@/lib/mobile/badgeProgress";
import { BADGE_LIST } from "@/lib/badges";
import {
  BadgeGalleryGrid,
  buildBadgeDisplayList,
} from "@/components/badges/BadgeGalleryGrid";
import { AppLink } from "@/components/mobile/AppLink";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";

export default function BadgesPage() {
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { ingredientIds } = useBarIngredients();
  const { favorites } = useFavorites();
  const { earnedIds, rows, isLoading, refresh } = useUserBadges();

  const earnedTimes = useMemo(
    () => new Map(rows.map((row) => [row.badge_id, row.earned_at])),
    [rows]
  );

  const allBadges = useMemo(
    () => buildBadgeDisplayList(isAuthenticated ? earnedIds : new Set(), earnedTimes),
    [earnedIds, earnedTimes, isAuthenticated]
  );

  const nextQuest = getNextBadgeQuest({
    earnedIds: isAuthenticated ? earnedIds : new Set(),
    barCount: ingredientIds.length,
    favoriteCount: favorites.length,
  });

  const earnedCount = isAuthenticated ? earnedIds.size : 0;

  return (
    <PullToRefreshContainer
      className="min-h-screen bg-gradient-to-b from-cream via-cream to-mist/30 pb-10"
      onRefresh={async () => {
        if (isAuthenticated) await refresh();
      }}
    >
      <div
        className="sticky top-0 z-10 border-b border-mist/60 bg-cream/95 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-sm"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold text-forest">Badges</h1>
            <p className="text-sm text-sage">
              {isLoading && isAuthenticated
                ? "Loading…"
                : `${earnedCount} of ${BADGE_LIST.length} earned`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {nextQuest && (
          <AppLink
            href={nextQuest.href}
            className="native-card-link mb-6 block rounded-[1.75rem] bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              Up next
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-2xl">
                {nextQuest.badge.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold leading-tight text-forest">
                  {nextQuest.badge.name}
                </span>
                <span className="mt-0.5 block text-sm text-sage">
                  {nextQuest.current}/{nextQuest.target} · {nextQuest.cta}
                </span>
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-terracotta transition-all"
                style={{
                  width: `${Math.round((nextQuest.current / nextQuest.target) * 100)}%`,
                }}
              />
            </div>
          </AppLink>
        )}

        {!isAuthenticated && (
          <div className="mb-6 rounded-[1.75rem] bg-white p-4 shadow-sm">
            <p className="font-display text-base font-bold text-forest">Browse every badge</p>
            <p className="mt-1 text-sm text-sage">
              You can explore quests as a guest. Sign in to earn badges and keep progress in sync.
            </p>
            <button
              type="button"
              onClick={() =>
                openAuthDialog({
                  mode: preferredAuthMode,
                  title: "Start earning badges",
                  subtitle: "Free account — syncs your bar, favorites, and achievements.",
                })
              }
              className="mt-3 flex w-full items-center justify-center rounded-2xl bg-terracotta py-2.5 text-sm font-bold text-cream"
            >
              Join to earn
            </button>
          </div>
        )}

        <BadgeGalleryGrid badges={allBadges} />
      </div>
    </PullToRefreshContainer>
  );
}
