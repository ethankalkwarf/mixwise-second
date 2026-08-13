import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { OccasionCocktailGrid } from "@/components/occasions/OccasionCocktailGrid";
import { getCocktailsList } from "@/lib/cocktails.server";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import {
  OCCASIONS,
  filterCocktailsForOccasion,
  getOccasion,
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
  const staticUrl = staticOccasionCoverIfPresent(occasion.slug);
  const heroUrl = staticUrl || cover?.image_url || null;
  const heroAlt = cover?.image_alt || cover?.name || occasion.name;

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[36vh] overflow-hidden">
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
          <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
        )}
        {/* Dim photo + opaque cream wash behind copy so bright drinks stay readable */}
        <div className="absolute inset-0 bg-forest/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/92 to-cream/25 sm:to-cream/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
        <MainContainer className="relative py-12 sm:py-16">
          <Link
            href="/occasions"
            className="inline-flex text-sm font-semibold text-forest hover:text-terracotta transition-colors mb-6"
          >
            ← All collections
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-3 drop-shadow-sm">
            {occasion.name}
          </h1>
          <p className="text-lg font-medium text-forest max-w-2xl mb-2">{occasion.headline}</p>
          <p className="text-charcoal/85 max-w-2xl leading-relaxed">{occasion.description}</p>
          <p className="mt-6 text-sm font-semibold text-forest">
            {matched.length} drink{matched.length === 1 ? "" : "s"}
          </p>
        </MainContainer>
      </section>

      <MainContainer className="py-10 sm:py-12">
        <OccasionCocktailGrid cocktails={matched} />
      </MainContainer>
    </div>
  );
}
