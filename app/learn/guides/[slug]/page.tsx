import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnSectionBlock } from "@/components/learn/LearnSectionBlock";
import { LearnPracticeCocktails } from "@/components/learn/LearnPracticeCocktails";
import { LearnChecks } from "@/components/learn/LearnChecks";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnLessonFooter } from "@/components/learn/LearnLessonFooter";
import {
  LEARN_GUIDES,
  LEARN_PATHS,
  getLearnGuide,
  getNextLearnGuide,
} from "@/lib/learnLibrary";
import { getGuideChecks } from "@/lib/learnChecks";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const FREE_SECTIONS = 2;

export function generateStaticParams() {
  return LEARN_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const guide = getLearnGuide(slug);
  if (!guide) return {};
  return generatePageMetadata({
    title: guide.title,
    description: guide.summary,
    path: `/learn/guides/${slug}`,
    ogImage: guide.coverImage,
    type: "article",
  });
}

export default async function LearnGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getLearnGuide(slug);
  if (!guide) notFound();

  const next = getNextLearnGuide(slug);
  const pathUsingGuide = LEARN_PATHS.find((p) =>
    p.steps.some((s) => s.type === "guide" && s.slug === slug)
  );
  const freeSections = guide.sections.slice(0, FREE_SECTIONS);
  const gatedSections = guide.sections.slice(FREE_SECTIONS);
  const checks = getGuideChecks(slug);

  return (
    <div className="min-h-screen bg-cream">
      <LearnHero
        imageSrc={guide.coverImage}
        imageAlt={guide.coverAlt}
        eyebrow={`${guide.eyebrow} · ${guide.readingMinutes} min read`}
        title={guide.title}
        summary={guide.summary}
        backHref="/learn"
      />

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-10">
        {freeSections.map((section) => (
          <LearnSectionBlock key={section.heading} section={section} />
        ))}

        {(gatedSections.length > 0 || checks.length > 0 || guide.practiceSlugs.length > 0) && (
          <LearnContentGate teaserLabel="Continue this lesson free">
            <div className="space-y-10">
              {gatedSections.map((section) => (
                <LearnSectionBlock key={section.heading} section={section} />
              ))}
              <LearnChecks checks={checks} title="Did it stick?" />
              <LearnPracticeCocktails slugs={guide.practiceSlugs} />
            </div>
          </LearnContentGate>
        )}

        <LearnLessonFooter next={next} path={pathUsingGuide} />
      </MainContainer>
    </div>
  );
}
