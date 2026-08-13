import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnLessonArticle } from "@/components/learn/LearnLessonArticle";
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

      <MainContainer className="py-10 sm:py-14 max-w-2xl space-y-14">
        <LearnContentGate gateId={`guide:${slug}`} teaserLabel="Keep reading this lesson">
          <LearnLessonArticle
            layers={guide}
            afterCore={
              <>
                <LearnChecks checks={checks} title="Did it stick?" />
                <LearnPracticeCocktails slugs={guide.practiceSlugs} />
              </>
            }
          />
        </LearnContentGate>

        <LearnLessonFooter next={next} path={pathUsingGuide} />
      </MainContainer>
    </div>
  );
}
