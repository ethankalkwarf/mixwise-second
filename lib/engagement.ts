"use client";

import { POUR_STREAK_EVENT } from "@/lib/mobile/pourStreak";
import { CHECKLIST_UPDATE_EVENT } from "@/lib/onboardingChecklist";
import {
  emptyEngagementPayload,
  mergeEngagementPayload,
  parseEngagementPayload,
  type EngagementPayload,
} from "@/lib/engagement.shared";

export type { EngagementChecklist, EngagementPayload } from "@/lib/engagement.shared";
export { emptyEngagementPayload, mergeEngagementPayload, parseEngagementPayload } from "@/lib/engagement.shared";

const POUR_DATES_KEY = "mixwise-pour-dates";
const MIXED_SLUGS_KEY = "mixwise-mixed-slugs";
const COLLECTION_KEY = "mixwise-checklist-collection";
const SHARE_KEY = "mixwise-checklist-shared";
const MADE_KEY = "mixwise-checklist-made";
const DISMISS_PREFIX = "mixwise-checklist-dismissed";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function readFlag(key: string): boolean {
  if (!canUseStorage()) return false;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  if (!canUseStorage()) return;
  try {
    if (value) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

function dismissKey(userId?: string | null): string {
  return userId ? `${DISMISS_PREFIX}:${userId}` : DISMISS_PREFIX;
}

function loadPourDates(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(POUR_DATES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((d) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function loadMixedSlugs(): Record<string, string> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(MIXED_SLUGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [slug, date] of Object.entries(parsed)) {
      if (typeof slug === "string" && typeof date === "string") out[slug] = date;
    }
    return out;
  } catch {
    return {};
  }
}

function savePourDates(dates: string[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(POUR_DATES_KEY, JSON.stringify(dates.slice(-60)));
  } catch {
    /* ignore */
  }
}

function saveMixedSlugs(map: Record<string, string>): void {
  if (!canUseStorage()) return;
  try {
    const entries = Object.entries(map).sort((a, b) => b[1].localeCompare(a[1]));
    localStorage.setItem(
      MIXED_SLUGS_KEY,
      JSON.stringify(Object.fromEntries(entries.slice(0, 200)))
    );
  } catch {
    /* ignore */
  }
}

export function readLocalEngagement(userId?: string | null): EngagementPayload {
  return {
    pourDates: loadPourDates(),
    mixedSlugs: loadMixedSlugs(),
    checklist: {
      collection: readFlag(COLLECTION_KEY),
      share: readFlag(SHARE_KEY),
      made: readFlag(MADE_KEY),
      dismissed: readFlag(dismissKey(userId)),
    },
  };
}

export function applyEngagementToLocal(payload: EngagementPayload, userId?: string | null): void {
  savePourDates([...new Set(payload.pourDates)].sort());
  saveMixedSlugs(payload.mixedSlugs);
  writeFlag(COLLECTION_KEY, payload.checklist.collection);
  writeFlag(SHARE_KEY, payload.checklist.share);
  writeFlag(MADE_KEY, payload.checklist.made);
  writeFlag(dismissKey(userId), payload.checklist.dismissed);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(POUR_STREAK_EVENT));
    window.dispatchEvent(new CustomEvent(CHECKLIST_UPDATE_EVENT));
  }
}

let syncUserId: string | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight: Promise<void> | null = null;

export function setEngagementSyncUserId(userId: string | null): void {
  syncUserId = userId;
}

export function scheduleEngagementSync(): void {
  if (!syncUserId || typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushEngagementSnapshot(syncUserId!);
  }, 1200);
}

export async function fetchRemoteEngagement(): Promise<EngagementPayload> {
  const res = await fetch("/api/engagement", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch engagement");
  }
  const data = await res.json().catch(() => ({}));
  return parseEngagementPayload(data.engagement);
}

export async function pushEngagementSnapshot(userId: string): Promise<void> {
  if (syncInFlight) {
    await syncInFlight;
    return;
  }

  syncInFlight = (async () => {
    const payload = readLocalEngagement(userId);
    const res = await fetch("/api/engagement", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagement: payload }),
    });
    if (!res.ok) {
      throw new Error("Failed to sync engagement");
    }
    const data = await res.json().catch(() => ({}));
    const merged = parseEngagementPayload(data.engagement);
    applyEngagementToLocal(merged, userId);
  })();

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}

export async function mergeEngagementOnLogin(userId: string): Promise<void> {
  const local = readLocalEngagement(userId);
  let remote = emptyEngagementPayload();

  try {
    remote = await fetchRemoteEngagement();
  } catch {
    /* use local only */
  }

  const merged = mergeEngagementPayload(local, remote);
  applyEngagementToLocal(merged, userId);

  try {
    const res = await fetch("/api/engagement", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagement: merged }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      applyEngagementToLocal(parseEngagementPayload(data.engagement), userId);
    }
  } catch {
    /* local merge still applied */
  }
}
