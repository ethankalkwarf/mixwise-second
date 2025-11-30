import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import Link from "next/link";
import type { SanityImage } from "@/lib/sanityTypes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Cocktail Collections | ${SITE_CONFIG.name}`,
  description: "Curated cocktail collections to inspire your next drink. From tiki classics to easy 3-ingredient recipes.",
  openGraph: {
    title: `Cocktail Collections | ${SITE_CONFIG.name}`,
    description: "Curated cocktail collections to inspire your next drink.",
    url: `${SITE_CONFIG.url}/collections`,
  },
};

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
  cocktailCount: number;
  featured: boolean;
}

const COLLECTIONS_QUERY = `*[_type == "collection"] | order(order asc, name asc) {
  _id,
  name,
  slug,
  description,
  image,
  featured,
  "cocktailCount": count(cocktails)
}`;

export default async function CollectionsPage() {
  const collections = await sanityClient.fetch<Collection[]>(COLLECTIONS_QUERY);

  return (
    <>
      <WebPageSchema
        title={`Cocktail Collections | ${SITE_CONFIG.name}`}
        description="Curated cocktail collections to inspire your next drink."
        url={`${SITE_CONFIG.url}/collections`}
      />

      <div className="py-10">
        <MainContainer>
          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif font-bold text-slate-50 mb-4">
              Cocktail Collections
            </h1>
            <p className="text-lg text-slate-400">
              Explore curated collections of cocktails for every occasion, mood, and skill level.
            </p>
          </div>

          {/* Collections Grid */}
          {collections.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection._id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-800/30 border border-slate-700 rounded-2xl">
              <div className="text-6xl mb-5" aria-hidden="true">📚</div>
              <h2 className="text-xl font-bold text-slate-200 mb-2">No collections yet</h2>
              <p className="text-slate-400 mb-6">
                Collections are coming soon. Check back later!
              </p>
              <Link
                href="/cocktails"
                className="inline-flex px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors"
              >
                Browse all cocktails
              </Link>
            </div>
          )}
        </MainContainer>
      </div>
    </>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const imageUrl = getImageUrl(collection.image, { width: 600, height: 400 });

  return (
    <Link
      href={`/collections/${collection.slug.current}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-6xl" aria-hidden="true">
            📚
          </div>
        )}
        {collection.featured && (
          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded shadow-lg">
            ★ FEATURED
          </span>
        )}
        {/* Cocktail count overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-sm font-medium text-slate-200">
            {collection.cocktailCount} cocktail{collection.cocktailCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="font-serif font-bold text-xl text-slate-100 group-hover:text-lime-400 transition-colors mb-2">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="text-sm text-slate-400 line-clamp-2">
            {collection.description}
          </p>
        )}
      </div>
    </Link>
  );
}

