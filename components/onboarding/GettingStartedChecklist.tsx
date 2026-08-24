"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XMarkIcon,
  BookOpenIcon,
  HeartIcon,
  ShareIcon,
  BeakerIcon,
  Squares2X2Icon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { CHECKLIST_ITEMS, type ChecklistItemId } from "@/lib/onboardingChecklist";
import { isNativeApp } from "@/lib/mobile/platform";
import { AppLink } from "@/components/mobile/AppLink";
import { LearnProgressBoundary } from "@/components/learn/LearnProgressBoundary";
import { useUser } from "@/components/auth/UserProvider";
import { createClient } from "@/lib/supabase/client";
import { BADGES } from "@/lib/badges";

const ICONS: Record<ChecklistItemId, typeof DocumentTextIcon> = {
  recipe: DocumentTextIcon,
  collection: Squares2X2Icon,
  save: HeartIcon,
  make: BeakerIcon,
  share: ShareIcon,
  lesson: BookOpenIcon,
};

type Props = {
  /** Tighter spacing for native home */
  compact?: boolean;
};

export function GettingStartedChecklist({ compact = false }: Props) {
  return (
    <LearnProgressBoundary>
      <GettingStartedChecklistInner compact={compact} />
    </LearnProgressBoundary>
  );
}

function GettingStartedChecklistInner({ compact = false }: Props) {
  const {
    visible,
    showCelebration,
    canDismiss,
    dismiss,
    completion,
    completedCount,
    totalCount,
  } = useOnboardingChecklist();
  const { user } = useUser();
  const awardedRef = useRef(false);

  const native = isNativeApp();
  const LinkComponent = native ? AppLink : Link;
  const pct = Math.round((completedCount / totalCount) * 100);

  // Hooks must run every render — do not early-return before useMemo.
  const sortedItems = useMemo(
    () =>
      [...CHECKLIST_ITEMS].sort((a, b) => {
        const aDone = completion[a.id] ? 1 : 0;
        const bDone = completion[b.id] ? 1 : 0;
        return aDone - bDone;
      }),
    [completion]
  );

  useEffect(() => {
    if (!showCelebration || !user?.id || awardedRef.current) return;
    awardedRef.current = true;
    const supabase = createClient();
    void supabase.from("user_badges").upsert(
      {
        user_id: user.id,
        badge_id: "home_bartender",
        metadata: {
          source: "getting_started_checklist",
          completed_at: new Date().toISOString(),
        },
      },
      { onConflict: "user_id,badge_id" }
    );
  }, [showCelebration, user?.id]);

  if (!visible && !showCelebration) return null;

  const shell = compact
    ? "rounded-2xl border border-mist bg-white p-4"
    : "rounded-3xl border border-mist bg-white p-5 sm:p-6";

  if (showCelebration) {
    const badge = BADGES.home_bartender;
    return (
      <section
        className={compact ? "mb-8" : "py-8 sm:py-10"}
        aria-label="Getting started complete"
      >
        <div className={shell}>
          <div className="text-center">
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-3xl"
              aria-hidden
            >
              {badge.icon}
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold text-forest sm:text-xl">
              You&apos;re set up
            </h2>
            <p className="mt-1 text-sm text-sage">
              You earned the {badge.name} badge. Keep exploring — your next quest
              is waiting on Home.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <LinkComponent
                href="/badges"
                className="inline-flex items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream"
              >
                View badges
              </LinkComponent>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center justify-center rounded-xl border border-mist px-4 py-2.5 text-sm font-semibold text-forest"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={compact ? "mb-8" : "py-8 sm:py-10"}
      aria-label="Getting started checklist"
    >
      <div className={shell}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-forest sm:text-xl">
                Getting started
              </h2>
              <span className="shrink-0 text-xs font-medium tabular-nums text-sage">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="mt-1 text-sm text-sage">
              Try these to get the most from MixWise.
            </p>
          </div>
          {canDismiss ? (
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1.5 text-sage transition hover:bg-mist/60 hover:text-forest"
              aria-label="Dismiss getting started checklist"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div
          className="mb-4 h-1 overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-olive transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="space-y-1.5">
          {sortedItems.map((item) => {
            const done = completion[item.id];
            const Icon = ICONS[item.id];
            return (
              <li key={item.id}>
                <LinkComponent
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition outline-none focus:outline-none ${
                    done
                      ? "bg-mist/40 text-sage"
                      : "border border-transparent bg-cream/50 hover:border-mist hover:bg-cream"
                  }`}
                >
                  <span className="shrink-0">
                    {done ? (
                      <CheckCircleSolid className="h-5 w-5 text-olive" aria-hidden />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-mist bg-white">
                        <Icon className="h-3 w-3 text-sage" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold ${
                        done ? "text-sage line-through" : "text-forest"
                      }`}
                    >
                      {item.title}
                    </span>
                    {!done && (
                      <span className="block text-xs text-sage">{item.description}</span>
                    )}
                  </span>
                  {!done && (
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-mist" aria-hidden />
                  )}
                </LinkComponent>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
