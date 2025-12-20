import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a temporary admin endpoint for backfilling cocktail images
// DELETE THIS FILE AFTER RUNNING THE BACKFILL

const BUCKET_NAME = 'cocktail-images-fullsize';
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];
const JUNK_TOKENS = [
  'cocktail', 'drink', 'recipe', 'image', 'photo', 'pic', 'fullsize', 'full',
  'large', 'final', 'optimized', 'hd', '2x', '@2x'
];

/**
 * Normalize a filename for matching
 */
function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/\.(webp|jpg|jpeg|png)$/i, '')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if token is a size token (numbers >= 3 digits or NxM format)
 */
function isSizeToken(token: string): boolean {
  if (/^\d{3,}$/.test(token)) return true;
  if (/^\d+x\d+$/.test(token)) return true;
  if (/\d.*x|x.*\d/.test(token)) return true;
  return false;
}

/**
 * Clean filename tokens by removing junk and size tokens
 */
function cleanTokens(tokens: string[]): string[] {
  return tokens.filter(token =>
    token.length > 0 &&
    !JUNK_TOKENS.includes(token) &&
    !isSizeToken(token)
  );
}

/**
 * Get normalized, cleaned tokens from filename
 */
function getFilenameTokens(filename: string): string[] {
  const normalized = normalizeFilename(filename);
  const tokens = normalized.split('-');
  return cleanTokens(tokens);
}

/**
 * Get tokens from cocktail name
 */
function getNameTokens(name: string | null): string[] {
  if (!name) return [];
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/[\s-]+/)
    .filter(token => token.length > 0);
}

/**
 * Check if filename contains slug as a whole token
 */
function filenameContainsSlug(filenameTokens: string[], slug: string): boolean {
  return filenameTokens.includes(slug);
}

/**
 * Score a filename match for a cocktail
 */
function scoreMatch(filename: string, slug: string, name: string | null, filenameTokens: string[] = []): number {
  if (!filenameTokens.length) {
    filenameTokens = getFilenameTokens(filename);
  }

  let score = 0;

  // +10 for containing slug token
  if (filenameContainsSlug(filenameTokens, slug)) {
    score += 10;
  } else {
    return 0; // Hard requirement
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
function findBestImage(cocktail: any, allFiles: any[]): { file: any; matchType: string; score: number } | null {
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
      if (score >= 12) {
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
      return null; // Ambiguous
    }
  }

  const best = candidates[0];

  // Tie-breaking: extension preference (webp > jpg/jpeg > png)
  const extensionPrefs: { [key: string]: number } = { '.webp': 3, '.jpg': 2, '.jpeg': 2, '.png': 1 };
  let bestCandidate = best;

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
function getPublicUrl(filePath: string, supabase: any): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    // Security check - this should only be callable by admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    // You should validate this token - for now, we'll accept any token for testing

    console.log('🔄 Starting cocktail image backfill...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // List all files in bucket
    console.log('📂 Listing files from Supabase Storage...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }

    // Filter to image files only
    const imageFiles = files.filter(file =>
      file.name && SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    console.log(`📸 Found ${imageFiles.length} image files`);

    // Query cocktails without image URLs
    console.log('🍸 Querying cocktails...');
    const { data: cocktails, error: queryError } = await supabase
      .from('cocktails')
      .select('id, slug, image_url, name')
      .is('image_url', null)
      .order('name');

    if (queryError) {
      console.error('❌ Error querying cocktails:', queryError);
      return NextResponse.json({ error: 'Failed to query cocktails' }, { status: 500 });
    }

    console.log(`🎯 Processing ${cocktails.length} cocktails without image URLs`);

    // Process each cocktail
    const results = [];
    const stats = {
      total: cocktails.length,
      updated: 0,
      skippedExistingUrl: 0,
      missingImage: 0,
      ambiguousSkipped: 0,
      errors: 0
    };

    for (const cocktail of cocktails) {
      try {
        // Double-check: skip if image_url exists and is not empty
        if (cocktail.image_url && cocktail.image_url.trim().length > 0) {
          stats.skippedExistingUrl++;
          continue;
        }

        // Find best image match
        const match = findBestImage(cocktail, imageFiles);

        if (!match) {
          stats.missingImage++;
          continue;
        }

        const publicUrl = getPublicUrl(match.file.name, supabase);

        // Update the database
        const { error: updateError } = await supabase
          .from('cocktails')
          .update({ image_url: publicUrl })
          .eq('id', cocktail.id);

        if (updateError) {
          console.error(`❌ Update failed for ${cocktail.slug}:`, updateError);
          stats.errors++;
        } else {
          console.log(`✅ Updated: ${cocktail.slug} → ${match.file.name}`);
          stats.updated++;
          results.push({
            id: cocktail.id,
            slug: cocktail.slug,
            name: cocktail.name,
            filePath: match.file.name,
            matchType: match.matchType,
            score: match.score,
            newUrl: publicUrl
          });
        }

      } catch (error) {
        console.error(`❌ Error processing ${cocktail.slug}:`, error);
        stats.errors++;
      }
    }

    // Return summary
    const summary = {
      success: true,
      stats,
      message: `Backfill completed. Updated ${stats.updated} cocktails with image URLs.`,
      results: results.slice(0, 10) // First 10 results
    };

    console.log('📊 Summary:', stats);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('💥 Backfill failed:', error);
    return NextResponse.json(
      { error: 'Backfill failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    message: 'Cocktail image backfill API',
    usage: 'POST with Bearer token to run backfill',
    warning: 'This is a temporary endpoint - delete after use'
  });
}
