"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, MusicalNoteIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { ListeningTrackPlayer } from "@/components/bar/ListeningTrackPlayer";
import {
  LISTENING_UNLOCK_BADGE_COUNT,
  type ListeningSearchTrack,
} from "@/lib/listening";

type ListeningTrackPickerProps = {
  deezerId?: string | null;
  trackName?: string | null;
  trackArtist?: string | null;
  unlocked: boolean;
  onSaved: (listening: {
    listening_spotify_id: string | null;
    listening_deezer_id: string | null;
    listening_track_name: string | null;
    listening_track_artist: string | null;
  }) => void;
};

export function ListeningTrackPicker({
  deezerId,
  trackName,
  trackArtist,
  unlocked,
  onSaved,
}: ListeningTrackPickerProps) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListeningSearchTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastErrorAt = useRef(0);

  const pinned = Boolean(deezerId && trackName && trackArtist);

  const runSearch = useCallback(
    async (q: string) => {
      abortRef.current?.abort();
      if (q.trim().length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);

      try {
        const res = await fetch(`/api/listening/search?q=${encodeURIComponent(q.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const now = Date.now();
          if (now - lastErrorAt.current > 2500) {
            lastErrorAt.current = now;
            toast.error(data.error || "Search failed");
          }
          return;
        }
        const data = (await res.json()) as { tracks?: ListeningSearchTrack[] };
        setResults(data.tracks ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        const now = Date.now();
        if (now - lastErrorAt.current > 2500) {
          lastErrorAt.current = now;
          toast.error("Search failed");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!unlocked) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch, unlocked]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const pinTrack = async (track: ListeningSearchTrack) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/listening", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deezerId: track.id,
          name: track.name,
          artist: track.artists,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn’t pin that track");
        return;
      }
      onSaved(data.listening);
      setQuery("");
      setResults([]);
      toast.success("Soundtrack saved");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t pin that track");
    } finally {
      setSaving(false);
    }
  };

  const clearTrack = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/listening", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn’t remove track");
        return;
      }
      onSaved(data.listening);
      toast.success("Soundtrack cleared");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t remove track");
    } finally {
      setSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="space-y-2">
        <p className="label-botanical mb-1.5">Bar soundtrack</p>
        <div className="rounded-xl border border-dashed border-mist bg-cream/50 px-3 py-3">
          <p className="text-sm font-medium text-forest">Unlock at Mixologist</p>
          <p className="mt-1 text-sm text-sage">
            Earn {LISTENING_UNLOCK_BADGE_COUNT} achievement badges to put a song on your public bar.
          </p>
          <Link
            href="/badges"
            className="mt-2 inline-block text-sm font-medium text-olive hover:text-olive-dark"
          >
            View badges →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="label-botanical mb-1.5">Bar soundtrack</p>
        <p className="text-sm text-sage">
          Search and pin a song that fits the mood of your bar. Friends can play a short preview.
        </p>
      </div>

      {pinned && deezerId && trackName && trackArtist ? (
        <div className="space-y-2">
          <ListeningTrackPlayer
            deezerId={deezerId}
            trackName={trackName}
            trackArtist={trackArtist}
          />
          <button
            type="button"
            onClick={() => void clearTrack()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-terracotta disabled:opacity-50"
          >
            <XMarkIcon className="h-4 w-4" />
            Remove song
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-mist bg-cream/40 px-3 py-3 text-sm text-sage">
          <MusicalNoteIcon className="h-5 w-5 shrink-0 text-olive/70" />
          No song pinned yet
        </div>
      )}

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-botanical pl-9"
          placeholder="Search for a song…"
          disabled={saving}
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage">
            Searching…
          </span>
        )}
      </div>

      {results.length > 0 && (
        <ul className="max-h-64 overflow-y-auto divide-y divide-mist/80 rounded-xl border border-mist bg-white/80">
          {results.map((track) => (
            <li key={track.id}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void pinTrack(track)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-mist/40 disabled:opacity-50"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-olive/15">
                  {track.albumArtUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.albumArtUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MusicalNoteIcon className="m-2 h-6 w-6 text-olive/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-forest">{track.name}</p>
                  <p className="truncate text-xs text-sage">{track.artists}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-olive">Pin</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
