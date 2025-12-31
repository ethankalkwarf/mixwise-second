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

  // Auto-unsubscribe on page load if token is present
  useEffect(() => {
    if (token && !unsubscribedAll) {
      handleUnsubscribeAll();
    }
  }, [token]);

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
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
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
          <div className="text-5xl mb-6">🔗</div>
          <h1 className="text-2xl font-display font-bold text-forest mb-4">
            Invalid Link
          </h1>
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
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-display font-bold text-forest">mixwise.</span>
          </Link>
          
          {unsubscribedAll ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-display font-bold text-forest mb-2">
                You&apos;re Unsubscribed
              </h1>
              <p className="text-sage">
                You won&apos;t receive any more emails from MixWise.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-forest mb-2">
                Email Preferences
              </h1>
              <p className="text-sage">
                Choose which emails you&apos;d like to receive from MixWise.
              </p>
            </>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl ${
              message.type === "success"
                ? "bg-olive/10 text-forest border border-olive/20"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Preferences */}
            <div className="space-y-4 mb-8">
              <PreferenceToggle
                label="Welcome emails"
                description="Get started tips and account information"
                checked={preferences.welcome_emails}
                onChange={() => handlePreferenceChange("welcome_emails")}
              />
              <PreferenceToggle
                label="Weekly digest"
                description="Cocktail recommendations based on your bar"
                checked={preferences.weekly_digest}
                onChange={() => handlePreferenceChange("weekly_digest")}
              />
              <PreferenceToggle
                label="Personalized recommendations"
                description="Cocktails you might like based on your favorites"
                checked={preferences.recommendations}
                onChange={() => handlePreferenceChange("recommendations")}
              />
              <PreferenceToggle
                label="Product updates"
                description="New features and improvements to MixWise"
                checked={preferences.product_updates}
                onChange={() => handlePreferenceChange("product_updates")}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full bg-terracotta text-cream px-6 py-4 rounded-2xl font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>

            {/* Back to site */}
            <div className="text-center mt-6">
              <Link href="/" className="text-sage hover:text-terracotta transition-colors text-sm">
                ← Back to MixWise
              </Link>
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
    <label className="flex items-start gap-4 p-4 bg-mist/30 rounded-2xl cursor-pointer hover:bg-mist/50 transition-colors">
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 rounded-lg border-2 border-stone text-terracotta focus:ring-terracotta focus:ring-offset-0 cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-forest">{label}</p>
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
          <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

