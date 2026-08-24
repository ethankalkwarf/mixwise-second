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
import {
  getAllTechniqueLearnEntries,
  getTechniqueTermBySlug,
  formatTechniqueLabel,
} from "@/lib/cocktailTechniqueGlossary";
import { LEARN_METHODS } from "@/lib/learnLibrary";
import {
  getTechniqueLesson,
  getTechniqueLessonLayers,
} from "@/lib/learnTechniques";
import { getTechniqueChecks } from "@/lib/learnChecks";
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
  const layers = getTechniqueLessonLayers(slug);
  if (!term) return {};
  return generatePageMetadata({
    title: `${formatTechniqueLabel(term.label)} — Cocktail Skill`,
    description: layers?.bigIdea ?? term.explanation,
    path: `/learn/techniques/${slug}`,
  });
}

export default async function TechniqueLearnPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getTechniqueTermBySlug(slug);
  const rawLayers = getTechniqueLessonLayers(slug);
  const lesson = getTechniqueLesson(slug);
  if (!term || !rawLayers) notFound();

  const layers = lesson?.layers
    ? rawLayers
    : {
        ...rawLayers,
        sections: rawLayers.sections.map((section) => ({ ...section, figure: undefined })),
      };

  const related = (lesson?.relatedSlugs ?? [])
    .map((relatedSlug) => getTechniqueTermBySlug(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedMethod = LEARN_METHODS.find(
    (m) =>
      m.relatedTechniqueSlugs.includes(slug) ||
      m.slug === slug ||
      m.label.toLowerCase() === term.label.toLowerCase()
  );
  const checks = getTechniqueChecks(slug);
  const cover = lesson
    ? { src: lesson.coverImage, alt: lesson.coverAlt }
    : { src: "/learn/method-shake.webp", alt: formatTechniqueLabel(term.label) };

  return (
    <LearnLessonChallengeProvider
      kind="technique"
      slug={slug}
      checks={checks}
      lessonTitle={formatTechniqueLabel(term.label)}
    >
    <div className="min-h-screen bg-cream" data-native-learn-lesson>
      <NativeLearnLessonHero
        title={formatTechniqueLabel(term.label)}
        eyebrow="Skill"
        summary={term.explanation}
        imageSrc={cover.src}
        imageAlt={cover.alt}
        kind="technique"
        slug={slug}
      />
      <div data-web-learn-chrome>
        <LearnHero
          imageSrc={cover.src}
          imageAlt={cover.alt}
          eyebrow="Skill"
          title={formatTechniqueLabel(term.label)}
          summary={term.explanation}
          backHref="/learn"
        />
      </div>

      <MainContainer className="native-learn-lesson__body py-10 sm:py-14 max-w-3xl">
        <LearnContentGate gateId={`technique:${slug}`} teaserLabel="Keep learning this skill">
          <LearnLessonArticle
            layers={layers}
            techniqueSlug={slug}
            afterCore={
              lesson && lesson.practice.length > 0 ? (
                <LearnPracticeCocktails
                  drinks={lesson.practice}
                  heading="Practice it"
                  subcopy="Open a recipe, focus on this move once, then make it again next week."
                />
              ) : null
            }
          />
        </LearnContentGate>

        {(relatedMethod || related.length > 0) && (
          <nav className="native-learn-related mt-14 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-5">
              Keep going
            </p>
            <ul className="space-y-1">
              {relatedMethod && relatedMethod.slug !== slug && (
                <li>
                  <Link
                    href={`/learn/methods/${relatedMethod.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3 border-b border-mist/80"
                  >
                    <span className="font-display text-2xl !text-charcoal group-hover:text-terracotta transition-colors tracking-tight">
                      {relatedMethod.label}
                    </span>
                    <span className="text-[13px] !text-charcoal/50 shrink-0">Skill</span>
                  </Link>
                </li>
              )}
              {related.map((item) => {
                const href =
                  item.learnPath ||
                  `/learn/techniques/${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-baseline justify-between gap-4 py-3 border-b border-mist/80"
                    >
                      <span className="font-display text-2xl !text-charcoal group-hover:text-terracotta transition-colors tracking-tight">
                        {formatTechniqueLabel(item.label)}
                      </span>
                      <span className="text-[13px] !text-charcoal/50 shrink-0">Skill</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <div className="mt-12" data-web-learn-chrome>
          <LearnJoinCta />
        </div>
      </MainContainer>
      <NativeLearnLessonActions kind="technique" slug={slug} />
    </div>
    </LearnLessonChallengeProvider>
  );
}
