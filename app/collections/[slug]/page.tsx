import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SanityImage } from "@/lib/sanityTypes";
import type { Metadata } from "next";

export const revalidate = 60;

interface Cocktail {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImage;
  externalImageUrl?: string;
  primarySpirit?: string;
  isPopular?: boolean;
}

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
  cocktails: Cocktail[];
}

const COLLECTION_QUERY = `*[_type == "collection" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  image,
  "cocktails": cocktails[]-> {
    _id,
    name,
    slug,
    image,
    externalImageUrl,
    primarySpirit,
    isPopular
  }
}`;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection: Collection | null = await sanityClient.fetch(COLLECTION_QUERY, { slug });

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.name} | Cocktail Collections | ${SITE_CONFIG.name}`,
    description: collection.description || `Explore ${collection.cocktails?.length || 0} cocktails in the ${collection.name} collection.`,
    openGraph: {
      title: `${collection.name} | ${SITE_CONFIG.name}`,
      description: collection.description || `Explore ${collection.cocktails?.length || 0} cocktails in the ${collection.name} collection.`,
      url: `${SITE_CONFIG.url}/collections/${collection.slug.current}`,
      images: collection.image
        ? [{ url: getImageUrl(collection.image, { width: 1200, height: 630 }) || "" }]
        : undefined,
    },
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collection: Collection | null = await sanityClient.fetch(COLLECTION_QUERY, { slug });

  if (!collection) {
    notFound();
  }

  const imageUrl = getImageUrl(collection.image, { width: 1200, height: 600 });

  return (
    <>
      <WebPageSchema
        title={`${collection.name} | ${SITE_CONFIG.name}`}
        description={collection.description || `Cocktails in the ${collection.name} collection.`}
        url={`${SITE_CONFIG.url}/collections/${collection.slug.current}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Collections", url: `${SITE_CONFIG.url}/collections` },
          { name: collection.name, url: `${SITE_CONFIG.url}/collections/${collection.slug.current}` },
        ]}
      />

      <div className="py-10">
        <MainContainer>
          {/* Back link */}
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-lime-400 transition-colors mb-6"
          >
            ← All collections
          </Link>

          {/* Header */}
          <div className="mb-10">
            {imageUrl && (
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6 bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                    {collection.name}
                  </h1>
                  <p className="text-slate-300">
                    {collection.cocktails?.length || 0} cocktails
                  </p>
                </div>
              </div>
            )}
            {!imageUrl && (
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-50 mb-2">
                  {collection.name}
                </h1>
                <p className="text-slate-400">
                  {collection.cocktails?.length || 0} cocktails
                </p>
              </div>
            )}
            {collection.description && (
              <p className="text-lg text-slate-300 max-w-3xl">
                {collection.description}
              </p>
            )}
          </div>

          {/* Cocktails Grid */}
          {collection.cocktails && collection.cocktails.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collection.cocktails.map((cocktail) => (
                <CocktailCard key={cocktail._id} cocktail={cocktail} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800/30 border border-slate-700 rounded-xl">
              <p className="text-slate-400">No cocktails in this collection yet.</p>
            </div>
          )}
        </MainContainer>
      </div>
    </>
  );
}

function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  const imageUrl = getImageUrl(cocktail.image, { width: 400, height: 300 }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-5xl" aria-hidden="true">
            🍸
          </div>
        )}
        {cocktail.isPopular && (
          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded shadow-lg">
            ★ FEATURED
          </span>
        )}
      </div>
      <div className="p-5 flex-1">
        {cocktail.primarySpirit && (
          <p className="text-xs text-lime-400 font-bold tracking-widest uppercase mb-1">
            {cocktail.primarySpirit}
          </p>
        )}
        <h3 className="font-serif font-bold text-xl text-slate-100 group-hover:text-lime-400 transition-colors">
          {cocktail.name}
        </h3>
      </div>
    </Link>
  );
}

// Generate static paths
export async function generateStaticParams() {
  const collections = await sanityClient.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "collection" && defined(slug.current)]{slug}`
  );

  return collections.map((collection) => ({
    slug: collection.slug.current,
  }));
}

