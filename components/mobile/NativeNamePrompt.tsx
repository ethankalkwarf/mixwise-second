"use client";

import { useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { greetingFirstName, profileNeedsGivenName } from "@/lib/homeHeroHeadline";

const SKIP_KEY = "mixwise-name-prompt-skipped";

type Props = {
  /** Overlay sheet vs in-page card */
  variant?: "card" | "sheet";
  onDone?: () => void;
};

export function NativeNamePrompt({ variant = "card", onDone }: Props) {
  const { isAuthenticated, isLoading, profile, user, refreshProfile } = useUser();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const needsName =
    isAuthenticated &&
    !isLoading &&
    profileNeedsGivenName({
      firstName: profile?.first_name,
      displayName: profile?.display_name,
      email: user?.email,
    });

  if (variant === "sheet" && hasSkippedNamePrompt()) return null;
  if (!needsName || hidden) return null;

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Add a first name so we can greet you.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/display-name", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: trimmed, display_name: trimmed }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Could not save name");
      }
      await refreshProfile();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save name");
    } finally {
      setSaving(false);
    }
  };

  const skip = () => {
    try {
      window.localStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
    onDone?.();
  };

  const inner = (
    <>
      <p className="font-display text-lg font-bold text-forest">What should we call you?</p>
      <p className="mt-1 text-sm text-sage">A first name is enough — it shows up on Home.</p>
      <input
        type="text"
        autoComplete="given-name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") void save();
        }}
        placeholder="First name"
        className="mt-3 w-full rounded-2xl border-0 bg-cream px-4 py-3 text-base text-forest placeholder:text-sage"
      />
      {error ? <p className="mt-2 text-xs font-medium text-terracotta">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-cream disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={skip} className="rounded-xl px-4 py-2.5 text-sm font-medium text-sage">
          Skip
        </button>
      </div>
    </>
  );

  if (variant === "sheet") {
    return (
      <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-[70] mx-auto max-w-md">
        <div className="rounded-2xl border border-mist/60 bg-white p-4 shadow-xl shadow-charcoal/12">{inner}</div>
      </div>
    );
  }

  return <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">{inner}</div>;
}

export function hasSkippedNamePrompt() {
  try {
    return window.localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function currentGivenName(input: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}) {
  return greetingFirstName(input);
}
