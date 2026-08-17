#!/usr/bin/env tsx
/**
 * Resolve TheCocktailDB's largest public bottle PNGs (not the -Small thumbs)
 * and store them on MixWise.
 *
 * Uses their documented JSON API / CDN — not HTML scraping.
 * Matching is exact (or an upgraded existing URL). No fuzzy substring matching.
 *
 *   npx tsx scripts/syncCocktailDbIngredientImages.ts --dry-run
 *   npx tsx scripts/syncCocktailDbIngredientImages.ts --apply
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { slugifyIngredientName } from "../lib/ingredientSlug";
import { upgradeIngredientImageUrl } from "../lib/ingredientImages";
import { ingredientBlobPath, publishWebpToBlob } from "./lib/catalogMedia";

dotenv.config({ path: ".env.local" });

const API = "https://www.thecocktaildb.com/api/json/v1/1";
const BUCKET = "cocktail-images-fullsize";
const PREFIX = "ingredients";
const apply = process.argv.includes("--apply");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

type DbIngredient = { id: number | string; name: string; image_url: string | null };

/** Known CocktailDB catalog names that differ from MixWise labels. */
const NAME_ALIASES: Record<string, string> = {
  scotch: "Blended Scotch",
  "baileys irish cream": "Baileys irish cream",
  "light rum": "Light rum",
  "white rum": "Light rum",
  "sugar syrup": "Sugar Syrup",
  "simple syrup": "Sugar Syrup",
  "honey syrup": "Honey syrup",
  "fresh lemon juice": "Lemon juice",
  "lemon juice": "Lemon juice",
  "lime juice": "Lime juice",
  "club soda": "Club Soda",
  "soda water": "Soda water",
  "coffee liqueur": "Coffee liqueur",
  "white creme de menthe": "White Creme de Menthe",
  "chambord raspberry liqueur": "Chambord raspberry liqueur",
  "apple brandy": "Apple brandy",
};

function cocktailDbImageUrl(name: string): string {
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}.png`;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function downloadOk(url: string): Promise<Buffer | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) return null;
  if (buf[0] !== 0x89 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  return buf;
}

async function tryUrl(url: string | null | undefined): Promise<{ url: string; png: Buffer } | null> {
  if (!url) return null;
  const png = await downloadOk(url);
  return png ? { url, png } : null;
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env");
    process.exit(1);
  }

  const { data: rows, error } = await supabase.from("ingredients").select("id, name, image_url");
  if (error || !rows) {
    console.error(error);
    process.exit(1);
  }

  const list = await fetchJson<{ drinks: Array<{ strIngredient1: string }> | null }>(`${API}/list.php?i=list`);
  const catalogByNorm = new Map(
    (list?.drinks || [])
      .map((d) => d.strIngredient1)
      .filter(Boolean)
      .map((name) => [normalize(name), name] as const)
  );

  let updated = 0;
  let uploaded = 0;
  let skipped = 0;

  for (const row of rows as DbIngredient[]) {
    const ours = normalize(row.name);
    const catalogName = NAME_ALIASES[ours] || catalogByNorm.get(ours) || null;

    const resolved =
      (await tryUrl(upgradeIngredientImageUrl(row.image_url))) ||
      (await tryUrl(catalogName ? cocktailDbImageUrl(catalogName) : null)) ||
      (await tryUrl(cocktailDbImageUrl(row.name)));

    if (!resolved) {
      skipped += 1;
      console.log(`skip  ${row.name} (no full-size bottle PNG)`);
      continue;
    }

    const slug = slugifyIngredientName(row.name) || String(row.id);
    const path = `${PREFIX}/${slug}.png`;
    let publicUrl = resolved.url;

    if (apply) {
      const { error: upError } = await supabase.storage.from(BUCKET).upload(path, resolved.png, {
        contentType: "image/png",
        upsert: true,
      });
      if (upError) {
        console.log(`warn  ${row.name} archive upload failed (${upError.message})`);
      } else {
        uploaded += 1;
      }

      try {
        const published = await publishWebpToBlob(ingredientBlobPath(slug), resolved.png);
        publicUrl = published.url;
      } catch (err) {
        console.log(`warn  ${row.name} blob publish failed (${(err as Error).message}); keeping source URL`);
      }

      const { error: updError } = await supabase.from("ingredients").update({ image_url: publicUrl }).eq("id", row.id);
      if (updError) {
        console.log(`fail  ${row.name} db update ${updError.message}`);
        continue;
      }
    }

    updated += 1;
    const label = catalogName || (row.image_url ? "url-upgrade" : row.name);
    console.log(`${apply ? "set " : "plan"} ${row.name}  ${(resolved.png.length / 1024).toFixed(0)}kb  ${label}`);
  }

  console.log(`\n${apply ? "Applied" : "Dry run"}: ${updated} images, ${uploaded} uploaded to storage, ${skipped} skipped`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
