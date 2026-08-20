"use client";

import { useMemo, type ReactNode } from "react";
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

/**
 * Home / Saved badge progress — editorial quest strip, not a SaaS widget card.
 */
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

  const pct = quest ? Math.min(100, Math.round((quest.current / quest.target) * 100)) : 100;
  const margin = compact ? "mb-5" : "mb-10";

  return (
    <section className={margin}>
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.65rem] font-bold leading-none tracking-tight text-forest">
          Badges
        </h2>
        <AppLink href="/badges" className="text-[13px] font-semibold text-terracotta">
          {earnedCount}/{BADGE_LIST.length}
        </AppLink>
      </div>

      {!hidePreview ? (
        <AppLink
          href="/badges"
          className="native-card-link mb-4 flex flex-row gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="View all badges"
        >
          {previewBadges.map((badge) => {
            const unlocked = previewEarnedIds.has(badge.id);
            return (
              <span
                key={badge.id}
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                  unlocked
                    ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} shadow-sm`
                    : "bg-mist/70 opacity-55 grayscale"
                }`}
                aria-hidden
              >
                {badge.icon}
              </span>
            );
          })}
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-mist/80 text-xs font-bold text-sage">
            +{BADGE_LIST.length - previewBadges.length}
          </span>
        </AppLink>
      ) : null}

      {quest ? (
        <QuestBoard
          quest={quest}
          pct={pct}
          href={quest.href}
          secondaryAction={
            isAuthenticated ? null : (
              <button
                type="button"
                onClick={() =>
                  openAuthDialog({
                    mode: preferredAuthMode,
                    title: "Save your progress",
                    subtitle: "Create a free account to earn badges and keep your bar in sync.",
                  })
                }
                className="text-left text-[13px] font-semibold text-cream/80 underline decoration-cream/25 underline-offset-4"
              >
                Join free to keep progress
              </button>
            )
          }
        />
      ) : (
        <AppLink href="/badges" className="native-card-link block">
          <div className="border-y border-forest/10 py-5">
            <p className="font-display text-2xl font-bold tracking-tight text-forest">
              {earnedCount} badge{earnedCount === 1 ? "" : "s"} earned
            </p>
            <p className="mt-1 text-sm text-sage">Open your collection</p>
          </div>
        </AppLink>
      )}
    </section>
  );
}

function QuestBoard({
  quest,
  pct,
  href,
  secondaryAction,
}: {
  quest: NonNullable<ReturnType<typeof getNextBadgeQuest>>;
  pct: number;
  href: string;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] bg-forest px-5 py-5 text-cream">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-terracotta/25 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-olive/20 blur-2xl"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/55">Up next</p>
          <p className="font-mono text-[11px] font-bold tabular-nums text-cream/55">
            {quest.current}/{quest.target}
          </p>
        </div>

        <AppLink href={href} className="native-card-link mt-3 flex flex-col items-start gap-2">
          <h3 className="font-display text-[1.85rem] font-bold leading-[1.05] tracking-tight text-cream">
            {quest.badge.name}
          </h3>
          <p className="max-w-[18rem] text-[15px] leading-snug text-cream/70">{quest.cta}</p>
        </AppLink>

        <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-cream/15">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
          />
        </div>

        <div className="mt-4 flex flex-col items-start gap-3">
          <AppLink
            href={href}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cream"
          >
            Continue
            <span aria-hidden>→</span>
          </AppLink>
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}
