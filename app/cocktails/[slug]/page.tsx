import { getCocktailBySlug, getCocktailsList, getTodaysDailyCocktailSlug } from "@/lib/cocktails.server";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { MixWiseToolCallout } from "@/components/seo/MixWiseToolCallout";
import { SITE_CONFIG, generateCocktailMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { Metadata } from "next";
import Image from "next/image";
import { FlavorProfileCard } from "@/components/cocktails/FlavorProfileCard";
import { BartendersNoteCard } from "@/components/cocktails/BartendersNoteCard";
import { RecipeActions } from "@/components/cocktails/RecipeActions";
import { getSimilarRecipes } from "@/lib/similarRecipes";
import { RecipeContent } from "./RecipeContent";
import { DailyCocktailBanner } from "@/components/cocktails/DailyCocktailBanner";
import { matchIngredientTextToIds } from "@/lib/ingredientMatching";
import { debugLog } from "@/lib/debugLog";

// --- helpers for data normalization ---

type IngredientLike =
  | null
  | undefined
  | string
  | { text?: string; name?: string; amount?: string; measure?: string; notes?: string; isOptional?: boolean; ingredient?: unknown }
  | Array<unknown>;

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

function formatIngredientLine(item: unknown): string {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item !== "object") return String(item).trim();

  const obj = item as Record<string, unknown>;
  if (typeof obj.text === "string" && obj.text.trim()) return obj.text.trim();

  const nested =
    obj.ingredient && typeof obj.ingredient === "object"
      ? (obj.ingredient as Record<string, unknown>)
      : null;
  const name =
    (typeof obj.name === "string" && obj.name) ||
    (nested && typeof nested.name === "string" && nested.name) ||
    (typeof obj.ingredient === "string" && obj.ingredient) ||
    "";
  const amount =
    (typeof obj.amount === "string" && obj.amount) ||
    (typeof obj.measure === "string" && obj.measure) ||
    "";
  const notes = typeof obj.notes === "string" ? obj.notes.trim() : "";
  const optional = obj.isOptional || obj.optional ? " (optional)" : "";

  const core = [amount, name].filter(Boolean).join(" ").trim();
  if (!core) return "";
  return notes ? `${core}${optional} — ${notes}` : `${core}${optional}`;
}

function normalizeIngredients(raw: IngredientLike): { text: string }[] {
  if (!raw) return [];

  if (typeof raw === "string") {
    try {
      return normalizeIngredients(JSON.parse(raw));
    } catch {
      return raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((text) => ({ text }));
    }
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item) => ({ text: formatIngredientLine(item) }))
      .filter((i) => i.text.length > 0);
  }

  const text = formatIngredientLine(raw);
  return text ? [{ text }] : [];
}

function normalizeInstructions(
  raw: string | string[] | null | undefined
): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((step) => {
        if (typeof step === "string") return step.trim();
        if (step && typeof step === "object" && "text" in (step as object)) {
          return String((step as { text?: unknown }).text ?? "").trim();
        }
        return "";
      })
      .filter((s) => s.length > 0);
  }

  if (typeof raw !== "string") return [];

  const value = raw.trim();
  if (!value) return [];

  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      return normalizeInstructions(JSON.parse(value));
    } catch {
      // fall through
    }
  }

  const numbered = value
    .split(/\s*\d+\)\s*/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));

  if (numbered.length > 1) return numbered;

  const newlineSteps = value
    .split(/\n+/)
    .map((s) => s.replace(/^\s*\d+[\.\)]\s*/, "").trim())
    .filter((s) => s.length > 0);

  if (newlineSteps.length > 1) return newlineSteps;

  const sentences = value
    .split(/\.\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));

  if (sentences.length > 1) return sentences;

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
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cocktail = await getCocktailBySlug(slug);

  if (!cocktail) {
    return { title: "Cocktail Not Found" };
  }

  return generateCocktailMetadata({
    name: cocktail.name,
    slug: { current: cocktail.slug },
    description: cocktail.short_description || cocktail.long_description,
    externalImageUrl: cocktail.image_url,
    seoTitle: cocktail.metadata_json?.seoTitle,
    metaDescription: cocktail.seo_description,
    ingredients: cocktail.ingredients,
    primarySpirit: cocktail.base_spirit,
  });
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
    image: args.imageUrl || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    recipeIngredient: args.ingredients,
    "recipeInstructions": instructions,
    keywords: args.keywords.join(", "),
    "recipeCategory": "Cocktail",
    "recipeCuisine": "Cocktail",
    "author": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
  };
}

export default async function CocktailDetailPage({ params }: PageProps) {
  const { slug } = await params;

  debugLog('[COCKTAIL PAGE] Received slug:', slug);

  const cocktail = await getCocktailBySlug(slug);

  debugLog('[COCKTAIL PAGE] Found cocktail:', cocktail ? `${cocktail.name} (id: ${cocktail.id})` : 'null');

  if (!cocktail) {
    console.error('[COCKTAIL PAGE] No cocktail found for slug:', slug);
    notFound();
  }

  const sanityCocktail = mapSupabaseToSanityCocktail(cocktail);

  // Normalize data from Supabase
  const ingredients = normalizeIngredients(cocktail.ingredients as any);
  const instructionSteps = normalizeInstructions(cocktail.instructions as any);
  const tags = normalizeTags(cocktail.tags as any);
  const tagLine = buildTagLine(tags);

  // Parallelize independent work: shopping-list match, similar recipes, daily slug
  const [matchedIngredients, rawSimilarRecipes, todaysDailySlug] = await Promise.all([
    matchIngredientTextToIds(ingredients.map((ing) => ing.text)),
    getSimilarRecipes(
      cocktail.id,
      cocktail.base_spirit,
      cocktail.tags,
      cocktail.categories_all
    ),
    getTodaysDailyCocktailSlug(),
  ]);

  const isDailyCocktailBanner = Boolean(todaysDailySlug && todaysDailySlug === cocktail.slug);

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
    technique: cocktail.technique,
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
          ...(todaysDailySlug && todaysDailySlug === cocktail.slug ? [
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
        <DailyCocktailBanner isInitiallyDaily={isDailyCocktailBanner} />

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
          matchedIngredients={matchedIngredients}
          instructionSteps={instructionSteps}
          tagLine={tagLine}
          imageUrl={imageUrl}
          similarRecipes={similarRecipes}
        />
        <MixWiseToolCallout
          cocktailName={sanityCocktail.name}
          ingredientNames={[
            ...new Set(
              matchedIngredients
                .map((item) => item.name)
                .filter((name): name is string => Boolean(name))
            ),
          ].slice(0, 6)}
          mixHref={
            matchedIngredients.some((item) => item.slug)
              ? `/mix?have=${[...new Set(
                  matchedIngredients
                    .map((item) => item.slug)
                    .filter((slug): slug is string => Boolean(slug))
                )].join(",")}`
              : "/mix"
          }
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
