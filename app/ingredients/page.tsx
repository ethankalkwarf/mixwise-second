import { sanityClient } from "@/lib/sanityClient";
import { MainContainer } from "@/components/layout/MainContainer";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { IngredientsDirectory } from "@/components/ingredients/IngredientsDirectory";
import type { SanityImage } from "@/lib/sanityTypes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Cocktail Ingredients | ${SITE_CONFIG.name}`,
  description: "Browse our complete ingredient library. Learn about spirits, mixers, liqueurs, and more to stock your home bar.",
  openGraph: {
    title: `Cocktail Ingredients | ${SITE_CONFIG.name}`,
    description: "Browse our complete ingredient library for cocktail making.",
    url: `${SITE_CONFIG.url}/ingredients`,
  },
};

interface Ingredient {
  _id: string;
  name: string;
  slug: { current: string };
  type?: string;
  image?: SanityImage;
  externalImageUrl?: string;
  description?: string;
  cocktailCount: number;
}

const INGREDIENTS_QUERY = `*[_type == "ingredient"] | order(name asc) {
  _id,
  name,
  slug,
  type,
  image,
  externalImageUrl,
  description,
  "cocktailCount": count(*[_type == "cocktail" && references(^._id)])
}`;

export default async function IngredientsPage() {
  const ingredients = await sanityClient.fetch<Ingredient[]>(INGREDIENTS_QUERY);

  return (
    <>
      <WebPageSchema
        title={`Cocktail Ingredients | ${SITE_CONFIG.name}`}
        description="Browse our complete ingredient library for cocktail making."
        url={`${SITE_CONFIG.url}/ingredients`}
      />

      <div className="py-10">
        <MainContainer>
          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif font-bold text-slate-50 mb-4">
              Ingredient Library
            </h1>
            <p className="text-lg text-slate-400">
              Everything you need to know about cocktail ingredients. Find spirits, mixers, liqueurs, and more.
            </p>
          </div>

          <IngredientsDirectory ingredients={ingredients} />
        </MainContainer>
      </div>
    </>
  );
}

