import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnLibraryClient } from "@/components/learn/LearnLibraryClient";
import { generatePageMetadata } from "@/lib/seo";
import { LEARN_PATHS } from "@/lib/learnLibrary";

export const metadata = generatePageMetadata({
  title: "Learn Mixology",
  description:
    "Training library for home mixologists — learning paths, guides, core methods, techniques, and smart swaps.",
  path: "/learn",
});

export default function LearnPage() {
  const starter = LEARN_PATHS[0];

  return (
    <div className="min-h-screen bg-cream">
      <LearnHero
        imageSrc="/media/bartender-home.webp"
        imageAlt="Home bartender preparing a cocktail"
        eyebrow="Education"
        title="Learn to make better drinks"
        summary="Follow a short path, then look up methods and techniques when you need them — training, not a glossary dump."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/learn/paths/${starter.slug}`}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
          >
            Start: {starter.title} →
          </Link>
          <a
            href="#library"
            className="inline-flex items-center justify-center rounded-full border border-forest/20 bg-white/80 px-6 py-3 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
          >
            Browse library
          </a>
        </div>
      </LearnHero>

      <MainContainer className="py-10 sm:py-14">
        <div id="library">
          <LearnLibraryClient />
        </div>
      </MainContainer>
    </div>
  );
}
