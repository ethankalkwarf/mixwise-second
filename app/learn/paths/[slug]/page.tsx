import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnPathCurriculum } from "@/components/learn/LearnPathCurriculum";
import { NativeLearnPathHero } from "@/components/mobile/NativeLearnPathHero";
import { LEARN_PATHS, LEARN_PATH_ALIASES, getLearnPath, pathStepHref } from "@/lib/learnLibrary";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const aliasSlugs = Object.keys(LEARN_PATH_ALIASES);
  return [...LEARN_PATHS.map((p) => p.slug), ...aliasSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const path = getLearnPath(slug);
  if (!path) return {};
  return generatePageMetadata({
    title: path.title,
    description: path.summary,
    path: `/learn/paths/${slug}`,
    ogImage: path.coverImage,
  });
}

export default async function LearnPathPage({ params }: PageProps) {
  const { slug } = await params;
  const path = getLearnPath(slug);
  if (!path) notFound();

  return (
    <div className="min-h-screen bg-cream" data-native-learn-path>
      <NativeLearnPathHero
        title={path.title}
        eyebrow={`${path.eyebrow} · ~${path.estimatedMinutes} min`}
        summary={path.summary}
        imageSrc={path.coverImage}
        imageAlt={path.coverAlt}
        beginHref={pathStepHref(path.steps[0])}
      />
      <div data-web-learn-chrome>
        <LearnHero
          imageSrc={path.coverImage}
          imageAlt={path.coverAlt}
          eyebrow={`${path.eyebrow} · ~${path.estimatedMinutes} min`}
          title={path.title}
          summary={path.summary}
          backHref="/learn"
        >
          <Link
            href={pathStepHref(path.steps[0])}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
          >
            Begin the path →
          </Link>
        </LearnHero>
      </div>

      <MainContainer className="native-learn-path__body native-frame py-8 sm:py-10 max-w-3xl">
        <LearnPathCurriculum path={path} />
      </MainContainer>
    </div>
  );
}
