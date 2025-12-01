import { sanityClient } from "@/lib/sanityClient";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { FeaturedCocktails } from "@/components/home/FeaturedCocktails";
import { PlatformSection } from "@/components/home/PlatformSection";
import { PersonalizedSections } from "@/components/home/PersonalizedSections";
import { FeaturedCocktailsWrapper } from "@/components/home/FeaturedCocktailsWrapper";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 60;

// Fetch popular cocktails from Sanity (will be randomized client-side)
const FEATURED_COCKTAILS_QUERY = `*[_type == "cocktail" && isPopular == true] [0...50] {
  _id,
  name,
  slug,
  description,
  image,
  externalImageUrl,
  primarySpirit,
  isPopular,
  "ingredientCount": count(ingredients)
}`;

// Fetch all cocktails for personalized sections (with ingredient refs)
const ALL_COCKTAILS_QUERY = `*[_type == "cocktail"] {
  _id,
  name,
  slug,
  image,
  externalImageUrl,
  primarySpirit,
  "ingredients": ingredients[] {
    "ingredient": ingredient-> {
      _id,
      name
    }
  }
}`;

export default async function HomePage() {
  const [settings, cocktails, allCocktails] = await Promise.all([
    sanityClient.fetch(`*[_type == "siteSettings"][0]{heroTitle, heroSubtitle}`),
    sanityClient.fetch<SanityCocktail[]>(FEATURED_COCKTAILS_QUERY),
    sanityClient.fetch(ALL_COCKTAILS_QUERY),
  ]);

  // Randomize featured cocktails on each page load
  const featuredCocktails = [...cocktails].sort(() => Math.random() - 0.5).slice(0, 8);

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
