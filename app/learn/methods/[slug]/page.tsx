import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnSectionBlock } from "@/components/learn/LearnSectionBlock";
import { LearnPracticeCocktails } from "@/components/learn/LearnPracticeCocktails";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { LearnChecks } from "@/components/learn/LearnChecks";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LEARN_METHODS, getLearnGuide, getLearnMethod } from "@/lib/learnLibrary";
import { getMethodChecks } from "@/lib/learnChecks";
import { getTechniqueTermBySlug } from "@/lib/cocktailTechniqueGlossary";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEARN_METHODS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const method = getLearnMethod(slug);
  if (!method) return {};
  return generatePageMetadata({
    title: `${method.label} — Cocktail Method`,
    description: method.summary,
    path: `/learn/methods/${slug}`,
    ogImage: method.coverImage,
  });
}

export default async function LearnMethodPage({ params }: PageProps) {
  const { slug } = await params;
  const method = getLearnMethod(slug);
  if (!method) notFound();

  const relatedGuide = method.relatedGuideSlug ? getLearnGuide(method.relatedGuideSlug) : undefined;
  const relatedTechniques = method.relatedTechniqueSlugs
    .map((s) => getTechniqueTermBySlug(s))
    .filter(Boolean);
  const checks = getMethodChecks(slug);

  return (
    <div className="min-h-screen bg-cream">
      <LearnHero
        imageSrc={method.coverImage}
        imageAlt={method.coverAlt}
        eyebrow={`Core method · ${method.cue}`}
        title={method.label}
        summary={method.summary}
        backHref="/learn"
      />

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-10">
        <LearnContentGate gateId={`method:${slug}`} teaserLabel="Keep learning this method">
          <div className="space-y-10">
            <aside className="rounded-2xl border border-olive/30 bg-olive/10 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1">
                Quick tip
              </p>
              <p className="text-charcoal/85 leading-relaxed font-medium">{method.tip}</p>
            </aside>

            {method.sections.map((section) => (
              <LearnSectionBlock key={section.heading} section={section} />
            ))}
            <LearnChecks checks={checks} title="Quick check" />
            <LearnPracticeCocktails
              slugs={method.practiceSlugs}
              heading={`Practice ${method.label.toLowerCase()}`}
            />
          </div>
        </LearnContentGate>

        {(relatedGuide || relatedTechniques.length > 0) && (
          <section className="space-y-4 border-t border-mist pt-8">
            <h2 className="font-display text-xl font-bold !text-charcoal">Keep going</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGuide && (
                <Link
                  href={`/learn/guides/${relatedGuide.slug}`}
                  className="rounded-2xl border border-mist bg-white px-4 py-4 hover:border-terracotta/30 transition-colors"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta mb-1">
                    Guide
                  </p>
                  <p className="font-display font-bold !text-charcoal">{relatedGuide.title}</p>
                </Link>
              )}
              {relatedTechniques.map((term) =>
                term ? (
                  <Link
                    key={term.learnPath}
                    href={term.learnPath || "/learn"}
                    className="rounded-2xl border border-mist bg-white px-4 py-4 hover:border-terracotta/30 transition-colors"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta mb-1">
                      Technique
                    </p>
                    <p className="font-display font-bold !text-charcoal capitalize">{term.label}</p>
                  </Link>
                ) : null
              )}
            </div>
          </section>
        )}

        <LearnJoinCta />
      </MainContainer>
    </div>
  );
}
