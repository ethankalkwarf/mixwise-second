import {
  getChildOccasions,
  getOccasion,
  getTopLevelOccasions,
  type OccasionDefinition,
} from "@/lib/occasions";

/** Featured collections surfaced on native Search when the query is empty. */
const FEATURED_COLLECTION_SLUGS = [
  "summer",
  "party",
  "classics",
  "tiki",
  "sours",
  "highballs",
  "holidays",
  "zero-proof",
] as const;

/** Curated collections stacked on the native home feed (subset of featured). */
const HOME_COLLECTION_STACK_SLUGS = [
  "summer",
  "party",
  "classics",
  "tiki",
  "zero-proof",
] as const;

export { HOME_COLLECTION_STACK_SLUGS, FEATURED_COLLECTION_SLUGS };

export function getHomeCollectionStack(): OccasionDefinition[] {
  return HOME_COLLECTION_STACK_SLUGS.map((slug) => getOccasion(slug)).filter(
    (item): item is OccasionDefinition => Boolean(item)
  );
}

export function getFeaturedCollectionShortcuts(): OccasionDefinition[] {
  return FEATURED_COLLECTION_SLUGS.map((slug) => getOccasion(slug)).filter(
    (item): item is OccasionDefinition => Boolean(item)
  );
}

/** All browsable collections for native Search (seasons + holiday children). */
export function getSearchCollectionSections(): {
  seasons: OccasionDefinition[];
  holidays: OccasionDefinition[];
} {
  const topLevel = getTopLevelOccasions();
  const holidayHub = topLevel.find((o) => o.slug === "holidays");
  return {
    seasons: topLevel.filter((o) => o.slug !== "holidays"),
    holidays: holidayHub ? getChildOccasions(holidayHub) : [],
  };
}

export function getAllSearchCollections(): OccasionDefinition[] {
  const { seasons, holidays } = getSearchCollectionSections();
  return [...seasons, ...holidays];
}

/** Stable slug list for cover-image prefetch on Search. */
export const ALL_SEARCH_COLLECTION_SLUGS = getAllSearchCollections().map((o) => o.slug);
