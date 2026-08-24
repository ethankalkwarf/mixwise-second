"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Share } from "@capacitor/share";
import { LinkIcon, CheckIcon, ShareIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/components/auth/UserProvider";
import { ActionSheet } from "@/components/mobile/ActionSheet";
import { MixwiseStories } from "@/lib/mobile/storiesSharePlugin";
import { trackContentShared } from "@/lib/analytics";
import { markChecklistShared } from "@/lib/onboardingChecklist";
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
const SNAPCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_SNAPCHAT_CLIENT_ID || "";

function noteShared() {
  markChecklistShared();
}

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

function SnapchatGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
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
  /** Prefilled SMS / iMessage body before the link. */
  shareText?: string;
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
  shareText,
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
  const [busy, setBusy] = useState<"ig" | "fb" | "sc" | "share" | "message" | null>(null);
  const [copied, setCopied] = useState(false);
  const [igAvailable, setIgAvailable] = useState(false);
  const [fbAvailable, setFbAvailable] = useState(false);
  const [scAvailable, setScAvailable] = useState(false);
  const [native, setNative] = useState(false);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [pourPicker, setPourPicker] = useState<{
    platform: "ig" | "fb" | "sc";
  } | null>(null);
  const pourResolveRef = useRef<((source: "camera" | "photos" | null) => void) | null>(
    null
  );

  const pickPourSource = (platform: "ig" | "fb" | "sc") =>
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
      MixwiseStories.canShareToSnapchatStories()
        .then((r) => r.available)
        .catch(() => false),
    ]).then(([ig, fb, sc]) => {
      if (cancelled) return;
      setIgAvailable(ig);
      setFbAvailable(fb);
      setScAvailable(sc);
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
      noteShared();
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

  const shareToSnapchat = async () => {
    if (!SNAPCHAT_CLIENT_ID) {
      toast.error("Snapchat sharing isn’t configured yet. Use Share or Copy link.");
      return;
    }
    setBusy("sc");
    try {
      let capturedBackground: { path?: string; dataUrl?: string } | null = null;
      if (cameraBackground) {
        const source = await pickPourSource("sc");
        if (!source) return;
        await wait(450);
        capturedBackground = await capturePourBackground(
          source === "camera" ? CameraSource.Camera : CameraSource.Photos
        );
        if (!capturedBackground) return;
      }

      const stickerDataUrl = await renderStickerBase64();
      if (!stickerDataUrl || stickerDataUrl.length < 100) {
        throw new Error("Sticker render failed");
      }

      const payload: {
        snapchatClientId: string;
        stickerImageBase64: string;
        backgroundImagePath?: string;
        backgroundImageBase64?: string;
        attachmentUrl?: string;
      } = {
        snapchatClientId: SNAPCHAT_CLIENT_ID,
        stickerImageBase64: stickerDataUrl,
        attachmentUrl: shareUrl,
      };

      if (capturedBackground?.path) {
        payload.backgroundImagePath = capturedBackground.path;
      } else if (capturedBackground?.dataUrl) {
        payload.backgroundImageBase64 = capturedBackground.dataUrl;
      } else if (backgroundImageUrl) {
        const backgroundDataUrl = await imageUrlToDataUrl(backgroundImageUrl);
        if (backgroundDataUrl) {
          payload.backgroundImageBase64 = backgroundDataUrl;
        }
      }

      await MixwiseStories.shareToSnapchatStories(payload);
      void trackContentShared(entity, "snapchat_stories", { url: shareUrl });
      noteShared();
      void maybeAwardStoryBadge();
    } catch (err) {
      console.error("Snapchat share failed:", err);
      toast.error("Couldn't open Snapchat. Try Share instead.");
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      void trackContentShared(entity, "copy_link", { url: shareUrl, from: "stories_actions" });
      noteShared();
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const handleMessageShare = async () => {
    setBusy("message");
    try {
      const text = shareText ? `${shareText} ${shareUrl}` : shareUrl;
      const platform = Capacitor.getPlatform();

      if (platform === "ios" || platform === "android") {
        window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
        void trackContentShared(entity, "sms", { url: shareUrl });
        noteShared();
        return;
      }

      await handleSystemShare();
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      await handleCopy();
    } finally {
      setBusy(null);
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
        noteShared();
        return;
      }
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: shareUrl });
        void trackContentShared(entity, "native_share", {
          url: shareUrl,
          from: "stories_fallback",
        });
        noteShared();
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
  const showSc = native && scAvailable && !!SNAPCHAT_CLIENT_ID;
  const showStories = showIg || showFb || showSc;
  // Always offer a link path on native — Stories buttons disappear when Meta apps aren't installed.
  const showLinkFallback = native;

  if (!native) return null;
  // Compact recipe row: only render when Stories apps exist (copy lives elsewhere).
  if (compact && (!availabilityReady || !showStories)) return null;

  const iconBtnSize = compact ? "h-9 w-9" : "h-10 w-10";
  const iconSize = compact ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]";
  const iconBtnBase = `inline-flex shrink-0 items-center justify-center overflow-visible rounded-xl transition-transform disabled:opacity-50 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${iconBtnSize}`;

  const showSystemShareFallback = availabilityReady && !showStories;

  const linkActions = showLinkFallback ? (
    <>
      {showSystemShareFallback ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleSystemShare()}
          className={`${iconBtnBase} bg-olive text-cream shadow-sm focus-visible:ring-olive/40`}
          aria-label={busy === "share" ? "Sharing link" : "Share link"}
          title="Share link"
        >
          <ShareIcon className={iconSize} />
        </button>
      ) : (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleMessageShare()}
          className={`${iconBtnBase} bg-olive text-cream shadow-sm focus-visible:ring-olive/40`}
          aria-label={busy === "message" ? "Opening Messages" : "Text recipe link"}
          title="Text link"
        >
          <ChatBubbleLeftRightIcon className={iconSize} />
        </button>
      )}
      <button
        type="button"
        onClick={() => void handleCopy()}
        disabled={busy !== null}
        className={`${iconBtnBase} border border-mist/80 bg-white text-forest hover:bg-mist/50 focus-visible:ring-forest/30`}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Copied" : "Copy link"}
      >
        {copied ? (
          <CheckIcon className={`${iconSize} text-forest`} />
        ) : (
          <LinkIcon className={`${iconSize} text-sage`} />
        )}
      </button>
    </>
  ) : null;

  return (
    <div
      className={
        className ??
        (compact
          ? "inline-flex flex-wrap items-center gap-2"
          : "flex w-full flex-wrap items-center justify-evenly gap-2")
      }
    >
      {showStories ? (
        <>
          {showIg && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void shareToStories("ig")}
              className={`${iconBtnBase} bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white shadow-sm shadow-[#FD1D1D]/25 focus-visible:ring-[#FD1D1D]/40`}
              aria-label={busy === "ig" ? "Opening Instagram Stories" : "Share to Instagram Story"}
              title="Instagram Story"
            >
              <InstagramGlyph className={iconSize} />
            </button>
          )}
          {showFb && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void shareToStories("fb")}
              className={`${iconBtnBase} bg-[#1877F2] text-white shadow-sm shadow-[#1877F2]/30 focus-visible:ring-[#1877F2]/40`}
              aria-label={busy === "fb" ? "Opening Facebook Stories" : "Share to Facebook Story"}
              title="Facebook Story"
            >
              <FacebookGlyph className={iconSize} />
            </button>
          )}
          {showSc && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void shareToSnapchat()}
              className={`${iconBtnBase} bg-[#FFFC00] text-[#1a1a1a] shadow-sm focus-visible:ring-[#FFFC00]/60`}
              aria-label={busy === "sc" ? "Opening Snapchat" : "Share to Snapchat Story"}
              title="Snapchat Story"
            >
              <SnapchatGlyph className={iconSize} />
            </button>
          )}
        </>
      ) : null}

      {linkActions}

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
            : pourPicker?.platform === "sc"
              ? "Share your pour with friends on Snapchat"
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
