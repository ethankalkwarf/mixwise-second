"use client";

import Link from "next/link";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { LearnProgressProvider, useLearnProgress } from "@/hooks/useLearnProgress";

export function DashboardLearnCard() {
  return (
    <LearnProgressProvider>
      <DashboardLearnCardInner />
    </LearnProgressProvider>
  );
}

function DashboardLearnCardInner() {
  const {
    isLoading,
    isAuthenticated,
    hasStarted,
    level,
    lessonsDone,
    lessonsTotal,
    pathStats,
    continueHref: nextHref,
  } = useLearnProgress();

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <section className="card overflow-hidden">
        <div className="p-6 animate-pulse space-y-3">
          <div className="h-6 bg-mist rounded-lg w-40" />
          <div className="h-4 bg-mist rounded-lg w-full" />
        </div>
      </section>
    );
  }

  if (!hasStarted) {
    return (
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-mist">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terracotta/15 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-forest">Learn Mixology</h2>
              <span className="text-sm text-sage">Optional, when you want it</span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-sage">
            Optional lessons on technique, spirits, and tasting — start when you want.
          </p>
          <Link
            href="/learn"
            className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group"
          >
            <span className="text-forest group-hover:text-terracotta font-medium transition-colors">
              Start a lesson
            </span>
            <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-mist">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-terracotta/15 rounded-xl flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5 text-terracotta" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-forest">Learn Mixology</h2>
            <span className="text-sm text-sage block min-h-[1.25rem]">
              {`${level.name} · ${level.xp} XP · ${lessonsDone}/${lessonsTotal} lessons`}
            </span>
          </div>
        </div>
        <Link
          href="/learn"
          className="text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium"
        >
          Library →
        </Link>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-terracotta">
              Level {level.level}
            </span>
            <span className="text-sage">
              {level.nextAt ? `${level.xp} / ${level.nextAt} XP` : `${level.xp} XP`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-mist overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-500"
              style={{ width: `${level.progressPct}%` }}
            />
          </div>
        </div>

        <ul className="space-y-3">
          {pathStats.map(({ path, done, total, pct }) => (
            <li key={path.slug}>
              <Link href={`/learn/paths/${path.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-forest group-hover:text-terracotta transition-colors">
                    {path.title}
                  </p>
                  <p className="text-xs text-sage shrink-0">
                    {done}/{total}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-mist overflow-hidden">
                  <div
                    className="h-full rounded-full bg-olive transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={nextHref || "/learn"}
          className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group"
        >
          <span className="text-forest group-hover:text-terracotta font-medium transition-colors">
            Continue learning
          </span>
          <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
        </Link>
      </div>
    </section>
  );
}
