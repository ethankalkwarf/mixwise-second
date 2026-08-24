"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  hasMixedCocktail,
  markDrinkMade,
  POUR_STREAK_EVENT,
} from "@/lib/mobile/pourStreak";

type Props = {
  slug: string;
  className?: string;
  /** Compact pill sized for the recipe action row (heart, notes, share). */
  compact?: boolean;
  onMixed?: () => void;
};

export function MixedThisButton({
  slug,
  className = "",
  compact = false,
  onMixed,
}: Props) {
  const toast = useToast();
  const [mixed, setMixed] = useState(false);

  useEffect(() => {
    setMixed(hasMixedCocktail(slug));
    const onPour = () => setMixed(hasMixedCocktail(slug));
    window.addEventListener(POUR_STREAK_EVENT, onPour);
    return () => window.removeEventListener(POUR_STREAK_EVENT, onPour);
  }, [slug]);

  const handleClick = () => {
    const { streak, isNewToday, isNewForCocktail } = markDrinkMade(slug);
    setMixed(true);
    onMixed?.();

    if (isNewToday) {
      toast.success(
        streak > 1 ? `${streak}-day pour streak!` : "Nice pour — streak started"
      );
    } else if (!isNewForCocktail) {
      toast.info("Already marked this one as mixed");
    } else {
      toast.success("Nice pour");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-1.5 font-semibold transition-colors ${
        compact
          ? "rounded-lg px-3 py-2 text-xs"
          : "w-full rounded-2xl py-3.5 text-sm font-bold"
      } ${
        mixed
          ? "bg-forest/10 text-forest"
          : "bg-terracotta text-cream active:scale-[0.98] hover:bg-terracotta-dark"
      } ${className}`}
    >
      {mixed ? "✓ Mixed" : "I mixed this"}
    </button>
  );
}
