import { getCocktailsList } from "@/lib/cocktails.server";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { PlatformSection } from "@/components/home/PlatformSection";
import { PersonalizedSections } from "@/components/home/PersonalizedSections";
import { FeaturedCocktailsWrapper } from "@/components/home/FeaturedCocktailsWrapper";
import { GuestExperienceSection } from "@/components/home/GuestExperienceSection";
import { EmailCaptureSection } from "@/components/home/EmailCaptureSection";
import { HomePageWrapper } from "@/components/mobile/HomePageWrapper";
import { isNativeAppRequest } from "@/lib/mobile/serverNative";
import { buildOccasionCoverMap } from "@/lib/mobile/collectionCovers";
import { HOME_COLLECTION_STACK_SLUGS } from "@/lib/mobile/collectionShortcuts";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 60;

// Helper function to map Supabase cocktails to Sanity format for compatibility
function mapSupabaseToSanityForHome(cocktails: any[]): SanityCocktail[] {
  return cocktails.map(cocktail => ({
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description,
    externalImageUrl: cocktail.image_url,
    primarySpirit: cocktail.base_spirit,
    isPopular: cocktail.metadata_json?.isPopular || false,
    createdAt: cocktail.created_at || undefined,
    ingredients: (cocktail.ingredients || []).map((ing: any, index: number) => ({
      _key: `ing${index}`,
      ingredient: ing.ingredient ? {
        _id: ing.ingredient.id,
        name: ing.ingredient.name,
        type: ing.ingredient.type || 'other'
      } : null,
      amount: ing.amount,
      isOptional: ing.isOptional,
      notes: ing.notes,
    })),
  }));
}

export default async function HomePage() {
  const native = await isNativeAppRequest();

  if (native) {
    const catalog = await getCocktailsList();
    const occasionCovers = buildOccasionCoverMap(HOME_COLLECTION_STACK_SLUGS, catalog);
    const withImages = catalog.filter((c) => c.image_url);
    const preview = mapSupabaseToSanityForHome(withImages.slice(0, 24));

    return (
      <HomePageWrapper
        featuredCocktails={preview.slice(0, 6)}
        allCocktails={preview}
        occasionCovers={occasionCovers}
        forceNative
      >
        <div data-web-home aria-hidden className="hidden" />
      </HomePageWrapper>
    );
  }

  const allCocktailsList = await getCocktailsList({ limit: 50 });

  // Convert to Sanity format for compatibility
  const allCocktails = mapSupabaseToSanityForHome(allCocktailsList);

  // Filter for popular cocktails, fallback to first 20 cocktails if no popular ones exist
  const popularCocktails = allCocktails.filter(c => c.isPopular);
  const featuredCocktails = popularCocktails.length > 0
    ? [...popularCocktails].sort(() => Math.random() - 0.5).slice(0, 5)
    : [...allCocktails].sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <>
      <WebPageSchema
        title={`${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`}
        description={SITE_CONFIG.description}
        url={SITE_CONFIG.url}
      />

      <HomePageWrapper featuredCocktails={featuredCocktails} allCocktails={allCocktails}>
        <div data-web-home>
          <Hero />

          <PersonalizedSections
            allCocktails={allCocktails}
            featuredCocktails={featuredCocktails}
          />

          {featuredCocktails.length > 0 && (
            <FeaturedCocktailsWrapper cocktails={featuredCocktails} />
          )}

          <GuestExperienceSection />
          <EmailCaptureSection />
          <PlatformSection />
        </div>
      </HomePageWrapper>
    </>
  );
}
