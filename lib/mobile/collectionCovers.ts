import { getOccasion, type OccasionDefinition } from "@/lib/occasions";

type CatalogCoverSource = {
  slug: string;
  image_url?: string | null;
  imageUrl?: string | null;
};

/** Pick a cover photo from the catalog using each collection's preferred coverSlugs. */
export function catalogCoverForOccasion(
  occasion: OccasionDefinition,
  catalog: CatalogCoverSource[]
): string | null {
  for (const slug of occasion.coverSlugs ?? []) {
    const hit = catalog.find((item) => item.slug === slug);
    const url = hit?.image_url ?? hit?.imageUrl ?? null;
    if (url) return url;
  }
  return null;
}

export function buildOccasionCoverMap(
  occasionSlugs: readonly string[],
  catalog: CatalogCoverSource[]
): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const slug of occasionSlugs) {
    const occasion = getOccasion(slug);
    if (!occasion) continue;
    map[slug] = catalogCoverForOccasion(occasion, catalog);
  }
  return map;
}

/** Best cover URL for native tiles: catalog photo first, static asset fallback. */
export function resolveNativeCollectionCover(
  occasion: OccasionDefinition,
  catalog: CatalogCoverSource[],
  prefetched?: string | null
): string | null {
  if (prefetched) return prefetched;
  return catalogCoverForOccasion(occasion, catalog) || occasion.staticCoverPath || null;
}
