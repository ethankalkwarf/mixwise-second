import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a temporary admin endpoint for analyzing unused images
// DELETE THIS FILE AFTER ANALYSIS

const BUCKET_NAME = 'cocktail-images-fullsize';
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

/**
 * Normalize filename for comparison (remove extension and clean)
 */
function normalizeFilename(filename: string): string {
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
function extractFilenameFromUrl(url: string): string | null {
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
    console.warn(`Could not parse URL: ${url}`, (error as Error).message);
  }

  return null;
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

    console.log('🔄 Starting image analysis...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get all image files from storage bucket
    console.log('📂 Fetching images from Supabase Storage...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing storage files:', listError);
      return NextResponse.json({ error: 'Failed to list storage files' }, { status: 500 });
    }

    // Filter to image files only
    const imageFiles = files.filter(file =>
      file.name && SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    console.log(`📸 Found ${imageFiles.length} image files in storage`);

    // Create set of normalized filenames in storage
    const storageFilenames = new Set<string>();
    const storageFilesMap = new Map<string, string>();

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
      return NextResponse.json({ error: 'Failed to query cocktails' }, { status: 500 });
    }

    console.log(`🍹 Found ${cocktails.length} cocktails with image URLs`);

    // Create set of normalized filenames used by cocktails
    const usedFilenames = new Set<string>();
    const cocktailImageMap = new Map<string, any>();

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
    const unusedImages: any[] = [];
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
    const missingImages: any[] = [];
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

    // 5. Prepare response
    const result = {
      success: true,
      summary: {
        totalImagesInStorage: imageFiles.length,
        totalImageReferencesInDb: usedFilenames.size,
        uniqueCocktailsWithImages: cocktails.length,
        unusedImagesCount: unusedImages.length,
        missingImagesCount: missingImages.length
      },
      unusedImages: unusedImages.slice(0, 50), // Limit for response size
      missingImages: missingImages.slice(0, 50), // Limit for response size
      hasMoreUnused: unusedImages.length > 50,
      hasMoreMissing: missingImages.length > 50
    };

    console.log('📊 Analysis complete:', result.summary);

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    message: 'Image analysis API',
    usage: 'POST with Bearer token to run analysis',
    warning: 'This is a temporary endpoint - delete after use'
  });
}
