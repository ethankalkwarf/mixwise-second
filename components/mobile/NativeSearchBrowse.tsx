"use client";

import { useMemo } from "react";
import { AppLink } from "@/components/mobile/AppLink";
import {
  ALL_SEARCH_COLLECTION_SLUGS,
  getSearchCollectionSections,
} from "@/lib/mobile/collectionShortcuts";
import { NativeCollectionTile } from "@/components/mobile/NativeCollectionTile";
import { useOccasionCoverMap } from "@/hooks/useOccasionCoverMap";
import { deterministicShuffle, getCocktailsRandomizationSeed } from "@/lib/randomization";
import type { OccasionDefinition } from "@/lib/occasions";

export type NativeBrowseTab = "recipes" | "collections";

type SpiritOption = { value: string; label: string };

type NativeBrowseTabsProps = {
  tab: NativeBrowseTab;
  onTab: (tab: NativeBrowseTab) => void;
};

export function NativeBrowseTabs({ tab, onTab }: NativeBrowseTabsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 rounded-2xl bg-mist/50 p-1">
      <BrowseTabButton
        label="Collections"
        active={tab === "collections"}
        onClick={() => onTab("collections")}
      />
      <BrowseTabButton
        label="Recipes"
        active={tab === "recipes"}
        onClick={() => onTab("recipes")}
      />
    </div>
  );
}

function BrowseTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
        active ? "bg-white text-forest shadow-sm" : "text-sage active:text-forest"
      }`}
    >
      {label}
    </button>
  );
}

type NativeSpiritFiltersProps = {
  spirits: SpiritOption[];
  filterSpirit: string | null;
  onFilterSpirit: (spirit: string | null) => void;
};

/** Compact horizontal spirit chips — only shown on the Recipes tab. */
export function NativeSpiritFilters({
  spirits,
  filterSpirit,
  onFilterSpirit,
}: NativeSpiritFiltersProps) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FilterChip label="All" active={!filterSpirit} onClick={() => onFilterSpirit(null)} />
      {spirits.map((spirit) => (
        <FilterChip
          key={spirit.value}
          label={spirit.label}
          active={filterSpirit === spirit.value}
          onClick={() => onFilterSpirit(filterSpirit === spirit.value ? null : spirit.value)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
        active ? "bg-terracotta text-cream" : "bg-white text-forest shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}

function CollectionGridSection({
  title,
  subtitle,
  items,
  covers,
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  items: OccasionDefinition[];
  covers: Record<string, string | null>;
  href?: string;
  linkLabel?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mb-8 last:mb-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-forest">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-sage">{subtitle}</p> : null}
        </div>
        {href && linkLabel ? (
          <AppLink href={href} className="shrink-0 text-xs font-semibold text-terracotta">
            {linkLabel}
          </AppLink>
        ) : null}
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}
      >
        {items.map((occasion) => (
          <NativeCollectionTile
            key={occasion.slug}
            occasion={occasion}
            variant="grid"
            coverImageUrl={covers[occasion.slug]}
          />
        ))}
      </div>
    </section>
  );
}

export function NativeCollectionsGrid({ shuffleSeed }: { shuffleSeed?: string }) {
  const { seasons, holidays } = getSearchCollectionSections();
  const seed = shuffleSeed ?? getCocktailsRandomizationSeed();
  const shuffledSeasons = useMemo(
    () => deterministicShuffle(seasons, `${seed}-seasons`),
    [seasons, seed]
  );
  const shuffledHolidays = useMemo(
    () => deterministicShuffle(holidays, `${seed}-holidays`),
    [holidays, seed]
  );
  const covers = useOccasionCoverMap(ALL_SEARCH_COLLECTION_SLUGS);
  const total = shuffledSeasons.length + shuffledHolidays.length;

  return (
    <div className="mb-5">
      <p className="mb-5 text-sm text-sage">
        {total} curated lists — tap any collection to browse its drinks.
      </p>
      <CollectionGridSection
        title="Seasons & styles"
        subtitle="Summer pours, classics, tiki, brunch, and more."
        items={shuffledSeasons}
        covers={covers}
      />
      <CollectionGridSection
        title="Holiday cocktails"
        subtitle="Christmas, Halloween, Thanksgiving, and every celebration in between."
        items={shuffledHolidays}
        covers={covers}
        href="/occasions/holidays"
        linkLabel="Holiday hub"
      />
    </div>
  );
}
