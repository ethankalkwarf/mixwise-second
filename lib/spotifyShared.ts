/** Shared listening-track helpers safe for client + server. */

export const SPOTIFY_TRACK_ID_RE = /^[0-9A-Za-z]{22}$/;
export const DEEZER_TRACK_ID_RE = /^[0-9]{1,20}$/;

export type ListeningProvider = "spotify" | "deezer";

export type ListeningSearchTrack = {
  provider: ListeningProvider;
  id: string;
  name: string;
  artists: string;
  albumArtUrl: string | null;
  externalUrl: string;
};

/** @deprecated Use ListeningSearchTrack */
export type SpotifySearchTrack = ListeningSearchTrack;

export function parseSpotifyTrackId(input: string): string | null {
  const trimmed = input.trim();
  if (SPOTIFY_TRACK_ID_RE.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "open.spotify.com" || host === "spotify.link") {
      const parts = url.pathname.split("/").filter(Boolean);
      const trackIdx = parts.indexOf("track");
      if (trackIdx >= 0 && parts[trackIdx + 1]) {
        const id = parts[trackIdx + 1].split("?")[0];
        if (SPOTIFY_TRACK_ID_RE.test(id)) return id;
      }
    }
  } catch {
    // not a URL
  }

  const uriMatch = trimmed.match(/^spotify:track:([0-9A-Za-z]{22})$/);
  if (uriMatch) return uriMatch[1];

  return null;
}

export function spotifyEmbedUrl(trackId: string): string {
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
}

export function deezerEmbedUrl(trackId: string): string {
  return `https://widget.deezer.com/widget/dark/track/${trackId}`;
}
