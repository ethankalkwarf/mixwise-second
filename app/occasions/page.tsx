import Image from "next/image";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { getCocktailsList } from "@/lib/cocktails.server";
import {
  OCCASIONS,
  countCocktailsByOccasion,
  getOccasionCovers,
  type OccasionCocktail,
} from "@/lib/occasions";
import { generatePageMetadata } from "@/lib/seo";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Occasions",
  description: "Browse MixWise cocktails by season and occasion — summer, fall, holidays, brunch, zero-proof, and more.",
  path: "/occasions",
});

export default async function OccasionsPage() {
  const cocktails = (await getCocktailsList()) as OccasionCocktail[];
  const counts = countCocktailsByOccasion(cocktails);
  const covers = getOccasionCovers(cocktails);
  const hero = covers.summer || covers.party || Object.values(covers).find(Boolean) || null;

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[42vh] sm:min-h-[48vh] overflow-hidden">
        {hero?.image_url ? (
          <Image
            src={hero.image_url}
            alt={hero.image_alt || hero.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/90 to-olive/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/55 to-forest/35" />
        <MainContainer className="relative flex min-h-[42vh] sm:min-h-[48vh] flex-col justify-end pb-12 pt-24">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            Browse by moment
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-forest mb-4 max-w-2xl">
            Occasions
          </h1>
          <p className="text-forest/80 max-w-xl text-base sm:text-lg">
            Seasonal and hosting collections from the live library — summer patios to holiday tables, without digging through tags.
          </p>
        </MainContainer>
      </section>

      <MainContainer className="py-10 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {OCCASIONS.map((occasion) => {
            const count = counts[occasion.slug] || 0;
            const cover = covers[occasion.slug];
            return (
              <Link
                key={occasion.slug}
                href={`/occasions/${occasion.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-mist bg-white min-h-[280px] transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {cover?.image_url ? (
                  <Image
                    src={cover.image_url}
                    alt={cover.image_alt || cover.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/35 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-5 text-cream">
                  <h2 className="font-display text-2xl font-bold mb-1 group-hover:text-olive transition-colors">
                    {occasion.name}
                  </h2>
                  <p className="text-sm text-cream/85 mb-3">{occasion.headline}</p>
                  <p className="text-xs font-medium text-cream/70">
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
