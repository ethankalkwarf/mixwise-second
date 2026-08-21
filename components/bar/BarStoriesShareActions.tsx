"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import {
  ShareIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { MixwiseStories } from "@/lib/mobile/storiesSharePlugin";
import { trackContentShared } from "@/lib/analytics";
import { withBarShareUtm, type BarShareStats } from "@/lib/barShare";
import { isNativeApp } from "@/lib/mobile/platform";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.691a6.146 6.146 0 100 12.292 6.146 6.146 0 000-12.292zm0 10.146a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type Props = {
  displayName: string;
  sharePath: string;
  username?: string | null;
  avatarUrl?: string | null;
  stats?: BarShareStats;
  /** Owner share vs recipient reshare */
  mode?: "owner" | "recipient";
};

export function BarStoriesShareActions({
  displayName,
  sharePath,
  username,
  avatarUrl,
  stats,
  mode = "owner",
}: Props) {
  const toast = useToast();
  const stickerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"ig" | "fb" | null>(null);
  const [copied, setCopied] = useState(false);
  const [igAvailable, setIgAvailable] = useState(false);
  const [fbAvailable, setFbAvailable] = useState(false);
  const native = isNativeApp();

  useEffect(() => {
    if (!native || !Capacitor.isNativePlatform()) return;
    void MixwiseStories.canShareToInstagramStories()
      .then((r) => setIgAvailable(r.available))
      .catch(() => setIgAvailable(false));
    void MixwiseStories.canShareToFacebookStories()
      .then((r) => setFbAvailable(r.available))
      .catch(() => setFbAvailable(false));
  }, [native]);

  const shareUrl = () => {
    const origin = window.location.origin;
    return withBarShareUtm(`${origin}${sharePath}`, {
      medium: "stories",
      campaign: mode === "owner" ? "share_my_bar" : "reshare_public_bar",
      content: username || sharePath.replace("/bar/", ""),
    });
  };

  const renderStickerBase64 = useCallback(async () => {
    if (!stickerRef.current) throw new Error("Sticker not ready");
    return toPng(stickerRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: 720,
      height: 900,
    });
  }, []);

  const shareToStories = async (platform: "ig" | "fb") => {
    if (!FACEBOOK_APP_ID) {
      toast.error("Stories sharing isn’t configured yet. Use Share or Copy link.");
      return;
    }
    setBusy(platform);
    try {
      const dataUrl = await renderStickerBase64();
      const payload = {
        facebookAppId: FACEBOOK_APP_ID,
        stickerImageBase64: dataUrl,
        backgroundTopColor: "#1F3A2E",
        backgroundBottomColor: "#5C4033",
      };
      if (platform === "ig") {
        await MixwiseStories.shareToInstagramStories(payload);
        void trackContentShared("bar", "instagram_stories", { path: sharePath });
      } else {
        await MixwiseStories.shareToFacebookStories(payload);
        void trackContentShared("bar", "facebook_stories", { path: sharePath });
      }
    } catch (err) {
      if ((err as Error)?.message?.includes("not installed")) {
        toast.error(
          platform === "ig"
            ? "Instagram isn’t installed on this device."
            : "Facebook isn’t installed on this device."
        );
      } else {
        console.error("Stories share failed:", err);
        toast.error("Couldn't open Stories. Try Share instead.");
      }
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      void trackContentShared("bar", "copy_link", { path: sharePath, from: "stories_actions" });
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const makeable = stats?.makeableCount;
  const bottles = stats?.ingredientCount;
  const showStories = native && (igAvailable || fbAvailable) && !!FACEBOOK_APP_ID;

  if (!showStories) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {igAvailable && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void shareToStories("ig")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-sm font-medium disabled:opacity-50"
          >
            <InstagramGlyph className="w-4 h-4" />
            {busy === "ig" ? "Opening…" : "Instagram Story"}
          </button>
        )}
        {fbAvailable && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void shareToStories("fb")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1877F2] text-white text-sm font-medium disabled:opacity-50"
          >
            <FacebookGlyph className="w-4 h-4" />
            {busy === "fb" ? "Opening…" : "Facebook Story"}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-mist hover:bg-stone text-forest text-sm font-medium"
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      {/* Offscreen sticker used for Stories */}
      <div className="pointer-events-none absolute -left-[9999px] top-0" aria-hidden>
        <div
          ref={stickerRef}
          style={{
            width: 720,
            height: 900,
            background: "linear-gradient(160deg, #1F3A2E 0%, #2F4A3A 50%, #5C4033 100%)",
            color: "#F9F7F2",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "Georgia, 'Times New Roman', serif",
            borderRadius: 48,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#C4B5A0",
                marginBottom: 16,
              }}
            >
              MixWise Bar
            </div>
            <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
              {displayName}
            </div>
            {username ? (
              <div style={{ fontSize: 24, color: "#D4C4B0", marginTop: 8 }}>@{username}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 40 }}>
            {typeof makeable === "number" ? (
              <div>
                <div style={{ fontSize: 56, fontWeight: 700 }}>{makeable}</div>
                <div style={{ fontSize: 20, color: "#C4B5A0" }}>cocktails ready</div>
              </div>
            ) : null}
            {typeof bottles === "number" ? (
              <div>
                <div style={{ fontSize: 56, fontWeight: 700 }}>{bottles}</div>
                <div style={{ fontSize: 20, color: "#C4B5A0" }}>bottles</div>
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={56}
                height={56}
                style={{ borderRadius: 999, objectFit: "cover" }}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: "#C4785A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                MW
              </div>
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>MixWise</div>
              <div style={{ fontSize: 18, color: "#C4B5A0" }}>getmixwise.com{sharePath}</div>
            </div>
          </div>
          <ShareIcon className="hidden" />
        </div>
      </div>
    </div>
  );
}
