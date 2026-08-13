import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { SUBSTITUTION_TIPS } from "@/lib/cocktailSubstitutions";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Smart Swaps",
  description:
    "Practical cocktail ingredient substitutions for home bartenders — orange liqueur, whiskey, mezcal, egg white, and more.",
  path: "/learn/swaps",
});

export default function LearnSwapsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <LearnHero
        imageSrc="/media/kitchen-shelf.webp"
        imageAlt="Bar bottles on a shelf"
        eyebrow="Reference"
        title="Smart swaps"
        summary="Use this when you are mid-shop or mid-mix and missing a bottle. Recipe pages stay focused on the drink as written."
        backHref="/learn"
        compact
      />

      <MainContainer className="py-10 sm:py-12 max-w-3xl space-y-4">
        {SUBSTITUTION_TIPS.map((tip) => (
          <article
            key={tip.id}
            className="rounded-2xl border border-mist bg-white px-5 py-5 sm:px-6"
          >
            <p className="text-charcoal font-medium text-base">
              {tip.have} <span className="text-sage font-normal">→</span> {tip.use}
            </p>
            {tip.note && <p className="text-sm text-sage mt-2 leading-relaxed">{tip.note}</p>}
          </article>
        ))}

        <div className="pt-6">
          <LearnJoinCta />
        </div>
        <p className="text-center text-sm text-sage">
          <Link href="/learn" className="font-medium text-terracotta hover:underline">
            Back to Learn
          </Link>
        </p>
      </MainContainer>
    </div>
  );
}
