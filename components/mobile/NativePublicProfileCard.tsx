"use client";

import { useCallback, useState } from "react";
import { ChevronRightIcon, EyeIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserBadges } from "@/hooks/useUserBadges";
import { getBarSharePath } from "@/lib/barShare";
import { listeningUnlocked } from "@/lib/listening";
import { AppLink } from "@/components/mobile/AppLink";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { ListeningTrackPicker } from "@/components/account/ListeningTrackPicker";
import { ListeningTrackPlayer } from "@/components/bar/ListeningTrackPlayer";

/**
 * You-tab card: open your public profile + pin a soundtrack in-app.
 */
export function NativePublicProfileCard() {
  const { profile, isAuthenticated, refreshProfile } = useUser();
  const { preferences } = useUserPreferences();
  const { earnedIds } = useUserBadges();
  const [songOpen, setSongOpen] = useState(false);

  const publicBarPath =
    preferences?.public_bar_enabled && getBarSharePath(profile)
      ? getBarSharePath(profile)
      : null;
  const unlocked = listeningUnlocked([...earnedIds]);
  const hasSong = Boolean(
    profile?.listening_deezer_id &&
      profile?.listening_track_name &&
      profile?.listening_track_artist
  );

  const onListeningSaved = useCallback(async () => {
    await refreshProfile().catch(() => undefined);
  }, [refreshProfile]);

  if (!isAuthenticated) return null;

  return (
    <section className="mb-6 space-y-3">
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
        <div className="border-b border-mist/70 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Your public profile
          </p>
          <p className="mt-1 font-display text-xl font-bold text-forest">
            {profile?.display_name || profile?.username || "Your bar"}
          </p>
          {profile?.username ? (
            <p className="text-sm text-sage">@{profile.username}</p>
          ) : (
            <p className="text-sm text-sage">Set a username to get a share link</p>
          )}
        </div>

        <div className="divide-y divide-mist/70">
          {publicBarPath ? (
            <AppLink
              href={publicBarPath}
              className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-mist/40"
            >
              <EyeIcon className="h-5 w-5 shrink-0 text-olive" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-forest">View public profile</span>
                <span className="block text-xs text-sage">What friends see when you share</span>
              </span>
            </AppLink>
          ) : (
            <AppLink
              href="/account"
              className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-mist/40"
            >
              <EyeIcon className="h-5 w-5 shrink-0 text-sage" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-forest">Turn on public bar</span>
                <span className="block text-xs text-sage">Required before friends can open your profile</span>
              </span>
            </AppLink>
          )}

          <ShareBarButton
            variant="menu"
            showPreview={false}
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-medium text-forest"
          />

          <button
            type="button"
            onClick={() => setSongOpen((v) => !v)}
            className="native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-mist/40"
          >
            <MusicalNoteIcon className="h-5 w-5 shrink-0 text-terracotta" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-forest">
                {hasSong ? "Change soundtrack" : "Add a song"}
              </span>
              <span className="block text-xs text-sage">
                {hasSong
                  ? `${profile?.listening_track_name} · ${profile?.listening_track_artist}`
                  : unlocked
                    ? "Pin a track on your public bar"
                    : "Unlocks at Mixologist (5 badges)"}
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage" />
          </button>
        </div>

        {hasSong && !songOpen && profile?.listening_deezer_id ? (
          <div className="border-t border-mist/70 px-4 py-3">
            <ListeningTrackPlayer
              deezerId={profile.listening_deezer_id}
              trackName={profile.listening_track_name!}
              trackArtist={profile.listening_track_artist!}
            />
          </div>
        ) : null}

        {songOpen ? (
          <div className="border-t border-mist/70 px-4 py-4">
            <ListeningTrackPicker
              deezerId={profile?.listening_deezer_id}
              trackName={profile?.listening_track_name}
              trackArtist={profile?.listening_track_artist}
              unlocked={unlocked}
              onSaved={async (listening) => {
                await onListeningSaved();
                if (listening.listening_deezer_id) setSongOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
