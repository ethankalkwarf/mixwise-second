import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnPracticeCocktails } from "@/components/learn/LearnPracticeCocktails";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnTechniqueVisual } from "@/components/learn/LearnTechniqueVisual";
import {
  getAllTechniqueLearnEntries,
  getTechniqueTermBySlug,
} from "@/lib/cocktailTechniqueGlossary";
import { LEARN_METHODS } from "@/lib/learnLibrary";
import { generatePageMetadata } from "@/lib/seo";

const TECHNIQUE_PRACTICE: Record<string, string[]> = {
  "dry-shake": ["whiskey-sour", "clover-club", "pisco-sour", "amaretto-sour"],
  "fine-strain": ["daiquiri", "aviation", "last-word", "martini"],
  express: ["old-fashioned", "martini", "sazerac", "negroni"],
  muddle: ["mojito", "whiskey-smash", "caipirinha", "gin-basil-smash"],
  swizzle: ["queens-park-swizzle", "chartreuse-swizzle"],
  rinse: ["sazerac", "remember-the-maine"],
  float: ["new-york-sour", "mai-tai"],
  layer: ["new-york-sour", "black-and-tan"],
  build: ["gin-and-tonic", "paloma", "americano", "dark-n-stormy"],
};

const TECHNIQUE_COVER: Record<string, { src: string; alt: string }> = {
  "dry-shake": { src: "/learn/technique-dry-shake.webp", alt: "Dry shaking a cocktail tin" },
  "fine-strain": { src: "/learn/technique-fine-strain.webp", alt: "Fine-straining into a coupe" },
  express: { src: "/learn/technique-express.webp", alt: "Expressing citrus peel over a cocktail" },
  muddle: { src: "/learn/technique-muddle.webp", alt: "Muddling mint in a glass" },
  swizzle: { src: "/learn/technique-swizzle.webp", alt: "Swizzling crushed ice" },
  rinse: { src: "/learn/technique-rinse.webp", alt: "Absinthe rinse coating a glass" },
  float: { src: "/learn/technique-float.webp", alt: "Floating a layer over a sour" },
  layer: { src: "/learn/method-layer.webp", alt: "Layered density bands in a glass" },
  build: { src: "/learn/method-build.webp", alt: "Building a highball over ice" },
};

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
  const practiceSlugs = TECHNIQUE_PRACTICE[slug] ?? [];
  const cover = TECHNIQUE_COVER[slug] ?? {
    src: "/learn/method-shake.webp",
    alt: term.label,
  };
  const relatedMethod = LEARN_METHODS.find(
    (m) =>
      m.relatedTechniqueSlugs.includes(slug) ||
      m.slug === slug ||
      m.label.toLowerCase() === term.label.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-cream">
      <LearnHero
        imageSrc={cover.src}
        imageAlt={cover.alt}
        eyebrow="Technique"
        title={term.label}
        summary={term.explanation}
        backHref="/learn"
        compact
      />

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-10">
        <LearnContentGate gateId={`technique:${slug}`} teaserLabel="Unlock practice recipes">
          <div className="space-y-10">
            <LearnTechniqueVisual slug={slug} label={term.label} />

            {term.why && (
              <section className="rounded-2xl border border-forest/15 bg-forest/[0.04] px-5 py-5 sm:px-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-2">
                  Why it matters
                </p>
                <p className="text-base text-charcoal/80 leading-relaxed">{term.why}</p>
              </section>
            )}

            {practiceSlugs.length > 0 ? (
              <LearnPracticeCocktails
                slugs={practiceSlugs}
                heading="Practice it"
                subcopy="Open a recipe, focus on this move once, then make it again next week."
              />
            ) : (
              <section className="rounded-2xl border border-mist bg-white px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-2">
                  Practice it
                </p>
                <p className="text-base text-sage leading-relaxed mb-3">
                  Find a recipe that uses this move and make the drink once focusing only on this technique.
                </p>
                <Link href="/cocktails" className="text-sm font-medium text-terracotta hover:underline">
                  Browse recipes →
                </Link>
              </section>
            )}
          </div>
        </LearnContentGate>

        {relatedMethod && (
          <Link
            href={`/learn/methods/${relatedMethod.slug}`}
            className="block rounded-2xl border border-mist bg-white px-5 py-4 hover:border-terracotta/30 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta mb-1">
              Related method
            </p>
            <p className="font-display text-xl font-bold !text-charcoal">{relatedMethod.label}</p>
            <p className="text-sm text-sage mt-1">{relatedMethod.summary}</p>
          </Link>
        )}

        <section>
          <h2 className="font-display text-xl font-bold !text-charcoal mb-3">Related techniques</h2>
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

        <LearnJoinCta />
      </MainContainer>
    </div>
  );
}
