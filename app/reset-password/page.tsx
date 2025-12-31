"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/common/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  function getHashParams(): URLSearchParams {
    if (typeof window === "undefined") return new URLSearchParams();
    const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
    return new URLSearchParams(hash);
  }

  function scrubUrl() {
    // Remove sensitive tokens from URL (hash/query) after we capture them
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("type");
    url.searchParams.delete("access_token");
    url.searchParams.delete("refresh_token");
    url.hash = "";
    window.history.replaceState({}, document.title, url.toString());
  }

  // Establish an auth session from Supabase recovery links.
  // Supabase may redirect with:
  // - `code` query param (PKCE flow), OR
  // - `#access_token=...&refresh_token=...&type=recovery` hash fragment (implicit flow)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);

      const code = searchParams.get("code");
      const qsAccessToken = searchParams.get("access_token");
      const qsRefreshToken = searchParams.get("refresh_token");
      const qsType = searchParams.get("type");

      const hashParams = getHashParams();
      const hashAccessToken = hashParams.get("access_token");
      const hashRefreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      try {
        // Preferred flow: exchange code for session (PKCE)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[ResetPassword] exchangeCodeForSession error:", exchangeError);
            if (!cancelled) setError("Invalid or expired password reset link. Please request a new one.");
            return;
          }
          if (!cancelled) setSessionReady(true);
          scrubUrl();
          return;
        }

        // Fallback: implicit flow tokens in querystring
        if (qsAccessToken && qsRefreshToken && (!qsType || qsType === "recovery")) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: qsAccessToken,
            refresh_token: qsRefreshToken,
          });
          if (setSessionError) {
            console.error("[ResetPassword] setSession error (query tokens):", setSessionError);
            if (!cancelled) setError("Invalid or expired password reset link. Please request a new one.");
            return;
          }
          if (!cancelled) setSessionReady(true);
          scrubUrl();
          return;
        }

        // Fallback: implicit flow tokens in hash fragment
        if (hashAccessToken && hashRefreshToken && (!hashType || hashType === "recovery")) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
          });
          if (setSessionError) {
            console.error("[ResetPassword] setSession error (hash tokens):", setSessionError);
            if (!cancelled) setError("Invalid or expired password reset link. Please request a new one.");
            return;
          }
          if (!cancelled) setSessionReady(true);
          scrubUrl();
          return;
        }

        if (!cancelled) setError("Invalid or expired password reset link. Please request a new one.");
      } catch (err) {
        console.error("[ResetPassword] Unexpected error establishing session:", err);
        if (!cancelled) setError("Invalid or expired password reset link. Please request a new one.");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Guard: ensure we have a session before attempting update
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("Your reset session is missing or expired. Please request a new password reset email.");
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(updateError.message || "Failed to update password. The link may have expired.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Password updated successfully!");

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-8 text-center">
          <div className="w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-forest mb-4">Password Updated!</h1>
          <p className="text-sage mb-6">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <p className="text-sm text-sage">
            Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-8">
        <div className="text-center mb-8">
          <span className="text-3xl font-display font-bold text-forest">mixwise.</span>
          <h1 className="text-xl font-display font-bold text-forest mt-4 mb-2">Reset Your Password</h1>
          <p className="text-sage text-sm">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-terracotta text-sm">
            {error}
          </div>
        )}

        {!error && !sessionReady && (
          <div className="mb-6 p-4 bg-cream border border-mist rounded-2xl text-forest text-sm">
            Loading your secure reset session…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-botanical">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="input-botanical"
              required
              minLength={8}
              disabled={isLoading || !sessionReady || !!error}
            />
            <p className="text-xs text-sage mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="label-botanical">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="input-botanical"
              required
              minLength={8}
              disabled={isLoading || !sessionReady || !!error}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !sessionReady || !!error || !password.trim() || !confirmPassword.trim()}
            className="w-full"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-terracotta hover:text-terracotta-dark font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
