import Image from "next/image";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { IngredientsDirectory } from "@/components/ingredients/IngredientsDirectory";
import { getIngredientsDirectory } from "@/lib/ingredients.server";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

export const revalidate = 60;

export const metadata = generatePageMetadata({
  title: "Cocktail Ingredients Guide: Spirits, Liqueurs & Mixers",
  description:
    "What cocktail ingredients are — gin, Campari, vermouth, citrus, syrups, and more — plus how they taste, where they come from, and MixWise drinks you can make with each bottle.",
  path: "/ingredients",
});

export default async function IngredientsPage() {
  const ingredients = await getIngredientsDirectory();
  const guided = ingredients.filter((item) => item.hasGuide).length;

  return (
    <>
      <WebPageSchema
        title={`Cocktail Ingredients Guide | ${SITE_CONFIG.name}`}
        description="What cocktail ingredients are, how they taste, and the MixWise drinks that use them."
        url={`${SITE_CONFIG.url}/ingredients`}
      />

      <div className="min-h-screen bg-cream">
        <section className="relative min-h-[38vh] sm:min-h-[44vh] overflow-hidden">
          <Image
            src="/ingredients/origins/juniper.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
          <MainContainer className="relative flex min-h-[38vh] sm:min-h-[44vh] flex-col justify-end pb-12 pt-24">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-3">
              Cocktail ingredients
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-tight text-forest mb-4 max-w-3xl [text-wrap:balance]">
              The bottles behind the drinks
            </h1>
            <p className="text-sage max-w-xl text-base sm:text-lg leading-relaxed [text-wrap:pretty]">
              What each spirit, aperitivo, and mixer actually is — and the MixWise recipes that use it.
            </p>
            <p className="mt-4 text-sm text-sage/80">
              {ingredients.length} ingredients
              {guided > 0 ? ` · ${guided} with full guides` : ""}
            </p>
          </MainContainer>
        </section>

        <MainContainer className="py-10 sm:py-14">
          {ingredients.length > 0 ? (
            <IngredientsDirectory ingredients={ingredients} />
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-display font-bold text-forest mb-2">No ingredients yet</h2>
              <p className="text-sage">The library is being restocked. Try the mix tool in the meantime.</p>
            </div>
          )}
        </MainContainer>
      </div>
    </>
  );
}
