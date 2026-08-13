import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  getAllTechniqueLearnEntries,
  getTechniqueTermBySlug,
} from "@/lib/cocktailTechniqueGlossary";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTechniqueLearnEntries().map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const term = getTechniqueTermBySlug(slug);
  if (!term) return {};
  return generatePageMetadata({
    title: `${term.label} — Cocktail Technique`,
    description: term.explanation,
    path: `/learn/techniques/${slug}`,
  });
}

export default async function TechniqueLearnPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getTechniqueTermBySlug(slug);
  if (!term) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <MainContainer className="py-12 sm:py-16 max-w-3xl">
        <Link href="/learn" className="text-sm font-medium text-sage hover:text-terracotta transition-colors">
          ← All techniques
        </Link>
        <h1 className="mt-6 font-display text-4xl font-bold text-forest capitalize mb-4">
          {term.label}
        </h1>
        <p className="text-lg text-forest/85 leading-relaxed mb-4">{term.explanation}</p>
        {term.why && (
          <div className="rounded-2xl border border-mist bg-white p-5 shadow-soft mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-terracotta mb-2">
              Why it matters
            </p>
            <p className="text-sm text-sage leading-relaxed">{term.why}</p>
          </div>
        )}
        <Link
          href="/cocktails"
          className="inline-flex text-sm font-medium text-terracotta hover:underline"
        >
          Browse recipes →
        </Link>
      </MainContainer>
    </div>
  );
}
