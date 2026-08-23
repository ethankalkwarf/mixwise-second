"use client";

import { useState } from "react";
import { trackContentShared } from "@/lib/analytics";
import { markChecklistShared } from "@/lib/onboardingChecklist";
import { withShareUtm } from "@/lib/analytics/utm";
import { ShareIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

// Twitter X Icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Facebook Icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  variant?: "icons" | "prominent";
}

function shareContentFromUrl(url: string): string | undefined {
  try {
    const path = new URL(url, "https://www.getmixwise.com").pathname;
    const match = /\/cocktails\/([^/]+)/.exec(path);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export function ShareButtons({ url, title, description, variant = "icons" }: ShareButtonsProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();
  const content = shareContentFromUrl(url);

  const taggedUrl = (medium: string) =>
    withShareUtm(url, { medium, content });

  const twitterUrl = taggedUrl("twitter");
  const facebookUrl = taggedUrl("facebook");
  const copyUrl = taggedUrl("copy_link");
  const nativeUrl = taggedUrl(isNative ? "native_share" : "web_share");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(twitterUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}`,
  };

  const noteShared = () => {
    markChecklistShared();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      void trackContentShared("cocktail", "copy_link", { url: copyUrl });
      noteShared();
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title,
          text: description || title,
          url: nativeUrl,
          dialogTitle: `Share ${title}`,
        });
        void trackContentShared("cocktail", "native_share", { url: nativeUrl });
        noteShared();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
      return;
    }

    // Fall back to Web Share API for web browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: nativeUrl,
        });
        void trackContentShared("cocktail", "web_share", { url: nativeUrl });
        noteShared();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === "prominent") {
    const canNativeShare =
      isNative || (typeof navigator !== "undefined" && typeof navigator.share === "function");

    return (
      <button
        type="button"
        onClick={() => void handleNativeShare()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-mist bg-white px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-mist/40 active:bg-mist"
      >
        <ShareIcon className="h-5 w-5" />
        {canNativeShare ? "Share recipe" : copied ? "Link copied" : "Copy recipe link"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Native share (mobile) */}
      {(isNative || (typeof navigator !== "undefined" && typeof navigator.share === "function")) && (
        <button
          onClick={handleNativeShare}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          aria-label="Share"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      )}

      {!isNative && (
        <>
          {/* Twitter/X */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void trackContentShared("cocktail", "twitter", { url: twitterUrl });
              noteShared();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            aria-label="Share on X (Twitter)"
          >
            <XIcon className="w-5 h-5" />
          </a>

          {/* Facebook */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void trackContentShared("cocktail", "facebook", { url: facebookUrl });
              noteShared();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            aria-label="Share on Facebook"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
        </>
      )}

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2.5 rounded-xl transition-colors ${
          copied 
            ? "bg-lime-500/20 text-lime-400" 
            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
        }`}
        aria-label="Copy link"
      >
        {copied ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <LinkIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
