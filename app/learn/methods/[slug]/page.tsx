import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnLessonArticle } from "@/components/learn/LearnLessonArticle";
import { LearnPracticeCocktails } from "@/components/learn/LearnPracticeCocktails";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnLessonChallengeProvider } from "@/components/learn/LearnLessonChallenge";
import { NativeLearnLessonHero } from "@/components/mobile/NativeLearnLessonHero";
import { NativeLearnLessonActions } from "@/components/mobile/NativeLearnLessonActions";
import { LEARN_METHODS, getLearnGuide, getLearnMethod } from "@/lib/learnLibrary";
import { getMethodLessonLayers } from "@/lib/learnMethodsContent";
import { getMethodChecks } from "@/lib/learnChecks";
import { getTechniqueTermBySlug, formatTechniqueLabel } from "@/lib/cocktailTechniqueGlossary";
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
    title: `${method.label} — Cocktail Skill`,
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
  const layers = getMethodLessonLayers(method);

  return (
    <LearnLessonChallengeProvider
      kind="method"
      slug={slug}
      checks={checks}
      lessonTitle={method.label}
    >
    <div className="min-h-screen bg-cream" data-native-learn-lesson>
      <NativeLearnLessonHero
        title={method.label}
        eyebrow={`Skill · ${method.cue}`}
        summary={method.summary}
        imageSrc={method.coverImage}
        imageAlt={method.coverAlt}
        kind="method"
        slug={slug}
      />
      <div data-web-learn-chrome>
        <LearnHero
          imageSrc={method.coverImage}
          imageAlt={method.coverAlt}
          eyebrow={`Skill · ${method.cue}`}
          title={method.label}
          summary={method.summary}
          backHref="/learn"
        />
      </div>

      <MainContainer className="native-learn-lesson__body py-10 sm:py-14 max-w-3xl">
        <LearnContentGate gateId={`method:${slug}`} teaserLabel="Keep learning this skill">
          <LearnLessonArticle
            layers={layers}
            afterCore={
              <LearnPracticeCocktails
                drinks={method.practice}
                heading={`Practice ${method.label.toLowerCase()}`}
              />
            }
          />
        </LearnContentGate>

        {(relatedGuide || relatedTechniques.length > 0) && (
          <nav className="native-learn-related mt-14 pt-2">
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
                      <span className="font-display text-2xl !text-charcoal group-hover:text-terracotta transition-colors tracking-tight">
                        {formatTechniqueLabel(term.label)}
                      </span>
                      <span className="text-[13px] !text-charcoal/50 shrink-0">Skill</span>
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </nav>
        )}

        <div className="mt-12" data-web-learn-chrome>
          <LearnJoinCta />
        </div>
      </MainContainer>
      <NativeLearnLessonActions kind="method" slug={slug} />
    </div>
    </LearnLessonChallengeProvider>
  );
}
