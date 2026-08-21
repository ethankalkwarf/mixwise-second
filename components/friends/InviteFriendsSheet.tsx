"use client";

import { useCallback, useMemo, useState } from "react";
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
import { AppLink } from "@/components/mobile/AppLink";
import { trackContentShared } from "@/lib/analytics";

export function InviteFriendsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile } = useUser();
  const toast = useToast();
  const [showQr, setShowQr] = useState(false);
  const native = isNativeApp();

  const username = profile?.username;
  const inviteUrl = useMemo(
    () => (username ? buildInviteUrl(getShareOrigin(), username) : null),
    [username]
  );

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

  const share = useCallback(async () => {
    if (!username) return;
    const result = await shareInviteLink(username);
    if (result === "copied") toast.success("Invite link copied");
    if (result === "shared" || result === "copied") onClose();
  }, [username, toast, onClose]);

  const sms = () => {
    if (!inviteUrl) return;
    const body = encodeURIComponent(`Join me on MixWise and follow my bar: ${inviteUrl}`);
    window.location.href = `sms:?&body=${body}`;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
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
          <div className="mt-5 rounded-2xl bg-cream/80 p-4 ring-1 ring-mist">
            <p className="text-sm text-forest">
              Set a username first so friends can find your bar.
            </p>
            <AppLink
              href="/account"
              onClick={onClose}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-cream"
            >
              Set username
            </AppLink>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {!native ? (
              <div className="rounded-2xl bg-cream/60 px-3 py-2.5 font-mono text-xs text-forest break-all ring-1 ring-mist">
                {inviteUrl}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void share()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-olive px-4 py-3.5 text-base font-semibold text-cream active:scale-[0.98]"
            >
              <ShareIcon className="h-5 w-5" />
              {native ? "Share invite" : "Share"}
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
