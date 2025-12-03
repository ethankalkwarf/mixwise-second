/**
 * ⚠️ Destructive Script: Clears cocktail-related documents from Sanity
 *
 * Usage:
 *   npx tsx scripts/clearSanityCocktails.ts
 *
 * Required environment variables:
 *   SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_PROJECT_ID
 *   SANITY_DATASET / NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_VERSION / NEXT_PUBLIC_SANITY_API_VERSION (optional)
 *   SANITY_AUTH_TOKEN (write-enabled token)
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type SanityConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token: string;
};

const config = resolveConfig();
const client = createClient({
  ...config,
  useCdn: false,
});

const COCKTAIL_TYPES = [
  "cocktail",
  "cocktailTag",
  "cocktailCategory",
];

async function main() {
  console.log("\n⚠️  This will permanently delete cocktail documents from Sanity.");
  console.log("    Project:", config.projectId, "Dataset:", config.dataset, "\n");

  for (const type of COCKTAIL_TYPES) {
    const ids = await client.fetch<string[]>(`*[_type == "${type}"]{_id}`)
      .then((docs) => docs.map((doc: any) => doc._id));

    if (ids.length === 0) {
      console.log(`• ${type}: nothing to delete`);
      continue;
    }

    console.log(`• ${type}: deleting ${ids.length} document(s)...`);
    await deleteInChunks(ids);
  }

  console.log("\n✅ Finished clearing cocktail documents.\n");
}

async function deleteInChunks(ids: string[], chunkSize = 50) {
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    let tx = client.transaction();
    chunk.forEach((id) => {
      tx = tx.delete(id);
    });

    await tx.commit({ visibility: "async" });
  }
}

function resolveConfig(): SanityConfig {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
  const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN;

  if (!projectId || !token) {
    console.error("❌ Missing Sanity credentials. Set SANITY_PROJECT_ID and SANITY_AUTH_TOKEN in .env.local");
    process.exit(1);
  }

  return { projectId, dataset, apiVersion, token };
}

main().catch((error) => {
  console.error("❌ Failed to clear Sanity cocktails", error);
  process.exit(1);
});
