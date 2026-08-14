import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { OccasionCocktailGrid } from "@/components/occasions/OccasionCocktailGrid";
import { getCocktailsList } from "@/lib/cocktails.server";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import {
  OCCASIONS,
  countCocktailsByOccasion,
  filterCocktailsForOccasion,
  getChildOccasions,
  getOccasion,
  getOccasionCovers,
  getRelatedOccasions,
  getSiblingOccasions,
  pickOccasionCover,
  type OccasionCocktail,
} from "@/lib/occasions";
import { generatePageMetadata } from "@/lib/seo";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) return {};
  return generatePageMetadata({
    title: `${occasion.name} Cocktail Recipes`,
    description: occasion.description,
    path: `/occasions/${occasion.slug}`,
  });
}

export default async function OccasionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) notFound();

  const cocktails = (await getCocktailsList()) as OccasionCocktail[];
  const matched = filterCocktailsForOccasion(cocktails, occasion);
  const cover = pickOccasionCover(occasion, cocktails);
  const covers = getOccasionCovers(cocktails);
  const counts = countCocktailsByOccasion(cocktails);
  const staticUrl =
    staticOccasionCoverIfPresent(occasion.slug) ||
    (occasion.parentSlug ? staticOccasionCoverIfPresent(occasion.parentSlug) : null);
  const heroUrl = staticUrl || cover?.image_url || null;
  const heroAlt = cover?.image_alt || cover?.name || occasion.name;

  const parent = occasion.parentSlug ? getOccasion(occasion.parentSlug) : null;
  const children = getChildOccasions(occasion);
  const siblings = getSiblingOccasions(occasion);
  const related = getRelatedOccasions(occasion, 4);

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[36vh] overflow-hidden">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            priority
            className={["object-cover", occasion.coverFocusClass || ""].join(" ")}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
        )}
        <div className="absolute inset-0 bg-forest/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/92 to-cream/25 sm:to-cream/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
        <MainContainer className="relative py-12 sm:py-16">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <Link href="/occasions" className="font-semibold text-forest hover:text-terracotta transition-colors">
              Collections
            </Link>
            {parent ? (
              <>
                <span className="text-sage" aria-hidden>
                  /
                </span>
                <Link
                  href={`/occasions/${parent.slug}`}
                  className="font-semibold text-forest hover:text-terracotta transition-colors"
                >
                  {parent.name}
                </Link>
              </>
            ) : null}
            <span className="text-sage" aria-hidden>
              /
            </span>
            <span className="text-charcoal font-medium">{occasion.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-tight text-charcoal mb-3 drop-shadow-sm break-words [text-wrap:balance]">
            {occasion.name}
          </h1>
          <p className="text-lg font-medium text-forest max-w-2xl mb-2">{occasion.headline}</p>
          <p className="text-charcoal/85 max-w-2xl leading-relaxed">{occasion.description}</p>
          <p className="mt-6 text-sm font-semibold text-forest">
            {matched.length} drink{matched.length === 1 ? "" : "s"}
          </p>
        </MainContainer>
      </section>

      <MainContainer className="py-10 sm:py-12 space-y-14">
        {children.length > 0 ? (
          <section>
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Go deeper
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest">Pick a holiday</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {children.map((child) => (
                <OccasionCard
                  key={child.slug}
                  occasion={child}
                  count={counts[child.slug] || 0}
                  cover={covers[child.slug]}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          {children.length > 0 ? (
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Full collection
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest">All {occasion.name.toLowerCase()} drinks</h2>
            </div>
          ) : null}
          <OccasionCocktailGrid cocktails={matched} />
        </section>

        {siblings.length > 0 ? (
          <section className="border-t border-mist pt-10">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Keep browsing
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest">More holidays</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {siblings.map((sib) => (
                <OccasionCard
                  key={sib.slug}
                  occasion={sib}
                  count={counts[sib.slug] || 0}
                  cover={covers[sib.slug]}
                  compact
                />
              ))}
            </div>
            {parent ? (
              <Link
                href={`/occasions/${parent.slug}`}
                className="mt-6 inline-flex text-sm font-semibold text-forest hover:text-terracotta transition-colors"
              >
                ← Back to {parent.name}
              </Link>
            ) : null}
          </section>
        ) : null}

        {related.length > 0 && siblings.length === 0 ? (
          <section className="border-t border-mist pt-10">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Keep browsing
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest">Related collections</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <OccasionCard
                  key={item.slug}
                  occasion={item}
                  count={counts[item.slug] || 0}
                  cover={covers[item.slug]}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 && siblings.length > 0 ? (
          <section className="border-t border-mist pt-10">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Also explore
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest">Other collections</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/occasions/${item.slug}`}
                  className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-forest hover:border-terracotta/40 hover:text-terracotta transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/occasions"
                className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-semibold text-charcoal hover:border-terracotta/40 hover:text-terracotta transition-colors"
              >
                All collections →
              </Link>
            </div>
          </section>
        ) : null}
      </MainContainer>
    </div>
  );
}
