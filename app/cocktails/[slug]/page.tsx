import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { RecipeSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { BackToCocktails } from "@/components/cocktails/BackToCocktails";
import { generateCocktailMetadata, SITE_CONFIG } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import { CocktailHero } from "@/components/cocktails/CocktailHero";
import { IngredientCard } from "@/components/cocktails/IngredientCard";
import { FlavorProfile } from "@/components/cocktails/FlavorProfile";
import { FunFactCard } from "@/components/cocktails/FunFactCard";
import { InstructionList } from "@/components/cocktails/InstructionList";
import { BestForCard } from "@/components/cocktails/BestForCard";

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
    `${item.amount ? item.amount + " " : ""}${item.ingredient?.name || "Unknown"}`
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

      <div className="py-8 lg:py-12 bg-cream min-h-screen">
        <MainContainer>
          {/* Back Link */}
          <div className="mb-8">
            <BackToCocktails />
          </div>

          <article className="space-y-12">
            {/* Hero Section */}
            <CocktailHero cocktail={cocktail} imageUrl={imageUrl} />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column - Tools & Ingredients (Sticky) */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24 space-y-8">
                  <IngredientCard ingredients={cocktail.ingredients || []} garnish={cocktail.garnish} />
                </div>
              </div>

              {/* Right Column - Experience & Instructions */}
              <div className="lg:col-span-7 space-y-10">
                {/* Enriched Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cocktail.flavorProfile && (
                    <FlavorProfile profile={cocktail.flavorProfile} />
                  )}
                  {cocktail.bestFor && cocktail.bestFor.length > 0 && (
                    <BestForCard bestFor={cocktail.bestFor} />
                  )}
                </div>

                {/* Fun Fact Card */}
                {cocktail.funFact && (
                  <FunFactCard 
                    fact={cocktail.funFact} 
                    sources={cocktail.funFactSources} 
                  />
                )}

                {/* Instructions */}
                {cocktail.instructions && (
                  <InstructionList 
                    instructions={cocktail.instructions} 
                    tips={cocktail.tips} 
                  />
                )}
              </div>
            </div>
          </article>
        </MainContainer>
      </div>
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
