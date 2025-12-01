import { sanityClient } from "@/lib/sanityClient";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { FeaturedCocktails } from "@/components/home/FeaturedCocktails";
import { PlatformSection } from "@/components/home/PlatformSection";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 60;

// Fetch featured cocktails from Sanity
const FEATURED_COCKTAILS_QUERY = `*[_type == "cocktail"] | order(isPopular desc, name asc) [0...8] {
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

export default async function HomePage() {
  const [settings, cocktails] = await Promise.all([
    sanityClient.fetch(`*[_type == "siteSettings"][0]{heroTitle, heroSubtitle}`),
    sanityClient.fetch<SanityCocktail[]>(FEATURED_COCKTAILS_QUERY)
  ]);

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

      {/* Featured Cocktails */}
      {cocktails.length > 0 && (
        <FeaturedCocktails cocktails={cocktails} />
      )}

      {/* Platform Section */}
      <PlatformSection />
    </>
  );
}

