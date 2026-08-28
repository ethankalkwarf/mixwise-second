/**
 * Mix "You can pour" order + back-restore.
 *
 * Order lives in localStorage for the app session.
 * A sessionStorage "live" flag detects cold start (app closed) → new shuffle.
 * Pull-to-refresh also clears order. Tab switches do not.
 */

export type MixPourSession = {
  seed: string;
  orderedIds: string[];
  orderedSlugs: string[];
  focusId?: string;
  focusSlug?: string;
  visibleCount?: number;
  y?: number;
};

const LIVE_KEY = "mixwise_mix_live";
const ORDER_KEY = "mixwise_mix_pour_order";
const SEED_KEY = "mixwise_mix_pour_seed";
/** Set when leaving Mix for a recipe — Back should return to Mix even if ?from= is lost. */
const RETURN_KEY = "mixwise_mix_recipe_return";

let memory: MixPourSession | null = null;

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** True when the WebView/app process just started (sessionStorage empty). */
export function consumeMixColdStart(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(LIVE_KEY)) return false;
    sessionStorage.setItem(LIVE_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function getMixPourSeed(): string {
  if (typeof window === "undefined") return "mix-tonight";
  try {
    const existing = localStorage.getItem(SEED_KEY);
    if (existing) return existing;
    const seed = `mix-tonight-${Date.now()}`;
    localStorage.setItem(SEED_KEY, seed);
    return seed;
  } catch {
    return `mix-tonight-${Date.now()}`;
  }
}

export function refreshMixPourSeed(): string {
  const seed = `mix-tonight-${Date.now()}`;
  try {
    localStorage.setItem(SEED_KEY, seed);
  } catch {
    /* ignore */
  }
  return seed;
}

export function peekMixPourSession(): MixPourSession | null {
  if (memory?.orderedIds?.length) return memory;
  if (typeof window === "undefined") return null;
  const stored = readJson<MixPourSession>(localStorage, ORDER_KEY);
  if (stored?.orderedIds?.length) {
    memory = stored;
    return stored;
  }
  return null;
}

export function saveMixPourOrder(session: MixPourSession) {
  memory = session;
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(session));
    if (session.seed) localStorage.setItem(SEED_KEY, session.seed);
  } catch {
    /* ignore */
  }
}

export function saveMixPourFocus(focus: {
  focusId: string;
  focusSlug: string;
  visibleCount: number;
  y: number;
}) {
  const current = peekMixPourSession();
  if (!current?.orderedIds?.length) return;
  saveMixPourOrder({
    ...current,
    ...focus,
  });
}

export function clearMixPourFocus() {
  const current = peekMixPourSession();
  if (!current) {
    memory = null;
    return;
  }
  const next: MixPourSession = {
    seed: current.seed,
    orderedIds: current.orderedIds,
    orderedSlugs: current.orderedSlugs,
  };
  saveMixPourOrder(next);
}

/** Mark that the open recipe should Back to Mix (not Search history). */
export function markMixRecipeReturn() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RETURN_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function peekMixRecipeReturn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(RETURN_KEY) === "1";
  } catch {
    return false;
  }
}

export function consumeMixRecipeReturn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hit = sessionStorage.getItem(RETURN_KEY) === "1";
    if (hit) sessionStorage.removeItem(RETURN_KEY);
    return hit;
  } catch {
    return false;
  }
}

/** Full reset — pull-to-refresh or app cold start. */
export function resetMixPourSession() {
  memory = null;
  try {
    localStorage.removeItem(ORDER_KEY);
    localStorage.removeItem(SEED_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    /* ignore */
  }
}
