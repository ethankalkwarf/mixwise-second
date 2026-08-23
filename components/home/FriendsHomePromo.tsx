"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  ShareIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { shareInviteLink } from "@/lib/inviteShare";
import { InviteFriendsSheet } from "@/components/friends/InviteFriendsSheet";
import { AppLink } from "@/components/mobile/AppLink";
import { isNativeApp } from "@/lib/mobile/platform";

type Props = {
  compact?: boolean;
};

const ROW =
  "flex w-full min-h-[3.25rem] items-center gap-3 px-4 py-3 text-left active:bg-mist/30";
const ICON_SLOT =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl";

export function FriendsHomePromo({ compact = false }: Props) {
  const { profile, isAuthenticated, isLoading } = useUser();
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);

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

  if (isLoading || !isAuthenticated) return null;

  const native = isNativeApp();
  const LinkComponent = native ? AppLink : Link;

  return (
    <>
      <section className={compact ? "mb-10" : "pb-6"}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              Social
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-forest">Friends</h2>
          </div>
          <LinkComponent
            href="/friends"
            className="shrink-0 pb-0.5 text-xs font-semibold text-terracotta"
          >
            Open
          </LinkComponent>
        </div>

        <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl bg-white shadow-sm">
          <LinkComponent href="/friends" className={ROW}>
            <span className={`${ICON_SLOT} bg-cream text-forest`}>
              <UserGroupIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-forest">
                Activity feed
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-sage">
                See what friends are saving
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage/60" aria-hidden />
          </LinkComponent>

          <button
            type="button"
            onClick={() => void onInvite()}
            disabled={inviteBusy}
            className={`${ROW} disabled:opacity-70`}
          >
            <span className={`${ICON_SLOT} bg-terracotta/10 text-terracotta`}>
              <UserPlusIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-forest">
                Invite a friend
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-sage">
                Share your bar link
              </span>
            </span>
            <ShareIcon className="h-4 w-4 shrink-0 text-sage/60" aria-hidden />
          </button>
        </div>
      </section>

      <InviteFriendsSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
