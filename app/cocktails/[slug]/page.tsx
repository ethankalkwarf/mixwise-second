import { getCocktailBySlug, getCocktailsList } from "@/lib/cocktails.server";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import Image from "next/image";
import { FlavorProfileCard } from "@/components/cocktails/FlavorProfileCard";
import { BartendersNoteCard } from "@/components/cocktails/BartendersNoteCard";
import { QuantitySelector } from "@/components/cocktails/QuantitySelector";
import { RecipeActions } from "@/components/cocktails/RecipeActions";
import { getSimilarRecipes } from "@/lib/similarRecipes";
import { ShoppingListButton } from "@/components/cocktails/ShoppingListButton";
import { RecipeContent } from "./RecipeContent";

// --- helpers for data normalization ---

type IngredientLike =
  | null
  | undefined
  | string
  | { text?: string }
  | Array<string | { text?: string }>;

function normalizeIngredients(raw: IngredientLike): { text: string }[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === "string"
          ? { text: item }
          : { text: String(item.text ?? "").trim() }
      )
      .filter((i) => i.text.length > 0);
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeIngredients(parsed);
    } catch {
      const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      return parts.map((text) => ({ text }));
    }
  }

  const text = String(raw.text ?? "").trim();
  return text ? [{ text }] : [];
}

function normalizeInstructions(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((s) => s.trim().length > 0);

  const value = raw.trim();

  const numbered = value
    .split(/\s*\d+\)\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  return value
    .split(/\.\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function normalizeTags(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((t) => t.trim().length > 0);

  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function titleCase(s: string): string {
  return s
    .split(/[\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function buildTagLine(tags: string[]): string {
  if (!tags.length) return "";
  return tags.map(titleCase).join(" · ");
}

export const revalidate = 300; // Revalidate every 5 minutes for better performance
export const dynamic = 'force-dynamic';

// Helper function to map Supabase cocktail to expected shape for the component
function mapSupabaseToSanityCocktail(cocktail: any) {
  return {
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description || cocktail.long_description,
    externalImageUrl: cocktail.image_url,
    glass: cocktail.glassware,
    method: cocktail.technique,
    tags: cocktail.tags || [],
    funFact: cocktail.fun_fact,
    funFactSources: cocktail.fun_fact_source ? [{ label: cocktail.fun_fact_source, url: "#" }] : [],
    flavorProfile: cocktail.flavor_strength || cocktail.flavor_sweetness || cocktail.flavor_tartness || cocktail.flavor_bitterness ? {
      strength: cocktail.flavor_strength,
      sweetness: cocktail.flavor_sweetness,
      tartness: cocktail.flavor_tartness,
      bitterness: cocktail.flavor_bitterness,
      aroma: cocktail.flavor_aroma,
      texture: cocktail.flavor_texture,
    } : undefined,
    bestFor: cocktail.metadata_json?.bestFor || [],
    seoTitle: cocktail.metadata_json?.seoTitle || cocktail.seo_description,
    metaDescription: cocktail.seo_description,
    imageAltOverride: cocktail.image_alt,
    // Map ingredients from Supabase format
    ingredients: (cocktail.ingredients || []).map((ing: any, index: number) => ({
      _key: `ing${index}`,
      ingredient: ing.ingredient ? {
        _id: ing.ingredient.id,
        name: ing.ingredient.name,
        type: ing.ingredient.type || 'other'
      } : null,
      amount: ing.amount,
      isOptional: ing.isOptional,
      notes: ing.notes,
    })),
    // Map instructions - convert from text to block format
    instructions: cocktail.instructions ? [{
      _key: "inst1",
      _type: "block",
      children: [{
        _key: "s1",
        _type: "span",
        marks: [],
        text: cocktail.instructions
      }],
      markDefs: [],
      style: "normal"
    }] : [],
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cocktail = await getCocktailBySlug(slug);
  const sanityCocktail = cocktail ? mapSupabaseToSanityCocktail(cocktail) : null;

  if (!sanityCocktail) {
    return { title: "Cocktail Not Found" };
  }

  const title = sanityCocktail.seoTitle || sanityCocktail.name;
  const description = sanityCocktail.metaDescription || sanityCocktail.description || `${sanityCocktail.name} cocktail recipe with ingredients and instructions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: sanityCocktail.externalImageUrl ? [{ url: sanityCocktail.externalImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: sanityCocktail.externalImageUrl ? [{ url: sanityCocktail.externalImageUrl }] : [],
    },
  };
}

// Generate JSON-LD Recipe Schema
function generateRecipeSchema(cocktail: SanityCocktail, imageUrl: string | null) {
  const ingredients = cocktail.ingredients?.map((item) =>
    `${item.amount ? item.amount + " " : ""}${item.ingredient?.name || "Ingredient"}`
  ) || [];

  const instructions = cocktail.instructions?.map((instruction, index) => ({
    "@type": "HowToStep",
    "text": instruction.children?.map(child => child.text).join("") || "",
    "position": index + 1
  })) || [];

  const keywords = [
    ...(cocktail.tags || []),
    ...(cocktail.bestFor || [])
  ].join(", ");

  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": cocktail.name,
    "description": cocktail.description,
    "image": imageUrl,
    "recipeIngredient": ingredients,
    "recipeInstructions": instructions,
    "keywords": keywords,
    "recipeCategory": "Cocktail",
    "recipeCuisine": "Cocktail",
    "author": {
      "@type": "Organization",
      "name": "MixWise"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MixWise"
    }
  };
}

export default async function CocktailDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cocktail = await getCocktailBySlug(slug);

  if (!cocktail) {
    notFound();
  }

  const sanityCocktail = mapSupabaseToSanityCocktail(cocktail);

  // Normalize data from Supabase
  const ingredients = normalizeIngredients(cocktail.ingredients as any);
  const instructionSteps = normalizeInstructions(cocktail.instructions as any);
  const tags = normalizeTags(cocktail.tags as any);
  const tagLine = buildTagLine(tags);

  // Use external image URL from Supabase
  const imageUrl = sanityCocktail.externalImageUrl || null;

  const recipeSchema = generateRecipeSchema(sanityCocktail, imageUrl);

  // Get similar recipes for recommendations
  const similarRecipes = await getSimilarRecipes(
    cocktail.id,
    cocktail.base_spirit,
    cocktail.tags,
    cocktail.categories_all
  );

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeSchema),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Cocktails", url: `${SITE_CONFIG.url}/cocktails` },
          { name: sanityCocktail.name, url: `${SITE_CONFIG.url}/cocktails/${sanityCocktail.slug.current}` },
        ]}
      />

      {/* MAIN PAGE WRAPPER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back Link */}
        <div className="mb-8">
          <a
            href="/cocktails"
            className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
          >
            ← Back to Cocktails
          </a>
        </div>

        <RecipeContent
          cocktail={cocktail}
          sanityCocktail={sanityCocktail}
          ingredients={ingredients}
          instructionSteps={instructionSteps}
          tagLine={tagLine}
          imageUrl={imageUrl}
          similarRecipes={similarRecipes}
        />
      </main>
    </>
  );
}

// Generate static paths for known cocktails
export async function generateStaticParams() {
  const cocktails = await getCocktailsList();

  return cocktails.map((cocktail) => ({
    slug: cocktail.slug,
  }));
}
