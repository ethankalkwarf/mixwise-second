"use client";

import { useState } from "react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { JoinCtaButton } from "@/components/auth/JoinCtaButton";

export function EmailCaptureSection() {
  const { isAuthenticated } = useUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/email/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "You're on the list — check your email.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="relative overflow-hidden bg-mist/40 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-3 [text-wrap:balance] font-display text-3xl font-bold text-forest sm:text-4xl">
          New cocktails{" "}
          <span className="italic text-terracotta">every week</span>
        </h2>
        <p className="mx-auto mb-8 max-w-md [text-wrap:pretty] text-base leading-relaxed text-sage sm:text-lg">
          Join the list for fresh recipes worth making at home. No account
          needed. Save your bar whenever you&apos;re ready.
        </p>

        {status === "success" ? (
          <div className="mx-auto max-w-md rounded-2xl border border-olive/30 bg-white px-6 py-8">
            <CheckCircleIcon className="mx-auto mb-3 h-10 w-10 text-olive" />
            <p className="font-medium text-forest">{message}</p>
            <p className="mt-3 text-sm text-sage">
              In that email there&apos;s a button to create a free account when
              you&apos;re ready to save your bar.
            </p>
            <div className="mt-5">
              <JoinCtaButton className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="homepage-email">
              Email address
            </label>
            <div className="relative flex-1">
              <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
              <input
                id="homepage-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@email.com"
                required
                autoComplete="email"
                className="input-botanical h-full w-full pl-11"
                disabled={status === "loading"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Joining…" : "Join the list"}
            </button>
          </form>
        )}

        {status === "error" && message && (
          <p className="mt-3 text-sm text-terracotta" role="alert">
            {message}
          </p>
        )}

        {status !== "success" && (
          <p className="mt-4 text-xs text-sage">
            Want to save your bar now?{" "}
            <JoinCtaButton
              label="Create a free account"
              className="font-medium text-terracotta underline-offset-2 hover:underline"
            />
          </p>
        )}
      </div>
    </section>
  );
}
