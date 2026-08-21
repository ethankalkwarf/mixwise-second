/**
 * Profile "Listening to" — Deezer catalog search + 30s preview playback.
 * Unlocked at Mixologist (5 counting badges).
 */

import {
  DEEZER_TRACK_ID_RE,
  type ListeningSearchTrack,
} from "@/lib/spotifyShared";
import { countTierBadges } from "@/lib/mixologistTiers";

export type { ListeningSearchTrack };
export { DEEZER_TRACK_ID_RE } from "@/lib/spotifyShared";

/** Mixologist tier — 5 counting achievement badges. */
export const LISTENING_UNLOCK_BADGE_COUNT = 5;

export type ListeningTrackMeta = ListeningSearchTrack & {
  previewUrl: string | null;
};

export function listeningUnlocked(badgeIds: string[]): boolean {
  return countTierBadges(badgeIds) >= LISTENING_UNLOCK_BADGE_COUNT;
}

export async function searchListeningTracks(
  query: string,
  limit = 8
): Promise<ListeningSearchTrack[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL("https://api.deezer.com/search/track");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 15)));

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[listening] Deezer search error:", res.status, text);
    throw new Error("Search failed");
  }

  const data = (await res.json()) as {
    data?: Array<{
      id: number | string;
      title?: string;
      title_short?: string;
      link?: string;
      preview?: string;
      artist?: { name?: string };
      album?: { cover_medium?: string; cover_small?: string };
    }>;
    error?: { message?: string };
  };

  if (data.error) {
    throw new Error(data.error.message || "Search failed");
  }

  const tracks: ListeningSearchTrack[] = [];
  for (const t of data.data ?? []) {
    const id = String(t.id ?? "");
    if (!DEEZER_TRACK_ID_RE.test(id)) continue;
    tracks.push({
      provider: "deezer",
      id,
      name: (t.title || t.title_short || "Track").slice(0, 200),
      artists: (t.artist?.name || "Unknown").slice(0, 200),
      albumArtUrl: t.album?.cover_medium || t.album?.cover_small || null,
      externalUrl: t.link || `https://www.deezer.com/track/${id}`,
    });
  }
  return tracks;
}

export async function resolveDeezerTrack(
  trackId: string
): Promise<ListeningTrackMeta | null> {
  if (!DEEZER_TRACK_ID_RE.test(trackId)) return null;

  const res = await fetch(`https://api.deezer.com/track/${trackId}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const t = (await res.json()) as {
    id?: number | string;
    title?: string;
    link?: string;
    preview?: string;
    error?: unknown;
    artist?: { name?: string };
    album?: { cover_medium?: string; cover_small?: string };
  };
  if (t.error || t.id == null) return null;

  return {
    provider: "deezer",
    id: String(t.id),
    name: (t.title || "Track").slice(0, 200),
    artists: (t.artist?.name || "Unknown").slice(0, 200),
    albumArtUrl: t.album?.cover_medium || t.album?.cover_small || null,
    externalUrl: t.link || `https://www.deezer.com/track/${t.id}`,
    previewUrl: t.preview?.trim() || null,
  };
}
