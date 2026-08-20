/**
 * Persistent Drink of the Day calendar.
 *
 * Assignments are locked per UTC date so adding cocktails to the catalog
 * does not reshuffle days that were already chosen (or pre-scheduled).
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getDailyIndexFromCount, getCurrentLocalDateString } from "@/lib/dailyCocktail";
import fs from "node:fs/promises";
import path from "node:path";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

export function addUtcDateDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function listCatalogSlugs(): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cocktails")
    .select("slug")
    .not("slug", "is", null)
    .neq("slug", "")
    .order("slug", { ascending: true })
    .limit(5000);

  if (!error) {
    const slugs = (data || [])
      .map((row) => (row?.slug ? String(row.slug) : ""))
      .filter(Boolean);
    if (slugs.length > 0) return slugs;
  } else {
    console.error("[daily-calendar] catalog slug query failed:", error);
  }

  try {
    const filePath = path.join(process.cwd(), "cocktails.enriched.ndjson");
    const raw = await fs.readFile(filePath, "utf8");
    const fileSlugs = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          const obj = JSON.parse(line);
          if (obj?.hidden === true) return null;
          const slug = obj?.slug?.current;
          return slug ? String(slug) : null;
        } catch {
          return null;
        }
      })
      .filter((slug): slug is string => !!slug);

    return Array.from(new Set(fileSlugs)).sort();
  } catch (fallbackError) {
    console.error("[daily-calendar] file fallback failed:", fallbackError);
    return [];
  }
}

function pickSlugForDate(slugs: string[], dateKey: string): string | null {
  if (!slugs.length) return null;
  const index = getDailyIndexFromCount(slugs.length, new Date(`${dateKey}T00:00:00.000Z`));
  return slugs[index] || null;
}

async function readAssignedSlugs(
  dateKeys: string[]
): Promise<Map<string, string>> {
  const assigned = new Map<string, string>();
  if (!dateKeys.length) return assigned;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("daily_cocktail_calendar")
    .select("date_key, slug")
    .in("date_key", dateKeys);

  if (error) {
    // Table may not exist yet in some environments — fall back to computed picks.
    console.error("[daily-calendar] read assignments failed:", error);
    return assigned;
  }

  for (const row of data || []) {
    if (row?.date_key && row?.slug) {
      assigned.set(String(row.date_key).slice(0, 10), String(row.slug));
    }
  }

  return assigned;
}

async function lockAssignments(
  rows: Array<{ date_key: string; slug: string }>
): Promise<void> {
  if (!rows.length) return;

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("daily_cocktail_calendar").upsert(rows, {
    onConflict: "date_key",
    ignoreDuplicates: true,
  });

  if (error) {
    console.error("[daily-calendar] lock assignments failed:", error);
  }
}

/**
 * Resolve (and lock) Drink of the Day slugs for the given UTC date keys.
 * Existing calendar rows win; missing days are computed from the current catalog then persisted.
 */
export async function resolveDailyCocktailSlugs(
  dateKeys: string[]
): Promise<Map<string, string>> {
  const uniqueKeys = Array.from(new Set(dateKeys.filter(Boolean)));
  const result = new Map<string, string>();
  if (!uniqueKeys.length) return result;

  const assigned = await readAssignedSlugs(uniqueKeys);
  const missing = uniqueKeys.filter((key) => !assigned.has(key));

  for (const [key, slug] of assigned) {
    result.set(key, slug);
  }

  if (!missing.length) return result;

  const catalog = await listCatalogSlugs();
  const toLock: Array<{ date_key: string; slug: string }> = [];

  for (const dateKey of missing) {
    const slug = pickSlugForDate(catalog, dateKey);
    if (!slug) continue;
    result.set(dateKey, slug);
    toLock.push({ date_key: dateKey, slug });
  }

  await lockAssignments(toLock);

  // Re-read in case of concurrent first-writer wins.
  if (toLock.length) {
    const confirmed = await readAssignedSlugs(missing);
    for (const [key, slug] of confirmed) {
      result.set(key, slug);
    }
  }

  return result;
}

export async function resolveDailyCocktailSlug(dateKey: string): Promise<string | null> {
  const map = await resolveDailyCocktailSlugs([dateKey]);
  return map.get(dateKey) || null;
}

export type DailyCocktailForecastItem = {
  dateKey: string;
  slug: string;
  name: string;
  baseSpirit: string | null;
  categories: string[];
  shortDescription: string | null;
};

/**
 * Lock and return the next `days` Drink of the Day entries (including today).
 */
export async function getDailyCocktailForecast(
  days = 30
): Promise<DailyCocktailForecastItem[]> {
  const count = Math.max(1, Math.min(60, Math.floor(days)));
  const today = getCurrentLocalDateString();
  const dateKeys = Array.from({ length: count }, (_, i) => addUtcDateDays(today, i));

  const slugByDate = await resolveDailyCocktailSlugs(dateKeys);
  const slugs = Array.from(new Set(Array.from(slugByDate.values())));
  if (!slugs.length) return [];

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("slug, name, base_spirit, categories_all, short_description")
    .in("slug", slugs);

  if (error) {
    console.error("[daily-calendar] forecast cocktail fetch failed:", error);
    return [];
  }

  const bySlug = new Map(
    (data || []).map((row) => [
      String(row.slug),
      {
        slug: String(row.slug),
        name: String(row.name),
        baseSpirit: row.base_spirit ?? null,
        categories: (row.categories_all || []).slice(0, 6),
        shortDescription: row.short_description ?? null,
      },
    ])
  );

  const forecast: DailyCocktailForecastItem[] = [];
  for (const dateKey of dateKeys) {
    const slug = slugByDate.get(dateKey);
    if (!slug) continue;
    const cocktail = bySlug.get(slug);
    if (!cocktail) continue;
    forecast.push({
      dateKey,
      slug: cocktail.slug,
      name: cocktail.name,
      baseSpirit: cocktail.baseSpirit,
      categories: cocktail.categories,
      shortDescription: cocktail.shortDescription,
    });
  }

  return forecast;
}
