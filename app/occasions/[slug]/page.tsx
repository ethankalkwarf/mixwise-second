import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { OccasionCocktailGrid } from "@/components/occasions/OccasionCocktailGrid";
import { getCocktailsList } from "@/lib/cocktails.server";
import {
  OCCASIONS,
  filterCocktailsForOccasion,
  getOccasion,
  type OccasionCocktail,
} from "@/lib/occasions";
import { generatePageMetadata } from "@/lib/seo";

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

  return (
    <div className="min-h-screen bg-cream">
      <div className={`relative overflow-hidden border-b border-mist bg-gradient-to-br ${occasion.accentClass}`}>
        <MainContainer className="relative py-12 sm:py-14">
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
      </div>

      <MainContainer className="py-10 sm:py-12">
        <OccasionCocktailGrid cocktails={matched} />
      </MainContainer>
    </div>
  );
}
