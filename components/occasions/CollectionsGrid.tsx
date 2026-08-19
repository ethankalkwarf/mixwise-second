"use client";

import { AppLink } from "@/components/mobile/AppLink";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { NativeOccasionCard } from "@/components/mobile/NativeOccasionCard";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { OccasionCocktail, OccasionDisplay } from "@/lib/occasions";

export type CollectionGridItem = {
  occasion: OccasionDisplay;
  count: number;
  cover?: OccasionCocktail | null;
  compact?: boolean;
};

type Props = {
  items: CollectionGridItem[];
  compactGrid?: boolean;
};

export function CollectionsGrid({ items, compactGrid }: Props) {
  const nativeShell = useNativeShell();

  if (nativeShell) {
    return (
      <div className="space-y-3">
        {items.map(({ occasion, count, cover }) => (
          <NativeOccasionCard key={occasion.slug} occasion={occasion} count={count} cover={cover} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        compactGrid
          ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {items.map(({ occasion, count, cover, compact }) => (
        <OccasionCard
          key={occasion.slug}
          occasion={occasion}
          count={count}
          cover={cover}
          compact={compact}
        />
      ))}
    </div>
  );
}

export function NativeCollectionsSectionHeader({
  title,
  dek,
  href,
  linkLabel,
}: {
  title: string;
  dek?: string;
  href?: string;
  linkLabel?: string;
}) {
  const nativeShell = useNativeShell();
  if (!nativeShell) return null;

  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-bold text-forest">{title}</h2>
        {dek ? <p className="mt-1 text-sm text-sage">{dek}</p> : null}
      </div>
      {href && linkLabel ? (
        <AppLink href={href} className="shrink-0 text-sm font-semibold text-terracotta">
          {linkLabel}
        </AppLink>
      ) : null}
    </div>
  );
}
