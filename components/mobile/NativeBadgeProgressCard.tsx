"use client";

import { useMemo, type ReactNode } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { getNextBadgeQuest } from "@/lib/mobile/badgeProgress";
import { BADGE_LIST, RARITY_COLORS } from "@/lib/badges";

type Props = {
  compact?: boolean;
  /** Home: quest only, no emoji strip. */
  hidePreview?: boolean;
};

export function NativeBadgeProgressCard({ compact = false, hidePreview = false }: Props) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { ingredientIds } = useBarIngredients();
  const { favorites } = useFavorites();
  const { earnedIds, earned, nextQuest, isLoading } = useUserBadges();

  const guestQuest = getNextBadgeQuest({
    earnedIds: new Set(),
    barCount: ingredientIds.length,
    favoriteCount: favorites.length,
  });

  const quest = isAuthenticated ? nextQuest : guestQuest;
  const earnedCount = isAuthenticated ? earned.length : 0;
  const previewEarnedIds = isAuthenticated ? earnedIds : new Set<string>();

  const previewBadges = useMemo(() => BADGE_LIST.slice(0, 8), []);

  if (authLoading) return null;
  if (isLoading && isAuthenticated) return null;
  if (!quest && earnedCount === 0) return null;

  const pct = quest ? Math.round((quest.current / quest.target) * 100) : 100;
  const margin = compact ? "mb-4" : "mb-9";

  return (
    <section className={margin}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest">Badges</h2>
          <p className="text-sm text-sage">
            {earnedCount} of {BADGE_LIST.length} earned
          </p>
        </div>
        <AppLink
          href="/badges"
          className="flex-shrink-0 text-sm font-semibold text-terracotta"
        >
          See all
        </AppLink>
      </div>

        {!hidePreview ? (
          <AppLink
            href="/badges"
            className="native-card-link mb-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="View all badges"
          >
            {previewBadges.map((badge) => {
              const unlocked = previewEarnedIds.has(badge.id);
              return (
                <span
                  key={badge.id}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl ${
                    unlocked
                      ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} shadow-sm`
                      : "bg-mist/80 opacity-60 grayscale"
                  }`}
                  aria-hidden
                >
                  {badge.icon}
                </span>
              );
            })}
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-sage shadow-sm">
              +{BADGE_LIST.length - previewBadges.length}
            </span>
          </AppLink>
        ) : null}

      {quest ? (
        isAuthenticated ? (
          <AppLink
            href={quest.href}
            className="native-card-link flex flex-col rounded-[1.75rem] bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <QuestCopy quest={quest} pct={pct} trailing={
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-sage" aria-hidden />
            } />
          </AppLink>
        ) : (
          <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              Up next
            </p>
            <div className="mt-2 flex items-center gap-3">
              <AppLink
                href={quest.href}
                className="native-flex-hit flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-2xl">
                  {quest.badge.icon}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-display text-lg font-bold leading-tight text-forest">
                    {quest.badge.name}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-sage">
                    {quest.current}/{quest.target} · {quest.cta}
                  </span>
                </span>
              </AppLink>
              <button
                type="button"
                onClick={() =>
                  openAuthDialog({
                    mode: preferredAuthMode,
                    title: "Save your progress",
                    subtitle: "Create a free account to earn badges and keep your bar in sync.",
                  })
                }
                className="native-compact-cta rounded-full bg-terracotta px-3.5 py-2 text-xs font-bold text-cream"
              >
                Join now
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      ) : (
        <AppLink
          href="/badges"
          className="native-card-link flex items-center gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-olive/15 text-2xl">
            🏆
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold text-forest">
              {earnedCount} badge{earnedCount === 1 ? "" : "s"} earned
            </span>
            <span className="text-sm text-sage">View your collection</span>
          </span>
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-sage" />
        </AppLink>
      )}
    </section>
  );
}

function QuestCopy({
  quest,
  pct,
  trailing,
}: {
  quest: NonNullable<ReturnType<typeof getNextBadgeQuest>>;
  pct: number;
  trailing?: ReactNode;
}) {
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
        Up next
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-2xl">
          {quest.badge.icon}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-display text-lg font-bold leading-tight text-forest">
            {quest.badge.name}
          </span>
          <span className="mt-0.5 block truncate text-sm text-sage">
            {quest.current}/{quest.target} · {quest.cta}
          </span>
        </span>
        {trailing}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}
