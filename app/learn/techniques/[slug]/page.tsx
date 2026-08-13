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

  const related = getAllTechniqueLearnEntries()
    .filter((t) => t.slug !== slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-mist bg-gradient-to-br from-olive/15 via-cream to-cream">
        <MainContainer className="py-12 sm:py-16 max-w-3xl">
          <Link href="/learn" className="text-sm font-medium text-sage hover:text-terracotta transition-colors">
            ← Learn library
          </Link>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-terracotta font-bold">
            Technique
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-forest capitalize mb-4">
            {term.label}
          </h1>
          <p className="text-lg text-forest/85 leading-relaxed">{term.explanation}</p>
        </MainContainer>
      </div>

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-8">
        {term.why && (
          <section className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-widest text-terracotta mb-3">
              Why it matters
            </p>
            <p className="text-base text-sage leading-relaxed">{term.why}</p>
          </section>
        )}

        <section className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-widest text-terracotta mb-3">
            Practice it
          </p>
          <p className="text-base text-sage leading-relaxed mb-4">
            Open a recipe that uses this move, read the tip above the steps, and make the drink once focusing only on this technique. Repetition beats reading alone.
          </p>
          <Link href="/cocktails" className="text-sm font-medium text-terracotta hover:underline">
            Browse recipes →
          </Link>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-forest mb-3">Related techniques</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/learn/techniques/${item.slug}`}
                  className="block rounded-xl border border-mist bg-white px-4 py-3 text-sm font-medium text-forest capitalize hover:border-terracotta/30"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </MainContainer>
    </div>
  );
}
