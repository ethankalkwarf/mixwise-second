import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/JsonLd";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnLibraryClient } from "@/components/learn/LearnLibraryClient";
import { NativeLearnIntro } from "@/components/mobile/NativeLearnIntro";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { LEARN_PATHS } from "@/lib/learnLibrary";

export const metadata = generatePageMetadata({
  title: "Learn Mixology",
  description:
    "Mixology courses plus a library of guides, methods, techniques, and swaps.",
  path: "/learn",
  keywords: [
    "learn mixology",
    "home bartending guide",
    "cocktail techniques",
    "how to shake a cocktail",
  ],
});

export default function LearnPage() {
  const starter = LEARN_PATHS[0];

  return (
    <div className="min-h-screen bg-cream" data-native-learn-page>
      <WebPageSchema
        title="Learn Mixology"
        description="Mixology courses plus a library of guides, methods, techniques, and swaps."
        url={`${SITE_CONFIG.url}/learn`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Learn Mixology", url: `${SITE_CONFIG.url}/learn` },
        ]}
      />
      <section data-web-learn-chrome>
        <LearnHero
          imageSrc="/media/kitchen-friends.webp"
          imageAlt="Friends mixing cocktails together in a bright home kitchen"
          eyebrow="Education"
          title="Learn to make better drinks"
          summary="Practical mixology for the home bar — templates, methods, and the small habits that change a drink."
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/learn/paths/${starter.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
            >
              Start the beginner course →
            </Link>
            <a
              href="#lessons"
              className="inline-flex items-center justify-center rounded-full border border-forest/20 bg-white/80 px-6 py-3 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
            >
              Browse lessons
            </a>
          </div>
        </LearnHero>
      </section>

      <MainContainer className="py-10 sm:py-14 max-w-5xl native-learn__main">
        <NativeLearnIntro />
        <div id="library">
          <LearnLibraryClient />
        </div>
      </MainContainer>
    </div>
  );
}
