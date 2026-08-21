"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";

/**
 * Soft prompt for signed-in users without a username — key for friend discovery.
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

  const dismiss = () => {
    setOpen(false);
    setDismissed(true);
    if (user) {
      try {
        sessionStorage.setItem(`mixwise_username_prompt_dismissed_${user.id}`, "1");
      } catch {
        /* ignore */
      }
    }
  };

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
      // Also enable public bar so friends can find them
      try {
        await fetch("/api/username", { method: "GET" }); // no-op keep
      } catch {
        /* ignore */
      }
      toast.success("Username saved");
      // Make bar findable by default once they claim a username
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
  }, [username, toast, refreshProfile]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-prompt-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="username-prompt-title" className="font-serif text-xl font-bold text-forest">
          Choose a username
        </h2>
        <p className="mt-2 text-sm text-sage">
          Friends find you with @{username || "yourname"} — required to share your bar and send
          invites.
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
            />
          </div>
          {error && <p className="mt-1.5 text-sm text-terracotta">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl px-4 py-2 text-sm font-medium text-sage hover:bg-mist hover:text-forest"
          >
            Later
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save username"}
          </button>
        </div>
      </div>
    </div>
  );
}
