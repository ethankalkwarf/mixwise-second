"use client";

import { useEffect, useRef, useState } from "react";
import { MusicalNoteIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/ui/toast";

type ListeningTrackPlayerProps = {
  deezerId: string;
  trackName: string;
  trackArtist: string;
  albumArtUrl?: string | null;
  previewUrl?: string | null;
  className?: string;
};

/** Compact play chip — song + artist + play (30s Deezer preview when available). */
export function ListeningTrackPlayer({
  deezerId,
  trackName,
  trackArtist,
  albumArtUrl: albumArtProp,
  previewUrl: previewProp,
  className = "",
}: ListeningTrackPlayerProps) {
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(previewProp ?? null);
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(albumArtProp ?? null);
  const [loadingMeta, setLoadingMeta] = useState(!previewProp);

  useEffect(() => {
    setPreviewUrl(previewProp ?? null);
    setAlbumArtUrl(albumArtProp ?? null);
  }, [previewProp, albumArtProp, deezerId]);

  useEffect(() => {
    if (previewProp) {
      setLoadingMeta(false);
      return;
    }

    let cancelled = false;
    setLoadingMeta(true);
    void (async () => {
      try {
        const res = await fetch(`/api/listening/meta?deezerId=${encodeURIComponent(deezerId)}`);
        if (!res.ok || cancelled) return;
        const t = (await res.json()) as {
          previewUrl?: string | null;
          albumArtUrl?: string | null;
        };
        if (cancelled) return;
        setPreviewUrl(t.previewUrl?.trim() || null);
        if (!albumArtProp) {
          setAlbumArtUrl(t.albumArtUrl || null);
        }
      } catch {
        /* preview optional */
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deezerId, previewProp, albumArtProp]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Reset audio when track / preview changes
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, [deezerId, previewUrl]);

  const toggle = async () => {
    if (loadingMeta) return;

    if (!previewUrl) {
      toast.error("No preview available for this track — try another song");
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(previewUrl);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("play", () => setPlaying(true));
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error("Listening preview play failed:", err);
      toast.error("Couldn’t play preview — try again");
      setPlaying(false);
    }
  };

  return (
    <div className={`max-w-[240px] ${className}`}>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-sage/90">
        Mixing to
      </p>
      <div className="flex items-center gap-2 rounded-xl bg-forest/[0.04] py-1.5 pl-1.5 pr-2 ring-1 ring-mist/90">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-olive/15">
          {albumArtUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={albumArtUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <MusicalNoteIcon className="m-2 h-5 w-5 text-olive/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold leading-tight text-forest">{trackName}</p>
          <p className="truncate text-[11px] leading-tight text-sage">{trackArtist}</p>
        </div>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={loadingMeta}
          aria-label={playing ? `Pause ${trackName}` : `Play ${trackName}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive text-cream transition hover:bg-olive-dark disabled:opacity-50"
        >
          {playing ? (
            <PauseIcon className="h-3.5 w-3.5" />
          ) : (
            <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
          )}
        </button>
      </div>
    </div>
  );
}
