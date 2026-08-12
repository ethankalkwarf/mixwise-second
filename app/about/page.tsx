import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";

const FEATURES = [
  {
    number: "01",
    title: "Find drinks worth making",
    description:
      "A curated library of recipes you can actually browse — by spirit, occasion, or whatever sounds good tonight.",
  },
  {
    number: "02",
    title: "Mix with what you have",
    description:
      "Add the bottles in your cabinet. See which cocktails you can make now, and what's worth picking up next.",
  },
  {
    number: "03",
    title: "Built for a real kitchen",
    description:
      "Designed for home setups, not a professional bar. Learn the techniques, skip the intimidation, enjoy the pour.",
  },
];

export const metadata: any = generatePageMetadata({
  title: "About",
  description:
    "MixWise helps you make better drinks at home. Browse curated recipes, mix with what you have, and build confidence behind your own bar.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <WebPageSchema
        title="About MixWise"
        description="MixWise helps you make better drinks at home. Browse curated recipes, mix with what you have, and build confidence behind your own bar."
        url={`${SITE_CONFIG.url}/about`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "About", url: `${SITE_CONFIG.url}/about` },
        ]}
      />

      <div className="py-12 sm:py-16 bg-cream min-h-screen">
        <MainContainer>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest mb-6">
              About MixWise
            </h1>

            <p className="text-base sm:text-lg text-sage max-w-2xl mx-auto mb-8">
              Recipes, your cabinet, and a little more confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mix"
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Open your cabinet
              </Link>
              <Link
                href="/cocktails"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Browse recipes
              </Link>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-4 text-center">
              What MixWise does
            </h2>
            <div className="h-1 w-16 bg-terracotta rounded-full mx-auto mb-12" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
              {FEATURES.map((feature) => (
                <div key={feature.number} className="pt-6 border-t border-forest/15">
                  <span className="block font-mono text-xs font-bold text-terracotta uppercase tracking-widest mb-3">
                    {feature.number}
                  </span>
                  <h3 className="text-xl font-display font-bold text-forest mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sage leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 mb-16 shadow-soft">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-6 text-center">
              Why we built MixWise
            </h2>

            <p className="text-sage text-lg leading-relaxed max-w-3xl mx-auto text-center">
              MixWise started as a way to make home mixology less overwhelming. Instead of flipping between recipes,
              shopping lists, and half-remembered bottles, we wanted one place that brings it all together.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-4">
              What's ahead
            </h2>
            <p className="text-sage mb-8 max-w-2xl mx-auto">
              We're adding recipes, tightening recommendations, and building the extras serious home bartenders
              actually want. Start with what's here today and grow with us.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mix"
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Start mixing
              </Link>
              <Link
                href="/cocktails"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Explore cocktails
              </Link>
            </div>
          </div>
        </MainContainer>
      </div>
    </>
  );
}
