"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/auth/UserProvider";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [showSkipAuth, setShowSkipAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth state - but allow onboarding without authentication
  useEffect(() => {
    if (!mounted || isLoading) return;

    // If not authenticated after 5 seconds, allow proceeding anyway
    // This handles the case where auth context is slow to initialize
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          console.log("[OnboardingPage] Auth context slow, allowing onboarding anyway");
          setShowSkipAuth(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, mounted]);

  // Show loading while checking auth initially
  if (isLoading && mounted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  // Once mounted, show onboarding even if not fully authenticated yet
  // Auth will initialize in the background
  if (!mounted) {
    return null;
  }

  return <OnboardingFlow />;
}




