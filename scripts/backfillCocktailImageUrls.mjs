#!/usr/bin/env node

/**
 * One-time script to backfill cocktail image URLs from Supabase Storage
 *
 * This script matches cocktail slugs to image files in the 'cocktail-images-fullsize' bucket
 * and updates the cocktails.image_url column with public URLs.
 *
 * USAGE:
 *   Dry run (default): npm run backfill:images:dry
 *   Apply changes:      npm run backfill:images:apply
 *   Limit results:       node scripts/backfillCocktailImageUrls.mjs --apply --limit 10
 *
 * This script is NOT automatic and must be run manually from the terminal.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Configuration
const BUCKET_NAME = 'cocktail-images-fullsize';
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];
const JUNK_TOKENS = [
  'cocktail', 'drink', 'recipe', 'image', 'photo', 'pic', 'fullsize', 'full',
  'large', 'final', 'optimized', 'hd', '2x', '@2x'
];

// CLI argument parsing
const args = process.argv.slice(2);
const isApplyMode = args.includes('--apply');
const isDryRun = !isApplyMode;
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : null;

console.log(`🔄 MixWise Image URL Backfill Script`);
console.log(`Mode: ${isApplyMode ? 'APPLY (will update database)' : 'DRY RUN (safe)'}`);
if (limit) console.log(`Limit: ${limit} cocktails`);
console.log(`---\n`);

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
 * Normalize a filename for matching
 */
function normalizeFilename(filename) {
  return filename
    // Lowercase
    .toLowerCase()
    // Replace spaces/underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove file extension
    .replace(/\.(webp|jpg|jpeg|png)$/i, '')
    // Remove punctuation except hyphens
    .replace(/[^\w-]/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if token is a size token (numbers >= 3 digits or NxM format)
 */
function isSizeToken(token) {
  // Pure numbers >= 3 digits
  if (/^\d{3,}$/.test(token)) return true;
  // NxM format (e.g. 1920x1080)
  if (/^\d+x\d+$/.test(token)) return true;
  // Tokens containing digits + "x"
  if (/\d.*x|x.*\d/.test(token)) return true;
  return false;
}

/**
 * Clean filename tokens by removing junk and size tokens
 */
function cleanTokens(tokens) {
  return tokens.filter(token =>
    token.length > 0 &&
    !JUNK_TOKENS.includes(token) &&
    !isSizeToken(token)
  );
}

/**
 * Get normalized, cleaned tokens from filename
 */
function getFilenameTokens(filename) {
  const normalized = normalizeFilename(filename);
  const tokens = normalized.split('-');
  return cleanTokens(tokens);
}

/**
 * Get tokens from cocktail name
 */
function getNameTokens(name) {
  if (!name) return [];
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/[\s-]+/)
    .filter(token => token.length > 0);
}

/**
 * Check if filename contains slug as a whole token
 */
function filenameContainsSlug(filenameTokens, slug) {
  return filenameTokens.includes(slug);
}

/**
 * Score a filename match for a cocktail
 */
function scoreMatch(filename, slug, name = null, filenameTokens = null) {
  if (!filenameTokens) {
    filenameTokens = getFilenameTokens(filename);
  }

  let score = 0;

  // +10 for containing slug token
  if (filenameContainsSlug(filenameTokens, slug)) {
    score += 10;
  } else {
    // Hard requirement: must contain slug token
    return 0;
  }

  // +4 if filename starts with slug
  if (filenameTokens[0] === slug) {
    score += 4;
  }

  // +2 for overlap with cocktail name tokens
  if (name) {
    const nameTokens = getNameTokens(name);
    const overlapCount = nameTokens.filter(token => filenameTokens.includes(token)).length;
    score += overlapCount * 2;
  }

  // -0.2 per extra token beyond 2
  const extraTokens = Math.max(0, filenameTokens.length - 2);
  score -= extraTokens * 0.2;

  return score;
}

/**
 * Find best image match for a cocktail
 */
function findBestImage(cocktail, allFiles, invertedIndex) {
  const { id, slug, name } = cocktail;
  const slugTokens = [slug];

  // First try exact match
  const normalizedSlug = normalizeFilename(slug);
  for (const file of allFiles) {
    const normalizedFilename = normalizeFilename(file.name);
    if (normalizedFilename === normalizedSlug) {
      return {
        file,
        matchType: 'exact',
        score: 100
      };
    }
  }

  // If no exact match, try fuzzy matching
  if (slug.length < 4) {
    return null; // No fuzzy matching for short slugs
  }

  const candidates = [];

  // Find files that contain slug as a token
  for (const file of allFiles) {
    const filenameTokens = getFilenameTokens(file.name);
    if (filenameContainsSlug(filenameTokens, slug)) {
      const score = scoreMatch(file.name, slug, name, filenameTokens);
      if (score >= 12) { // Minimum score requirement
        candidates.push({
          file,
          score,
          filenameTokens
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Check if best score is significantly better than second best
  if (candidates.length > 1) {
    const bestScore = candidates[0].score;
    const secondBestScore = candidates[1].score;
    if (bestScore - secondBestScore < 3) {
      return null; // Ambiguous, skip
    }
  }

  const best = candidates[0];

  // Tie-breaking: extension preference (webp > jpg/jpeg > png)
  const extensionPrefs = { '.webp': 3, '.jpg': 2, '.jpeg': 2, '.png': 1 };
  let bestCandidate = best;

  // Check for same score with better extension
  for (const candidate of candidates) {
    if (candidate.score === best.score) {
      const currentExt = candidate.file.name.toLowerCase().match(/\.(webp|jpg|jpeg|png)$/i)?.[1];
      const bestExt = bestCandidate.file.name.toLowerCase().match(/\.(webp|jpg|jpeg|png)$/i)?.[1];

      if (extensionPrefs[`.${currentExt}`] > extensionPrefs[`.${bestExt}`]) {
        bestCandidate = candidate;
      }
    }
  }

  // Tie-breaking: shortest cleaned filename
  const bestFilenameLength = getFilenameTokens(bestCandidate.file.name).join('-').length;
  for (const candidate of candidates) {
    if (candidate.score === best.score) {
      const candidateFilenameLength = getFilenameTokens(candidate.file.name).join('-').length;
      if (candidateFilenameLength < bestFilenameLength) {
        bestCandidate = candidate;
      }
    }
  }

  return {
    file: bestCandidate.file,
    matchType: 'fuzzy',
    score: bestCandidate.score
  };
}

/**
 * Generate public URL for a file
 */
function getPublicUrl(filePath) {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Main execution
 */
async function main() {
  try {
    // List all files in bucket
    console.log('📂 Listing files from Supabase Storage...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      process.exit(1);
    }

    // Filter to image files only
    const imageFiles = files.filter(file =>
      file.name && SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    console.log(`📸 Found ${imageFiles.length} image files`);

    // Build inverted index: token -> files
    const invertedIndex = new Map();
    for (const file of imageFiles) {
      const tokens = getFilenameTokens(file.name);
      for (const token of tokens) {
        if (!invertedIndex.has(token)) {
          invertedIndex.set(token, []);
        }
        invertedIndex.get(token).push(file);
      }
    }

    // Query cocktails
    console.log('🍸 Querying cocktails...');
    const { data: cocktails, error: queryError } = await supabase
      .from('cocktails')
      .select('id, slug, image_url, name')
      .is('image_url', null)
      .order('name');

    if (queryError) {
      console.error('❌ Error querying cocktails:', queryError);
      process.exit(1);
    }

    // Apply limit if specified
    const cocktailsToProcess = limit ? cocktails.slice(0, limit) : cocktails;

    console.log(`🎯 Processing ${cocktailsToProcess.length} cocktails without image URLs`);

    // Process each cocktail
    const results = [];
    const stats = {
      total: cocktailsToProcess.length,
      updated: 0,
      skippedExistingUrl: 0,
      missingImage: 0,
      ambiguousSkipped: 0,
      errors: 0
    };

    for (const cocktail of cocktailsToProcess) {
      try {
        // Double-check: skip if image_url exists and is not empty
        if (cocktail.image_url && cocktail.image_url.trim().length > 0) {
          stats.skippedExistingUrl++;
          continue;
        }

        // Find best image match
        const match = findBestImage(cocktail, imageFiles, invertedIndex);

        if (!match) {
          stats.missingImage++;
          console.log(`❌ No match: ${cocktail.slug} (${cocktail.name || 'no name'})`);
          continue;
        }

        const publicUrl = getPublicUrl(match.file.name);

        results.push({
          id: cocktail.id,
          slug: cocktail.slug,
          name: cocktail.name,
          filePath: match.file.name,
          matchType: match.matchType,
          score: match.score,
          newUrl: publicUrl
        });

        console.log(`✅ Match: ${cocktail.slug} (${cocktail.name || 'no name'}) → ${match.file.name} (${match.matchType}, score: ${match.score})`);

      } catch (error) {
        console.error(`❌ Error processing ${cocktail.slug}:`, error);
        stats.errors++;
      }
    }

    // Apply updates if in apply mode
    if (isApplyMode && results.length > 0) {
      console.log(`\n💾 Applying ${results.length} updates...`);

      for (const result of results) {
        try {
          const { error: updateError } = await supabase
            .from('cocktails')
            .update({ image_url: result.newUrl })
            .eq('id', result.id);

          if (updateError) {
            console.error(`❌ Update failed for ${result.slug}:`, updateError);
            stats.errors++;
          } else {
            console.log(`✅ Updated: ${result.slug}`);
            stats.updated++;
          }
        } catch (error) {
          console.error(`❌ Update error for ${result.slug}:`, error);
          stats.errors++;
        }
      }
    } else if (isApplyMode) {
      console.log('\n💾 No updates to apply');
    } else {
      console.log(`\n💾 DRY RUN: Would update ${results.length} cocktails`);
      stats.updated = results.length; // For summary display
    }

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Total cocktails processed: ${stats.total}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Skipped (existing URL): ${stats.skippedExistingUrl}`);
    console.log(`   Missing image: ${stats.missingImage}`);
    console.log(`   Ambiguous (skipped): ${stats.ambiguousSkipped}`);
    console.log(`   Errors: ${stats.errors}`);

    if (!isApplyMode && results.length > 0) {
      console.log('\n🔄 To apply these changes, run: npm run backfill:images:apply');
    }

    console.log('\n✨ Script completed successfully');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
