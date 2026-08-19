"use client";

import { ChevronRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";

type Props = {
  className?: string;
  compact?: boolean;
};

export function DailySpotlightCard({ className = "mb-9", compact = false }: Props) {
  if (compact) {
    return (
      <AppLink
        href="/cocktail-of-the-day"
        className={[
          "native-card-link flex h-full min-h-[7.5rem] flex-col justify-between rounded-[1.6rem]",
          "bg-gradient-to-br from-forest via-forest to-charcoal p-4 text-left text-cream shadow-sm",
          "active:scale-[0.98] transition-transform",
          className,
        ].join(" ")}
      >
        <SparklesIcon className="h-6 w-6 text-cream/70" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/70">
            Daily
          </p>
          <p className="font-display text-lg font-bold leading-tight">Drink of the Day</p>
        </div>
      </AppLink>
    );
  }

  return (
    <AppLink
      href="/cocktail-of-the-day"
      className={[
        "native-card-link group flex w-full items-center gap-4 overflow-hidden rounded-[1.75rem]",
        "bg-gradient-to-br from-forest via-forest to-charcoal p-4 text-left text-cream shadow-sm",
        "active:scale-[0.98] transition-transform",
        className,
      ].join(" ")}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream/15">
        <SparklesIcon className="h-6 w-6" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/70">
          Daily spotlight
        </p>
        <p className="font-display text-xl font-bold leading-tight">Drink of the Day</p>
        <p className="mt-0.5 text-sm text-cream/75">Tap to see what we picked for today.</p>
      </div>

      <ChevronRightIcon className="h-5 w-5 shrink-0 text-cream/60" aria-hidden />
    </AppLink>
  );
}
