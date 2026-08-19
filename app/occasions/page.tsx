import Image from "next/image";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  CollectionsGrid,
  NativeCollectionsSectionHeader,
} from "@/components/occasions/CollectionsGrid";
import { getCocktailsList } from "@/lib/cocktails.server";
import {
  countCocktailsByOccasion,
  getChildOccasions,
  getOccasionCovers,
  getTopLevelOccasions,
  toOccasionDisplay,
  type OccasionCocktail,
} from "@/lib/occasions";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { CollectionPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { NativeCollectionsIntro } from "@/components/mobile/NativeCollectionsIntro";

export const revalidate = 300;

export const metadata = generatePageMetadata({
  title: "Cocktail Collections by Season & Style",
  description:
    "Browse MixWise cocktail collections — summer, winter, holidays, sours, highballs, frozen, tropical, brunch, tiki, and more.",
  path: "/occasions",
});

export default async function OccasionsPage() {
  const cocktails = (await getCocktailsList()) as OccasionCocktail[];
  const counts = countCocktailsByOccasion(cocktails);
  const covers = getOccasionCovers(cocktails);
  const topLevel = getTopLevelOccasions();
  const holidayHub = topLevel.find((o) => o.slug === "holidays");
  const holidayChildren = holidayHub ? getChildOccasions(holidayHub) : [];
  const primary = topLevel.filter((o) => o.slug !== "holidays");

  const heroStatic = staticOccasionCoverIfPresent("summer") || staticOccasionCoverIfPresent("party");
  const heroCocktail = covers.summer || covers.party || Object.values(covers).find(Boolean) || null;
  const heroUrl = heroStatic || heroCocktail?.image_url || null;
  const heroAlt = heroCocktail?.image_alt || heroCocktail?.name || "Seasonal cocktail collections";

  return (
    <div className="min-h-screen bg-cream" data-native-collections-page>
      <CollectionPageSchema
        name="Cocktail Collections by Season & Style"
        description="Curated MixWise cocktail collections for seasons, holidays, and drink styles."
        url={`${SITE_CONFIG.url}/occasions`}
        items={topLevel.map((occasion) => ({
          name: occasion.name,
          url: `${SITE_CONFIG.url}/occasions/${occasion.slug}`,
        }))}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Collections", url: `${SITE_CONFIG.url}/occasions` },
        ]}
      />
      <section data-web-collections-chrome className="relative min-h-[42vh] sm:min-h-[48vh] overflow-hidden">
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
            Cocktail collections
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-tight text-charcoal mb-4 max-w-3xl drop-shadow-sm [text-wrap:balance]">
            Collections for every season
          </h1>
          <p className="text-forest max-w-xl text-base sm:text-lg leading-relaxed">
            Curated cocktail collections for summer patios, winter nights, holiday tables, sours, highballs, and more — without digging through tags.
          </p>
          <Link
            href="/cocktails"
            className="mt-6 inline-flex w-fit items-center text-sm font-semibold text-terracotta hover:text-forest transition-colors"
          >
            Or browse the full library
            <span className="ml-1.5" aria-hidden>
              →
            </span>
          </Link>
        </MainContainer>
      </section>

      <MainContainer className="py-10 sm:py-12 space-y-14">
        <NativeCollectionsIntro />
        <NativeCollectionsSectionHeader title="Seasons & styles" />
        <section>
          <div data-web-collections-chrome className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Collections
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-forest">
                Seasons & styles
              </h2>
            </div>
          </div>
          <CollectionsGrid
            items={primary.map((occasion) => ({
              occasion: toOccasionDisplay(occasion),
              count: counts[occasion.slug] || 0,
              cover: covers[occasion.slug],
            }))}
          />
        </section>

        {holidayHub && holidayChildren.length > 0 ? (
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p data-web-collections-chrome className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                  Nested collections
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-forest">
                  Holiday cocktails
                </h2>
                <p data-web-collections-chrome className="mt-1 text-sm text-sage max-w-xl">
                  Start with a holiday, then keep going — each page leads to sibling celebrations and related seasons.
                </p>
              </div>
              <Link
                href={`/occasions/${holidayHub.slug}`}
                className="text-sm font-semibold text-forest hover:text-terracotta transition-colors shrink-0"
              >
                All holidays →
              </Link>
            </div>
            <NativeCollectionsSectionHeader
              title="Holiday cocktails"
              dek="Seasonal celebrations and hosting picks."
              href={`/occasions/${holidayHub.slug}`}
              linkLabel="All holidays"
            />
            <CollectionsGrid
              compactGrid
              items={holidayChildren.map((occasion) => ({
                occasion: toOccasionDisplay(occasion),
                count: counts[occasion.slug] || 0,
                cover: covers[occasion.slug],
                compact: true,
              }))}
            />
          </section>
        ) : null}

        <div data-web-collections-chrome className="pt-8 border-t border-mist flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
              Full library
            </p>
            <p className="text-sm text-sage">Search, filter, and browse every MixWise recipe.</p>
          </div>
          <Link
            href="/cocktails"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-mist bg-white text-sm font-semibold text-forest hover:border-terracotta/40 hover:text-terracotta transition-colors"
          >
            Browse all recipes →
          </Link>
        </div>
      </MainContainer>
    </div>
  );
}
