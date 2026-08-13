import Link from "next/link";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnPathProgress } from "@/components/learn/LearnPathProgress";
import {
  LEARN_PATHS,
  getLearnPath,
  pathStepHref,
  pathStepLabel,
} from "@/lib/learnLibrary";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEARN_PATHS.map((p) => ({ slug: p.slug }));
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

  const freeSteps = path.steps.slice(0, 2);
  const gatedSteps = path.steps.slice(2);

  return (
    <div className="min-h-screen bg-cream">
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
          Start with step 1 →
        </Link>
      </LearnHero>

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-8">
        <LearnPathProgress pathSlug={path.slug} steps={path.steps} />

        <ol className="space-y-3">
          {freeSteps.map((step, index) => (
            <StepRow key={`${step.type}-${"slug" in step ? step.slug : "swaps"}`} step={step} index={index} />
          ))}
        </ol>

        {gatedSteps.length > 0 && (
          <LearnContentGate teaserLabel="Unlock the full path">
            <ol className="space-y-3">
              {gatedSteps.map((step, index) => (
                <StepRow
                  key={`${step.type}-${"slug" in step ? step.slug : "swaps"}`}
                  step={step}
                  index={index + freeSteps.length}
                />
              ))}
            </ol>
          </LearnContentGate>
        )}

        <LearnJoinCta />
      </MainContainer>
    </div>
  );
}

function StepRow({
  step,
  index,
}: {
  step: (typeof LEARN_PATHS)[number]["steps"][number];
  index: number;
}) {
  return (
    <li>
      <Link
        href={pathStepHref(step)}
        className="group flex gap-4 rounded-2xl border border-mist bg-white px-5 py-4 hover:border-terracotta/30 transition-colors"
      >
        <span className="font-mono text-sm text-terracotta font-bold w-8 shrink-0 pt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage mb-1">
            {step.type === "swaps" ? "Reference" : step.type}
          </p>
          <p className="font-display text-xl font-bold text-forest capitalize group-hover:text-terracotta transition-colors">
            {pathStepLabel(step)}
          </p>
        </div>
      </Link>
    </li>
  );
}
