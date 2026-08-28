/**
 * Survives Mix → recipe → Mix remounts in the Capacitor WebView.
 * Memory first (same JS realm), sessionStorage as backup.
 */

export type MixPourSession = {
  y: number;
  visibleCount: number;
  orderedIds: string[];
  focusId: string;
  seed: string;
};

const STORAGE_KEY = "mixwise-mix-pour-session";

let memorySession: MixPourSession | null = null;

export function saveMixPourSession(session: MixPourSession) {
  memorySession = session;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* private mode */
  }
}

export function peekMixPourSession(): MixPourSession | null {
  if (memorySession?.orderedIds?.length && memorySession.focusId) {
    return memorySession;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MixPourSession;
    if (
      parsed &&
      typeof parsed.focusId === "string" &&
      Array.isArray(parsed.orderedIds) &&
      parsed.orderedIds.length > 0
    ) {
      memorySession = parsed;
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearMixPourSession() {
  memorySession = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
