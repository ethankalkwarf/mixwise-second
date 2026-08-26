export type LearnHubMode = "paths" | "lessons";

export type LearnLessonTab = "guides" | "methods" | "techniques" | "swaps";

export type LearnLibraryState = {
  mode: LearnHubMode;
  lessonTab: LearnLessonTab;
};

export const LEARN_FILTER_STATE_KEY = "mixwise-learn-filters";

const LESSON_TABS = new Set<LearnLessonTab>(["guides", "methods", "techniques", "swaps"]);

export function isLearnLessonTab(value: string | null | undefined): value is LearnLessonTab {
  return Boolean(value && LESSON_TABS.has(value as LearnLessonTab));
}

export function learnLibraryHref(state?: Partial<LearnLibraryState> | null): string {
  if (!state || state.mode !== "lessons") return "/learn";
  const params = new URLSearchParams({ tab: "lessons" });
  if (state.lessonTab && state.lessonTab !== "guides") {
    params.set("section", state.lessonTab);
  }
  const q = params.toString();
  return q ? `/learn?${q}` : "/learn";
}

export function readLearnLibraryState(): LearnLibraryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LEARN_FILTER_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnLibraryState>;
    if (parsed.mode !== "paths" && parsed.mode !== "lessons") return null;
    return {
      mode: parsed.mode,
      lessonTab: isLearnLessonTab(parsed.lessonTab) ? parsed.lessonTab : "guides",
    };
  } catch {
    return null;
  }
}

export function writeLearnLibraryState(state: LearnLibraryState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LEARN_FILTER_STATE_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}
