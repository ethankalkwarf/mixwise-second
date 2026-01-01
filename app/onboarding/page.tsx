"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/auth/UserProvider";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useUser();
  const [timeout, setTimeout] = useState(false);

  // Redirect to home if not authenticated (but allow timeout for slow auth)
  useEffect(() => {
    // First, set a long timeout to handle slow auth initialization
    const timeoutTimer = setInterval(() => {
      console.log("[OnboardingPage] Auth context loading timeout - proceeding anyway");
      setTimeout(true);
    }, 8000); // 8 second timeout

    return () => clearInterval(timeoutTimer);
  }, []);

  // If auth has loaded and user is authenticated, show onboarding
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !timeout) {
      console.log("[OnboardingPage] Not authenticated and auth check complete, redirecting to home");
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, timeout]);

  // Show loading while checking auth OR waiting for auth to settle
  if (isLoading || (!isAuthenticated && !timeout)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
          <p className="text-sage text-sm">Signing you in…</p>
        </div>
      </div>
    );
  }

  // If we have user data (authenticated) OR timeout has occurred, show onboarding
  // The timeout allows onboarding to show even if auth context is slow
  if (isAuthenticated || (timeout && user)) {
    return <OnboardingFlow />;
  }

  // If timeout occurred but no user, user isn't actually authenticated - redirect
  if (timeout && !user) {
    console.log("[OnboardingPage] Timeout occurred but no user found, redirecting to home");
    router.push("/");
    return null;
  }

  return null;
}




