#!/usr/bin/env node

/**
 * Analyze unused cocktail images in Supabase Storage
 *
 * This script compares images in the cocktail-images-fullsize bucket
 * against image URLs used in the cocktails table to identify unused/orphaned images.
 *
 * USAGE:
 *   npm run analyze:unused-images
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const BUCKET_NAME = 'cocktail-images-fullsize';
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

// Environment setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * Normalize filename for comparison (remove extension and clean)
 */
function normalizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/\.(webp|jpg|jpeg|png)$/i, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract filename from full Supabase storage URL
 */
function extractFilenameFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    // Supabase storage URLs look like:
    // https://uvmbmlahkwmlomfoeaha.supabase.co/storage/v1/object/public/cocktail-images-fullsize/filename.jpg
    const urlParts = url.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);

    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      return urlParts[bucketIndex + 1];
    }

    // Fallback: try to extract filename from end of URL
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      return lastPart;
    }
  } catch (error) {
    console.warn(`Could not parse URL: ${url}`, error.message);
  }

  return null;
}

/**
 * Main analysis function
 */
async function analyzeUnusedImages() {
  console.log('🔄 Analyzing unused cocktail images...\n');

  try {
    // 1. Get all image files from storage bucket
    console.log('📂 Fetching images from Supabase Storage...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing storage files:', listError);
      process.exit(1);
    }

    // Filter to image files only
    const imageFiles = files.filter(file =>
      file.name && SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    console.log(`📸 Found ${imageFiles.length} image files in storage`);

    // Create set of normalized filenames in storage
    const storageFilenames = new Set();
    const storageFilesMap = new Map();

    for (const file of imageFiles) {
      const normalized = normalizeFilename(file.name);
      storageFilenames.add(normalized);
      storageFilesMap.set(normalized, file.name);
    }

    // 2. Get all cocktail image URLs from database
    console.log('🍸 Fetching cocktail image URLs from database...');
    const { data: cocktails, error: queryError } = await supabase
      .from('cocktails')
      .select('id, name, slug, image_url')
      .not('image_url', 'is', null);

    if (queryError) {
      console.error('❌ Error querying cocktails:', queryError);
      process.exit(1);
    }

    console.log(`🍹 Found ${cocktails.length} cocktails with image URLs`);

    // Create set of normalized filenames used by cocktails
    const usedFilenames = new Set();
    const cocktailImageMap = new Map();

    for (const cocktail of cocktails) {
      if (cocktail.image_url) {
        const filename = extractFilenameFromUrl(cocktail.image_url);
        if (filename) {
          const normalized = normalizeFilename(filename);
          usedFilenames.add(normalized);
          cocktailImageMap.set(normalized, {
            cocktailId: cocktail.id,
            cocktailName: cocktail.name,
            cocktailSlug: cocktail.slug,
            imageUrl: cocktail.image_url,
            originalFilename: filename
          });
        }
      }
    }

    console.log(`🔗 Found ${usedFilenames.size} unique image references in database`);

    // 3. Find unused images
    const unusedImages = [];
    for (const storageFilename of storageFilenames) {
      if (!usedFilenames.has(storageFilename)) {
        unusedImages.push({
          normalizedName: storageFilename,
          storageFilename: storageFilesMap.get(storageFilename),
          storageUrl: `https://uvmbmlahkwmlomfoeaha.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${storageFilesMap.get(storageFilename)}`
        });
      }
    }

    // 4. Find images referenced but not in storage
    const missingImages = [];
    for (const usedFilename of usedFilenames) {
      if (!storageFilenames.has(usedFilename)) {
        const cocktailInfo = cocktailImageMap.get(usedFilename);
        if (cocktailInfo) {
          missingImages.push({
            normalizedName: usedFilename,
            cocktailId: cocktailInfo.cocktailId,
            cocktailName: cocktailInfo.cocktailName,
            cocktailSlug: cocktailInfo.cocktailSlug,
            referencedUrl: cocktailInfo.imageUrl,
            expectedFilename: cocktailInfo.originalFilename
          });
        }
      }
    }

    // 5. Generate report
    console.log('\n📊 ANALYSIS RESULTS\n');

    console.log(`Total images in storage: ${imageFiles.length}`);
    console.log(`Total image references in database: ${usedFilenames.size}`);
    console.log(`Unique cocktails with images: ${cocktails.length}`);
    console.log(`Unused images in storage: ${unusedImages.length}`);
    console.log(`Missing images (referenced but not in storage): ${missingImages.length}`);

    if (unusedImages.length > 0) {
      console.log('\n🗂️ UNUSED IMAGES (can be safely deleted):');
      console.log('='.repeat(60));

      unusedImages.forEach((image, index) => {
        console.log(`${index + 1}. ${image.storageFilename}`);
        console.log(`   Storage URL: ${image.storageUrl}`);
        console.log('');
      });
    }

    if (missingImages.length > 0) {
      console.log('\n❌ MISSING IMAGES (referenced in database but not in storage):');
      console.log('='.repeat(60));

      missingImages.forEach((image, index) => {
        console.log(`${index + 1}. Cocktail: "${image.cocktailName}" (${image.cocktailSlug})`);
        console.log(`   Referenced URL: ${image.referencedUrl}`);
        console.log(`   Expected filename: ${image.expectedFilename}`);
        console.log('');
      });
    }

    if (unusedImages.length === 0 && missingImages.length === 0) {
      console.log('\n✅ PERFECT MATCH: All images are properly referenced!');
    }

    // Summary
    console.log('\n💡 RECOMMENDATIONS:');
    if (unusedImages.length > 0) {
      console.log(`- Consider deleting ${unusedImages.length} unused images to save storage space`);
    }
    if (missingImages.length > 0) {
      console.log(`- ${missingImages.length} cocktails reference missing images - may need re-uploading or URL fixes`);
    }
    if (unusedImages.length === 0 && missingImages.length === 0) {
      console.log('- Your image storage is perfectly organized!');
    }

    console.log('\n✨ Analysis complete!');

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeUnusedImages().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
