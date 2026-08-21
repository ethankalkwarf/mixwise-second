"use client";

import { useCallback, useState } from "react";
import { ShareIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { shareInviteLink } from "@/lib/inviteShare";
import { InviteFriendsSheet } from "@/components/friends/InviteFriendsSheet";

/**
 * Native You-tab viral card — invite is one tap into the system share sheet.
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
      <section className="mb-6">
        <button
          type="button"
          onClick={() => void onInvite()}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-[1.75rem] bg-olive px-4 py-4 text-left text-cream active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream/15">
            <UserPlusIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold leading-tight">
              Invite friends
            </span>
            <span className="mt-0.5 block text-sm text-cream/85">
              Share a link — they auto-follow your bar
            </span>
          </span>
          <ShareIcon className="h-5 w-5 shrink-0 opacity-90" />
        </button>
      </section>
      <InviteFriendsSheet open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
