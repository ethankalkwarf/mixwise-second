"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Share } from "@capacitor/share";
import { LinkIcon, CheckIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/components/auth/UserProvider";
import { ActionSheet } from "@/components/mobile/ActionSheet";
import { MixwiseStories } from "@/lib/mobile/storiesSharePlugin";
import { trackContentShared } from "@/lib/analytics";
import { isNativeApp } from "@/lib/mobile/platform";
import { getSupabaseClient } from "@/lib/supabase/client";
import { awardSharingBadge } from "@/lib/badgeEngine";
import { notifyBadgesUpdated } from "@/hooks/useUserBadges";

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Capture a pour photo. Prefer the on-disk Camera path so native Stories
 * can read the file directly (avoids multi‑MB base64 over the Capacitor bridge).
 */
async function capturePourBackground(
  source: CameraSource
): Promise<{ path?: string; dataUrl?: string } | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source,
      correctOrientation: true,
      width: 1440,
    });

    if (photo.path) {
      return { path: photo.path };
    }

    // Fallback when only a webPath is available
    if (photo.webPath) {
      const res = await fetch(photo.webPath);
      if (!res.ok) throw new Error("Couldn't read the photo");
      const dataUrl = await blobToDataUrl(await res.blob());
      return { dataUrl: await normalizeStoryBackground(dataUrl) };
    }

    return null;
  } catch (err) {
    const message = String((err as Error)?.message ?? err).toLowerCase();
    if (
      message.includes("cancel") ||
      message.includes("dismiss") ||
      message.includes("no image") ||
      message.includes("user cancelled")
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Cover-fill into 9:16. Keep the JPEG modest so Capacitor → pasteboard doesn't choke.
 */
async function normalizeStoryBackground(dataUrl: string): Promise<string> {
  const TARGET_W = 720;
  const TARGET_H = 1280;
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);
        const scale = Math.max(TARGET_W / img.naturalWidth, TARGET_H / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (TARGET_W - w) / 2, (TARGET_H - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Couldn't process the photo"));
    img.src = dataUrl;
  });
}

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

/** Load a remote image as a JPEG data URL for Stories backgroundImage. */
async function imageUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    // CORS fallback: draw via Image + canvas
    try {
      const dataUrl = await new Promise<string | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 1080;
            canvas.height = img.naturalHeight || 1920;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
      return dataUrl;
    } catch {
      return null;
    }
  }
}

export type StoriesEntity = "bar" | "cocktail" | "other";

type Props = {
  entity: StoriesEntity;
  /** Absolute or path share URL (will be copied / attributed by caller). */
  shareUrl: string;
  /** Offscreen sticker content — prefer transparent text-only stickers. */
  sticker: ReactNode;
  stickerWidth?: number;
  stickerHeight?: number;
  /** Optional drink/photo URL used as the full Stories background layer. */
  backgroundImageUrl?: string;
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  /**
   * Open MixWise camera/library first, then pass that photo as the Stories
   * background with the text sticker on top. (Meta’s API cannot open IG’s camera.)
   */
  cameraBackground?: boolean;
  className?: string;
  /** Compact icon-style buttons for recipe action rows. */
  compact?: boolean;
};

/**
 * Native Instagram / Facebook Stories share using MixwiseStories plugin.
 * When Meta apps aren't installed, falls back to Share link / Copy link on native.
 * Renders nothing on web.
 */
export function StoriesShareButtons({
  entity,
  shareUrl,
  sticker,
  stickerWidth = 720,
  stickerHeight = 900,
  backgroundImageUrl,
  backgroundTopColor = "#1F3A2E",
  backgroundBottomColor = "#5C4033",
  cameraBackground = false,
  className,
  compact = false,
}: Props) {
  const toast = useToast();
  const { user } = useUser();
  const supabase = getSupabaseClient();
  const stickerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"ig" | "fb" | "share" | null>(null);
  const [copied, setCopied] = useState(false);
  const [igAvailable, setIgAvailable] = useState(false);
  const [fbAvailable, setFbAvailable] = useState(false);
  const [native, setNative] = useState(false);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [pourPicker, setPourPicker] = useState<{
    platform: "ig" | "fb";
  } | null>(null);
  const pourResolveRef = useRef<((source: "camera" | "photos" | null) => void) | null>(
    null
  );

  const pickPourSource = (platform: "ig" | "fb") =>
    new Promise<"camera" | "photos" | null>((resolve) => {
      pourResolveRef.current = resolve;
      setPourPicker({ platform });
    });

  const finishPourPick = (source: "camera" | "photos" | null) => {
    const resolve = pourResolveRef.current;
    pourResolveRef.current = null;
    setPourPicker(null);
    resolve?.(source);
  };

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  useEffect(() => {
    if (!native || !Capacitor.isNativePlatform()) {
      setAvailabilityReady(true);
      return;
    }
    let cancelled = false;
    void Promise.all([
      MixwiseStories.canShareToInstagramStories()
        .then((r) => r.available)
        .catch(() => false),
      MixwiseStories.canShareToFacebookStories()
        .then((r) => r.available)
        .catch(() => false),
    ]).then(([ig, fb]) => {
      if (cancelled) return;
      setIgAvailable(ig);
      setFbAvailable(fb);
      setAvailabilityReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [native]);

  const renderStickerBase64 = useCallback(async () => {
    if (!stickerRef.current) throw new Error("Sticker not ready");
    // pixelRatio 1 keeps Capacitor → pasteboard payloads small enough to survive the bridge
    return toPng(stickerRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: stickerWidth,
      height: stickerHeight,
      style: {
        background: "transparent",
        backgroundColor: "transparent",
      },
    });
  }, [stickerWidth, stickerHeight]);

  const maybeAwardStoryBadge = useCallback(async () => {
    if (!user || entity !== "cocktail") return;
    try {
      const result = await awardSharingBadge(supabase, user.id, "stories");
      result.awarded.forEach((badge) => {
        toast.success(`${badge.icon} ${badge.name} unlocked`);
      });
      if (result.awarded.length > 0) notifyBadgesUpdated();
    } catch (err) {
      console.error("Story badge award failed:", err);
    }
  }, [entity, supabase, toast, user]);

  const shareToStories = async (platform: "ig" | "fb") => {
    if (!FACEBOOK_APP_ID) {
      toast.error("Stories sharing isn’t configured yet. Use Share or Copy link.");
      return;
    }
    setBusy(platform);
    try {
      let capturedBackground: { path?: string; dataUrl?: string } | null = null;
      if (cameraBackground) {
        // Own sheet + explicit Camera/Photos — Capacitor Prompt opens library for both on iOS
        const source = await pickPourSource(platform);
        if (!source) return;
        // iOS won't present UIImagePicker while our sheet is still dismissing
        await wait(450);
        capturedBackground = await capturePourBackground(
          source === "camera" ? CameraSource.Camera : CameraSource.Photos
        );
        if (!capturedBackground) {
          // User cancelled / denied — don’t open Stories on a black canvas
          return;
        }
      }

      const stickerDataUrl = await renderStickerBase64();
      if (!stickerDataUrl || stickerDataUrl.length < 100) {
        throw new Error("Sticker render failed");
      }

      const payload: {
        facebookAppId: string;
        stickerImageBase64: string;
        backgroundImagePath?: string;
        backgroundImageBase64?: string;
        backgroundTopColor?: string;
        backgroundBottomColor?: string;
      } = {
        facebookAppId: FACEBOOK_APP_ID,
        stickerImageBase64: stickerDataUrl,
      };

      if (capturedBackground?.path) {
        payload.backgroundImagePath = capturedBackground.path;
      } else if (capturedBackground?.dataUrl) {
        payload.backgroundImageBase64 = capturedBackground.dataUrl;
      } else if (backgroundImageUrl) {
        const backgroundDataUrl = await imageUrlToDataUrl(backgroundImageUrl);
        if (backgroundDataUrl) {
          payload.backgroundImageBase64 = backgroundDataUrl;
        } else {
          payload.backgroundTopColor = backgroundTopColor;
          payload.backgroundBottomColor = backgroundBottomColor;
        }
      } else if (!cameraBackground) {
        payload.backgroundTopColor = backgroundTopColor;
        payload.backgroundBottomColor = backgroundBottomColor;
      }

      if (platform === "ig") {
        await MixwiseStories.shareToInstagramStories(payload);
        void trackContentShared(entity, "instagram_stories", { url: shareUrl });
      } else {
        await MixwiseStories.shareToFacebookStories(payload);
        void trackContentShared(entity, "facebook_stories", { url: shareUrl });
      }
      void maybeAwardStoryBadge();
    } catch (err) {
      console.error("Stories share failed:", err);
      const msg = String((err as Error)?.message ?? err);
      const lower = msg.toLowerCase();
      // Surface a short native reason so we can diagnose TestFlight reports
      const detail = msg.replace(/^Error:\s*/i, "").slice(0, 90);
      if (lower.includes("not installed") || lower.includes("could not open")) {
        toast.error(
          platform === "ig"
            ? `Couldn't open Instagram Stories${detail ? ` — ${detail}` : ""}. Update to the latest TestFlight build and try again.`
            : `Couldn't open Facebook Stories${detail ? ` — ${detail}` : ""}.`
        );
      } else if (lower.includes("permission") || lower.includes("denied") || lower.includes("access")) {
        toast.error("Allow Camera and Photos access in Settings, then try again.");
      } else if (lower.includes("sticker")) {
        toast.error("Couldn't build the pour sticker. Try again.");
      } else if (lower.includes("background") || lower.includes("photo") || lower.includes("image")) {
        toast.error("Couldn't use that photo. Try another shot.");
      } else if (lower.includes("facebookappid") || lower.includes("app id")) {
        toast.error("Stories isn’t configured yet. Use Share instead.");
      } else {
        toast.error(`Couldn't open Stories${detail ? ` — ${detail}` : ""}. Try Share instead.`);
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

  const handleSystemShare = async () => {
    setBusy("share");
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: "MixWise",
          url: shareUrl,
          dialogTitle: "Share link",
        });
        void trackContentShared(entity, "native_share", {
          url: shareUrl,
          from: "stories_fallback",
        });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: shareUrl });
        void trackContentShared(entity, "native_share", {
          url: shareUrl,
          from: "stories_fallback",
        });
        return;
      }
      await handleCopy();
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      // Last resort: copy
      await handleCopy();
    } finally {
      setBusy(null);
    }
  };

  const showIg = native && igAvailable && !!FACEBOOK_APP_ID;
  const showFb = native && fbAvailable && !!FACEBOOK_APP_ID;
  const showStories = showIg || showFb;
  // Always offer a link path on native — Stories buttons disappear when Meta apps aren't installed.
  const showLinkFallback = native;

  if (!native) return null;
  // Compact recipe row: only render when Stories apps exist (copy lives elsewhere).
  if (compact && (!availabilityReady || !showStories)) return null;

  const bothPlatforms = showIg && showFb;
  const btnBase = compact
    ? "inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98]"
    : "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-semibold tracking-tight disabled:opacity-50 active:scale-[0.98] transition-transform";

  const showSystemShareFallback = availabilityReady && !showStories;

  return (
    <div className={className ?? (compact ? "inline-flex flex-wrap items-center gap-2" : "mt-0 space-y-2.5")}>
      {showStories ? (
        <div
          className={
            compact
              ? "flex flex-wrap gap-2"
              : bothPlatforms
                ? "grid grid-cols-2 gap-2"
                : "grid grid-cols-1 gap-2"
          }
        >
          {showIg && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void shareToStories("ig")}
              className={`${btnBase} bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white shadow-sm shadow-[#FD1D1D]/25`}
              aria-label="Share to Instagram Story"
            >
              <InstagramGlyph className={compact ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]"} />
              {!compact && (
                <span className="min-w-0 truncate">
                  {busy === "ig" ? "Opening…" : "Instagram"}
                </span>
              )}
            </button>
          )}
          {showFb && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void shareToStories("fb")}
              className={`${btnBase} bg-[#1877F2] text-white shadow-sm shadow-[#1877F2]/30`}
              aria-label="Share to Facebook Story"
            >
              <FacebookGlyph className={compact ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]"} />
              {!compact && (
                <span className="min-w-0 truncate">
                  {busy === "fb" ? "Opening…" : "Facebook"}
                </span>
              )}
            </button>
          )}
        </div>
      ) : null}

      {!compact && showLinkFallback ? (
        <div
          className={
            showStories || !showSystemShareFallback
              ? "space-y-2.5"
              : "grid grid-cols-1 gap-2 sm:grid-cols-2"
          }
        >
          {showSystemShareFallback ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handleSystemShare()}
              className={`${btnBase} bg-olive text-cream shadow-sm`}
            >
              <ShareIcon className="h-[1.125rem] w-[1.125rem]" />
              <span className="min-w-0 truncate">
                {busy === "share" ? "Sharing…" : "Share link"}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-mist/80 bg-white/60 px-3 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-mist/50 active:scale-[0.98]"
          >
            {copied ? <CheckIcon className="h-4 w-4 text-forest" /> : <LinkIcon className="h-4 w-4 text-sage" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}

      {showStories ? (
        <div
          className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0"
          aria-hidden
          style={{ width: stickerWidth, height: stickerHeight }}
        >
          <div
            ref={stickerRef}
            style={{
              width: stickerWidth,
              height: stickerHeight,
              overflow: "hidden",
              background: "transparent",
            }}
          >
            {sticker}
          </div>
        </div>
      ) : null}

      <ActionSheet
        isOpen={pourPicker !== null}
        title={
          pourPicker?.platform === "fb"
            ? "Share your pour with friends on Facebook"
            : "Share your pour with friends on Instagram"
        }
        onClose={() => finishPourPick(null)}
        options={[
          {
            label: "Take photo",
            action: () => finishPourPick("camera"),
          },
          {
            label: "Choose from library",
            action: () => finishPourPick("photos"),
          },
        ]}
      />
    </div>
  );
}
