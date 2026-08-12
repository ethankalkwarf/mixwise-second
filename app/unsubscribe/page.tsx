"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

interface EmailPreferences {
  welcome_emails: boolean;
  weekly_digest: boolean;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const typeParam = searchParams.get("type") || "all";
  const email = searchParams.get("email");
  const source = searchParams.get("source");
  const isNewsletter = Boolean(email && source && token);

  const [preferences, setPreferences] = useState<EmailPreferences>({
    welcome_emails: true,
    weekly_digest: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [unsubscribedAll, setUnsubscribedAll] = useState(false);
  const [didInitialUnsubscribe, setDidInitialUnsubscribe] = useState(false);

  useEffect(() => {
    if (!token || didInitialUnsubscribe) return;

    void (async () => {
      setIsLoading(true);
      try {
        if (isNewsletter && email && source) {
          const response = await fetch("/api/email/newsletter-unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, source, token }),
          });
          const data = await response.json();
          if (response.ok) {
            setDidInitialUnsubscribe(true);
            setUnsubscribedAll(true);
            setMessage({
              type: "success",
              text: "You've been unsubscribed from this MixWise mailing list.",
            });
          } else {
            setMessage({ type: "error", text: data.error || "Failed to unsubscribe" });
          }
          return;
        }

        const unsubscribeType =
          typeParam === "digest" || typeParam === "welcome" ? typeParam : "all";

        const response = await fetch(
          `/api/email/unsubscribe?token=${encodeURIComponent(token)}&type=${unsubscribeType}`
        );
        const data = await response.json();

        if (response.ok) {
          setDidInitialUnsubscribe(true);
          if (unsubscribeType === "all") {
            setUnsubscribedAll(true);
            setPreferences({ welcome_emails: false, weekly_digest: false });
            setMessage({
              type: "success",
              text: "You've been unsubscribed from all MixWise emails.",
            });
          } else if (unsubscribeType === "digest") {
            setPreferences((p) => ({ ...p, weekly_digest: false }));
            setMessage({
              type: "success",
              text: "You've been unsubscribed from the weekly digest.",
            });
          } else {
            setPreferences((p) => ({ ...p, welcome_emails: false }));
            setMessage({
              type: "success",
              text: "You've been unsubscribed from welcome emails.",
            });
          }
        } else {
          setMessage({ type: "error", text: data.error || "Failed to unsubscribe" });
        }
      } catch {
        setMessage({ type: "error", text: "An error occurred. Please try again." });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, typeParam, didInitialUnsubscribe, isNewsletter, email, source]);

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/email/unsubscribe?token=${encodeURIComponent(token)}&type=all`
      );
      const data = await response.json();

      if (response.ok) {
        setUnsubscribedAll(true);
        setPreferences({ welcome_emails: false, weekly_digest: false });
        setMessage({
          type: "success",
          text: "You've been unsubscribed from all MixWise emails.",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to unsubscribe" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof EmailPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    if (!token) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, preferences }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Your email preferences have been updated." });
        setUnsubscribedAll(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update preferences" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-soft p-8 text-center border border-mist">
          <h1 className="text-2xl font-display font-bold text-forest mb-4">Invalid Link</h1>
          <p className="text-sage mb-6">
            This unsubscribe link is invalid or has expired. If you want to manage your email
            preferences, please log in to your account.
          </p>
          <Link
            href="/account"
            className="inline-block bg-terracotta text-cream px-6 py-3 rounded-2xl font-semibold hover:bg-terracotta-dark transition-colors"
          >
            Go to Account Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-soft p-8 border border-mist">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <BrandLogo size="lg" variant="dark" />
          </div>
          <h1 className="text-2xl font-display font-bold text-forest mb-2">Email Preferences</h1>
          <p className="text-sage">Manage what we send to your inbox</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm ${
              message.type === "success"
                ? "bg-mist text-forest border border-stone"
                : "bg-red-50 text-terracotta border border-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-sage py-8">Updating your preferences…</p>
        ) : unsubscribedAll ? (
          <div className="text-center py-4">
            <p className="text-forest mb-6">
              You&apos;ve been unsubscribed from all marketing emails. You may still receive
              essential account emails (like password resets).
            </p>
            <Link href="/account" className="text-terracotta font-semibold hover:underline">
              Manage preferences in your account →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <PreferenceToggle
                label="Weekly digest"
                description="Thursday cocktail inspiration based on your bar — weekend-ready at 5pm ET"
                checked={preferences.weekly_digest}
                onChange={() => handlePreferenceChange("weekly_digest")}
              />
              <PreferenceToggle
                label="Welcome emails"
                description="One-time tips when you join MixWise"
                checked={preferences.welcome_emails}
                onChange={() => handlePreferenceChange("welcome_emails")}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full bg-terracotta text-cream py-3 rounded-2xl font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Preferences"}
              </button>
              <button
                onClick={handleUnsubscribeAll}
                className="w-full text-sage py-2 text-sm hover:text-forest transition-colors"
              >
                Unsubscribe from all emails
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-start gap-4 p-4 rounded-2xl bg-cream/50 border border-mist cursor-pointer hover:border-stone transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 w-5 h-5 rounded border-stone text-terracotta focus:ring-terracotta"
      />
      <div>
        <p className="font-semibold text-forest">{label}</p>
        <p className="text-sm text-sage">{description}</p>
      </div>
    </label>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-sage">Loading…</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
