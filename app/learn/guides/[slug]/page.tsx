import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnLessonArticle } from "@/components/learn/LearnLessonArticle";
import { LearnPracticeCocktails } from "@/components/learn/LearnPracticeCocktails";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnLessonFooter } from "@/components/learn/LearnLessonFooter";
import { LearnLessonChallengeProvider } from "@/components/learn/LearnLessonChallenge";
import { NativeLearnLessonHero } from "@/components/mobile/NativeLearnLessonHero";
import { NativeLearnLessonActions } from "@/components/mobile/NativeLearnLessonActions";
import {
  LEARN_GUIDES,
  LEARN_PATHS,
  getLearnGuide,
  getNextLearnGuide,
} from "@/lib/learnLibrary";
import { getGuideChecks } from "@/lib/learnChecks";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";

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
    <LearnLessonChallengeProvider
      kind="guide"
      slug={slug}
      checks={checks}
      lessonTitle={guide.title}
    >
    <div className="min-h-screen bg-cream" data-native-learn-lesson>
      <ArticleSchema
        title={guide.title}
        description={guide.summary}
        image={`${SITE_CONFIG.url}${guide.coverImage}`}
        publishedAt="2026-03-01T00:00:00.000Z"
        url={`${SITE_CONFIG.url}/learn/guides/${slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Learn Mixology", url: `${SITE_CONFIG.url}/learn` },
          { name: guide.title, url: `${SITE_CONFIG.url}/learn/guides/${slug}` },
        ]}
      />
      <NativeLearnLessonHero
        title={guide.title}
        eyebrow={guide.eyebrow}
        summary={guide.summary}
        imageSrc={guide.coverImage}
        imageAlt={guide.coverAlt}
        kind="guide"
        slug={slug}
        readingMinutes={guide.readingMinutes}
      />
      <div data-web-learn-chrome>
        <LearnHero
          imageSrc={guide.coverImage}
          imageAlt={guide.coverAlt}
          eyebrow={`${guide.eyebrow} · ${guide.readingMinutes} min read`}
          title={guide.title}
          summary={guide.summary}
          backHref="/learn"
        />
      </div>

      <MainContainer className="native-learn-lesson__body native-frame py-8 sm:py-10 max-w-3xl space-y-14">
        <LearnContentGate gateId={`guide:${slug}`} teaserLabel="Keep reading this lesson">
          <LearnLessonArticle
            layers={guide}
            afterCore={<LearnPracticeCocktails drinks={guide.practice} />}
          />
        </LearnContentGate>

        <LearnLessonFooter next={next} path={pathUsingGuide} />
      </MainContainer>
      <NativeLearnLessonActions kind="guide" slug={slug} />
    </div>
    </LearnLessonChallengeProvider>
  );
}
