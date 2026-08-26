import Image from "next/image";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { IngredientsDirectory } from "@/components/ingredients/IngredientsDirectory";
import { NativeIngredientsIntro } from "@/components/mobile/NativeIngredientsIntro";
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
  const ingredients = (await getIngredientsDirectory()).filter((item) => item.hasGuide);

  return (
    <>
      <WebPageSchema
        title={`Cocktail Ingredients Guide | ${SITE_CONFIG.name}`}
        description="What cocktail ingredients are, how they taste, and the MixWise drinks that use them."
        url={`${SITE_CONFIG.url}/ingredients`}
      />

      <div className="min-h-screen bg-cream" data-native-ingredients-page>
        <section
          data-web-ingredients-chrome
          className="relative min-h-[12rem] overflow-hidden sm:min-h-[44vh]"
        >
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
          <MainContainer className="relative flex flex-col justify-end pb-8 pt-16 sm:min-h-[44vh] sm:pb-12 sm:pt-24">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terracotta font-bold mb-2 sm:mb-3">
              Cocktail ingredients
            </p>
            <h1 className="font-display text-3xl sm:text-6xl font-semibold tracking-tight leading-tight text-forest mb-2 sm:mb-4 max-w-3xl [text-wrap:balance]">
              The bottles behind the drinks
            </h1>
            <p className="text-sage max-w-xl text-sm sm:text-lg leading-relaxed [text-wrap:pretty]">
              What each spirit, aperitivo, and mixer actually is — and the MixWise recipes that use it.
            </p>
            <p className="mt-3 sm:mt-4 text-sm text-sage/80">
              {ingredients.length} guides
            </p>
          </MainContainer>
        </section>

        <MainContainer className="py-6 sm:py-14 native-ingredients__main native-frame native-frame-wide">
          <NativeIngredientsIntro count={ingredients.length} />
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
