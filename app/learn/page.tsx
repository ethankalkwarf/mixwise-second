import { MainContainer } from "@/components/layout/MainContainer";
import { LearnLibraryClient } from "@/components/learn/LearnLibraryClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Learn Mixology",
  description:
    "A searchable MixWise learning library for home mixologists — guides, techniques, balance, spirits, and smart swaps.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-mist bg-gradient-to-br from-olive/20 via-cream to-terracotta/10">
        <MainContainer className="py-14 sm:py-16">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
            Education
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-4 max-w-3xl">
            Learn to make better drinks
          </h1>
          <p className="text-sage max-w-2xl text-base sm:text-lg">
            Not a glossary dump — a training library for home mixologists. Search techniques, read deeper guides, and keep smart swaps off the recipe page until you need them.
          </p>
        </MainContainer>
      </div>

      <MainContainer className="py-10 sm:py-12">
        <LearnLibraryClient />
      </MainContainer>
    </div>
  );
}
