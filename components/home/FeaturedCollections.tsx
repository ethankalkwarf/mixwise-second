import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { SectionHeader } from "@/components/common/SectionHeader";
import Link from "next/link";
import type { SanityImage } from "@/lib/sanityTypes";
import { getAllCocktails } from "@/lib/cocktails";

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
  cocktails: Array<{ _ref: string }>;
  cocktailCount?: number;
}

const FEATURED_COLLECTIONS_QUERY = `*[_type == "collection" && featured == true] | order(order asc) [0...5] {
  _id,
  name,
  slug,
  description,
  image,
  "cocktails": cocktails[]{
    _ref
  }
}`;

export async function FeaturedCollections() {
  const [collections, cocktails] = await Promise.all([
    sanityClient.fetch<Collection[]>(FEATURED_COLLECTIONS_QUERY),
    getAllCocktails(),
  ]);

  const cocktailByLegacyId = new Map(
    cocktails.filter((cocktail) => cocktail.legacyId).map((cocktail) => [cocktail.legacyId as string, cocktail])
  );

  const enrichedCollections = collections.map((collection) => {
    const count = (collection.cocktails || []).reduce((total, ref) => {
      if (ref._ref && cocktailByLegacyId.has(ref._ref)) {
        return total + 1;
      }
      return total;
    }, 0);

    return {
      ...collection,
      cocktailCount: count,
    };
  });

  if (enrichedCollections.length === 0) {
    return null;
  }

  return (
    <section className="mb-16" aria-labelledby="collections-title">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Curated Collections" id="collections-title" />
        <Link
          href="/collections"
          className="text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
        {enrichedCollections.map((collection) => (
          <CollectionCard key={collection._id} collection={collection} />
        ))}
      </div>
    </section>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const imageUrl = getImageUrl(collection.image, { width: 400, height: 250 });

  return (
    <Link
      href={`/collections/${collection.slug.current}`}
      className="group flex-shrink-0 w-72 overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover"
    >
      <div className="relative h-36 w-full overflow-hidden bg-mist">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-4xl" aria-hidden="true">
            📚
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-forest">
            {collection.cocktailCount ?? 0} cocktail{(collection.cocktailCount ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-base text-forest group-hover:text-terracotta transition-colors line-clamp-1">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-sage line-clamp-1 mt-1">
            {collection.description}
          </p>
        )}
      </div>
    </Link>
  );
}
