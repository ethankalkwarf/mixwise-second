import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { SectionHeader } from "@/components/common/SectionHeader";
import Link from "next/link";
import type { SanityImage } from "@/lib/sanityTypes";

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
  cocktailCount: number;
}

const FEATURED_COLLECTIONS_QUERY = `*[_type == "collection" && featured == true] | order(order asc) [0...5] {
  _id,
  name,
  slug,
  description,
  image,
  "cocktailCount": count(cocktails)
}`;

export async function FeaturedCollections() {
  const collections = await sanityClient.fetch<Collection[]>(FEATURED_COLLECTIONS_QUERY);

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="mb-16" aria-labelledby="collections-title">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Curated Collections" id="collections-title" />
        <Link
          href="/collections"
          className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {collections.map((collection) => (
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
      className="group flex-shrink-0 w-72 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10"
    >
      <div className="relative h-36 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-4xl" aria-hidden="true">
            📚
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-slate-300">
            {collection.cocktailCount} cocktail{collection.cocktailCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif font-bold text-base text-slate-100 group-hover:text-lime-400 transition-colors line-clamp-1">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-slate-500 line-clamp-1 mt-1">
            {collection.description}
          </p>
        )}
      </div>
    </Link>
  );
}

