"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  LinkIcon,
  QrCodeIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { isNativeApp } from "@/lib/mobile/platform";
import { getShareOrigin } from "@/lib/shareOrigin";
import { buildInviteUrl, shareInviteLink } from "@/lib/inviteShare";
import { trackContentShared } from "@/lib/analytics";

function suggestUsername(profile: {
  display_name?: string | null;
  username?: string | null;
} | null, email?: string | null) {
  if (profile?.username) return profile.username;
  return (
    profile?.display_name?.toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 20) ||
    email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) ||
    ""
  );
}

export function InviteFriendsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, profile, refreshProfile } = useUser();
  const toast = useToast();
  const [showQr, setShowQr] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [sharing, setSharing] = useState(false);
  const native = isNativeApp();

  const username = profile?.username ?? null;
  const inviteUrl = useMemo(
    () => (username ? buildInviteUrl(getShareOrigin(), username) : null),
    [username]
  );

  useEffect(() => {
    if (!open) return;
    setUsernameError(null);
    setShowQr(false);
    if (!username) {
      setDraftUsername(suggestUsername(profile, user?.email));
    }
  }, [open, username, profile, user?.email]);

  const claimUsername = useCallback(async (): Promise<string | null> => {
    const trimmed = draftUsername.trim().replace(/^@/, "");
    if (trimmed.length < 3) {
      setUsernameError("At least 3 characters");
      return null;
    }
    setSavingUsername(true);
    setUsernameError(null);
    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUsernameError(data.error || "Couldn't save username");
        return null;
      }
      const saved = (data.username as string) || trimmed;
      try {
        const { getSupabaseClient } = await import("@/lib/supabase/client");
        const supabase = getSupabaseClient();
        if (user?.id) {
          await supabase.from("user_preferences").upsert(
            { user_id: user.id, public_bar_enabled: true },
            { onConflict: "user_id" }
          );
        }
      } catch {
        /* non-blocking */
      }
      await refreshProfile().catch(() => undefined);
      toast.success(`@${saved} ready`);
      return saved;
    } catch {
      setUsernameError("Couldn't save username");
      return null;
    } finally {
      setSavingUsername(false);
    }
  }, [draftUsername, refreshProfile, toast, user?.id]);

  const copy = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied");
      void trackContentShared("other", "copy_link", { username: username || undefined });
    } catch {
      toast.error("Couldn't copy link");
    }
  }, [inviteUrl, toast, username]);

  const shareWithUsername = useCallback(
    async (handle: string) => {
      setSharing(true);
      try {
        const result = await shareInviteLink(handle);
        if (result === "copied") toast.success("Invite link copied");
        if (result === "shared" || result === "copied") onClose();
      } finally {
        setSharing(false);
      }
    },
    [toast, onClose]
  );

  const share = useCallback(async () => {
    if (username) {
      await shareWithUsername(username);
      return;
    }
    const saved = await claimUsername();
    if (saved) await shareWithUsername(saved);
  }, [username, claimUsername, shareWithUsername]);

  const sms = () => {
    if (!inviteUrl) return;
    const body = encodeURIComponent(`Join me on MixWise and follow my bar: ${inviteUrl}`);
    window.location.href = `sms:?&body=${body}`;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
      style={{
        paddingBottom: native
          ? "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)"
          : undefined,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="invite-title" className="font-display text-xl font-bold text-forest">
              Invite friends
            </h2>
            <p className="mt-1 text-sm text-sage">
              When they join from your link, they&apos;ll automatically follow you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-sage active:bg-mist"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {!username ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-cream/80 p-4 ring-1 ring-mist">
              <p className="text-sm font-medium text-forest">
                Pick a username for your invite link
              </p>
              <p className="mt-1 text-xs text-sage">
                Friends find you as @{draftUsername || "yourname"}
              </p>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sage">
                  @
                </span>
                <input
                  value={draftUsername}
                  onChange={(e) => {
                    setDraftUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
                    setUsernameError(null);
                  }}
                  className="input-botanical w-full pl-8"
                  placeholder="yourname"
                  autoComplete="username"
                  maxLength={30}
                  autoFocus={!native}
                />
              </div>
              {usernameError ? (
                <p className="mt-1.5 text-sm text-terracotta">{usernameError}</p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={savingUsername || sharing || draftUsername.trim().length < 3}
              onClick={() => void share()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta px-4 py-3.5 text-base font-semibold text-cream active:scale-[0.98] disabled:opacity-50"
            >
              <ShareIcon className="h-5 w-5" />
              {savingUsername || sharing ? "Working…" : "Save & share invite"}
            </button>
            <button
              type="button"
              disabled={savingUsername || draftUsername.trim().length < 3}
              onClick={() => void claimUsername()}
              className="inline-flex w-full items-center justify-center rounded-xl border border-mist bg-white px-4 py-2.5 text-sm font-medium text-forest active:bg-mist disabled:opacity-50"
            >
              Save username only
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {!native ? (
              <div className="rounded-2xl bg-cream/60 px-3 py-2.5 font-mono text-xs text-forest break-all ring-1 ring-mist">
                {inviteUrl}
              </div>
            ) : (
              <p className="rounded-2xl bg-cream/70 px-3 py-2 text-sm text-forest ring-1 ring-mist">
                Your link uses <span className="font-semibold">@{username}</span>
              </p>
            )}
            <button
              type="button"
              disabled={sharing}
              onClick={() => void share()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-olive px-4 py-3.5 text-base font-semibold text-cream active:scale-[0.98] disabled:opacity-50"
            >
              <ShareIcon className="h-5 w-5" />
              {sharing ? "Opening…" : native ? "Share invite" : "Share"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copy()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-medium text-forest active:bg-mist"
              >
                <LinkIcon className="h-4 w-4" />
                Copy link
              </button>
              <button
                type="button"
                onClick={sms}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-medium text-forest active:bg-mist"
              >
                Text message
              </button>
              {!native ? (
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-medium text-forest hover:bg-mist"
                >
                  <QrCodeIcon className="h-4 w-4" />
                  {showQr ? "Hide QR" : "QR code"}
                </button>
              ) : null}
            </div>
            {showQr && inviteUrl ? (
              <div className="flex justify-center rounded-2xl bg-white p-4 ring-1 ring-mist">
                <QRCodeSVG value={inviteUrl} size={180} bgColor="#ffffff" fgColor="#2C3E2D" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
