export type EngagementChecklist = {
  collection: boolean;
  share: boolean;
  made: boolean;
  dismissed: boolean;
};

export type EngagementPayload = {
  pourDates: string[];
  mixedSlugs: Record<string, string>;
  checklist: EngagementChecklist;
};

const EMPTY_CHECKLIST: EngagementChecklist = {
  collection: false,
  share: false,
  made: false,
  dismissed: false,
};

function normalizeChecklist(input: Partial<EngagementChecklist> | null | undefined): EngagementChecklist {
  return {
    collection: Boolean(input?.collection),
    share: Boolean(input?.share),
    made: Boolean(input?.made),
    dismissed: Boolean(input?.dismissed),
  };
}

export function emptyEngagementPayload(): EngagementPayload {
  return {
    pourDates: [],
    mixedSlugs: {},
    checklist: { ...EMPTY_CHECKLIST },
  };
}

export function parseEngagementPayload(raw: unknown): EngagementPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyEngagementPayload();
  }

  const data = raw as Record<string, unknown>;
  const pourDates = Array.isArray(data.pourDates)
    ? data.pourDates.filter((d): d is string => typeof d === "string")
    : [];
  const mixedSlugs: Record<string, string> = {};
  if (data.mixedSlugs && typeof data.mixedSlugs === "object" && !Array.isArray(data.mixedSlugs)) {
    for (const [slug, date] of Object.entries(data.mixedSlugs)) {
      if (typeof slug === "string" && typeof date === "string") mixedSlugs[slug] = date;
    }
  }

  return {
    pourDates,
    mixedSlugs,
    checklist: normalizeChecklist(data.checklist as Partial<EngagementChecklist>),
  };
}

export function mergeEngagementPayload(
  local: EngagementPayload,
  remote: EngagementPayload
): EngagementPayload {
  const pourDates = [...new Set([...local.pourDates, ...remote.pourDates])].sort().slice(-60);

  const mixedSlugs: Record<string, string> = { ...remote.mixedSlugs };
  for (const [slug, date] of Object.entries(local.mixedSlugs)) {
    if (!mixedSlugs[slug] || date > mixedSlugs[slug]) {
      mixedSlugs[slug] = date;
    }
  }
  const mixedEntries = Object.entries(mixedSlugs).sort((a, b) => b[1].localeCompare(a[1]));

  return {
    pourDates,
    mixedSlugs: Object.fromEntries(mixedEntries.slice(0, 200)),
    checklist: {
      collection: local.checklist.collection || remote.checklist.collection,
      share: local.checklist.share || remote.checklist.share,
      made: local.checklist.made || remote.checklist.made,
      dismissed: local.checklist.dismissed || remote.checklist.dismissed,
    },
  };
}
