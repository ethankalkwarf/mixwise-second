"use client";

import { useCallback, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { isNativeApp } from "@/lib/mobile/platform";

/**
 * Soft prompt for signed-in users without a username — key for friend discovery.
 * Must sit above the native tab bar (z-100) or Save/Later are unreachable.
 */
export function UsernamePrompt() {
  const { user, profile, isAuthenticated, refreshProfile } = useUser();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || dismissed) return;
    if (profile && !profile.username) {
      const key = `mixwise_username_prompt_dismissed_${user.id}`;
      try {
        if (sessionStorage.getItem(key)) {
          setDismissed(true);
          return;
        }
      } catch {
        /* ignore */
      }
      const suggestion =
        profile.display_name?.toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 20) ||
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) ||
        "";
      setUsername(suggestion);
      setOpen(true);
    } else if (profile?.username) {
      setOpen(false);
    }
  }, [isAuthenticated, user, profile, dismissed]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setDismissed(true);
    if (user) {
      try {
        sessionStorage.setItem(`mixwise_username_prompt_dismissed_${user.id}`, "1");
      } catch {
        /* ignore */
      }
    }
  }, [user]);

  const save = useCallback(async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("At least 3 characters");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't save username");
        return;
      }
      toast.success("Username saved");
      try {
        const { getSupabaseClient } = await import("@/lib/supabase/client");
        const supabase = getSupabaseClient();
        await supabase.from("user_preferences").upsert(
          { user_id: user!.id, public_bar_enabled: true },
          { onConflict: "user_id" }
        );
      } catch {
        /* non-blocking */
      }
      await refreshProfile().catch(() => undefined);
      setOpen(false);
    } catch {
      setError("Couldn't save username");
    } finally {
      setSaving(false);
    }
  }, [username, toast, refreshProfile, user]);

  if (!open) return null;

  const native = typeof window !== "undefined" && isNativeApp();

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-charcoal/50 p-4"
      style={{
        paddingBottom: native
          ? "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)"
          : undefined,
        paddingTop: native ? "env(safe-area-inset-top, 0px)" : undefined,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-prompt-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-sage active:bg-mist"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h2 id="username-prompt-title" className="pr-10 font-display text-xl font-bold text-forest">
          Choose a username
        </h2>
        <p className="mt-2 text-sm text-sage">
          Friends find you with @{username || "yourname"}. You can set this later in Account.
        </p>
        <div className="mt-4">
          <label htmlFor="username-prompt-input" className="label-botanical mb-1.5">
            Username
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sage">
              @
            </span>
            <input
              id="username-prompt-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""));
                setError(null);
              }}
              className="input-botanical pl-8"
              placeholder="yourname"
              autoComplete="username"
              maxLength={30}
              autoFocus={!native}
            />
          </div>
          {error ? <p className="mt-1.5 text-sm text-terracotta">{error}</p> : null}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl border border-mist bg-white px-4 py-3 text-sm font-semibold text-forest active:bg-mist"
          >
            Later
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="flex-1 rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-cream active:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
