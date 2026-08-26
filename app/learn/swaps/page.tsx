import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { LearnHero } from "@/components/learn/LearnHero";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { LearnSwapIndex } from "@/components/learn/LearnSwapIndex";
import { NativeLearnSwapsIntro } from "@/components/mobile/NativeLearnSwapsIntro";
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
    <div className="min-h-screen bg-cream" data-native-learn-swaps>
      <MainContainer className="native-learn-swaps__body native-frame native-frame-wide pt-6 pb-8">
        <NativeLearnSwapsIntro />
        <div data-web-learn-chrome>
          <LearnHero
            imageSrc="/media/kitchen-pour.webp"
            imageAlt="Pouring a shaken cocktail into a coupe at a home kitchen counter"
            eyebrow="Reference"
            title="Smart swaps"
            summary="Reach for this mid-shop or mid-mix when a bottle is missing. Keep the role of the ingredient; adjust sweetness if the swap is richer."
            backHref="/learn"
            compact
          />
        </div>

        <div className="space-y-10">
          <LearnSwapIndex tips={SUBSTITUTION_TIPS} />

          <div className="pt-2" data-web-learn-chrome>
            <LearnJoinCta />
          </div>
          <p className="text-center text-sm text-sage" data-web-learn-chrome>
            <Link href="/learn" className="font-medium text-terracotta hover:underline">
              Back to Learn
            </Link>
          </p>
        </div>
      </MainContainer>
    </div>
  );
}
