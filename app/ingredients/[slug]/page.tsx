import { WebPageSchema, BreadcrumbSchema, IngredientTermSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG, generatePageMetadata } from "@/lib/seo";
import { IngredientGuideView } from "@/components/ingredients/IngredientGuideView";
import { getIngredientBySlug, getIngredientsDirectory } from "@/lib/ingredients.server";
import { fallbackIngredientGuide, getIngredientGuide, ingredientMetaDescription, ingredientMetaTitle } from "@/lib/ingredientContent";
import { getIngredientWayfinder } from "@/lib/ingredientTaxonomy";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const ingredients = await getIngredientsDirectory();
    return ingredients.map((ingredient) => ({ slug: ingredient.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = await getIngredientBySlug(slug);

  if (!ingredient) {
    return { title: "Ingredient Not Found" };
  }

  const guide =
    getIngredientGuide(slug) ||
    fallbackIngredientGuide({
      slug,
      name: ingredient.name,
      type: ingredient.type,
      cocktailCount: ingredient.cocktailCount,
    });

  return generatePageMetadata({
    title: ingredientMetaTitle(ingredient.name),
    description: ingredientMetaDescription(ingredient.name, guide.seoDescription),
    path: `/ingredients/${ingredient.slug}`,
    ogImage: ingredient.heroImageUrl || ingredient.imageUrl || undefined,
    keywords: [
      ingredient.name,
      `what is ${ingredient.name}`,
      `${ingredient.name} cocktails`,
      `what does ${ingredient.name} taste like`,
      `how to use ${ingredient.name} in cocktails`,
      `drinks with ${ingredient.name}`,
      `${ingredient.name} history`,
    ],
  });
}

export default async function IngredientDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [ingredient, directory] = await Promise.all([
    getIngredientBySlug(slug),
    getIngredientsDirectory(),
  ]);

  if (!ingredient) {
    notFound();
  }

  const guide =
    getIngredientGuide(slug) ||
    fallbackIngredientGuide({
      slug,
      name: ingredient.name,
      type: ingredient.type,
      cocktailCount: ingredient.cocktailCount,
    });
  const wayfinder = getIngredientWayfinder(ingredient, directory);

  const pageUrl = `${SITE_CONFIG.url}/ingredients/${ingredient.slug}`;
  const faqs = [
    {
      question: `What is ${ingredient.name}?`,
      answer: guide.whatItIs,
    },
    {
      question: `What does ${ingredient.name} taste like?`,
      answer: guide.tastingNotes,
    },
    {
      question: `How do you use ${ingredient.name} in cocktails?`,
      answer: guide.howToUse,
    },
    {
      question: `What cocktails can I make with ${ingredient.name}?`,
      answer:
        ingredient.cocktails.length > 0
          ? `MixWise is a free tool that matches cocktails to the bottles in your cabinet. ${ingredient.name} is used in ${ingredient.cocktails
              .slice(0, 8)
              .map((c) => c.name)
              .join(", ")}${ingredient.cocktails.length > 8 ? ", and more" : ""}. Add ${ingredient.name} plus whatever else you own at getmixwise.com/mix to see what you can pour tonight — not only a list of ${ingredient.name} drinks.`
          : `MixWise is a free cocktail tool that matches drinks to what you already have. Add ${ingredient.name} to your bar at getmixwise.com/mix to see what you can make.`,
    },
  ];

  return (
    <>
      <WebPageSchema title={`${ingredientMetaTitle(ingredient.name)} | ${SITE_CONFIG.name}`} description={ingredientMetaDescription(ingredient.name, guide.seoDescription)} url={pageUrl} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Ingredients", url: `${SITE_CONFIG.url}/ingredients` },
          { name: wayfinder.sectionTitle, url: `${SITE_CONFIG.url}/ingredients#${wayfinder.sectionId}` },
          { name: ingredient.name, url: pageUrl },
        ]}
      />
      <IngredientTermSchema
        name={ingredient.name}
        description={guide.seoDescription}
        url={pageUrl}
        image={ingredient.heroImageUrl || ingredient.imageUrl}
        faqs={faqs}
        cocktails={ingredient.cocktails.map((cocktail) => ({
          name: cocktail.name,
          url: `${SITE_CONFIG.url}/cocktails/${cocktail.slug}`,
        }))}
      />

      <div className="bg-cream min-h-screen">
        <IngredientGuideView ingredient={ingredient} guide={guide} wayfinder={wayfinder} />
      </div>
    </>
  );
}
