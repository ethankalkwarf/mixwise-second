import { sanityClient } from "@/lib/sanityClient";
import { getCocktailsList } from "@/lib/cocktails.server";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { FeaturedCocktails } from "@/components/home/FeaturedCocktails";
import { PlatformSection } from "@/components/home/PlatformSection";
import { PersonalizedSections } from "@/components/home/PersonalizedSections";
import { FeaturedCocktailsWrapper } from "@/components/home/FeaturedCocktailsWrapper";
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
  const [settings, allCocktailsList] = await Promise.all([
    sanityClient.fetch(`*[_type == "siteSettings"][0]{heroTitle, heroSubtitle}`),
    getCocktailsList({ limit: 50 }), // Get cocktails from Supabase
  ]);

  // Convert to Sanity format for compatibility
  const allCocktails = mapSupabaseToSanityForHome(allCocktailsList);

  // Filter for popular cocktails and randomize
  const popularCocktails = allCocktails.filter(c => c.isPopular);
  const featuredCocktails = [...popularCocktails].sort(() => Math.random() - 0.5).slice(0, 8);

  const heroTitle = settings?.heroTitle || "Discover Your Next Favorite Cocktail";
  const heroSubtitle =
    settings?.heroSubtitle ||
    "Browse handcrafted cocktail recipes, find what you can make with ingredients you have, and expand your mixology skills.";

  return (
    <>
      <WebPageSchema
        title={`${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`}
        description={SITE_CONFIG.description}
        url={SITE_CONFIG.url}
      />

      {/* Hero Section */}
      <Hero title={heroTitle} subtitle={heroSubtitle} />

      {/* Personalized Sections for Logged-in Users */}
      <section className="bg-cream py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PersonalizedSections
            allCocktails={allCocktails}
            featuredCocktails={featuredCocktails}
          />
        </div>
      </section>

      {/* Featured Cocktails */}
      {featuredCocktails.length > 0 && (
        <FeaturedCocktailsWrapper cocktails={featuredCocktails} />
      )}

      {/* Platform Section */}
      <PlatformSection />
    </>
  );
}
