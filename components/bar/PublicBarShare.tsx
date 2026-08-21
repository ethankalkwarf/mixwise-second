"use client";

import { useState } from "react";
import { ShareIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useToast } from "@/components/ui/toast";
import {
  buildBarShareCopy,
  withBarShareUtm,
  type BarShareStats,
} from "@/lib/barShare";
import { trackContentShared } from "@/lib/analytics";
import { isNativeApp } from "@/lib/mobile/platform";

interface PublicBarShareProps {
  displayName: string;
  sharePath: string;
  username?: string | null;
  stats?: BarShareStats;
}

export function PublicBarShare({
  displayName,
  sharePath,
  username,
  stats,
}: PublicBarShareProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const base = `${origin}${sharePath}`;
    return withBarShareUtm(base, {
      medium: isNativeApp() ? "app" : "web",
      campaign: "reshare_public_bar",
      content: username || sharePath.replace("/bar/", ""),
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      void trackContentShared("bar", "copy_link", { path: sharePath, role: "recipient" });
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const handleShare = async () => {
    const url = getUrl();
    const { title, text } = buildBarShareCopy(
      { display_name: displayName, username },
      stats,
      { forRecipient: true }
    );

    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: `Share ${displayName}'s bar`,
        });
        void trackContentShared("bar", "native_share", {
          path: sharePath,
          role: "recipient",
          medium: "capacitor",
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        void trackContentShared("bar", "native_share", {
          path: sharePath,
          role: "recipient",
          medium: "web_share",
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await handleCopy();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex items-center gap-2 rounded-xl bg-mist px-3.5 py-2 text-sm font-medium text-forest transition-colors hover:bg-stone"
      >
        <ShareIcon className="h-4 w-4 shrink-0" />
        Share
      </button>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-2 rounded-xl border border-mist bg-white/70 px-3.5 py-2 text-sm font-medium text-forest transition-colors hover:bg-mist/60"
      >
        {copied ? <CheckIcon className="h-4 w-4 shrink-0" /> : <LinkIcon className="h-4 w-4 shrink-0" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
