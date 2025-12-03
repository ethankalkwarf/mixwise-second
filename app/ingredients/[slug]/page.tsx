import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { IngredientActions } from "@/components/ingredients/IngredientActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SanityImage } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import { getAllCocktails } from "@/lib/cocktails";

export const revalidate = 60;

interface Substitute {
  _id: string;
  name: string;
  slug: { current: string };
}

interface Ingredient {
  _id: string;
  name: string;
  slug: { current: string };
  type?: string;
  image?: SanityImage;
  externalImageUrl?: string;
  description?: string;
  abv?: number;
  origin?: string;
  flavorProfile?: string[];
  isStaple?: boolean;
  storageNotes?: string;
  substitutes?: Substitute[];
}

const INGREDIENT_QUERY = `*[_type == "ingredient" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  type,
  image,
  externalImageUrl,
  description,
  abv,
  origin,
  flavorProfile,
  isStaple,
  storageNotes,
  "substitutes": substitutes[]-> {
    _id,
    name,
    slug
  }
}`;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredient: Ingredient | null = await sanityClient.fetch(INGREDIENT_QUERY, { slug });

  if (!ingredient) {
    return { title: "Ingredient Not Found" };
  }

  return {
    title: `${ingredient.name} | Ingredients | ${SITE_CONFIG.name}`,
    description: ingredient.description || `Learn about ${ingredient.name} and discover cocktails you can make with it.`,
    openGraph: {
      title: `${ingredient.name} | ${SITE_CONFIG.name}`,
      description: ingredient.description || `Learn about ${ingredient.name} and discover cocktails you can make with it.`,
      url: `${SITE_CONFIG.url}/ingredients/${ingredient.slug.current}`,
      images: (ingredient.image?.asset?._ref || ingredient.externalImageUrl)
        ? [{ url: getImageUrl(ingredient.image, { width: 1200, height: 630 }) || ingredient.externalImageUrl || "" }]
        : undefined,
    },
  };
}

export default async function IngredientDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const ingredient: Ingredient | null = await sanityClient.fetch(INGREDIENT_QUERY, { slug });

  if (!ingredient) {
    notFound();
  }

  const imageUrl = getImageUrl(ingredient.image, { width: 600, height: 600 }) || ingredient.externalImageUrl;
  const cocktails = await getAllCocktails();
  const cocktailsUsingIngredient = cocktails
    .filter((cocktail) =>
      cocktail.ingredients.some((ing) => getIngredientKey(ing) === ingredient._id)
    )
    .slice(0, 12)
    .map((cocktail) => ({
      id: cocktail.id,
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.imageUrl,
      baseSpirit: cocktail.baseSpirit,
    }));

  return (
    <>
      <WebPageSchema
        title={`${ingredient.name} | ${SITE_CONFIG.name}`}
        description={ingredient.description || `Learn about ${ingredient.name}.`}
        url={`${SITE_CONFIG.url}/ingredients/${ingredient.slug.current}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Ingredients", url: `${SITE_CONFIG.url}/ingredients` },
          { name: ingredient.name, url: `${SITE_CONFIG.url}/ingredients/${ingredient.slug.current}` },
        ]}
      />

      <div className="py-10">
        <MainContainer>
          {/* Back link */}
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-lime-400 transition-colors mb-6"
          >
            ← All ingredients
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left column - Image and basic info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-8xl" aria-hidden="true">
                      🧪
                    </div>
                  )}
                  {ingredient.isStaple && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      ★ Essential
                    </span>
                  )}
                </div>

                {/* Add to bar button */}
                <IngredientActions
                  ingredient={{
                    id: ingredient._id,
                    name: ingredient.name,
                    type: ingredient.type,
                  }}
                />

                {/* Quick info */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                  {ingredient.type && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-slate-200 capitalize">{ingredient.type}</p>
                    </div>
                  )}
                  {ingredient.abv !== undefined && ingredient.abv > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ABV</p>
                      <p className="text-slate-200">{ingredient.abv}%</p>
                    </div>
                  )}
                  {ingredient.origin && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Origin</p>
                      <p className="text-slate-200">{ingredient.origin}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                {ingredient.type && (
                  <p className="text-sm text-lime-400 font-bold tracking-widest uppercase mb-2">
                    {ingredient.type}
                  </p>
                )}
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 mb-4">
                  {ingredient.name}
                </h1>
                {ingredient.description && (
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {ingredient.description}
                  </p>
                )}
              </div>

              {/* Flavor Profile */}
              {ingredient.flavorProfile && ingredient.flavorProfile.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-3">Flavor Profile</h2>
                  <div className="flex flex-wrap gap-2">
                    {ingredient.flavorProfile.map((flavor) => (
                      <span
                        key={flavor}
                        className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-sm capitalize"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Notes */}
              {ingredient.storageNotes && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                  <h2 className="text-lg font-bold text-slate-100 mb-2">Storage Tips</h2>
                  <p className="text-slate-300">{ingredient.storageNotes}</p>
                </div>
              )}

              {/* Substitutes */}
              {ingredient.substitutes && ingredient.substitutes.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-3">Substitutes</h2>
                  <div className="flex flex-wrap gap-2">
                    {ingredient.substitutes.map((sub) => (
                      <Link
                        key={sub._id}
                        href={`/ingredients/${sub.slug.current}`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Cocktails */}
              {cocktailsUsingIngredient.length > 0 && (
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-100 mb-4">
                    Cocktails with {ingredient.name}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {cocktailsUsingIngredient.map((cocktail) => (
                      <CocktailCard key={cocktail.id} cocktail={cocktail} />
                    ))}
                  </div>
                  {cocktailsUsingIngredient.length === 12 && (
                    <div className="mt-6 text-center">
                      <Link
                        href={`/cocktails?ingredient=${ingredient.name}`}
                        className="text-lime-400 hover:text-lime-300 font-medium"
                      >
                        View all cocktails with {ingredient.name} →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </MainContainer>
      </div>
    </>
  );
}

type IngredientCocktailCard = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  baseSpirit?: string | null;
};

function CocktailCard({ cocktail }: { cocktail: IngredientCocktailCard }) {
  const imageUrl = cocktail.imageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className="group flex gap-4 p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors"
    >
      <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-slate-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700 text-2xl" aria-hidden="true">
            🍸
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {cocktail.baseSpirit && (
          <p className="text-xs text-lime-400 font-bold tracking-wider uppercase">
            {cocktail.baseSpirit}
          </p>
        )}
        <h3 className="font-medium text-slate-100 group-hover:text-lime-400 transition-colors truncate">
          {cocktail.name}
        </h3>
      </div>
    </Link>
  );
}

function getIngredientKey(ingredient: { id?: string | null; name?: string | null }): string | null {
  if (ingredient.id) return ingredient.id;
  if (!ingredient.name) return null;
  return ingredient.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate static paths
export async function generateStaticParams() {
  const ingredients = await sanityClient.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "ingredient" && defined(slug.current)]{slug}`
  );

  return ingredients.map((ingredient) => ({
    slug: ingredient.slug.current,
  }));
}

