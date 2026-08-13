import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  getAllTechniqueLearnEntries,
  METHOD_TIPS,
} from "@/lib/cocktailTechniqueGlossary";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Learn Cocktail Techniques",
  description:
    "Plain-language cocktail technique tips — shake, stir, muddle, fine-strain, and more — right where you need them.",
  path: "/learn",
});

export default function LearnPage() {
  const terms = getAllTechniqueLearnEntries();
  const methods = Object.values(
    Object.fromEntries(
      Object.entries(METHOD_TIPS).map(([key, tip]) => [tip.label, tip])
    )
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-mist bg-gradient-to-br from-olive/15 via-cream to-cream">
        <MainContainer className="py-14 sm:py-16">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            Education
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-4">Learn</h1>
          <p className="text-sage max-w-xl text-base sm:text-lg">
            Short technique guides for home bartenders. The same tips appear inline on recipes — this hub is for browsing them all.
          </p>
        </MainContainer>
      </div>

      <MainContainer className="py-10 sm:py-12 space-y-12">
        <section>
          <h2 className="font-display text-2xl font-bold text-forest mb-4">Core methods</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map((method) => (
              <div
                key={method.label}
                className="rounded-2xl border border-mist bg-white p-5 shadow-soft"
              >
                <h3 className="font-display text-xl font-bold text-forest mb-1">{method.label}</h3>
                <p className="text-sm text-terracotta font-medium mb-2">{method.cue}</p>
                <p className="text-sm text-sage leading-relaxed">{method.summary}</p>
                <p className="text-sm text-sage/90 mt-2 leading-relaxed">{method.tip}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-forest mb-4">Technique terms</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {terms.map((term) => (
              <Link
                key={term.slug}
                href={`/learn/techniques/${term.slug}`}
                className="rounded-2xl border border-mist bg-white p-5 shadow-soft hover:border-terracotta/30 hover:-translate-y-0.5 transition-all"
              >
                <h3 className="font-display text-lg font-bold text-forest mb-1 capitalize">
                  {term.label}
                </h3>
                <p className="text-sm text-sage line-clamp-2">{term.explanation}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="pt-6 border-t border-mist">
          <Link href="/cocktails" className="text-sm font-medium text-terracotta hover:underline">
            ← Back to recipes
          </Link>
        </div>
      </MainContainer>
    </div>
  );
}
