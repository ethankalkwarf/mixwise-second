"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useToast } from "@/components/ui/toast";
import { rememberFollowIntent } from "@/lib/invite";

interface FollowButtonProps {
  userId: string;
  className?: string;
  /** Hide follower count — better in dense lists */
  compact?: boolean;
  /** Confirm before unfollow (default true) */
  confirmUnfollow?: boolean;
  /** Called after a successful follow/unfollow */
  onChange?: (following: boolean) => void;
}

export function FollowButton({
  userId,
  className = "",
  compact = false,
  confirmUnfollow = true,
  onChange,
}: FollowButtonProps) {
  const { user, isAuthenticated } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const toast = useToast();

  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isSelf = Boolean(user?.id && user.id === userId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/follows?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setFollowing(Boolean(data.following));
      setFollowerCount(typeof data.followerCount === "number" ? data.followerCount : null);
    } catch (err) {
      console.error("Failed to load follow state:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load, isAuthenticated]);

  const applyUnfollow = async () => {
    setBusy(true);
    setFollowing(false);
    setFollowerCount((c) => (c === null ? c : Math.max(0, c - 1)));
    setConfirmOpen(false);

    try {
      const res = await fetch(`/api/follows?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFollowing(true);
        setFollowerCount((c) => (c === null ? c : c + 1));
        toast.error(data.error || "Couldn't unfollow");
        return;
      }
      onChange?.(false);
    } catch {
      setFollowing(true);
      setFollowerCount((c) => (c === null ? c : c + 1));
      toast.error("Couldn't unfollow");
    } finally {
      setBusy(false);
    }
  };

  if (isSelf) {
    if (compact || followerCount === null) return null;
    return (
      <p className={`text-sm text-sage ${className}`}>
        {followerCount} follower{followerCount === 1 ? "" : "s"}
      </p>
    );
  }

  const toggle = async () => {
    if (!isAuthenticated) {
      rememberFollowIntent(userId);
      openAuthDialog({ mode: preferredAuthMode });
      return;
    }

    if (following) {
      if (confirmUnfollow) {
        setConfirmOpen(true);
        return;
      }
      await applyUnfollow();
      return;
    }

    setBusy(true);
    setFollowing(true);
    setFollowerCount((c) => (c === null ? c : c + 1));

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFollowing(false);
        setFollowerCount((c) => (c === null ? c : Math.max(0, c - 1)));
        toast.error(data.error || "Something went wrong");
        return;
      }
      onChange?.(true);
    } catch {
      setFollowing(false);
      setFollowerCount((c) => (c === null ? c : Math.max(0, c - 1)));
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={loading || busy}
          aria-pressed={following}
          aria-label={following ? "Unfollow" : "Follow"}
          className={
            following
              ? "inline-flex min-w-[5.5rem] items-center justify-center rounded-xl border border-mist bg-white px-3.5 py-2 text-sm font-medium text-forest transition-colors hover:bg-mist disabled:opacity-50"
              : "inline-flex min-w-[5.5rem] items-center justify-center rounded-xl bg-olive px-3.5 py-2 text-sm font-medium text-cream transition-colors hover:bg-olive-dark disabled:opacity-50"
          }
        >
          {loading ? (
            <span className="h-4 w-12 animate-pulse rounded bg-current/20" aria-hidden />
          ) : following ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
        {!compact && followerCount !== null && !loading && (
          <span className="text-sm text-sage tabular-nums">
            {followerCount} follower{followerCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unfollow-title"
          onClick={() => !busy && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="unfollow-title" className="font-serif text-lg font-bold text-forest">
              Unfollow?
            </h2>
            <p className="mt-2 text-sm text-sage">
              You&apos;ll stop seeing their activity in your Friends feed. You can follow them again
              anytime.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-forest hover:bg-mist"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void applyUnfollow()}
                className="rounded-xl bg-terracotta px-4 py-2 text-sm font-medium text-cream hover:bg-terracotta-dark disabled:opacity-50"
              >
                {busy ? "…" : "Unfollow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
