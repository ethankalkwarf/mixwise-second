"use client";

import { useState } from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useUserBadges } from "@/hooks/useUserBadges";
import { listeningUnlocked } from "@/lib/listening";
import { ListeningTrackPicker } from "@/components/account/ListeningTrackPicker";

/** Owner-only soundtrack editor on the public bar. */
export function OwnerListeningEditor({
  initialDeezerId,
  initialTrackName,
  initialTrackArtist,
}: {
  initialDeezerId?: string | null;
  initialTrackName?: string | null;
  initialTrackArtist?: string | null;
}) {
  const { refreshProfile } = useUser();
  const { earnedIds } = useUserBadges();
  const unlocked = listeningUnlocked([...earnedIds]);
  const [open, setOpen] = useState(false);
  const [deezerId, setDeezerId] = useState(initialDeezerId ?? null);
  const [trackName, setTrackName] = useState(initialTrackName ?? null);
  const [trackArtist, setTrackArtist] = useState(initialTrackArtist ?? null);

  const hasSong = Boolean(deezerId && trackName && trackArtist);

  return (
    <div className="mt-4 rounded-2xl border border-mist/80 bg-cream/40 p-3.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
          <MusicalNoteIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-forest">
            {hasSong ? "Your soundtrack" : "Add a song to your bar"}
          </span>
          <span className="block text-xs text-sage">
            {hasSong
              ? `${trackName} · ${trackArtist}`
              : unlocked
                ? "Friends hear a short preview on your profile"
                : "Unlocks at Mixologist (5 badges)"}
          </span>
        </span>
        <span className="text-xs font-semibold text-olive">
          {open ? "Close" : hasSong ? "Change" : "Add"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 border-t border-mist/70 pt-3">
          <ListeningTrackPicker
            deezerId={deezerId}
            trackName={trackName}
            trackArtist={trackArtist}
            unlocked={unlocked}
            onSaved={async (listening) => {
              setDeezerId(listening.listening_deezer_id);
              setTrackName(listening.listening_track_name);
              setTrackArtist(listening.listening_track_artist);
              await refreshProfile().catch(() => undefined);
              if (listening.listening_deezer_id) setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
