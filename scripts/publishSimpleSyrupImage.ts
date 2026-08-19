#!/usr/bin/env tsx
/**
 * One-off: replace the Simple Syrup catalog photo (was a bag of sugar).
 *
 *   npx tsx scripts/publishSimpleSyrupImage.ts
 */

import * as dotenv from "dotenv";
import { readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import { publishWebpToBlob } from "./lib/catalogMedia";

dotenv.config({ path: ".env.local" });

async function main() {
  const pngPath = "data/image-rebuild/Simple Syrup.png";
  // New key so CDN / next/image do not keep serving the sugar-bag webp.
  const blobPath = "catalog/ingredients/simple-syrup-bottle.webp";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const png = await readFile(pngPath);

  const { error: upError } = await supabase.storage
    .from("cocktail-images-fullsize")
    .upload("ingredients/simple-syrup.png", png, {
      contentType: "image/png",
      upsert: true,
    });
  if (upError) console.log("storage archive:", upError.message);
  else console.log("storage archive: ingredients/simple-syrup.png");

  const published = await publishWebpToBlob(blobPath, png);
  console.log("blob", published.url, published.bytes, "bytes");

  for (const name of ["Simple Syrup", "Sugar Syrup"]) {
    const { data, error } = await supabase
      .from("ingredients")
      .update({ image_url: published.url })
      .eq("name", name)
      .select("id, name, image_url");
    if (error) console.log("db fail", name, error.message);
    else console.log("db", JSON.stringify(data));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
