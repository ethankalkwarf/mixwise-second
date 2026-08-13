import Image from "next/image";
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
  const ruleSection = method.sections.find((s) => s.kind === "rule");
  const otherSections = method.sections.filter((s) => s.kind !== "rule");

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

      <MainContainer className="py-10 sm:py-14 max-w-2xl">
        <LearnContentGate gateId={`method:${slug}`} teaserLabel="Keep learning this method">
          <article className="space-y-14">
            {/* Opening lede — same body scale, not a second display size */}
            <p className="text-[17px] !text-charcoal/85 leading-[1.7] border-b border-mist pb-10">
              {method.tip}
            </p>

            {ruleSection && <LearnSectionBlock section={ruleSection} />}

            <figure className="relative -mx-4 sm:mx-0 overflow-hidden rounded-2xl aspect-[16/10] bg-mist">
              <Image
                src={method.coverImage}
                alt={method.coverAlt}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
              <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-forest/80 to-transparent px-5 py-4">
                <p className="text-[13px] font-medium !text-cream/95 tracking-wide">{method.cue}</p>
              </figcaption>
            </figure>

            {otherSections.map((section) => (
              <LearnSectionBlock key={section.heading} section={section} />
            ))}

            <LearnChecks checks={checks} title="Quick check" />
            <LearnPracticeCocktails
              slugs={method.practiceSlugs}
              heading={`Practice ${method.label.toLowerCase()}`}
            />
          </article>
        </LearnContentGate>

        {(relatedGuide || relatedTechniques.length > 0) && (
          <nav className="mt-14 pt-8 border-t border-mist">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-5">
              Keep going
            </p>
            <ul className="space-y-1">
              {relatedGuide && (
                <li>
                  <Link
                    href={`/learn/guides/${relatedGuide.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3 border-b border-mist/80"
                  >
                    <span className="font-display text-2xl !text-charcoal group-hover:text-terracotta transition-colors tracking-tight">
                      {relatedGuide.title}
                    </span>
                    <span className="text-[13px] !text-charcoal/50 shrink-0">Guide</span>
                  </Link>
                </li>
              )}
              {relatedTechniques.map((term) =>
                term ? (
                  <li key={term.learnPath}>
                    <Link
                      href={term.learnPath || "/learn"}
                      className="group flex items-baseline justify-between gap-4 py-3 border-b border-mist/80"
                    >
                      <span className="font-display text-2xl !text-charcoal capitalize group-hover:text-terracotta transition-colors tracking-tight">
                        {term.label}
                      </span>
                      <span className="text-[13px] !text-charcoal/50 shrink-0">Technique</span>
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </nav>
        )}

        <div className="mt-12">
          <LearnJoinCta />
        </div>
      </MainContainer>
    </div>
  );
}
