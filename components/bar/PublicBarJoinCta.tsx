"use client";

import Link from "next/link";
import { JoinCtaButton } from "@/components/auth/JoinCtaButton";
import { useUser } from "@/components/auth/UserProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";

export function PublicBarJoinCta() {
  const { isAuthenticated, isLoading } = useUser();
  const preferredMode = usePreferredAuthMode();

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="card p-8 text-center bg-gradient-to-r from-terracotta/10 to-olive/10 border-terracotta/20">
      <h3 className="text-xl font-serif font-bold text-forest mb-2">
        Ready to Mix Your Own Cocktails?
      </h3>
      <p className="text-sage mb-6 max-w-md mx-auto">
        {preferredMode === "login"
          ? "Sign in to open your own bar, save recipes, and share what you can make."
          : "Join MixWise to create your own bar, discover new recipes, and share your cocktail creations with friends."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <JoinCtaButton
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
        />
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
        >
          Browse Cocktails
        </Link>
      </div>
    </div>
  );
}
