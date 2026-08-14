"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { awardSharingBadge } from "@/lib/badgeEngine";
import { getBarSharePath, getBarShareUrl } from "@/lib/barShare";

type ShareBarVariant = "cta" | "menu" | "inline";

interface ShareBarButtonProps {
  variant?: ShareBarVariant;
  className?: string;
  onShared?: () => void;
  /** When false, skip the preview link next to the CTA. */
  showPreview?: boolean;
}

export function ShareBarButton({
  variant = "cta",
  className,
  onShared,
  showPreview = true,
}: ShareBarButtonProps) {
  const { user, profile, isAuthenticated, isLoading: authLoading } = useUser();
  const { preferences, isLoading: preferencesLoading, updatePreferences } = useUserPreferences();
  const { openPreferredAuthDialog } = useAuthDialog();
  const toast = useToast();
  const supabase = getSupabaseClient();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const sharePath = getBarSharePath(profile);
  const isPublic = preferences?.public_bar_enabled === true;

  const handleShare = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      openPreferredAuthDialog({
        title: "Share your bar",
        subtitle: "Sign in to send friends a link to what you can mix.",
      });
      return;
    }

    const origin = window.location.origin;
    const url = getBarShareUrl(origin, profile);
    if (!url) {
      toast.error("Set a username in Account to get a shareable bar link.");
      onShared?.();
      return;
    }

    setBusy(true);
    try {
      if (!isPublic) {
        const result = await updatePreferences({ public_bar_enabled: true });
        if (result.error) {
          toast.error(typeof result.error === "string" ? result.error : "Couldn't make your bar public.");
          return;
        }
      }

      const sharePayload = {
        title: profile?.display_name
          ? `${profile.display_name}'s MixWise bar`
          : "My MixWise bar",
        text: "Here's what I can mix at home.",
        url,
      };

      let usedNativeShare = false;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share(sharePayload);
          usedNativeShare = true;
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            return;
          }
        }
      }

      if (!usedNativeShare) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(
          isPublic ? "Bar link copied — send it to a friend." : "Your bar is public. Link copied!",
          5000,
          { label: "Open bar", href: url.replace(origin, "") }
        );
      }

      await awardSharingBadge(supabase, user.id, "bar");
      onShared?.();
    } catch (err) {
      console.error("Error sharing bar:", err);
      toast.error("Couldn't share your bar. Try again.");
    } finally {
      setBusy(false);
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    profile,
    isPublic,
    openPreferredAuthDialog,
    updatePreferences,
    toast,
    supabase,
    onShared,
  ]);

  if (authLoading || (isAuthenticated && preferencesLoading)) {
    if (variant === "menu") {
      return (
        <span className={className ?? "flex items-center gap-2 px-4 py-2.5 text-sm text-sage"}>
          <ShareIcon className="w-4 h-4" />
          Share My Bar
        </span>
      );
    }
    return (
      <span className={className ?? "inline-flex items-center gap-2 px-4 py-2 bg-mist rounded-2xl text-sm font-medium text-sage"}>
        <ShareIcon className="w-4 h-4" />
        Share My Bar
      </span>
    );
  }

  const label = copied ? "Link copied" : "Share My Bar";
  const Icon = copied ? CheckIcon : ShareIcon;

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className={className ?? "flex w-full items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:bg-mist/50 hover:text-terracotta disabled:opacity-50"}
      >
        <Icon className="w-4 h-4" />
        {busy ? "Sharing..." : label}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className={className ?? "inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:text-terracotta-dark disabled:opacity-50"}
      >
        <Icon className="w-4 h-4" />
        {busy ? "Sharing..." : label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className={
          className ??
          "inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-cream rounded-2xl transition-all text-sm font-medium shadow-soft disabled:opacity-50"
        }
      >
        <Icon className="w-4 h-4" />
        {busy ? "Sharing..." : label}
      </button>
      {showPreview && sharePath && isPublic && (
        <Link
          href={sharePath}
          prefetch={false}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-forest bg-white border border-mist hover:border-stone rounded-2xl transition-all"
        >
          Preview
        </Link>
      )}
    </div>
  );
}
