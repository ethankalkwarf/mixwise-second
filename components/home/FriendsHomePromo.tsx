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
  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left active:bg-mist/30";

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
      <section className={compact ? "mb-7" : "pb-6"}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-forest">Friends</h2>
          <LinkComponent href="/friends" className="text-xs font-semibold text-terracotta">
            Open
          </LinkComponent>
        </div>

        <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl bg-white shadow-sm">
          <LinkComponent href="/friends" className={ROW}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cream text-forest">
              <UserGroupIcon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-forest">Activity feed</span>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-sage/60" aria-hidden />
          </LinkComponent>

          <button
            type="button"
            onClick={() => void onInvite()}
            disabled={inviteBusy}
            className={`${ROW} disabled:opacity-70`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
              <UserPlusIcon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-forest">Invite a friend</span>
            <ShareIcon className="h-3.5 w-3.5 shrink-0 text-sage/60" aria-hidden />
          </button>
        </div>
      </section>

      <InviteFriendsSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
