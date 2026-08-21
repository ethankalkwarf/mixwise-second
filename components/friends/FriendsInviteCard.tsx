"use client";

import { useCallback, useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { shareInviteLink } from "@/lib/inviteShare";

export function FriendsInviteCard({
  onInvite,
  variant = "hero",
}: {
  onInvite: () => void;
  variant?: "hero" | "compact" | "native";
}) {
  const { profile } = useUser();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  /** Native: jump straight to the share sheet when a username exists. */
  const handleNativeInvite = useCallback(async () => {
    if (!profile?.username) {
      onInvite();
      return;
    }
    setBusy(true);
    try {
      const result = await shareInviteLink(profile.username);
      if (result === "copied") toast.success("Invite link copied");
      if (result === "need_username") onInvite();
    } finally {
      setBusy(false);
    }
  }, [profile?.username, onInvite, toast]);

  if (variant === "native") {
    return (
      <button
        type="button"
        onClick={() => void handleNativeInvite()}
        disabled={busy}
        className="flex w-full items-center justify-between gap-3 rounded-[1.75rem] bg-olive px-4 py-4 text-left text-cream active:scale-[0.98] transition-transform disabled:opacity-70"
      >
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">Invite friends</p>
          <p className="mt-0.5 text-sm text-cream/85">
            {profile?.username
              ? "Opens your share sheet — they auto-follow you"
              : "Set a username, then share your link"}
          </p>
        </div>
        <UserPlusIcon className="h-6 w-6 shrink-0 opacity-90" />
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onInvite}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-olive/25 bg-olive/10 px-4 py-3 text-left text-forest transition-colors hover:bg-olive/15"
      >
        <div className="min-w-0">
          <p className="font-semibold">Invite friends</p>
          <p className="text-sm text-sage">Share a link — they auto-follow you</p>
        </div>
        <UserPlusIcon className="h-5 w-5 shrink-0 text-olive" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onInvite}
      className="flex w-full items-center justify-between gap-4 rounded-3xl bg-olive px-5 py-4 text-left text-cream transition-colors hover:bg-olive-dark sm:px-6"
    >
      <div className="min-w-0">
        <p className="font-serif text-lg font-bold">Invite friends</p>
        <p className="mt-0.5 text-sm text-cream/85">
          Share your link — they auto-follow your bar when they join
        </p>
      </div>
      <UserPlusIcon className="h-6 w-6 shrink-0 opacity-90" />
    </button>
  );
}
