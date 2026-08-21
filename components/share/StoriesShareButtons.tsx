"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { MixwiseStories } from "@/lib/mobile/storiesSharePlugin";
import { trackContentShared } from "@/lib/analytics";
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

export type StoriesEntity = "bar" | "cocktail" | "other";

type Props = {
  entity: StoriesEntity;
  /** Absolute or path share URL (will be copied / attributed by caller). */
  shareUrl: string;
  /** Offscreen sticker content — rendered at 720×900. */
  sticker: ReactNode;
  stickerWidth?: number;
  stickerHeight?: number;
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  className?: string;
  /** Compact icon-style buttons for recipe action rows. */
  compact?: boolean;
};

/**
 * Native Instagram / Facebook Stories share using MixwiseStories plugin.
 * Renders nothing on web or when Stories apps / App ID are unavailable.
 */
export function StoriesShareButtons({
  entity,
  shareUrl,
  sticker,
  stickerWidth = 720,
  stickerHeight = 900,
  backgroundTopColor = "#1F3A2E",
  backgroundBottomColor = "#5C4033",
  className,
  compact = false,
}: Props) {
  const toast = useToast();
  const stickerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"ig" | "fb" | null>(null);
  const [copied, setCopied] = useState(false);
  const [igAvailable, setIgAvailable] = useState(false);
  const [fbAvailable, setFbAvailable] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  useEffect(() => {
    if (!native || !Capacitor.isNativePlatform()) return;
    void MixwiseStories.canShareToInstagramStories()
      .then((r) => setIgAvailable(r.available))
      .catch(() => setIgAvailable(false));
    void MixwiseStories.canShareToFacebookStories()
      .then((r) => setFbAvailable(r.available))
      .catch(() => setFbAvailable(false));
  }, [native]);

  const renderStickerBase64 = useCallback(async () => {
    if (!stickerRef.current) throw new Error("Sticker not ready");
    return toPng(stickerRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: stickerWidth,
      height: stickerHeight,
    });
  }, [stickerWidth, stickerHeight]);

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
        backgroundTopColor,
        backgroundBottomColor,
      };
      if (platform === "ig") {
        await MixwiseStories.shareToInstagramStories(payload);
        void trackContentShared(entity, "instagram_stories", { url: shareUrl });
      } else {
        await MixwiseStories.shareToFacebookStories(payload);
        void trackContentShared(entity, "facebook_stories", { url: shareUrl });
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
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      void trackContentShared(entity, "copy_link", { url: shareUrl, from: "stories_actions" });
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const showStories = native && (igAvailable || fbAvailable) && !!FACEBOOK_APP_ID;
  if (!showStories) return null;

  const btnBase = compact
    ? "inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
    : "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-50";

  return (
    <div className={className ?? (compact ? "inline-flex flex-wrap items-center gap-2" : "mt-3 space-y-3")}>
      <div className="flex flex-wrap gap-2">
        {igAvailable && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void shareToStories("ig")}
            className={`${btnBase} bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white`}
            aria-label="Share to Instagram Story"
          >
            <InstagramGlyph className="w-4 h-4" />
            {!compact && (busy === "ig" ? "Opening…" : "Instagram Story")}
          </button>
        )}
        {fbAvailable && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void shareToStories("fb")}
            className={`${btnBase} bg-[#1877F2] text-white`}
            aria-label="Share to Facebook Story"
          >
            <FacebookGlyph className="w-4 h-4" />
            {!compact && (busy === "fb" ? "Opening…" : "Facebook Story")}
          </button>
        )}
        {!compact && (
          <button
            type="button"
            onClick={handleCopy}
            className={`${btnBase} bg-mist hover:bg-stone text-forest`}
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute -left-[9999px] top-0" aria-hidden>
        <div
          ref={stickerRef}
          style={{
            width: stickerWidth,
            height: stickerHeight,
            overflow: "hidden",
          }}
        >
          {sticker}
        </div>
      </div>
    </div>
  );
}
