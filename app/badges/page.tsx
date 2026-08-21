"use client";

import { useMemo } from "react";
import Link from "next/link";
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
import { countTierBadges, getMixologistTier } from "@/lib/mixologistTiers";
import {
  BadgeGalleryGrid,
  buildBadgeDisplayList,
} from "@/components/badges/BadgeGalleryGrid";
import { TierProgressPanel } from "@/components/badges/TierProgressPanel";
import { AppLink } from "@/components/mobile/AppLink";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";
import { MainContainer } from "@/components/layout/MainContainer";
import { useNativeShell } from "@/hooks/useIsNativeApp";

function useBadgesData() {
  const { isAuthenticated } = useUser();
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

  const tier = getMixologistTier(isAuthenticated ? [...earnedIds] : 0);
  const progress = countTierBadges(isAuthenticated ? [...earnedIds] : []);

  return {
    isAuthenticated,
    earnedIds,
    isLoading,
    refresh,
    allBadges,
    nextQuest,
    tier,
    progress,
    earnedCount: isAuthenticated ? earnedIds.size : 0,
  };
}

function NativeBadgesPage() {
  const router = useRouter();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const {
    isAuthenticated,
    earnedIds,
    isLoading,
    refresh,
    allBadges,
    nextQuest,
    tier,
    earnedCount,
  } = useBadgesData();

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
                : isAuthenticated
                  ? `${tier.name} · ${earnedCount} of ${BADGE_LIST.length} badges`
                  : `Browse ${BADGE_LIST.length} badges`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 pt-5">
        {isAuthenticated && <TierProgressPanel earnedIds={earnedIds} compact />}
        {nextQuest && (
          <AppLink
            href={nextQuest.href}
            className="native-card-link block rounded-[1.75rem] bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
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
          <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
            <p className="font-display text-base font-bold text-forest">Browse every badge</p>
            <p className="mt-1 text-sm text-sage">
              Sign in to earn badges and level up from Beginner to Master Mixologist.
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
        <BadgeGalleryGrid badges={allBadges} columns="native" />
      </div>
    </PullToRefreshContainer>
  );
}

function WebBadgesPage() {
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const {
    isAuthenticated,
    earnedIds,
    isLoading,
    allBadges,
    nextQuest,
    tier,
    progress,
    earnedCount,
  } = useBadgesData();

  return (
    <div className="py-10 sm:py-14">
      <MainContainer>
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="max-w-2xl">
            <h1 className="font-serif text-3xl font-bold text-forest sm:text-4xl">Badges & levels</h1>
            <p className="mt-2 text-sage">
              {isLoading && isAuthenticated
                ? "Loading your progress…"
                : isAuthenticated
                  ? `You're a ${tier.name} with ${progress} counting badges (${earnedCount} total including milestones).`
                  : "Earn achievement badges to climb from Beginner to Master Mixologist."}
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            {isAuthenticated ? (
              <TierProgressPanel earnedIds={earnedIds} />
            ) : (
              <div className="rounded-3xl border border-mist bg-white p-6 sm:p-7">
                <h2 className="font-serif text-xl font-bold text-forest">How levels work</h2>
                <p className="mt-2 text-sm text-sage">
                  Collect achievement badges to unlock levels. Mixologist and Master Mixologist
                  milestone badges are awarded automatically when you hit 5 and 10 counting badges
                  — they don&apos;t add extra progress.
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
                  className="btn-primary mt-5"
                >
                  Sign in to track progress
                </button>
              </div>
            )}

            {nextQuest && isAuthenticated && (
              <Link
                href={nextQuest.href}
                className="rounded-3xl border border-mist bg-white p-6 transition-colors hover:border-olive/40 sm:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                  Suggested next
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-3xl">
                    {nextQuest.badge.icon}
                  </span>
                  <div>
                    <p className="font-serif text-xl font-bold text-forest">
                      {nextQuest.badge.name}
                    </p>
                    <p className="mt-1 text-sm text-sage">
                      {nextQuest.current}/{nextQuest.target} · {nextQuest.cta}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-terracotta"
                    style={{
                      width: `${Math.round((nextQuest.current / nextQuest.target) * 100)}%`,
                    }}
                  />
                </div>
              </Link>
            )}
          </div>

          <section>
            <h2 className="mb-4 font-serif text-xl font-bold text-forest">All badges</h2>
            <BadgeGalleryGrid badges={allBadges} columns="web" />
          </section>
        </div>
      </MainContainer>
    </div>
  );
}

export default function BadgesPage() {
  const native = useNativeShell();
  return native ? <NativeBadgesPage /> : <WebBadgesPage />;
}
