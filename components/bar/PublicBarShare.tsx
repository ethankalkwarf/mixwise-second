"use client";

import { useState } from "react";
import { ShareIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";

interface PublicBarShareProps {
  displayName: string;
  sharePath: string;
}

export function PublicBarShare({ displayName, sharePath }: PublicBarShareProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${sharePath}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const handleShare = async () => {
    const url = getUrl();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${displayName}'s MixWise bar`,
          text: `See what ${displayName} can mix at home.`,
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await handleCopy();
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors text-sm font-medium"
      >
        <ShareIcon className="w-4 h-4" />
        Share this bar
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-2 bg-mist hover:bg-stone text-forest rounded-xl transition-colors text-sm font-medium"
      >
        {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
