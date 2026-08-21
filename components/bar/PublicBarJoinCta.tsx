"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { JoinCtaButton } from "@/components/auth/JoinCtaButton";
import { useUser } from "@/components/auth/UserProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { isNativeApp } from "@/lib/mobile/platform";

const IOS_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";

export function PublicBarJoinCta({
  displayName,
  makeableCount,
  ingredientCount,
}: {
  displayName?: string;
  makeableCount?: number;
  ingredientCount?: number;
} = {}) {
  const { isAuthenticated, isLoading } = useUser();
  const preferredMode = usePreferredAuthMode();
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  if (isLoading || isAuthenticated) {
    return null;
  }

  const name = displayName?.trim();
  const hook =
    typeof makeableCount === "number" && makeableCount > 0 && name
      ? `${name} can make ${makeableCount} cocktail${makeableCount === 1 ? "" : "s"}. Build your own bar and see what you can pour.`
      : typeof ingredientCount === "number" && ingredientCount > 0 && name
        ? `${name} stocks ${ingredientCount} bottle${ingredientCount === 1 ? "" : "s"}. Add yours and discover what you can mix.`
        : preferredMode === "login"
          ? "Sign in to open your own bar, save recipes, and share what you can make."
          : "Join MixWise to create your own bar, discover recipes, and share what you can mix with friends.";

  return (
    <div className="card p-8 text-center bg-gradient-to-r from-terracotta/10 to-olive/10 border-terracotta/20">
      <h3 className="text-xl font-serif font-bold text-forest mb-2">
        {native ? "Save this energy for your own bar" : "Ready to mix your own?"}
      </h3>
      <p className="text-sage mb-6 max-w-md mx-auto">{hook}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <JoinCtaButton
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
        />
        {!native && (
          <>
            {IOS_STORE_URL ? (
              <a
                href={IOS_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-forest hover:bg-forest/90 text-cream rounded-xl transition-colors font-medium"
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
                Get the MixWise app
              </a>
            ) : (
              <Link
                href="/mix"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
              >
                Try the mixer free
              </Link>
            )}
          </>
        )}
        {native && (
          <Link
            href="/mix"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
          >
            Open the mixer
          </Link>
        )}
      </div>
    </div>
  );
}
