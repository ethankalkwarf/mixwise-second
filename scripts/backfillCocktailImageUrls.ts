#!/usr/bin/env tsx

/**
 * Backfill script for cocktail image URLs
 *
 * Updates cocktails.image_url with public URLs from Supabase Storage bucket 'cocktail-images-fullsize'
 *
 * Usage:
 *   npx tsx scripts/backfillCocktailImageUrls.ts --dry-run
 *   npx tsx scripts/backfillCocktailImageUrls.ts --apply
 *   npx tsx scripts/backfillCocktailImageUrls.ts --apply --overwrite --limit 10
 *
 * Environment variables required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';

const BUCKET_NAME = 'cocktail-images-fullsize';

interface Cocktail {
  id: string;
  slug: string;
  image_url: string | null;
}

interface StorageFile {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, any> | null;
}

interface PlannedUpdate {
  id: string;
  slug: string;
  oldUrl: string | null;
  newUrl: string;
}

const EXTENSION_PREFERENCE = ['webp', 'jpg', 'jpeg', 'png'];

function getSlugFromPath(path: string): string {
  // Remove extension and any leading/trailing slashes
  return path.replace(/\.[^.]+$/, '').replace(/^\/+|\/+$/g, '');
}

function getExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

function chooseBestExt(files: StorageFile[]): StorageFile | null {
  if (files.length === 0) return null;
  if (files.length === 1) return files[0];

  // Group by extension
  const byExt: Record<string, StorageFile[]> = {};
  files.forEach(file => {
    const ext = getExtension(file.name);
    if (!byExt[ext]) byExt[ext] = [];
    byExt[ext].push(file);
  });

  // Find best extension in preference order
  for (const preferredExt of EXTENSION_PREFERENCE) {
    if (byExt[preferredExt] && byExt[preferredExt].length > 0) {
      return byExt[preferredExt][0]; // Take first one if multiple
    }
  }

  // Fallback to first file if no preferred extensions found
  return files[0];
}

async function listAllFiles(supabase: any): Promise<StorageFile[]> {
  const allFiles: StorageFile[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    allFiles.push(...data);
    offset += limit;

    // Safety check to prevent infinite loops
    if (offset > 100000) {
      console.warn('Reached high offset, stopping to prevent infinite loop');
      break;
    }
  }

  return allFiles;
}

async function main() {
  const {
    values: { 'dry-run': dryRun = true, apply = false, overwrite = false, limit }
  } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: true },
      apply: { type: 'boolean', default: false },
      overwrite: { type: 'boolean', default: false },
      limit: { type: 'string' }
    },
    args: process.argv.slice(2)
  });

  if (!apply && !dryRun) {
    console.error('Must specify either --dry-run or --apply');
    process.exit(1);
  }

  if (apply) {
    console.log('🚨 APPLY MODE: This will update the database!');
  } else {
    console.log('🔍 DRY RUN MODE: No changes will be made');
  }

  if (overwrite) {
    console.log('⚠️ OVERWRITE MODE: Will update existing image_url values');
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('\n📂 Listing all files in storage bucket...');
  const allFiles = await listAllFiles(supabase);
  console.log(`✅ Found ${allFiles.length} files in bucket`);

  // Build slug -> best file mapping
  console.log('\n🔗 Building slug to file mapping...');
  const slugToFiles: Record<string, StorageFile[]> = {};

  allFiles.forEach(file => {
    const slug = getSlugFromPath(file.name);
    if (!slug) return; // Skip files without proper names

    if (!slugToFiles[slug]) slugToFiles[slug] = [];
    slugToFiles[slug].push(file);
  });

  const slugToBestFile: Record<string, StorageFile> = {};
  Object.entries(slugToFiles).forEach(([slug, files]) => {
    const bestFile = chooseBestExt(files);
    if (bestFile) {
      slugToBestFile[slug] = bestFile;
    }
  });

  console.log(`✅ Built mapping for ${Object.keys(slugToBestFile).length} unique slugs`);

  // Fetch cocktails
  console.log('\n🍸 Fetching cocktails...');
  let query = supabase
    .from('cocktails')
    .select('id, slug, image_url')
    .not('slug', 'is', null);

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data: cocktails, error: fetchError } = await query;

  if (fetchError) {
    console.error('❌ Failed to fetch cocktails:', fetchError.message);
    process.exit(1);
  }

  if (!cocktails || cocktails.length === 0) {
    console.log('ℹ️ No cocktails found');
    return;
  }

  console.log(`✅ Found ${cocktails.length} cocktails with slugs`);

  // Plan updates
  const plannedUpdates: PlannedUpdate[] = [];
  const skipped = {
    alreadyHasUrl: 0,
    noMatchingImage: 0,
    noSlug: 0,
    errors: 0
  };

  for (const cocktail of cocktails) {
    try {
      if (!cocktail.slug) {
        skipped.noSlug++;
        continue;
      }

      const bestFile = slugToBestFile[cocktail.slug];
      if (!bestFile) {
        skipped.noMatchingImage++;
        continue;
      }

      // Generate public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(bestFile.name);

      if (!publicUrlData?.publicUrl) {
        console.warn(`⚠️ Failed to generate public URL for ${bestFile.name}`);
        skipped.errors++;
        continue;
      }

      const newUrl = publicUrlData.publicUrl;

      // Check if we should update
      const shouldUpdate = overwrite || !cocktail.image_url || cocktail.image_url.trim() === '';

      if (!shouldUpdate) {
        skipped.alreadyHasUrl++;
        continue;
      }

      plannedUpdates.push({
        id: cocktail.id,
        slug: cocktail.slug,
        oldUrl: cocktail.image_url,
        newUrl
      });

    } catch (error) {
      console.error(`❌ Error processing cocktail ${cocktail.id}:`, error);
      skipped.errors++;
    }
  }

  // Print summary
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Total cocktails processed: ${cocktails.length}`);
  console.log(`Planned updates: ${plannedUpdates.length}`);
  console.log(`Skipped (already has URL): ${skipped.alreadyHasUrl}`);
  console.log(`Skipped (no matching image): ${skipped.noMatchingImage}`);
  console.log(`Skipped (no slug): ${skipped.noSlug}`);
  console.log(`Errors: ${skipped.errors}`);

  if (plannedUpdates.length === 0) {
    console.log('\n✅ No updates needed!');
    return;
  }

  // Show planned updates
  console.log('\n🔧 PLANNED UPDATES');
  console.log('==================');
  plannedUpdates.forEach(update => {
    console.log(`• ${update.slug} (${update.id})`);
    console.log(`  Old: ${update.oldUrl || 'null'}`);
    console.log(`  New: ${update.newUrl}`);
    console.log('');
  });

  if (!apply) {
    console.log('💡 Run with --apply to execute these updates');
    return;
  }

  // Execute updates in batches
  console.log('\n⚡ EXECUTING UPDATES');
  console.log('====================');

  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < plannedUpdates.length; i += batchSize) {
    const batch = plannedUpdates.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(plannedUpdates.length / batchSize)} (${batch.length} items)...`);

    for (const update of batch) {
      try {
        const { error } = await supabase
          .from('cocktails')
          .update({ image_url: update.newUrl })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Failed to update ${update.slug}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Updated ${update.slug}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${update.slug}:`, error);
        errorCount++;
      }
    }
  }

  console.log('\n🎉 UPDATE COMPLETE');
  console.log('==================');
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed updates: ${errorCount}`);
  console.log(`Total processed: ${successCount + errorCount}`);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
