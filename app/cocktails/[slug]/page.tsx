import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { RecipeSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { BackToCocktails } from "@/components/cocktails/BackToCocktails";
import { generateCocktailMetadata, SITE_CONFIG } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import { CocktailHero } from "@/components/cocktails/CocktailHero";
import { CocktailIngredientsCard } from "@/components/cocktails/CocktailIngredientsCard";
import { CocktailTools } from "@/components/cocktails/CocktailTools";
import { CocktailFlavorProfileCard } from "@/components/cocktails/CocktailFlavorProfileCard";
import { CocktailBestForCard } from "@/components/cocktails/CocktailBestForCard";
import { CocktailFunFactCard } from "@/components/cocktails/CocktailFunFactCard";
import { CocktailInstructions } from "@/components/cocktails/CocktailInstructions";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

// GROQ query to fetch a single cocktail by slug
const COCKTAIL_QUERY = `*[_type == "cocktail" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  image,
  externalImageUrl,
  description,
  "ingredients": ingredients[] {
    _key,
    amount,
    isOptional,
    notes,
    "ingredient": ingredient-> {
      _id,
      name,
      type,
      slug
    }
  },
  instructions,
  glass,
  method,
  garnish,
  tags,
  drinkCategories,
  primarySpirit,
  isPopular,
  isFavorite,
  isTrending,
  history,
  tips,
  funFact,
  funFactSources[]{label, url},
  flavorProfile,
  bestFor,
  seoTitle,
  metaDescription,
  imageAltOverride
}`;

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cocktail: SanityCocktail | null = await sanityClient.fetch(COCKTAIL_QUERY, { slug });

  if (!cocktail) {
    return { title: "Cocktail Not Found" };
  }

  return generateCocktailMetadata(cocktail);
}

export default async function CocktailDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cocktail: SanityCocktail | null = await sanityClient.fetch(COCKTAIL_QUERY, { slug });

  if (!cocktail) {
    notFound();
  }

  // Use uploaded Sanity image, or fall back to external URL
  const imageUrl = getImageUrl(cocktail.image, { width: 1200, height: 1200 }) || cocktail.externalImageUrl || null;

  // Build ingredients list for schema
  const ingredientsList = cocktail.ingredients?.map((item) =>
    `${item.amount ? item.amount + " " : ""}${item.ingredient?.name || "Ingredient"}`
  ) || [];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <RecipeSchema
        name={cocktail.name}
        description={cocktail.description}
        image={imageUrl}
        ingredients={ingredientsList}
        category={cocktail.primarySpirit ? `${cocktail.primarySpirit} Cocktail` : "Cocktail"}
        url={`${SITE_CONFIG.url}/cocktails/${cocktail.slug.current}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Cocktails", url: `${SITE_CONFIG.url}/cocktails` },
          { name: cocktail.name, url: `${SITE_CONFIG.url}/cocktails/${cocktail.slug.current}` },
        ]}
      />

      {/* MAIN PAGE WRAPPER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back Link */}
        <div className="mb-8">
          <BackToCocktails />
        </div>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16 items-start">
          <CocktailHero cocktail={cocktail} imageUrl={imageUrl} />
        </section>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* INGREDIENTS COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 sticky top-24">
              <CocktailIngredientsCard ingredients={cocktail.ingredients || []} />
              <div className="mt-8 pt-6 border-t border-gray-100">
                <CocktailTools method={cocktail.method} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 space-y-10">
            {/* FLAVOR + BEST FOR GRID */}
            {(cocktail.flavorProfile || cocktail.bestFor) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cocktail.flavorProfile && (
                  <CocktailFlavorProfileCard profile={cocktail.flavorProfile} />
                )}
                {cocktail.bestFor && cocktail.bestFor.length > 0 && (
                  <CocktailBestForCard bestFor={cocktail.bestFor} />
                )}
              </div>
            )}

            {/* FUN FACT */}
            {cocktail.funFact && (
              <CocktailFunFactCard
                fact={cocktail.funFact}
                sources={cocktail.funFactSources}
              />
            )}

            {/* INSTRUCTIONS */}
            {cocktail.instructions && (
              <CocktailInstructions
                instructions={cocktail.instructions}
                tips={cocktail.tips}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

// Generate static paths for known cocktails
export async function generateStaticParams() {
  const cocktails = await sanityClient.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "cocktail" && defined(slug.current)]{slug}`
  );

  return cocktails.map((cocktail) => ({
    slug: cocktail.slug.current,
  }));
}
