import type { CocktailRow, Json } from "@/lib/supabase/database.types";

export type CocktailIngredient = {
  id?: string | null;
  name: string;
  amount?: string | null;
  unit?: string | null;
  isOptional?: boolean;
  notes?: string | null;
};

export type CocktailFlavorProfile = {
  strength?: number | null;
  sweetness?: number | null;
  tartness?: number | null;
  bitterness?: number | null;
  aroma?: string | null;
  texture?: string | null;
};

export type Cocktail = {
  id: string;
  legacyId: string | null;
  slug: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  baseSpirit: string | null;
  categoryPrimary: string | null;
  categories: string[];
  tags: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  glass: string | null;
  garnish: string | null;
  method: string | null;
  difficulty: string | null;
  flavorProfile: CocktailFlavorProfile;
  notes: string | null;
  funFact: string | null;
  funFactSource: string | null;
  metadata: Record<string, any>;
  ingredients: CocktailIngredient[];
  instructions: string[];
  isPopular: boolean;
  isFavorite: boolean;
  isTrending: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export function normalizeCocktail(row: CocktailRow): Cocktail {
  const metadata = toObject(row.metadata_json) ?? {};
  const metadataInstructionSource = Array.isArray(metadata.instructions)
    ? metadata.instructions
        .map((entry: unknown) => stringifyInstruction(entry))
        .filter((entry): entry is string => Boolean(entry))
    : typeof metadata.instructions === "string"
      ? parseInstructions(metadata.instructions)
      : [];
  const instructionsFromRow = parseInstructions(row.instructions);
  const instructions = instructionsFromRow.length > 0 ? instructionsFromRow : metadataInstructionSource;
  const metadataFlavor = (metadata.flavorProfile || metadata.flavor_profile || {}) as Record<string, any>;
  const flavorProfile: CocktailFlavorProfile = {
    strength: row.flavor_strength ?? (metadataFlavor.strength ?? null),
    sweetness: row.flavor_sweetness ?? (metadataFlavor.sweetness ?? null),
    tartness: row.flavor_tartness ?? (metadataFlavor.tartness ?? null),
    bitterness: row.flavor_bitterness ?? (metadataFlavor.bitterness ?? null),
    aroma: row.flavor_aroma ?? metadataFlavor.aroma ?? null,
    texture: row.flavor_texture ?? metadataFlavor.texture ?? null,
  };

  return {
    id: row.id,
    legacyId: row.legacy_id,
    slug: row.slug,
    name: row.name,
    description: row.short_description || row.long_description || row.seo_description || null,
    longDescription: row.long_description || null,
    seoTitle: metadata.seoTitle || metadata.seo_title || null,
    seoDescription: row.seo_description || null,
    baseSpirit: row.base_spirit || null,
    categoryPrimary: row.category_primary || null,
    categories: row.categories_all || [],
    tags: row.tags || [],
    imageUrl: row.image_url || null,
    imageAlt: row.image_alt || null,
    glass: row.glassware || null,
    garnish: row.garnish || null,
    method: row.technique || null,
    difficulty: row.difficulty || null,
    flavorProfile,
    notes: row.notes || null,
    funFact: row.fun_fact || null,
    funFactSource: row.fun_fact_source || null,
    metadata,
    ingredients: parseIngredients(row.ingredients),
    instructions,
    isPopular: Boolean(row.is_popular),
    isFavorite: Boolean(row.is_favorite),
    isTrending: Boolean(row.is_trending),
    isHidden: Boolean(row.is_hidden),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getCocktailImageUrl(cocktail: Cocktail): string | null {
  return cocktail.imageUrl;
}

function parseIngredients(value: Json | null): CocktailIngredient[] {
  if (!value) return [];

  let raw: any[] = [];
  if (Array.isArray(value)) {
    raw = value as any[];
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        raw = parsed;
      }
    } catch {
      raw = value
        .split(/\r?\n|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line }));
    }
  }

  return raw
    .map((item) => normalizeIngredient(item))
    .filter((item): item is CocktailIngredient => Boolean(item));
}

function normalizeIngredient(item: any): CocktailIngredient | null {
  if (!item) return null;

  const id = item.id || item.ingredient_id || item.ingredientId || item.ingredient?.id || item.ingredient?._id || null;
  const name = item.name || item.ingredient_name || item.ingredient?.name || item.label || null;

  if (!name) return null;

  return {
    id: id || slugify(name),
    name,
    amount: formatAmount(item.amount, item.unit),
    unit: item.unit || null,
    isOptional: Boolean(item.isOptional ?? item.is_optional),
    notes: item.notes || item.note || null,
  };
}

function formatAmount(amount: unknown, unit?: unknown) {
  if (amount == null && unit == null) return null;
  if (amount == null) return String(unit ?? "").trim() || null;
  if (typeof amount === "number") {
    return `${amount}${unit ? ` ${unit}` : ""}`.trim();
  }
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (!trimmed && unit) {
      return String(unit).trim() || null;
    }
    return unit ? `${trimmed} ${unit}`.trim() : trimmed || null;
  }
  return null;
}

function parseInstructions(value: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => stringifyInstruction(entry))
        .filter((entry): entry is string => Boolean(entry));
    }
  } catch {
    // not JSON
  }

  return trimmed
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\d+[\)\.]\s*/, "").trim())
    .filter(Boolean);
}

function stringifyInstruction(entry: unknown): string | null {
  if (!entry) return null;
  if (typeof entry === "string") {
    return entry.trim() || null;
  }
  if (typeof entry === "object") {
    if (Array.isArray((entry as any).children)) {
      const text = (entry as any).children
        .map((child: any) => child?.text || "")
        .join("")
        .trim();
      return text || null;
    }
    if (typeof (entry as any).text === "string") {
      const text = (entry as any).text.trim();
      return text || null;
    }
  }
  return null;
}

function toObject(value: Json | null): Record<string, any> | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, any>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
