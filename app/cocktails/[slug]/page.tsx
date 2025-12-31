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
import { DailyCocktailBanner } from "@/components/cocktails/DailyCocktailBanner";

// --- helpers for data normalization ---

type IngredientLike =
  | null
  | undefined
  | string
  | { text?: string }
  | Array<string | { text?: string }>;

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value == null) return null;
  try {
    return String(value);
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => asString(v)).filter(Boolean) as string[];
  // Allow a single string value to be treated as a one-item list
  if (typeof value === "string") return [value];
  return [];
}

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
  if (Array.isArray(raw)) return raw.filter((s) => s && typeof s === 'string' && s.trim().length > 0);

  if (typeof raw !== 'string') return [];

  const value = raw.trim();

  // First try to split on numbered patterns like "1) ", "2) ", etc.
  const numbered = value
    .split(/\s*\d+\)\s*/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+$/.test(s)); // Remove standalone numbers

  if (numbered.length > 1) return numbered;

  // Fallback: split on sentence endings (periods followed by space)
  const sentences = value
    .split(/\.\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 0 && !/^\d+$/.test(s)); // Remove standalone numbers

  if (sentences.length > 1) return sentences;

  // Final fallback: if it's a single instruction, return it as one step
  return [value];
}

function normalizeTags(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((t) => t && typeof t === 'string' && t.trim().length > 0);

  if (typeof raw !== 'string') return [];

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

// Helper function to map Supabase cocktail to expected shape for the component
function mapSupabaseToSanityCocktail(cocktail: any) {
  const tags = asStringArray(cocktail.tags);
  const bestFor = asStringArray(cocktail.metadata_json?.bestFor);
  const funFactSource = asString(cocktail.fun_fact_source);

  return {
    _id: cocktail.id,
    _type: "cocktail" as const,
    name: cocktail.name,
    slug: { _type: "slug" as const, current: cocktail.slug },
    description: cocktail.short_description || cocktail.long_description,
    externalImageUrl: cocktail.image_url,
    glass: cocktail.glassware,
    method: cocktail.technique,
    tags,
    funFact: cocktail.fun_fact,
    funFactSources: funFactSource ? [{
      label: funFactSource,
      url: funFactSource.startsWith('http') ? funFactSource : ""
    }] : [],
    flavorProfile: cocktail.flavor_strength || cocktail.flavor_sweetness || cocktail.flavor_tartness || cocktail.flavor_bitterness ? {
      strength: cocktail.flavor_strength,
      sweetness: cocktail.flavor_sweetness,
      tartness: cocktail.flavor_tartness,
      bitterness: cocktail.flavor_bitterness,
      aroma: cocktail.flavor_aroma,
      texture: cocktail.flavor_texture,
    } : undefined,
    bestFor,
    seoTitle: cocktail.metadata_json?.seoTitle || cocktail.seo_description,
    metaDescription: cocktail.seo_description,
    imageAltOverride: cocktail.image_alt,
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { daily } = await searchParams;
  const cocktail = await getCocktailBySlug(slug);
  const sanityCocktail = cocktail ? mapSupabaseToSanityCocktail(cocktail) : null;

  if (!sanityCocktail) {
    return { title: "Cocktail Not Found" };
  }

  const isDailyCocktail = daily === 'true';
  const baseTitle = sanityCocktail.seoTitle || sanityCocktail.name;
  const title = isDailyCocktail ? `Cocktail of the Day: ${baseTitle}` : baseTitle;
  const baseDescription = sanityCocktail.metaDescription || sanityCocktail.description || `${sanityCocktail.name} cocktail recipe with ingredients and instructions.`;
  const description = isDailyCocktail
    ? `Today's featured cocktail: ${baseDescription}`
    : baseDescription;

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
function generateRecipeSchema(args: {
  name: string;
  description?: string | null;
  imageUrl: string | null;
  ingredients: string[];
  instructionSteps: string[];
  keywords: string[];
}) {
  const instructions = args.instructionSteps.map((text, index) => ({
    "@type": "HowToStep",
    text,
    position: index + 1,
  }));

  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: args.name,
    description: args.description || undefined,
    image: args.imageUrl || undefined,
    recipeIngredient: args.ingredients,
    "recipeInstructions": instructions,
    keywords: args.keywords.join(", "),
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

export default async function CocktailDetailPage({ params, searchParams }: PageProps) {
  try {
    const { slug } = await params;
    const { daily } = await searchParams;

    console.log('[COCKTAIL PAGE] Received slug:', slug);

    const cocktail = await getCocktailBySlug(slug);

    console.log('[COCKTAIL PAGE] Found cocktail:', cocktail ? `${cocktail.name} (id: ${cocktail.id})` : 'null');

    if (!cocktail) {
      console.error('[COCKTAIL PAGE] No cocktail found for slug:', slug);
      notFound();
    }

  const sanityCocktail = mapSupabaseToSanityCocktail(cocktail);

  // Get all cocktails for daily cocktail comparison
  const rawAllCocktails = await getCocktailsList();
  // Only pass id and slug to DailyCocktailBanner for performance
  const allCocktails = rawAllCocktails
    .filter(c => c && c.id && c.slug)
    .map(c => ({ id: c.id, slug: c.slug }));

  // Normalize data from Supabase
  const ingredients = normalizeIngredients(cocktail.ingredients as any);
  const instructionSteps = normalizeInstructions(cocktail.instructions as any);
  const tags = normalizeTags(cocktail.tags as any);
  const tagLine = buildTagLine(tags);

  // Use external image URL from Supabase
  const imageUrl = sanityCocktail.externalImageUrl || null;

  const recipeSchema = generateRecipeSchema({
    name: sanityCocktail.name,
    description: sanityCocktail.description,
    imageUrl,
    ingredients: ingredients.map((i) => i.text),
    instructionSteps,
    keywords: [...tags, ...asStringArray(sanityCocktail.bestFor)].filter(Boolean),
  });

  // Get similar recipes for recommendations
  const rawSimilarRecipes = await getSimilarRecipes(
    cocktail.id,
    cocktail.base_spirit,
    cocktail.tags,
    cocktail.categories_all
  );

  // Sanitize similar recipes data for client components
  const similarRecipes = rawSimilarRecipes
    .filter(recipe => recipe && recipe.id && recipe.name && recipe.slug)
    .map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      slug: recipe.slug,
      short_description: recipe.short_description || null,
      image_url: recipe.image_url || null,
    }));

  // Create a sanitized cocktail object for client components
  const sanitizedCocktail = {
    id: cocktail.id,
    name: cocktail.name,
    slug: cocktail.slug,
    short_description: cocktail.short_description,
    long_description: cocktail.long_description,
    base_spirit: cocktail.base_spirit,
    category_primary: cocktail.category_primary,
    glassware: cocktail.glassware,
    image_url: cocktail.image_url,
    image_alt: cocktail.image_alt,
    categories_all: cocktail.categories_all,
    notes: cocktail.notes,
    metadata_json: cocktail.metadata_json ? {
      is_community_favorite: cocktail.metadata_json.is_community_favorite,
      is_mixwise_original: cocktail.metadata_json.is_mixwise_original,
    } : undefined,
  };

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
          ...(isDailyCocktail ? [
            { name: "Cocktail of the Day", url: `${SITE_CONFIG.url}/cocktail-of-the-day` }
          ] : [
            { name: "Cocktails", url: `${SITE_CONFIG.url}/cocktails` }
          ]),
          { name: sanityCocktail.name, url: `${SITE_CONFIG.url}/cocktails/${sanityCocktail.slug.current}` },
        ]}
      />

      {/* MAIN PAGE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Cocktail of the Day Banner */}
        <DailyCocktailBanner
          cocktailId={cocktail.id}
          allCocktails={allCocktails}
          isInitiallyDaily={daily === 'true'}
        />

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
          cocktail={sanitizedCocktail}
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
