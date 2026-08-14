"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useUser } from "@/components/auth/UserProvider";
import { clearReturningUserHints } from "@/lib/auth/returning-user";

type CaptureStatus = "idle" | "loading" | "success" | "existing_account" | "error";

export function EmailListCapture({
  source,
  variant = "light",
}: {
  source: "homepage" | "footer";
  variant?: "light" | "dark";
}) {
  const { openLoginDialog } = useAuthDialog();
  const { signOut } = useUser();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [message, setMessage] = useState("");
  const [joinUrl, setJoinUrl] = useState("");

  const isDark = variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/email/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.path === "existing_account" || data.hasAccount) {
        setSubmittedEmail(email.trim().toLowerCase());
        setStatus("existing_account");
        setMessage(data.message || "This email already has a MixWise account.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "You're on the list — check your email.");
      setJoinUrl(typeof data.joinUrl === "string" ? data.joinUrl : "/join");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleClearBrowser = async () => {
    setClearing(true);
    try {
      await signOut().catch(() => undefined);
    } finally {
      clearReturningUserHints();
      setEmail("");
      setSubmittedEmail("");
      setStatus("idle");
      setMessage("");
      setClearing(false);
    }
  };

  if (status === "existing_account") {
    return (
      <div className={isDark ? "max-w-sm" : "mx-auto max-w-md rounded-2xl border border-olive/30 bg-white px-6 py-8 text-center"}>
        <p className={isDark ? "text-sm text-cream" : "font-medium text-forest"}>
          {message || "This email already has a MixWise account."}
        </p>
        <p className={isDark ? "mt-2 text-xs text-cream/70" : "mt-2 text-sm text-sage"}>
          Log in to keep getting weekly drinks. If this isn&apos;t you, clear this browser and try another email.
        </p>
        <div className={`mt-4 flex flex-col gap-2 ${isDark ? "" : "sm:flex-row sm:justify-center"}`}>
          <button
            type="button"
            onClick={() => openLoginDialog({ initialEmail: submittedEmail })}
            className={
              isDark
                ? "rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-cream hover:bg-terracotta-dark"
                : "inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-cream hover:bg-terracotta-dark"
            }
          >
            Log in
          </button>
          <button
            type="button"
            onClick={handleClearBrowser}
            disabled={clearing}
            className={
              isDark
                ? "text-left text-xs text-cream/70 underline-offset-2 hover:underline disabled:opacity-50"
                : "text-sm text-sage underline-offset-2 hover:underline disabled:opacity-50"
            }
          >
            {clearing ? "Clearing…" : "Not you? Clear this browser"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={isDark ? "max-w-sm" : "mx-auto max-w-md rounded-2xl border border-olive/30 bg-white px-6 py-8 text-center"}>
        {!isDark && <CheckCircleIcon className="mx-auto mb-3 h-10 w-10 text-olive" />}
        <p className={isDark ? "text-sm text-cream/90" : "font-medium text-forest"}>
          {message}
        </p>
        {!isDark && (
          <>
            <p className="mt-3 text-sm text-sage">
              We sent a drink to start with. One last step if you want MixWise to remember the cabinet.
            </p>
            <div className="mt-5">
              <Link
                href={joinUrl || "/join"}
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark"
              >
                Set a password
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  const inputClass = isDark
    ? "min-w-0 flex-1 rounded-full border border-cream/20 bg-forest px-4 py-2.5 text-sm text-cream placeholder:text-stone focus:border-cream/40 focus:outline-none"
    : "input-botanical h-full w-full pl-11";

  return (
    <div className={isDark ? "max-w-sm" : undefined}>
      <form
        onSubmit={handleSubmit}
        className={
          isDark
            ? "flex flex-col gap-2 sm:flex-row"
            : "mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
        }
      >
        <label className="sr-only" htmlFor={`${source}-email`}>
          Email address
        </label>
        <div className={isDark ? "contents" : "relative flex-1"}>
          {!isDark && (
            <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
          )}
          <input
            id={`${source}-email`}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@email.com"
            required
            autoComplete="email"
            className={inputClass}
            disabled={status === "loading"}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className={
            isDark
              ? "shrink-0 rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-50"
              : "inline-flex shrink-0 items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {status === "loading" ? (isDark ? "…" : "Joining…") : isDark ? "Join list" : "Join the list"}
        </button>
      </form>
      {status === "error" && message && (
        <p
          className={isDark ? "mt-2 text-xs text-terracotta" : "mt-3 text-sm text-terracotta"}
          role="alert"
        >
          {message}
        </p>
      )}
      {!isDark && (
        <p className="mt-4 text-xs text-sage">
          Want to save your bar now?{" "}
          <Link href="/join" className="font-medium text-terracotta underline-offset-2 hover:underline">
            Create a free account
          </Link>
        </p>
      )}
    </div>
  );
}
