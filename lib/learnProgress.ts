/**
 * Learn XP, catalog totals, and derived path/dashboard stats.
 */

import {
  LEARN_GUIDES,
  LEARN_LIBRARY_METHODS,
  LEARN_PATHS,
  pathStepHref,
  pathStepLabel,
  type LearnPath,
  type LearnPathStep,
} from "@/lib/learnLibrary";
import { getAllTechniqueLearnEntries } from "@/lib/cocktailTechniqueGlossary";
import type { LearnProgressRow } from "@/lib/supabase/database.types";

export type LearnLessonKind = "guide" | "method" | "technique" | "path";

export const LEARN_XP = {
  guide: 25,
  method: 20,
  technique: 15,
  path: 50,
  checkBonus: 5,
} as const;

const LEVELS: { minXp: number; name: string }[] = [
  { minXp: 0, name: "New pour" },
  { minXp: 40, name: "Home bartender" },
  { minXp: 100, name: "Shaker" },
  { minXp: 175, name: "Palate" },
  { minXp: 275, name: "Sour hand" },
  { minXp: 400, name: "Scholar" },
];

export function lessonKey(kind: LearnLessonKind, slug: string): string {
  return `${kind}:${slug}`;
}

export function xpForCompletion(
  kind: Exclude<LearnLessonKind, "path">,
  checksCorrect = 0
): number {
  return LEARN_XP[kind] + checksCorrect * LEARN_XP.checkBonus;
}

export function learnLevelFromXp(xp: number): {
  level: number;
  name: string;
  xp: number;
  nextAt: number | null;
  progressPct: number;
} {
  let current = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = LEVELS[1] ?? null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const span = next ? next.minXp - current.minXp : 1;
  const into = xp - current.minXp;
  return {
    level: LEVELS.indexOf(current) + 1,
    name: current.name,
    xp,
    nextAt: next?.minXp ?? null,
    progressPct: next ? Math.min(100, Math.round((into / span) * 100)) : 100,
  };
}

export function catalogLessonCount(): number {
  return (
    LEARN_GUIDES.length + LEARN_LIBRARY_METHODS.length + getAllTechniqueLearnEntries().length
  );
}

export function stepLessonRef(step: LearnPathStep): { kind: LearnLessonKind; slug: string } | null {
  switch (step.type) {
    case "guide":
      return { kind: "guide", slug: step.slug };
    case "method":
      return { kind: "method", slug: step.slug };
    case "technique":
      return { kind: "technique", slug: step.slug };
    case "swaps":
      // Smart swaps reference page; progress tracks the paired guide lesson.
      return { kind: "guide", slug: "swap-with-intent" };
  }
}

export function isStepComplete(
  step: LearnPathStep,
  completed: Set<string>
): boolean {
  const ref = stepLessonRef(step);
  if (!ref) return false;
  return completed.has(lessonKey(ref.kind, ref.slug));
}

export function pathProgress(
  path: LearnPath,
  completed: Set<string>
): { done: number; total: number; pct: number; nextIndex: number } {
  const flags = path.steps.map((step) => isStepComplete(step, completed));
  const done = flags.filter(Boolean).length;
  const nextIndex = flags.findIndex((flag) => !flag);
  return {
    done,
    total: path.steps.length,
    pct: Math.round((done / Math.max(path.steps.length, 1)) * 100),
    nextIndex: nextIndex === -1 ? path.steps.length : nextIndex,
  };
}

export function continueHref(rows: LearnProgressRow[]): string | null {
  const started = rows
    .filter((row) => row.status === "started" && row.lesson_kind !== "path")
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];
  if (started) return lessonHref(started.lesson_kind, started.lesson_slug);

  for (const path of LEARN_PATHS) {
    const completed = completedKeys(rows);
    const progress = pathProgress(path, completed);
    if (progress.done < progress.total) {
      const step = path.steps[progress.nextIndex];
      return pathStepHref(step);
    }
  }

  return "/learn";
}

export function lessonHref(kind: string, slug: string): string {
  if (kind === "guide") return `/learn/guides/${slug}`;
  if (kind === "method") return `/learn/methods/${slug}`;
  if (kind === "technique") return `/learn/techniques/${slug}`;
  if (kind === "path") return `/learn/paths/${slug}`;
  return "/learn";
}

export function completedKeys(rows: LearnProgressRow[]): Set<string> {
  return new Set(
    rows
      .filter((row) => row.status === "completed" && row.lesson_kind !== "path")
      .map((row) => lessonKey(row.lesson_kind, row.lesson_slug))
  );
}

export function totalXp(rows: LearnProgressRow[]): number {
  return rows.reduce((sum, row) => sum + (row.xp || 0), 0);
}

export function completedLessonCount(rows: LearnProgressRow[]): number {
  return rows.filter((row) => row.status === "completed" && row.lesson_kind !== "path").length;
}

export function nextStepLabel(path: LearnPath, completed: Set<string>): string | null {
  const progress = pathProgress(path, completed);
  if (progress.done >= progress.total) return null;
  return pathStepLabel(path.steps[progress.nextIndex]);
}
