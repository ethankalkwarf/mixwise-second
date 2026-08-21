"use client";

import { useUser } from "@/components/auth/UserProvider";
import { MixExplainer, MixFaq } from "@/components/mix/MixExplainer";
import { useNativeShell } from "@/hooks/useIsNativeApp";

/**
 * Web Mix marketing chrome (SEO / acquisition copy).
 * Guests: full explainer + FAQ.
 * Signed-in: hidden — MixPageClient owns the product header.
 * Native shell: always hidden.
 */
export function MixMarketingChrome({ slot }: { slot: "top" | "bottom" }) {
  const nativeShell = useNativeShell();
  const { isAuthenticated, isLoading: authLoading } = useUser();

  if (nativeShell) return null;

  // Avoid flashing acquisition copy at signed-in users while auth resolves
  if (authLoading) return null;
  if (isAuthenticated) return null;

  return slot === "top" ? <MixExplainer /> : <MixFaq />;
}
