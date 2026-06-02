"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface EmailPreferences {
  welcome_emails: boolean;
  weekly_digest: boolean;
  recommendations: boolean;
  product_updates: boolean;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const source = searchParams.get("source");

  const isNewsletterLink = Boolean(email && source && token);

  const [preferences, setPreferences] = useState<EmailPreferences>({
    welcome_emails: true,
    weekly_digest: true,
    recommendations: true,
    product_updates: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [unsubscribedAll, setUnsubscribedAll] = useState(false);

  useEffect(() => {
    if (isNewsletterLink && !unsubscribedAll) {
      handleNewsletterUnsubscribe();
    } else if (token && !isNewsletterLink && !unsubscribedAll) {
      handleUnsubscribeAll();
    }
  }, [token, email, source, isNewsletterLink]);

  const handleNewsletterUnsubscribe = async () => {
    if (!email || !source || !token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ email, source, token });
      const response = await fetch(`/api/email/unsubscribe?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUnsubscribedAll(true);
        setMessage({
          type: "success",
          text: "You've been unsubscribed from Thirsty Thursday emails.",
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

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/email/unsubscribe?token=${token}&type=all`);
      const data = await response.json();

      if (response.ok) {
        setUnsubscribedAll(true);
        setPreferences({
          welcome_emails: false,
          weekly_digest: false,
          recommendations: false,
          product_updates: false,
        });
        setMessage({ type: "success", text: "You've been unsubscribed from all MixWise emails." });
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

  if (isNewsletterLink) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-soft p-8 text-center border border-mist">
          <div className="text-5xl mb-6">{unsubscribedAll ? "✅" : "📧"}</div>
          <h1 className="text-2xl font-display font-bold text-forest mb-4">
            {unsubscribedAll ? "You're unsubscribed" : "Unsubscribing…"}
          </h1>
          {message && (
            <p className={`mb-6 ${message.type === "success" ? "text-forest" : "text-terracotta"}`}>
              {message.text}
            </p>
          )}
          {isLoading && <p className="text-sage mb-6">Processing your request…</p>}
          <Link
            href="/"
            className="inline-block bg-terracotta text-cream px-6 py-3 rounded-2xl font-semibold hover:bg-terracotta-dark transition-colors"
          >
            Back to MixWise
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-soft p-8 text-center border border-mist">
          <div className="text-5xl mb-6">🔗</div>
          <h1 className="text-2xl font-display font-bold text-forest mb-4">Invalid Link</h1>
          <p className="text-sage mb-6">
            This unsubscribe link is invalid or has expired. If you want to manage your email preferences, please log in to your account.
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
          <Link href="/" className="inline-block mb-6">
            <span className="font-display text-3xl font-bold text-forest">mixwise.</span>
          </Link>
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
              You&apos;ve been unsubscribed from all marketing emails. You may still receive essential account emails (like password resets).
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
                description="Sunday cocktail inspiration based on your bar"
                checked={preferences.weekly_digest}
                onChange={() => handlePreferenceChange("weekly_digest")}
              />
              <PreferenceToggle
                label="Welcome emails"
                description="Tips when you join MixWise"
                checked={preferences.welcome_emails}
                onChange={() => handlePreferenceChange("welcome_emails")}
              />
              <PreferenceToggle
                label="Personalized recommendations"
                description="Cocktail recommendations based on your bar"
                checked={preferences.recommendations}
                onChange={() => handlePreferenceChange("recommendations")}
              />
              <PreferenceToggle
                label="Product updates"
                description="New features and improvements"
                checked={preferences.product_updates}
                onChange={() => handlePreferenceChange("product_updates")}
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
