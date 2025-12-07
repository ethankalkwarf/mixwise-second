// scripts/seedCocktailsFromExcel.ts

import "dotenv/config";
import path from "path";
import xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars in seedCocktailsFromExcel.ts");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

type Row = {
  ID?: number | string;
  slug?: string;
  name?: string;
  short_description?: string;
  long_description?: string;
  seo_description?: string;
  base_spirit?: string;
  category_primary?: string;
  categories_all?: string;
  tags?: string;
  image_url?: string;
  image_alt?: string;
  glassware?: string;
  garnish?: string;
  technique?: string;
  difficulty?: string;
  flavor_strength?: number | string;
  flavor_sweetness?: number | string;
  flavor_tartness?: number | string;
  flavor_bitterness?: number | string;
  flavor_aroma?: number | string;
  flavor_texture?: number | string;
  notes?: string;
  fun_fact?: string;
  fun_fact_source?: string;
  metadata_json?: string;
  ingredients?: string;
  instructions?: string;
};

function parseIntOrNull(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseJsonOrNull(value: any): any | null {
  if (!value || typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    console.warn("Invalid JSON:", value.slice(0, 80), "… using fallback:", null);
    return null;
  }
}

function splitPipeToArray(value: any): string[] | null {
  if (!value || typeof value !== "string") return null;
  const parts = value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

/**
 * Ingredients can be:
 * - valid JSON (array or object)
 * - pipe-delimited string: "2 oz rye|1 oz amaro|2 dashes bitters"
 * We normalize to an array of { text: string } objects.
 */
function parseIngredients(value: any): Array<{ text: string }> | null {
  if (!value) return null;

  if (typeof value === "string") {
    // Try JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // If already array of strings or objects, normalize to { text }
        return parsed
          .map((item) =>
            typeof item === "string" ? { text: item } : { text: String(item.text ?? "") }
          )
          .filter((item) => item.text.trim().length > 0);
      }
      if (parsed && typeof parsed === "object") {
        const text = String((parsed as any).text ?? "");
        return text ? [{ text }] : null;
      }
    } catch {
      // not JSON, fall through
    }

    // Pipe-delimited
    const parts = value
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return null;
    return parts.map((text) => ({ text }));
  }

  // If Excel gave us something structured, normalize as best we can
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? { text: item } : { text: String(item.text ?? "") }
      )
      .filter((item) => item.text.trim().length > 0);
  }

  return null;
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "Cocktail DB_Full.xlsx");
  console.log("🌱 Starting cocktail seeding from Excel…");
  console.log("📖 Reading Excel file:", filePath);

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Row>(sheet);

  console.log(`📊 Found ${rows.length} rows in Excel file`);

  console.log("🗑️  Clearing existing cocktails…");
  const { error: deleteError } = await supabase
    .from("cocktails")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("❌ Failed to clear cocktails:", deleteError.message);
    process.exit(1);
  }

  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batchRows = rows.slice(i, i + batchSize);

    const batch = batchRows.map((row) => ({
      legacy_id:
        typeof row.ID === "number"
          ? row.ID
          : row.ID
          ? Number.isNaN(Number(row.ID))
            ? row.ID
            : Number(row.ID)
          : null,
      slug: row.slug ?? null,
      name: row.name ?? "",
      short_description: row.short_description ?? null,
      long_description: row.long_description ?? null,
      seo_description: row.seo_description ?? null,
      base_spirit: row.base_spirit ?? null,
      category_primary: row.category_primary ?? null,
      categories_all: splitPipeToArray(row.categories_all),
      tags: splitPipeToArray(row.tags),
      image_url: row.image_url ?? null,
      image_alt: row.image_alt ?? null,
      glassware: row.glassware ?? null,
      garnish: row.garnish ?? null,
      technique: row.technique ?? null,
      difficulty: row.difficulty ?? null,
      flavor_strength: parseIntOrNull(row.flavor_strength),
      flavor_sweetness: parseIntOrNull(row.flavor_sweetness),
      flavor_tartness: parseIntOrNull(row.flavor_tartness),
      flavor_bitterness: parseIntOrNull(row.flavor_bitterness),
      flavor_aroma: parseIntOrNull(row.flavor_aroma),
      flavor_texture: parseIntOrNull(row.flavor_texture),
      notes: row.notes ?? null,
      fun_fact: row.fun_fact ?? null,
      fun_fact_source: row.fun_fact_source ?? null,
      metadata_json: parseJsonOrNull(row.metadata_json),
      ingredients: parseIngredients(row.ingredients),
      instructions: row.instructions ?? null,
    }));

    const { error } = await supabase.from("cocktails").insert(batch);

    if (error) {
      console.error(
        `❌ Error inserting batch ${i / batchSize + 1}:`,
        error.message
      );
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`📤 Inserted ${inserted}/${rows.length} cocktails…`);
  }

  console.log(`🎉 Successfully seeded ${inserted} cocktails!`);
}

main().catch((err) => {
  console.error("❌ Unexpected error during seeding:", err);
  process.exit(1);
});

