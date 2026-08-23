"use client";

import { useCallback, useState } from "react";
import { ShareIcon, CheckIcon, EyeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useUser } from "@/components/auth/UserProvider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { awardSharingBadge } from "@/lib/badgeEngine";
import { notifyBadgesUpdated } from "@/hooks/useUserBadges";
import {
  buildBarShareCopy,
  getBarSharePath,
  getBarShareUrl,
  withBarShareUtm,
  type BarShareStats,
} from "@/lib/barShare";
import { trackContentShared } from "@/lib/analytics";
import { isNativeApp } from "@/lib/mobile/platform";
import { getShareOrigin } from "@/lib/shareOrigin";
import { AppLink } from "@/components/mobile/AppLink";

type ShareBarVariant = "cta" | "menu" | "inline" | "icon";

interface ShareBarButtonProps {
  variant?: ShareBarVariant;
  className?: string;
  onShared?: () => void;
  /** When false, skip the preview link next to the CTA. */
  showPreview?: boolean;
  /** Optional subtitle for menu variant rows. */
  menuDescription?: string;
  /** Optional counts for dynamic share copy. */
  stats?: BarShareStats;
}

export function ShareBarButton({
  variant = "cta",
  className,
  onShared,
  showPreview = true,
  menuDescription,
  stats,
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
        gate: "share_bar",
        title: "Share your bar",
        subtitle: "Sign in to send friends a link to what you can mix.",
      });
      return;
    }

      const origin = getShareOrigin();
      const baseUrl = getBarShareUrl(origin, profile);
    if (!baseUrl) {
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

      const medium = isNativeApp() ? "app" : "web";
      const url = withBarShareUtm(baseUrl, {
        medium,
        content: getBarSharePath(profile)?.replace("/bar/", "") || undefined,
      });
      const { title, text } = buildBarShareCopy(profile, stats);

      let usedNativeShare = false;

      if (Capacitor.isNativePlatform()) {
        try {
          await Share.share({
            title,
            text,
            url,
            dialogTitle: "Share My Bar",
          });
          usedNativeShare = true;
          void trackContentShared("bar", "native_share", {
            path: sharePath,
            medium: "capacitor",
            makeable_count: stats?.makeableCount,
            ingredient_count: stats?.ingredientCount,
          });
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            return;
          }
        }
      }

      if (!usedNativeShare && typeof navigator.share === "function") {
        try {
          await navigator.share({ title, text, url });
          usedNativeShare = true;
          void trackContentShared("bar", "native_share", {
            path: sharePath,
            medium: "web_share",
            makeable_count: stats?.makeableCount,
            ingredient_count: stats?.ingredientCount,
          });
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
        void trackContentShared("bar", "copy_link", {
          path: sharePath,
          medium,
          makeable_count: stats?.makeableCount,
          ingredient_count: stats?.ingredientCount,
        });
        toast.success(
          isPublic ? "Bar link copied — send it to a friend." : "Your bar is public. Link copied!",
          5000,
          { label: "View public bar", href: url.replace(origin, "").split("?")[0] || sharePath || "/" }
        );
      }

      const result = await awardSharingBadge(supabase, user.id, "bar");
      result.awarded.forEach((badge) => {
        toast.success(`${badge.icon} ${badge.name} unlocked`);
      });
      if (result.awarded.length > 0) notifyBadgesUpdated();
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
    sharePath,
    stats,
  ]);

  if (authLoading || (isAuthenticated && preferencesLoading)) {
    if (variant === "icon") {
      return (
        <span
          className={
            className ??
            "flex h-10 w-10 items-center justify-center rounded-full bg-white text-sage shadow-sm"
          }
          aria-hidden
        >
          <ShareIcon className="h-5 w-5" />
        </span>
      );
    }
    if (variant === "menu") {
      return (
        <span className={className ?? "native-menu-row flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-sage"}>
          <ShareIcon className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1 font-medium">Share My Bar</span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage" />
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
        className={
          className ??
          "native-menu-row flex w-full min-h-[3.25rem] items-center gap-3 px-4 py-3 text-left text-sm font-medium text-forest hover:bg-mist/50 hover:text-terracotta disabled:opacity-50"
        }
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream">
          <Icon className="h-5 w-5 shrink-0 text-olive" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight text-forest">
            {busy ? "Sharing..." : label}
          </span>
          {menuDescription ? (
            <span className="mt-0.5 block text-xs leading-snug text-sage">{menuDescription}</span>
          ) : null}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-sage/60" />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className={
          className ??
          "flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-sm transition active:scale-[0.97] disabled:opacity-50"
        }
        aria-label={busy ? "Sharing your bar" : "Share your bar"}
      >
        <Icon className="h-5 w-5 shrink-0" />
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className={
          className ??
          "inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:text-terracotta-dark disabled:opacity-50"
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{busy ? "Sharing..." : label}</span>
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
        <Icon className="h-4 w-4 shrink-0" />
        <span>{busy ? "Sharing..." : label}</span>
      </button>
      {showPreview && sharePath && isPublic && (
        <AppLink
          href={sharePath}
          title="See your bar the way friends will"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-forest bg-white border border-mist hover:border-stone rounded-2xl transition-all"
        >
          <EyeIcon className="w-4 h-4" />
          View public bar
        </AppLink>
      )}
    </div>
  );
}
