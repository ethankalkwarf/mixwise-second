"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ChevronRightIcon,
  EyeIcon,
  MusicalNoteIcon,
  ShareIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useToast } from "@/components/ui/toast";
import { getBarSharePath } from "@/lib/barShare";
import { listeningUnlocked } from "@/lib/listening";
import { shareInviteLink } from "@/lib/inviteShare";
import { optimizeAvatarUrl } from "@/lib/avatarUrl";
import { AppLink } from "@/components/mobile/AppLink";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { ListeningTrackPicker } from "@/components/account/ListeningTrackPicker";
import { ListeningTrackPlayer } from "@/components/bar/ListeningTrackPlayer";
import { InviteFriendsSheet } from "@/components/friends/InviteFriendsSheet";

const ROW =
  "native-menu-row flex w-full min-h-[3.25rem] items-center gap-3 px-4 py-3 text-left active:bg-mist/30";
const TITLE = "block text-[15px] font-semibold leading-tight text-forest";
const ICON_SLOT =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl";
const CHEVRON = "h-4 w-4 shrink-0 text-sage/60";

function RowCopy({
  title,
  subtitle,
  inverted,
}: {
  title: string;
  subtitle?: string;
  inverted?: boolean;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className={`${TITLE} ${inverted ? "text-cream" : ""}`}>{title}</span>
      {subtitle ? (
        <span className={`mt-0.5 block text-xs leading-snug ${inverted ? "text-cream/85" : "text-sage"}`}>
          {subtitle}
        </span>
      ) : null}
    </span>
  );
}

function RowChevron({ className }: { className?: string }) {
  return <ChevronRightIcon className={className ? `${CHEVRON} ${className}` : CHEVRON} />;
}

function SocialRow({
  title,
  subtitle,
  href,
  onClick,
  disabled,
  borderTop = true,
  variant = "default",
  icon,
  iconBg,
  trailing,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  borderTop?: boolean;
  variant?: "default" | "olive";
  icon: ReactNode;
  iconBg?: string;
  trailing?: ReactNode;
}) {
  const border = borderTop ? "border-t border-mist/70" : "";
  const olive = variant === "olive";
  const classes = [
    ROW,
    border,
    olive ? "bg-olive text-cream disabled:opacity-70" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <span
        className={`${ICON_SLOT} ${iconBg ?? (olive ? "bg-cream/15 text-cream" : "bg-cream text-forest")}`}
      >
        {icon}
      </span>
      <RowCopy
        title={title}
        subtitle={subtitle}
        inverted={olive}
      />
      {trailing ?? <RowChevron className={olive ? "text-cream/80" : undefined} />}
    </>
  );

  if (href) {
    return (
      <AppLink href={href} className={classes}>
        {body}
      </AppLink>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {body}
    </button>
  );
}

/**
 * Unified social hub on the You tab — friends, invite, and public bar in one card.
 */
export function NativeYouSocialSection() {
  const { profile, isAuthenticated, refreshProfile } = useUser();
  const { preferences } = useUserPreferences();
  const { earnedIds } = useUserBadges();
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
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
  const avatarUrl = optimizeAvatarUrl(profile?.avatar_url, 96);
  const displayName =
    profile?.display_name || profile?.username || userLabel(profile) || "Your bar";
  const handleLine = profile?.username
    ? `@${profile.username}`
    : profile?.public_slug
      ? `mixwise.com/bar/${profile.public_slug}`
      : "Add a username for a share link";

  const onInvite = useCallback(async () => {
    if (!profile?.username) {
      setInviteOpen(true);
      return;
    }
    setInviteBusy(true);
    try {
      const result = await shareInviteLink(profile.username);
      if (result === "copied") toast.success("Invite link copied");
      if (result === "need_username") setInviteOpen(true);
    } finally {
      setInviteBusy(false);
    }
  }, [profile?.username, toast]);

  const onListeningSaved = useCallback(async () => {
    await refreshProfile().catch(() => undefined);
  }, [refreshProfile]);

  if (!isAuthenticated) return null;

  return (
    <>
      <section className="mb-8">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-sage">
          Social
        </p>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <SocialRow
            borderTop={false}
            href="/friends"
            title="Friends & activity"
            subtitle="See what friends are saving"
            icon={<UserGroupIcon className="h-5 w-5 text-olive" />}
            iconBg="bg-olive/10"
          />

          <SocialRow
            variant="olive"
            title="Invite friends"
            subtitle="Share a link — they auto-follow your bar"
            icon={<UserPlusIcon className="h-5 w-5" />}
            onClick={() => void onInvite()}
            disabled={inviteBusy}
            trailing={<ShareIcon className="h-4 w-4 shrink-0 text-cream/85" />}
          />

          <AppLink
            href="/account"
            className={`${ROW} border-t border-mist/70 bg-cream/40`}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-mist ring-1 ring-black/[0.04]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" sizes="40px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base text-olive">
                  🍸
                </div>
              )}
            </div>
            <RowCopy title={displayName} subtitle={handleLine} />
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-olive">
              Edit
              <RowChevron />
            </span>
          </AppLink>

          {publicBarPath ? (
            <SocialRow
              href={publicBarPath}
              title="View public bar"
              subtitle="What friends see when you share"
              icon={<EyeIcon className="h-5 w-5 text-olive" />}
            />
          ) : (
            <SocialRow
              href="/account"
              title="Set up public bar"
              subtitle="Let friends view your cabinet"
              icon={<EyeIcon className="h-5 w-5 text-sage" />}
            />
          )}

          <ShareBarButton
            variant="menu"
            showPreview={false}
            menuDescription="Send friends a link to your cabinet"
            className={`${ROW} border-t border-mist/70`}
          />

          <SocialRow
            title={hasSong ? "Change soundtrack" : "Add a song"}
            subtitle={
              hasSong
                ? `${profile?.listening_track_name} · ${profile?.listening_track_artist}`
                : unlocked
                  ? "Pin a track on your public bar"
                  : "Unlocks at Mixologist (5 badges)"
            }
            icon={<MusicalNoteIcon className="h-5 w-5 text-terracotta" />}
            onClick={() => setSongOpen((v) => !v)}
          />

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

      <InviteFriendsSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

function userLabel(profile: { username?: string | null; public_slug?: string | null } | null) {
  if (profile?.username) return profile.username;
  if (profile?.public_slug) return profile.public_slug;
  return null;
}
