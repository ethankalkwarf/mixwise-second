"use client";

import { useCallback, useState } from "react";
import { ShareIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { shareInviteLink } from "@/lib/inviteShare";
import { InviteFriendsSheet } from "@/components/friends/InviteFriendsSheet";
import { AppLink } from "@/components/mobile/AppLink";

/**
 * Native You-tab social card — Friends hub + invite, kept apart from Explore.
 */
export function NativeFriendsPromoCard() {
  const { profile, isAuthenticated } = useUser();
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onInvite = useCallback(async () => {
    if (!profile?.username) {
      setInviteOpen(true);
      return;
    }
    setBusy(true);
    try {
      const result = await shareInviteLink(profile.username);
      if (result === "copied") toast.success("Invite link copied");
      if (result === "need_username") setInviteOpen(true);
    } finally {
      setBusy(false);
    }
  }, [profile?.username, toast]);

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="mb-3 space-y-2">
        <AppLink
          href="/friends"
          className="flex w-full items-center gap-3 rounded-[1.5rem] border border-olive/25 bg-white px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-olive/10 text-olive">
            <UserGroupIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-bold leading-tight text-forest">
              Friends & activity
            </span>
            <span className="mt-0.5 block text-sm text-sage">
              See what friends are saving and follow bars
            </span>
          </span>
        </AppLink>

        <button
          type="button"
          onClick={() => void onInvite()}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-[1.5rem] bg-olive px-4 py-3.5 text-left text-cream active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream/15">
            <UserPlusIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-bold leading-tight">
              Invite friends
            </span>
            <span className="mt-0.5 block text-sm text-cream/85">
              Share a link — they auto-follow your bar
            </span>
          </span>
          <ShareIcon className="h-5 w-5 shrink-0 opacity-90" />
        </button>
      </div>
      <InviteFriendsSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
