"use client";

export type ChecklistItemId =
  | "recipe"
  | "collection"
  | "save"
  | "make"
  | "share"
  | "lesson";

export type ChecklistItem = {
  id: ChecklistItemId;
  title: string;
  description: string;
  href: string;
};

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "recipe",
    title: "View a recipe",
    description: "Open any cocktail and skim the ingredients.",
    href: "/cocktails",
  },
  {
    id: "collection",
    title: "Browse a collection",
    description: "Explore seasonal and themed drink lists.",
    href: "/occasions",
  },
  {
    id: "save",
    title: "Save a drink",
    description: "Heart a recipe you want to come back to.",
    href: "/cocktails",
  },
  {
    id: "make",
    title: "Make a drink",
    description: "Find what you can pour from your bar.",
    href: "/mix",
  },
  {
    id: "share",
    title: "Share a cocktail",
    description: "Send a recipe or pour to a friend.",
    href: "/cocktails",
  },
  {
    id: "lesson",
    title: "Start a lesson",
    description: "Pick up a technique or guide in Learn.",
    href: "/learn",
  },
];

const COLLECTION_KEY = "mixwise-checklist-collection";
const SHARE_KEY = "mixwise-checklist-shared";
const MADE_KEY = "mixwise-checklist-made";
const DISMISS_PREFIX = "mixwise-checklist-dismissed";

export const CHECKLIST_UPDATE_EVENT = "mixwise:checklist-update";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function dismissKey(userId?: string | null): string {
  return userId ? `${DISMISS_PREFIX}:${userId}` : DISMISS_PREFIX;
}

function notifyChecklistUpdate(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHECKLIST_UPDATE_EVENT));
}

function readFlag(key: string): boolean {
  if (!canUseStorage()) return false;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, "1");
    notifyChecklistUpdate();
    void import("@/lib/engagement").then(({ scheduleEngagementSync }) => {
      scheduleEngagementSync();
    });
  } catch {
    /* ignore */
  }
}

export function markCollectionBrowsed(): void {
  writeFlag(COLLECTION_KEY);
}

export function markChecklistShared(): void {
  writeFlag(SHARE_KEY);
}

export function markChecklistMade(): void {
  writeFlag(MADE_KEY);
}

export function isChecklistDismissed(userId?: string | null): boolean {
  return readFlag(dismissKey(userId));
}

export function dismissChecklist(userId?: string | null): void {
  writeFlag(dismissKey(userId));
}

export type ChecklistCompletionInput = {
  viewedRecipe: boolean;
  savedDrink: boolean;
  startedLesson: boolean;
  mixedAny: boolean;
};

export function getChecklistCompletion(
  input: ChecklistCompletionInput
): Record<ChecklistItemId, boolean> {
  return {
    recipe: input.viewedRecipe,
    collection: readFlag(COLLECTION_KEY),
    save: input.savedDrink,
    make: input.mixedAny || readFlag(MADE_KEY),
    share: readFlag(SHARE_KEY),
    lesson: input.startedLesson,
  };
}

export function incompleteChecklistIds(
  completion: Record<ChecklistItemId, boolean>
): ChecklistItemId[] {
  return CHECKLIST_ITEMS.filter((item) => !completion[item.id]).map((item) => item.id);
}

/** Dismiss allowed when only share + lesson remain (or everything is done). */
export function canDismissChecklist(
  completion: Record<ChecklistItemId, boolean>
): boolean {
  const remaining = incompleteChecklistIds(completion);
  if (remaining.length === 0) return true;
  return (
    remaining.length <= 2 &&
    remaining.every((id) => id === "share" || id === "lesson")
  );
}

export function isChecklistComplete(
  completion: Record<ChecklistItemId, boolean>
): boolean {
  return CHECKLIST_ITEMS.every((item) => completion[item.id]);
}
