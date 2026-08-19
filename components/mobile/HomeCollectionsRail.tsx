"use client";

import { AppLink } from "@/components/mobile/AppLink";
import {
  getHomeCollectionStack,
  HOME_COLLECTION_STACK_SLUGS,
} from "@/lib/mobile/collectionShortcuts";
import { NativeCollectionTile } from "@/components/mobile/NativeCollectionTile";
import { useOccasionCoverMap } from "@/hooks/useOccasionCoverMap";

type Props = {
  /** Server-prefetched cover URLs keyed by occasion slug. */
  initialCovers?: Record<string, string | null>;
};

export function HomeCollectionsRail({ initialCovers = {} }: Props) {
  const collections = getHomeCollectionStack();
  const clientCovers = useOccasionCoverMap(HOME_COLLECTION_STACK_SLUGS);
  const covers = { ...initialCovers, ...clientCovers };

  if (collections.length === 0) return null;

  return (
    <section className="mb-9">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest">Collections</h2>
          <p className="text-sm text-sage">Curated lists for every mood</p>
        </div>
        <AppLink href="/cocktails?browse=collections" className="text-xs font-semibold text-terracotta">
          See all
        </AppLink>
      </div>
      <div className="flex flex-col gap-3.5">
        {collections.map((occasion) => (
          <NativeCollectionTile
            key={occasion.slug}
            occasion={occasion}
            variant="stack"
            coverImageUrl={covers[occasion.slug]}
          />
        ))}
      </div>
    </section>
  );
}
