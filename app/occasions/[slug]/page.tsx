import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { OccasionCocktailGrid } from "@/components/occasions/OccasionCocktailGrid";
import { getCocktailsList } from "@/lib/cocktails.server";
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
    title: `${occasion.name} Cocktails`,
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

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[36vh] overflow-hidden">
        {cover?.image_url ? (
          <Image
            src={cover.image_url}
            alt={cover.image_alt || cover.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/60 to-forest/30" />
        <MainContainer className="relative py-12 sm:py-16">
          <Link
            href="/occasions"
            className="inline-flex text-sm font-medium text-sage hover:text-terracotta transition-colors mb-6"
          >
            ← All occasions
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-3">{occasion.name}</h1>
          <p className="text-lg text-forest/80 max-w-2xl mb-2">{occasion.headline}</p>
          <p className="text-sage max-w-2xl">{occasion.description}</p>
          <p className="mt-6 text-sm font-medium text-forest/70">
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
