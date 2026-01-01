"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/auth/UserProvider";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();

  // Redirect to home if auth has loaded and user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[OnboardingPage] Not authenticated, redirecting to home");
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
          <p className="text-sage text-sm">Signing you in…</p>
        </div>
      </div>
    );
  }

  // If authenticated, show onboarding
  if (isAuthenticated) {
    return <OnboardingFlow />;
  }

  // Fallback (should not reach here due to redirect above)
  return null;
}




