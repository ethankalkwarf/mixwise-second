"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { checkLearnBadges } from "@/lib/badgeEngine";
import {
  trackLearnLessonCompleted,
  trackLearnLessonStarted,
} from "@/lib/analytics";
import { LEARN_GUIDES, LEARN_PATHS } from "@/lib/learnLibrary";
import {
  LEARN_XP,
  catalogLessonCount,
  completedKeys,
  completedLessonCount,
  continueHref,
  learnLevelFromXp,
  lessonKey,
  pathProgress,
  stepLessonRef,
  totalXp,
  xpForCompletion,
  type LearnLessonKind,
} from "@/lib/learnProgress";
import type { LearnProgressRow } from "@/lib/supabase/database.types";

type CompleteResult = { newlyCompleted: boolean; xpEarned?: number };

type LearnProgressApi = {
  rows: LearnProgressRow[];
  isLoading: boolean;
  isAuthenticated: boolean;
  completed: Set<string>;
  xp: number;
  level: ReturnType<typeof learnLevelFromXp>;
  lessonsDone: number;
  lessonsTotal: number;
  hasStarted: boolean;
  pathStats: Array<ReturnType<typeof pathProgress> & { path: (typeof LEARN_PATHS)[number] }>;
  continueHref: string | null;
  isComplete: (kind: LearnLessonKind, slug: string) => boolean;
  markStarted: (kind: Exclude<LearnLessonKind, "path">, slug: string) => Promise<void>;
  completeLesson: (
    kind: Exclude<LearnLessonKind, "path">,
    slug: string,
    checks?: { correct: number; total: number }
  ) => Promise<CompleteResult>;
  uncompleteLesson: (kind: Exclude<LearnLessonKind, "path">, slug: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const LearnProgressContext = createContext<LearnProgressApi | null>(null);

function useLearnProgressState(): LearnProgressApi {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const toast = useToast();
  const [rows, setRows] = useState<LearnProgressRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);
  const fetching = useRef(false);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const load = useCallback(
    async (userId: string) => {
      if (fetching.current) return;
      fetching.current = true;
      try {
        const { data, error } = await supabase
          .from("learn_progress")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error loading learn progress:", error);
        } else {
          setRows((data || []) as LearnProgressRow[]);
        }
        lastUserId.current = userId;
      } finally {
        fetching.current = false;
        setIsLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      setRows([]);
      setIsLoading(false);
      lastUserId.current = null;
      return;
    }
    if (lastUserId.current === user.id) return;
    void load(user.id);
  }, [authLoading, isAuthenticated, user, load]);

  const completed = useMemo(() => completedKeys(rows), [rows]);
  const xp = useMemo(() => totalXp(rows), [rows]);
  const level = useMemo(() => learnLevelFromXp(xp), [xp]);
  const lessonsDone = useMemo(() => completedLessonCount(rows), [rows]);
  const lessonsTotal = catalogLessonCount();

  const isComplete = useCallback(
    (kind: LearnLessonKind, slug: string) => completed.has(lessonKey(kind, slug)),
    [completed]
  );

  const markStarted = useCallback(
    async (kind: Exclude<LearnLessonKind, "path">, slug: string) => {
      if (!user?.id) return;
      const current = rowsRef.current;
      if (current.some((row) => row.lesson_kind === kind && row.lesson_slug === slug)) return;

      const { data, error } = await supabase
        .from("learn_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_kind: kind,
            lesson_slug: slug,
            status: "started",
            xp: 0,
          },
          { onConflict: "user_id,lesson_kind,lesson_slug" }
        )
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error starting learn lesson:", error);
        return;
      }
      if (data) {
        setRows((prev) => {
          if (prev.some((row) => row.lesson_kind === kind && row.lesson_slug === slug)) return prev;
          return [data as LearnProgressRow, ...prev];
        });
        void trackLearnLessonStarted(kind, slug);
      }
    },
    [user?.id, supabase]
  );

  const completeLesson = useCallback(
    async (
      kind: Exclude<LearnLessonKind, "path">,
      slug: string,
      checks?: { correct: number; total: number }
    ): Promise<CompleteResult> => {
      if (!user?.id) return { newlyCompleted: false };

      const current = rowsRef.current;
      const already = current.find(
        (row) => row.lesson_kind === kind && row.lesson_slug === slug && row.status === "completed"
      );
      if (already) return { newlyCompleted: false };

      const xpEarned = xpForCompletion(kind, checks?.correct ?? 0);
      const { data, error } = await supabase
        .from("learn_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_kind: kind,
            lesson_slug: slug,
            status: "completed",
            xp: xpEarned,
            checks_correct: checks?.correct ?? 0,
            checks_total: checks?.total ?? 0,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_kind,lesson_slug" }
        )
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error completing learn lesson:", error);
        return { newlyCompleted: false };
      }

      let nextRows = current;
      if (data) {
        const row = data as LearnProgressRow;
        nextRows = [
          row,
          ...current.filter((r) => !(r.lesson_kind === kind && r.lesson_slug === slug)),
        ];
        setRows(nextRows);
        rowsRef.current = nextRows;
      }

      const keys = completedKeys(nextRows);
      const newlyFinishedPaths: string[] = [];
      const finishedPaths: string[] = [];

      for (const path of LEARN_PATHS) {
        const progress = pathProgress(path, keys);
        if (progress.done < progress.total) continue;
        finishedPaths.push(path.slug);

        const pathRow = nextRows.find(
          (r) => r.lesson_kind === "path" && r.lesson_slug === path.slug && r.status === "completed"
        );
        if (pathRow) continue;

        const { data: savedPath } = await supabase
          .from("learn_progress")
          .upsert(
            {
              user_id: user.id,
              lesson_kind: "path",
              lesson_slug: path.slug,
              status: "completed",
              xp: LEARN_XP.path,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,lesson_kind,lesson_slug" }
          )
          .select("*")
          .maybeSingle();

        if (savedPath) {
          newlyFinishedPaths.push(path.slug);
          nextRows = [
            savedPath as LearnProgressRow,
            ...nextRows.filter(
              (r) => !(r.lesson_kind === "path" && r.lesson_slug === path.slug)
            ),
          ];
          setRows(nextRows);
          rowsRef.current = nextRows;
        }
      }

      const completedGuides = LEARN_GUIDES.filter((g) =>
        keys.has(lessonKey("guide", g.slug))
      ).length;
      const result = await checkLearnBadges(
        supabase,
        user.id,
        completedLessonCount(nextRows),
        completedGuides,
        LEARN_GUIDES.length,
        finishedPaths
      );

      toast.success("Lesson complete — saved to your progress");
      for (const pathSlug of newlyFinishedPaths) {
        const path = LEARN_PATHS.find((p) => p.slug === pathSlug);
        toast.success(`Course complete${path ? `: ${path.title}` : ""}`);
      }
      for (const badge of result.awarded) {
        toast.success(`Badge unlocked: ${badge.name}`);
      }

      void trackLearnLessonCompleted(kind, slug, {
        xp: xpEarned,
        checks_correct: checks?.correct,
        checks_total: checks?.total,
      });

      return { newlyCompleted: true, xpEarned };
    },
    [user?.id, supabase, toast]
  );

  const uncompleteLesson = useCallback(
    async (kind: Exclude<LearnLessonKind, "path">, slug: string) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("learn_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_kind", kind)
        .eq("lesson_slug", slug);
      if (error) {
        console.error("Error clearing learn lesson:", error);
        return;
      }

      const remaining = rowsRef.current.filter(
        (row) => !(row.lesson_kind === kind && row.lesson_slug === slug)
      );
      const keys = completedKeys(remaining);
      const stalePaths = LEARN_PATHS.filter((path) => {
        const stillDone = pathProgress(path, keys).done >= path.steps.length;
        const hadPath = remaining.some(
          (row) => row.lesson_kind === "path" && row.lesson_slug === path.slug
        );
        const usedLesson = path.steps.some((step) => {
          const ref = stepLessonRef(step);
          return ref?.kind === kind && ref.slug === slug;
        });
        return usedLesson && hadPath && !stillDone;
      });

      if (stalePaths.length > 0) {
        await supabase
          .from("learn_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_kind", "path")
          .in(
            "lesson_slug",
            stalePaths.map((path) => path.slug)
          );
      }

      const staleSlugs = new Set(stalePaths.map((path) => path.slug));
      const next = remaining.filter(
        (row) => !(row.lesson_kind === "path" && staleSlugs.has(row.lesson_slug))
      );
      setRows(next);
      rowsRef.current = next;
    },
    [user?.id, supabase]
  );

  const pathStats = useMemo(
    () => LEARN_PATHS.map((path) => ({ path, ...pathProgress(path, completed) })),
    [completed]
  );

  return {
    rows,
    isLoading,
    isAuthenticated,
    completed,
    xp,
    level,
    lessonsDone,
    lessonsTotal,
    hasStarted: rows.length > 0,
    pathStats,
    continueHref: continueHref(rows),
    isComplete,
    markStarted,
    completeLesson,
    uncompleteLesson,
    refresh: () => (user?.id ? load(user.id) : Promise.resolve()),
  };
}

export function LearnProgressProvider({ children }: { children: ReactNode }) {
  const value = useLearnProgressState();
  return (
    <LearnProgressContext.Provider value={value}>{children}</LearnProgressContext.Provider>
  );
}

export function useLearnProgress(): LearnProgressApi {
  const ctx = useContext(LearnProgressContext);
  if (!ctx) {
    throw new Error("useLearnProgress must be used within LearnProgressProvider");
  }
  return ctx;
}
