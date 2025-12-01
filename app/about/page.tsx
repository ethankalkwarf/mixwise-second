import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/seo";
import {
  BeakerIcon,
  SparklesIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Smarter discovery",
    description: "Browse curated recipes, find new favorites, and use powerful filters to narrow in on the perfect drink for any night.",
    color: "text-olive",
    bgColor: "bg-olive/10",
  },
  {
    icon: BeakerIcon,
    title: "Ingredient-aware mixing",
    description: "Tell MixWise what you have on hand, and we will highlight cocktails you can make now and what to buy next.",
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
  },
  {
    icon: HomeIcon,
    title: "Built for home bartenders",
    description: "Designed for real home setups, not professional bars. Learn techniques, build confidence, and enjoy the process.",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
];

export const metadata: any = generatePageMetadata({
  title: "About",
  description: "MixWise is your smart home bar partner. Discover cocktails, manage ingredients, and master mixology with confidence.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <WebPageSchema
        title="About MixWise"
        description="MixWise is your smart home bar partner. Discover cocktails, manage ingredients, and master mixology with confidence."
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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest mb-6">
              About MixWise
            </h1>

            <p className="text-base sm:text-lg text-sage max-w-2xl mx-auto mb-8">
              Your smart home bar partner.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mix"
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Try MixWise
              </Link>
              <Link
                href="/cocktails"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Browse Recipes
              </Link>
            </div>
          </div>

          {/* What MixWise Does */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-8 text-center">
              What MixWise does
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-white border border-mist rounded-2xl hover:shadow-card transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-forest mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Why We Built MixWise */}
          <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 mb-16 shadow-soft">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-6 text-center">
              Why we built MixWise
            </h2>

            <p className="text-sage text-lg leading-relaxed max-w-3xl mx-auto text-center">
              MixWise started as a way to make home mixology less overwhelming. Instead of flipping between recipes,
              shopping lists, and half-remembered bottles, we wanted one place that brings it all together.
            </p>
          </div>

          {/* What's Ahead */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-4">
              What's ahead
            </h2>
            <p className="text-sage mb-8 max-w-2xl mx-auto">
              We are always refining MixWise with new recipes, smarter recommendations, and features to support
              serious home bartenders. You can start with today's features and grow with us as we evolve.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mix"
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Get Started Today
              </Link>
              <Link
                href="/cocktails"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Explore Cocktails
              </Link>
            </div>
          </div>
        </MainContainer>
      </div>
    </>
  );
}

