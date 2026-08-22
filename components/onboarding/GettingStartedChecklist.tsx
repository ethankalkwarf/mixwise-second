"use client";

import { useMemo } from "react";
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
    canDismiss,
    dismiss,
    completion,
    completedCount,
    totalCount,
  } = useOnboardingChecklist();

  if (!visible) return null;

  const native = isNativeApp();
  const LinkComponent = native ? AppLink : Link;
  const pct = Math.round((completedCount / totalCount) * 100);

  const sortedItems = useMemo(
    () =>
      [...CHECKLIST_ITEMS].sort((a, b) => {
        const aDone = completion[a.id] ? 1 : 0;
        const bDone = completion[b.id] ? 1 : 0;
        return aDone - bDone;
      }),
    [completion]
  );

  return (
    <section
      className={compact ? "mb-8" : "py-8 sm:py-10"}
      aria-label="Getting started checklist"
    >
      <div
        className={
          compact
            ? "rounded-2xl border border-mist bg-white p-4"
            : "rounded-3xl border border-mist bg-white p-5 sm:p-6"
        }
      >
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
