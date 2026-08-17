#!/usr/bin/env tsx
/**
 * Copy public catalog photos off Supabase Storage onto Vercel Blob.
 *
 * Masters stay in `cocktail-images-fullsize` (archive). `image_url` becomes a
 * ~1200w WebP on Blob so email/OG/browsers never hit Supabase egress.
 *
 *   npx tsx scripts/migrateCatalogImagesToBlob.ts
 *   npx tsx scripts/migrateCatalogImagesToBlob.ts --apply
 *   npx tsx scripts/migrateCatalogImagesToBlob.ts --apply --ingredients
 *   npx tsx scripts/migrateCatalogImagesToBlob.ts --make-private
 *
 * Requires BLOB_READ_WRITE_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { slugifyIngredientName } from "../lib/ingredientSlug";
import {
  CATALOG_STORAGE_BUCKET,
  cocktailBlobPath,
  ingredientBlobPath,
  isSupabaseStorageUrl,
  isVercelBlobUrl,
  publishStorageObjectToBlob,
  publishWebpToBlob,
  storagePathFromPublicUrl,
} from "./lib/catalogMedia";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const apply = process.argv.includes("--apply");
const includeIngredients = process.argv.includes("--ingredients");
const makePrivate = process.argv.includes("--make-private");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
const slugArg = process.argv.find((arg) => arg.startsWith("--slug="));
const onlySlug = slugArg ? slugArg.split("=")[1] : undefined;

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}kb`;
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
}

function requireEnv() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!makePrivate && apply && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN in .env.local");
  }
  return { supabaseUrl, serviceKey };
}

async function remainingSupabaseUrls(
  supabase: ReturnType<typeof createClient>
): Promise<{ cocktails: number; ingredients: number }> {
  const [{ count: cocktailCount }, { count: ingredientCount }] = await Promise.all([
    supabase
      .from("cocktails")
      .select("id", { count: "exact", head: true })
      .like("image_url", "%supabase.co/storage%"),
    supabase
      .from("ingredients")
      .select("id", { count: "exact", head: true })
      .like("image_url", "%supabase.co/storage%"),
  ]);
  return {
    cocktails: cocktailCount || 0,
    ingredients: ingredientCount || 0,
  };
}

async function migrateCocktails(supabase: ReturnType<typeof createClient>) {
  let query = supabase
    .from("cocktails")
    .select("id, slug, name, image_url")
    .not("image_url", "is", null)
    .order("slug");
  if (onlySlug) query = query.eq("slug", onlySlug);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || [])
    .filter((row) => isSupabaseStorageUrl(row.image_url) && !isVercelBlobUrl(row.image_url))
    .slice(0, limit);

  console.log(`Cocktails on Supabase Storage: ${rows.length}${apply ? "" : " (dry run)"}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  await mapPool(rows, apply ? 2 : 1, async (row) => {
    const path = storagePathFromPublicUrl(row.image_url || "");
    if (!path) {
      skipped += 1;
      console.log(`skip  ${row.slug}  (could not parse storage path)`);
      return;
    }

    if (!apply) {
      console.log(`plan  ${row.slug}  ${path} -> ${cocktailBlobPath(row.slug)}`);
      updated += 1;
      return;
    }

    try {
      const published = await publishStorageObjectToBlob(supabase, {
        storagePath: path,
        blobPath: cocktailBlobPath(row.slug),
      });
      const { error: updError } = await supabase
        .from("cocktails")
        .update({ image_url: published.url })
        .eq("id", row.id);
      if (updError) throw updError;
      updated += 1;
      console.log(
        `set   ${row.slug}  ${kb(published.sourceBytes)} -> ${kb(published.publicBytes)}`
      );
    } catch (err) {
      failed += 1;
      console.error(`fail  ${row.slug}  ${(err as Error).message}`);
    }
  });

  return { updated, skipped, failed };
}

async function migrateIngredients(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, image_url")
    .not("image_url", "is", null)
    .order("name");
  if (error) throw error;

  const rows = (data || [])
    .filter((row) => isSupabaseStorageUrl(row.image_url) && !isVercelBlobUrl(row.image_url))
    .slice(0, limit);

  console.log(`\nIngredients on Supabase Storage: ${rows.length}${apply ? "" : " (dry run)"}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  await mapPool(rows, apply ? 2 : 1, async (row) => {
    const path = storagePathFromPublicUrl(row.image_url || "");
    const slug = slugifyIngredientName(row.name) || String(row.id);

    if (!apply) {
      console.log(`plan  ${row.name}  ${path || "(external fetch)"} -> ${ingredientBlobPath(slug)}`);
      updated += 1;
      return;
    }

    try {
      let published: { url: string; sourceBytes: number; publicBytes: number };
      if (path) {
        published = await publishStorageObjectToBlob(supabase, {
          storagePath: path,
          blobPath: ingredientBlobPath(slug),
        });
      } else {
        const res = await fetch(row.image_url as string);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching current image_url`);
        const source = Buffer.from(await res.arrayBuffer());
        const blob = await publishWebpToBlob(ingredientBlobPath(slug), source);
        published = {
          url: blob.url,
          sourceBytes: source.length,
          publicBytes: blob.bytes,
        };
      }

      const { error: updError } = await supabase
        .from("ingredients")
        .update({ image_url: published.url })
        .eq("id", row.id);
      if (updError) throw updError;
      updated += 1;
      console.log(
        `set   ${row.name}  ${kb(published.sourceBytes)} -> ${kb(published.publicBytes)}`
      );
    } catch (err) {
      failed += 1;
      console.error(`fail  ${row.name}  ${(err as Error).message}`);
    }
  });

  return { updated, skipped, failed };
}

async function privatizeBucket(supabase: ReturnType<typeof createClient>) {
  const leftover = await remainingSupabaseUrls(supabase);
  if (leftover.cocktails > 0 || leftover.ingredients > 0) {
    throw new Error(
      `Refusing to privatize: ${leftover.cocktails} cocktail and ${leftover.ingredients} ingredient image_url values still point at Supabase Storage. Re-run --apply (and --ingredients) first.`
    );
  }

  const { data, error } = await supabase.storage.updateBucket(CATALOG_STORAGE_BUCKET, {
    public: false,
  });
  if (error) throw error;
  console.log(`Bucket ${CATALOG_STORAGE_BUCKET} is now private.`, data);
}

async function main() {
  const { supabaseUrl, serviceKey } = requireEnv();
  const supabase = createClient(supabaseUrl, serviceKey);

  if (makePrivate) {
    await privatizeBucket(supabase);
    return;
  }

  const cocktails = await migrateCocktails(supabase);
  const ingredients = includeIngredients
    ? await migrateIngredients(supabase)
    : { updated: 0, skipped: 0, failed: 0 };

  const leftover = await remainingSupabaseUrls(supabase);
  console.log(
    `\n${apply ? "Applied" : "Dry run"}: cocktails ${cocktails.updated} ok / ${cocktails.failed} fail / ${cocktails.skipped} skip` +
      (includeIngredients
        ? `; ingredients ${ingredients.updated} ok / ${ingredients.failed} fail / ${ingredients.skipped} skip`
        : "")
  );
  console.log(
    `Still on Supabase URLs: ${leftover.cocktails} cocktails, ${leftover.ingredients} ingredients`
  );
  if (apply && leftover.cocktails === 0 && leftover.ingredients === 0) {
    console.log("Ready to privatize: npx tsx scripts/migrateCatalogImagesToBlob.ts --make-private");
  } else if (apply && leftover.cocktails === 0 && leftover.ingredients > 0) {
    console.log("Cocktails done. Next: npx tsx scripts/migrateCatalogImagesToBlob.ts --apply --ingredients");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
