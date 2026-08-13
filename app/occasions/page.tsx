import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { getCocktailsList } from "@/lib/cocktails.server";
import { OCCASIONS, countCocktailsByOccasion, type OccasionCocktail } from "@/lib/occasions";
import { generatePageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Occasions",
  description: "Browse MixWise cocktails by season and occasion — summer, fall, holidays, brunch, zero-proof, and more.",
  path: "/occasions",
});

export default async function OccasionsPage() {
  const cocktails = (await getCocktailsList()) as OccasionCocktail[];
  const counts = countCocktailsByOccasion(cocktails);

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative overflow-hidden border-b border-mist">
        <div className="absolute inset-0 bg-gradient-to-br from-forest/10 via-cream to-olive/10" />
        <MainContainer className="relative py-14 sm:py-16">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            Browse by moment
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-4 max-w-2xl">
            Occasions
          </h1>
          <p className="text-sage max-w-xl text-base sm:text-lg">
            Seasonal and hosting collections pulled from the live library — so summer, holidays, and zero-proof drinks are easy to find without hunting tags.
          </p>
        </MainContainer>
      </div>

      <MainContainer className="py-10 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {OCCASIONS.map((occasion) => {
            const count = counts[occasion.slug] || 0;
            return (
              <Link
                key={occasion.slug}
                href={`/occasions/${occasion.slug}`}
                className={`group relative overflow-hidden rounded-3xl border border-mist bg-gradient-to-br ${occasion.accentClass} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}
              >
                <div className="relative z-10 flex h-full flex-col min-h-[160px]">
                  <h2 className="font-display text-2xl font-bold text-forest mb-2 group-hover:text-terracotta transition-colors">
                    {occasion.name}
                  </h2>
                  <p className="text-sm text-sage mb-4 flex-1">{occasion.headline}</p>
                  <p className="text-xs font-medium text-forest/70">
                    {count} drink{count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-mist flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-sage">Looking for something specific?</p>
          <Link
            href="/cocktails"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-mist bg-white text-sm font-medium text-forest hover:border-terracotta/40 hover:text-terracotta transition-colors"
          >
            Browse all recipes
          </Link>
        </div>
      </MainContainer>
    </div>
  );
}
