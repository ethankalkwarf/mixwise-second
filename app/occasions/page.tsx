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
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { generatePageMetadata } from "@/lib/seo";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Cocktail Recipes by Season & Occasion",
  description:
    "Find cocktail recipes for summer, fall, holidays, brunch, parties, aperitivo, tiki, and zero-proof — curated collections from the MixWise library.",
  path: "/occasions",
});

export default async function OccasionsPage() {
  const cocktails = (await getCocktailsList()) as OccasionCocktail[];
  const counts = countCocktailsByOccasion(cocktails);
  const covers = getOccasionCovers(cocktails);
  const heroStatic = staticOccasionCoverIfPresent("summer") || staticOccasionCoverIfPresent("party");
  const heroCocktail = covers.summer || covers.party || Object.values(covers).find(Boolean) || null;
  const heroUrl = heroStatic || heroCocktail?.image_url || null;
  const heroAlt = heroCocktail?.image_alt || heroCocktail?.name || "Seasonal cocktail collections";

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[42vh] sm:min-h-[48vh] overflow-hidden">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
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
        <div className="absolute inset-0 bg-forest/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/92 to-cream/25 sm:to-cream/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/45 to-transparent" />
        <MainContainer className="relative flex min-h-[42vh] sm:min-h-[48vh] flex-col justify-end pb-12 pt-24">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            Browse by moment
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-charcoal mb-4 max-w-3xl drop-shadow-sm [text-wrap:balance]">
            Cocktail recipes for every season
          </h1>
          <p className="text-forest max-w-xl text-base sm:text-lg leading-relaxed">
            Curated collections for summer patios, holiday tables, brunch, parties, and more — without digging through tags.
          </p>
        </MainContainer>
      </section>

      <MainContainer className="py-10 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {OCCASIONS.map((occasion) => {
            const count = counts[occasion.slug] || 0;
            const cover = covers[occasion.slug];
            const imageUrl = staticOccasionCoverIfPresent(occasion.slug) || cover?.image_url || null;
            return (
              <Link
                key={occasion.slug}
                href={`/occasions/${occasion.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-mist bg-white min-h-[280px] transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cover?.image_alt || cover?.name || occasion.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
                )}
                {/* Strong bottom scrim so cream type stays readable on bright Envato covers */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/10" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/90 to-transparent" />
                <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-end p-5">
                  <h2
                    className="font-sans text-[1.35rem] font-semibold tracking-tight text-cream mb-1.5 transition-colors group-hover:text-olive"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
                  >
                    {occasion.name}
                  </h2>
                  <p
                    className="text-sm font-medium text-cream mb-3 leading-snug"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                  >
                    {occasion.headline}
                  </p>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide text-cream"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
                  >
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
