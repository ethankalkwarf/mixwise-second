import { sanityClient } from "@/lib/sanityClient";
import { getImageUrl } from "@/lib/sanityImage";
import { MainContainer } from "@/components/layout/MainContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/common/Button";
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
    <div className="py-10">
      <MainContainer>
        {/* Hero Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-50 mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg text-slate-300 mb-8">
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

        {/* Featured Cocktails */}
        {cocktails.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <SectionHeader title="Featured Cocktails" />
              <Link
                href="/cocktails"
                className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cocktails.map((cocktail) => (
                <FeaturedCocktailCard key={cocktail._id} cocktail={cocktail} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State - Show when no cocktails */}
        {cocktails.length === 0 && (
          <section className="mb-16">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
              <div className="text-5xl mb-4">🍸</div>
              <h2 className="text-xl font-serif font-bold text-slate-200 mb-2">
                No cocktails yet
              </h2>
              <p className="text-slate-400 mb-6">
                Create your first cocktail in Sanity Studio to see it here.
              </p>
              <Link href="/studio">
                <Button variant="secondary">Open Studio</Button>
              </Link>
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            title="Manage Content"
            description="Add and edit cocktails, ingredients, and more in Sanity Studio."
            href="/studio"
            icon="✏️"
          />
        </section>
      </MainContainer>
    </div>
  );
}

function FeaturedCocktailCard({ cocktail }: { cocktail: SanityCocktail & { ingredientCount?: number } }) {
  const imageUrl = getImageUrl(cocktail.image, { width: 400, height: 300 });

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={cocktail.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-4xl">
            🍸
          </div>
        )}
        {cocktail.isPopular && (
          <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded">
            ★ FEATURED
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {cocktail.primarySpirit && (
          <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase mb-1">
            {cocktail.primarySpirit}
          </p>
        )}
        <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-lime-400 transition-colors">
          {cocktail.name}
        </h3>
        {cocktail.ingredientCount !== undefined && (
          <p className="text-xs text-slate-500 mt-auto pt-2">
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
      className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-lime-500/30 hover:bg-slate-900"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-slate-100 mb-2 group-hover:text-lime-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}
