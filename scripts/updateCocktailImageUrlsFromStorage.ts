#!/usr/bin/env tsx

/**
 * Update cocktail image URLs from Supabase Storage
 * 
 * Matches cocktails by slug to files in the 'cocktail-images-fullsize' bucket
 * and publishes a public WebP to Vercel Blob (image_url). Masters stay in Storage.
 * 
 * Usage:
 *   npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --dry-run
 *   npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply
 *   npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply --slug "bloody-mary"
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
import {
  cocktailBlobPath,
  isVercelBlobUrl,
  publishStorageObjectToBlob,
} from './lib/catalogMedia';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const BUCKET_NAME = 'cocktail-images-fullsize';

interface Cocktail {
  id: string;
  slug: string;
  name: string;
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

/**
 * Convert slug to possible filename variations
 */
function slugToFilenames(slug: string): string[] {
  // Convert slug to title case (e.g., "bloody-mary" -> "Bloody Mary")
  const titleCase = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Generate possible filenames
  const variations = [
    `${titleCase}.jpg`,
    `${titleCase}.jpeg`,
    `${titleCase}.png`,
    `${titleCase}.webp`,
    `${titleCase} Cocktail.jpg`,
    `${titleCase} Cocktail.jpeg`,
    `${titleCase} Cocktail.png`,
    `${titleCase} Cocktail.webp`,
    `${slug}.jpg`,
    `${slug}.jpeg`,
    `${slug}.png`,
    `${slug}.webp`,
  ];
  
  return variations;
}

/**
 * Normalize filename for matching (remove extension, convert to lowercase, handle spaces)
 */
function normalizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Find best matching image file for a cocktail slug
 */
function findBestMatch(slug: string, files: StorageFile[]): StorageFile | null {
  const normalizedSlug = normalizeFilename(slug);
  
  // Try exact slug match first
  for (const file of files) {
    const normalizedFile = normalizeFilename(file.name);
    if (normalizedFile === normalizedSlug) {
      return file;
    }
  }
  
  // Try partial match (slug is contained in filename or vice versa)
  for (const file of files) {
    const normalizedFile = normalizeFilename(file.name);
    if (normalizedFile.includes(normalizedSlug) || normalizedSlug.includes(normalizedFile)) {
      return file;
    }
  }
  
  // Try filename variations
  const variations = slugToFilenames(slug);
  for (const variation of variations) {
    const normalizedVariation = normalizeFilename(variation);
    for (const file of files) {
      const normalizedFile = normalizeFilename(file.name);
      if (normalizedFile === normalizedVariation) {
        return file;
      }
    }
  }
  
  return null;
}

async function listAllFiles(): Promise<StorageFile[]> {
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
      console.error(`❌ Error listing files: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    allFiles.push(...data);
    offset += limit;

    if (data.length < limit) {
      break;
    }
  }

  return allFiles;
}

async function main() {
  const {
    values: { 'dry-run': dryRunFlag, apply: applyFlag, slug: filterSlug }
  } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      apply: { type: 'boolean' },
      slug: { type: 'string' }
    },
    allowPositionals: true,
  });

  // Default to dry-run unless --apply is explicitly passed
  const dryRun = applyFlag ? false : (dryRunFlag ?? true);
  const apply = applyFlag ?? false;

  if (!dryRun && !apply) {
    console.error('❌ Must specify either --dry-run or --apply');
    process.exit(1);
  }

  console.log('🖼️  Cocktail Image URL Updater');
  console.log('================================\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Fetch cocktails
  console.log('📋 Fetching cocktails from database...');
  let query = supabase.from('cocktails').select('id, slug, name, image_url');
  
  if (filterSlug) {
    query = query.eq('slug', filterSlug);
  }
  
  const { data: cocktails, error: cocktailsError } = await query;
  
  if (cocktailsError) {
    console.error(`❌ Error fetching cocktails: ${cocktailsError.message}`);
    process.exit(1);
  }
  
  if (!cocktails || cocktails.length === 0) {
    console.log('ℹ️  No cocktails found');
    return;
  }
  
  console.log(`✅ Found ${cocktails.length} cocktails\n`);
  
  // Fetch storage files
  console.log('📦 Fetching files from Supabase Storage...');
  const files = await listAllFiles();
  console.log(`✅ Found ${files.length} image files\n`);
  
  // Match cocktails to images
  console.log('🔍 Matching cocktails to images...\n');
  
  const updates: Array<{
    cocktail: Cocktail;
    file: StorageFile;
    newUrl: string;
  }> = [];
  
  const noMatch: Cocktail[] = [];
  const alreadyHasUrl: Cocktail[] = [];
  
  for (const cocktail of cocktails) {
    // Skip if already on the public CDN
    if (isVercelBlobUrl(cocktail.image_url)) {
      alreadyHasUrl.push(cocktail);
      continue;
    }
    
    const match = findBestMatch(cocktail.slug, files);
    
    if (!match) {
      noMatch.push(cocktail);
      continue;
    }
    
    updates.push({
      cocktail,
      file: match,
      newUrl: `(blob) ${cocktailBlobPath(cocktail.slug)}`
    });
  }
  
  // Print results
  console.log('📊 RESULTS');
  console.log('==========\n');
  console.log(`✅ Matches found: ${updates.length}`);
  console.log(`⏭️  Already have URLs: ${alreadyHasUrl.length}`);
  console.log(`❌ No match found: ${noMatch.length}\n`);
  
  if (updates.length > 0) {
    console.log('📝 PLANNED UPDATES');
    console.log('==================\n');
    
    updates.slice(0, 20).forEach(({ cocktail, file, newUrl }) => {
      console.log(`${cocktail.name} (${cocktail.slug})`);
      console.log(`  File: ${file.name}`);
      console.log(`  URL: ${newUrl}`);
      console.log('');
    });
    
    if (updates.length > 20) {
      console.log(`... and ${updates.length - 20} more\n`);
    }
  }
  
  if (noMatch.length > 0 && noMatch.length <= 20) {
    console.log('⚠️  NO MATCH FOUND');
    console.log('==================\n');
    noMatch.forEach(cocktail => {
      console.log(`  ${cocktail.name} (${cocktail.slug})`);
    });
    console.log('');
  }
  
  // Apply updates
  if (!dryRun && updates.length > 0) {
    console.log('💾 Applying updates...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const { cocktail, file } of updates) {
      let newUrl: string;
      try {
        const published = await publishStorageObjectToBlob(supabase, {
          storagePath: file.name,
          blobPath: cocktailBlobPath(cocktail.slug),
        });
        newUrl = published.url;
      } catch (err) {
        console.error(`❌ Error publishing ${cocktail.slug}: ${(err as Error).message}`);
        errorCount++;
        continue;
      }

      const { error } = await supabase
        .from('cocktails')
        .update({ image_url: newUrl })
        .eq('id', cocktail.id);
      
      if (error) {
        console.error(`❌ Error updating ${cocktail.slug}: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Updated ${successCount}/${updates.length}...`);
        }
      }
    }
    
    console.log(`\n🎉 Update complete!`);
    console.log(`   ✅ Updated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
