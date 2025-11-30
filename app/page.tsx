import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/common/Button";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { PersonalizedSections } from "@/components/home/PersonalizedSections";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import Link from "next/link";
import type { SanityCocktail } from "@/lib/sanityTypes";

export const revalidate = 60;

// Fetch featured cocktails from Sanity
const FEATURED_COCKTAILS_QUERY = `*[_type == "cocktail"] | order(isPopular desc, name asc) [0...6] {
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

// Fetch all cocktails with ingredients for personalized matching
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
    sanityClient.fetch(ALL_COCKTAILS_QUERY)
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

      <div className="py-12 sm:py-16">
        <MainContainer>
          {/* Hero Section */}
          <section className="mb-20 text-center max-w-4xl mx-auto" aria-labelledby="hero-title">
            <h1 
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-50 mb-6 leading-tight"
            >
              {heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cocktails">
                <Button>Browse Cocktails</Button>
              </Link>
              <Link href="/mix">
                <Button variant="secondary">Mix with What You Have</Button>
              </Link>
            </div>
          </section>

          {/* Personalized Sections (for authenticated users) */}
          <div className="mb-20">
            <PersonalizedSections allCocktails={allCocktails} featuredCocktails={cocktails} />
          </div>

          {/* Featured Cocktails (fallback for anonymous users) */}
          {cocktails.length > 0 && (
            <section className="mb-20" aria-labelledby="featured-title">
              <div className="flex items-center justify-between mb-8">
                <SectionHeader title="Featured Cocktails" id="featured-title" />
                <Link
                  href="/cocktails"
                  className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {cocktails.map((cocktail) => (
                  <FeaturedCocktailCard key={cocktail._id} cocktail={cocktail} />
                ))}
              </div>
            </section>
          )}

          {/* Featured Collections */}
          <FeaturedCollections />

          {/* Empty State */}
          {cocktails.length === 0 && (
            <section className="mb-20">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">
                <div className="text-6xl mb-5" aria-hidden="true">🍸</div>
                <h2 className="text-2xl font-serif font-bold text-slate-200 mb-3">
                  No cocktails yet
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Create your first cocktail in Sanity Studio to see it here.
                </p>
                <Link href="/studio">
                  <Button variant="secondary">Open Studio</Button>
                </Link>
              </div>
            </section>
          )}

          {/* Quick Links */}
          <section aria-labelledby="explore-title">
            <h2 id="explore-title" className="sr-only">Explore MixWise</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <QuickLinkCard
                title="Browse Recipes"
                description="Explore our collection of cocktail recipes with detailed ingredients and instructions."
                href="/cocktails"
                icon="📚"
              />
              <QuickLinkCard
                title="Mix Tool"
                description="Find cocktails you can make with the ingredients you already have at home."
                href="/mix"
                icon="🧪"
              />
              <QuickLinkCard
                title="About MixWise"
                description="Learn about our mission to make cocktail learning simple and accessible."
                href="/about"
                icon="💡"
              />
            </div>
          </section>
        </MainContainer>
      </div>
    </>
  );
}

function FeaturedCocktailCard({ cocktail }: { cocktail: SanityCocktail & { ingredientCount?: number } }) {
  const imageUrl = getImageUrl(cocktail.image, { width: 400, height: 300 }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
      role="listitem"
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
      <div className="p-5 flex-1 flex flex-col">
        {cocktail.primarySpirit && (
          <p className="text-xs text-lime-400 font-bold tracking-widest uppercase mb-1">
            {cocktail.primarySpirit}
          </p>
        )}
        <h3 className="font-serif font-bold text-xl text-slate-100 group-hover:text-lime-400 transition-colors">
          {cocktail.name}
        </h3>
        {cocktail.ingredientCount !== undefined && (
          <p className="text-sm text-slate-500 mt-auto pt-3">
            {cocktail.ingredientCount} ingredient{cocktail.ingredientCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  icon
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-lime-500/30 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
    >
      <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-bold text-lg text-slate-100 mb-2 group-hover:text-lime-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </Link>
  );
}
