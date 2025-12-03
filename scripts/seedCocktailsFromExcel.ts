/**
 * Seed Supabase cocktails table from data/Cocktail DB_Full.xlsx
 *
 * Usage:
 *   npx tsx scripts/seedCocktailsFromExcel.ts
 */

import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const EXCEL_PATH = path.resolve(process.cwd(), "data/Cocktail DB_Full.xlsx");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`❌ Excel file not found at ${EXCEL_PATH}. Please add Cocktail DB_Full.xlsx to /data.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("\n📖 Reading Excel file:", EXCEL_PATH);
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });

  console.log(`• Loaded ${rows.length} row(s)`);
  const normalized = rows.map((row, index) => normalizeRow(row, index));

  console.log("\n🧹 Clearing existing cocktails table...");
  const { error: deleteError } = await supabase
    .from("cocktails")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("❌ Failed to clear cocktails table", deleteError);
    process.exit(1);
  }

  console.log("✅ Existing rows removed. Inserting new data...");
  const chunkSize = 150;
  let inserted = 0;

  for (let i = 0; i < normalized.length; i += chunkSize) {
    const chunk = normalized.slice(i, i + chunkSize);
    const { error } = await supabase.from("cocktails").insert(chunk);
    if (error) {
      console.error(`❌ Failed to insert batch starting at row ${i}`, error);
      process.exit(1);
    }
    inserted += chunk.length;
    process.stdout.write(`  • Inserted ${inserted}/${normalized.length}\r`);
  }

  console.log(`\n✅ Seed complete. Inserted ${inserted} cocktails.`);
}

type NormalizedCocktail = {
  legacy_id: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  seo_description: string | null;
  base_spirit: string | null;
  category_primary: string | null;
  categories_all: string[] | null;
  tags: string[] | null;
  image_url: string | null;
  image_alt: string | null;
  glassware: string | null;
  garnish: string | null;
  technique: string | null;
  difficulty: string | null;
  flavor_strength: number | null;
  flavor_sweetness: number | null;
  flavor_tartness: number | null;
  flavor_bitterness: number | null;
  flavor_aroma: string | null;
  flavor_texture: string | null;
  notes: string | null;
  fun_fact: string | null;
  fun_fact_source: string | null;
  metadata_json: Record<string, any> | null;
  ingredients: any[] | null;
  instructions: string | null;
  is_popular: boolean;
  is_favorite: boolean;
  is_trending: boolean;
  is_hidden: boolean;
};

function normalizeRow(row: Record<string, any>, index: number): NormalizedCocktail {
  const normalized = normalizeKeys(row);
  const name = (normalized.name || normalized.title || `Cocktail ${index + 1}`).trim();
  const slug = (normalized.slug && String(normalized.slug).trim()) || slugify(name);

  const metadata = parseJson<Record<string, any>>(normalized.metadata_json) || {};
  const isPopular = readBoolean(normalized.is_popular ?? metadata.isPopular);
  const isFavorite = readBoolean(normalized.is_favorite ?? metadata.isFavorite);
  const isTrending = readBoolean(normalized.is_trending ?? metadata.isTrending);
  const isHidden = readBoolean(normalized.hidden ?? metadata.hidden);

  return {
    legacy_id: normalized.id ? String(normalized.id) : null,
    slug,
    name,
    short_description: orNull(normalized.short_description ?? normalized.description),
    long_description: orNull(normalized.long_description ?? normalized.story),
    seo_description: orNull(normalized.seo_description ?? normalized.meta_description),
    base_spirit: orNull(normalized.base_spirit ?? normalized.primary_spirit),
    category_primary: orNull(normalized.category_primary),
    categories_all: splitList(normalized.categories_all ?? metadata.categories),
    tags: splitList(normalized.tags ?? metadata.tags),
    image_url: orNull(normalized.image_url ?? normalized.image ?? metadata.imageUrl),
    image_alt: orNull(normalized.image_alt ?? metadata.imageAlt),
    glassware: orNull(normalized.glassware ?? normalized.glass),
    garnish: orNull(normalized.garnish),
    technique: orNull(normalized.technique ?? normalized.method),
    difficulty: orNull(normalized.difficulty),
    flavor_strength: toNumber(normalized.flavor_strength),
    flavor_sweetness: toNumber(normalized.flavor_sweetness),
    flavor_tartness: toNumber(normalized.flavor_tartness),
    flavor_bitterness: toNumber(normalized.flavor_bitterness),
    flavor_aroma: orNull(normalized.flavor_aroma),
    flavor_texture: orNull(normalized.flavor_texture),
    notes: orNull(normalized.notes),
    fun_fact: orNull(normalized.fun_fact ?? metadata.funFact),
    fun_fact_source: orNull(normalized.fun_fact_source ?? metadata.funFactSource),
    metadata_json: Object.keys(metadata).length ? metadata : null,
    ingredients: parseIngredients(normalized.ingredients ?? metadata.ingredients),
    instructions: serializeInstructions(normalized.instructions ?? metadata.instructions),
    is_popular: isPopular,
    is_favorite: isFavorite,
    is_trending: isTrending,
    is_hidden: isHidden,
  };
}

function normalizeKeys(row: Record<string, any>) {
  return Object.keys(row).reduce<Record<string, any>>((acc, key) => {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    acc[normalizedKey] = row[key];
    return acc;
  }, {});
}

function orNull(value: any): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function toNumber(value: any): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function splitList(value: any): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => String(item).trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  const parts = String(value)
    .split(/[,|;]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

function parseJson<T>(value: any): T | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function parseIngredients(value: any): any[] | null {
  if (!value) return null;
  let entries: any[] = [];

  if (Array.isArray(value)) {
    entries = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        entries = parsed;
      }
    } catch {
      entries = value
        .split(/\r?\n|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line }));
    }
  }

  if (!entries.length) return null;

  return entries.map((entry) => {
    const name = entry.name || entry.ingredient_name || entry.ingredient?.name || entry.label || \"\";\n+    const safeName = String(name).trim();\n+    const idCandidate = entry.id || entry.ingredient_id || entry.ingredient?._id;\n+    const id = idCandidate || (safeName ? slugify(safeName) : null);\n+    return {\n+      id,\n+      name: safeName || \"Ingredient\",\n+      amount: entry.amount ?? entry.measure ?? null,\n+      unit: entry.unit ?? null,\n+      notes: entry.notes ?? null,\n+      isOptional: Boolean(entry.isOptional ?? entry.is_optional),\n+    };\n+  });\n }
}

function serializeInstructions(value: any): string | null {
  if (!value) return null;

  const toSteps = (): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (typeof entry === "string") return entry.trim();
          if (entry?.text) return String(entry.text).trim();
          if (Array.isArray(entry?.children)) {
            return entry.children.map((child: any) => child?.text || "").join("").trim();
          }
          return "";
        })
        .filter(Boolean);
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((step) => String(step).trim()).filter(Boolean);
        }
      } catch {
        // treat as raw text
      }
      return value
        .split(/\r?\n+/)
        .map((line) => line.replace(/^\d+[\)\.]\s*/, "").trim())
        .filter(Boolean);
    }

    return [];
  };

  const steps = toSteps();
  return steps.length ? JSON.stringify(steps) : null;
}

function readBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return false;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main().catch((error) => {
  console.error("❌ Seed script failed", error);
  process.exit(1);
});
