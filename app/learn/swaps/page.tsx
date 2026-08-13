import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
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
      <MainContainer className="py-12 sm:py-16 max-w-3xl">
        <Link href="/learn" className="text-sm font-medium text-sage hover:text-terracotta">
          ← Learn library
        </Link>
        <h1 className="mt-6 font-display text-4xl font-bold text-forest mb-3">Smart swaps</h1>
        <p className="text-sage text-lg leading-relaxed mb-10">
          Use this when you are mid-shop or mid-mix and missing a bottle. Recipe pages stay focused on the drink as written — swaps live here on purpose.
        </p>

        <ul className="space-y-4">
          {SUBSTITUTION_TIPS.map((tip) => (
            <li key={tip.id} className="rounded-2xl border border-mist bg-white p-5 shadow-soft">
              <p className="text-forest font-medium text-base">
                {tip.have} <span className="text-sage font-normal">→</span> {tip.use}
              </p>
              {tip.note && <p className="text-sm text-sage mt-2 leading-relaxed">{tip.note}</p>}
            </li>
          ))}
        </ul>
      </MainContainer>
    </div>
  );
}
