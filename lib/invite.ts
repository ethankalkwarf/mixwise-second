/**
 * Persist invite / follow intents through OAuth (localStorage survives better than sessionStorage).
 */

const INVITE_KEY = "mixwise-invite-username";
const FOLLOW_INTENT_KEY = "mixwise-follow-intent-id";

export function rememberInviteUsername(username: string | null | undefined): void {
  if (typeof window === "undefined") return;
  const clean = username?.trim().replace(/^@/, "").toLowerCase();
  if (!clean || clean.length < 2) return;
  try {
    localStorage.setItem(INVITE_KEY, clean);
  } catch {
    /* private mode */
  }
}

export function peekInviteUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(INVITE_KEY);
  } catch {
    return null;
  }
}

export function consumeInviteUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(INVITE_KEY);
    if (value) localStorage.removeItem(INVITE_KEY);
    return value;
  } catch {
    return null;
  }
}

/** Capture ?ref= / ?invite= / utm_content from current URL */
export function captureInviteFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref =
      params.get("ref") ||
      params.get("invite") ||
      (params.get("from") === "bar_share" || params.get("utm_source") === "bar_share"
        ? params.get("utm_content")
        : null);
    if (ref) {
      rememberInviteUsername(ref);
      return ref.replace(/^@/, "").toLowerCase();
    }
    // /invite/username path
    const match = window.location.pathname.match(/^\/invite\/([^/]+)/i);
    if (match?.[1]) {
      rememberInviteUsername(match[1]);
      return match[1].replace(/^@/, "").toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function rememberFollowIntent(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(FOLLOW_INTENT_KEY, userId);
  } catch {
    /* ignore */
  }
}

export function consumeFollowIntent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(FOLLOW_INTENT_KEY);
    if (value) localStorage.removeItem(FOLLOW_INTENT_KEY);
    return value;
  } catch {
    return null;
  }
}

/** Apply pending invite username + follow intent after auth. Safe to call repeatedly. */
export async function applyPendingSocialIntents(): Promise<{
  followed: string[];
}> {
  const followed: string[] = [];
  if (typeof window === "undefined") return { followed };

  const followId = consumeFollowIntent();
  if (followId) {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: followId }),
      });
      if (res.ok) followed.push(followId);
    } catch {
      /* ignore */
    }
  }

  const username = consumeInviteUsername();
  if (username) {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.userId) followed.push(data.userId);
      }
    } catch {
      /* ignore */
    }
  }

  return { followed };
}
