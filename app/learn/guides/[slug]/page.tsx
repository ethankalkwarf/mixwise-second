import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LEARN_GUIDES, getLearnGuide } from "@/lib/learnLibrary";
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
  });
}

export default async function LearnGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getLearnGuide(slug);
  if (!guide) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-mist bg-gradient-to-br from-forest/10 via-cream to-olive/10">
        <MainContainer className="py-12 sm:py-16 max-w-3xl">
          <Link href="/learn" className="text-sm font-medium text-sage hover:text-terracotta">
            ← Learn library
          </Link>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-terracotta font-bold">
            {guide.eyebrow} · {guide.readingMinutes} min read
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-forest mb-4">
            {guide.title}
          </h1>
          <p className="text-lg text-forest/80 leading-relaxed">{guide.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {guide.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-mist bg-white px-3 py-1 text-xs text-sage"
              >
                {topic}
              </span>
            ))}
          </div>
        </MainContainer>
      </div>

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-10">
        {guide.sections.map((section) => (
          <article key={section.heading}>
            <h2 className="font-display text-2xl font-bold text-forest mb-3">{section.heading}</h2>
            <div className="space-y-4">
              {section.body.map((para) => (
                <p key={para.slice(0, 40)} className="text-base text-sage leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </article>
        ))}

        <div className="pt-8 border-t border-mist flex flex-wrap gap-4">
          <Link href="/learn" className="text-sm font-medium text-terracotta hover:underline">
            More guides
          </Link>
          <Link href="/cocktails" className="text-sm font-medium text-sage hover:text-terracotta">
            Practice on a recipe →
          </Link>
        </div>
      </MainContainer>
    </div>
  );
}
