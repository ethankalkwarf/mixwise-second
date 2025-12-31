#!/usr/bin/env tsx

/**
 * Cocktail Image Scraper (IBA + TheCocktailDB)
 * 
 * This script identifies cocktails with MISSING/EMPTY images in the Supabase database
 * and scrapes multiple sources to find matching cocktail images:
 *   1. IBA (International Bartenders Association) - iba-world.com
 *   2. TheCocktailDB - thecocktaildb.com (free API)
 * 
 * IMPORTANT: Only updates cocktails where image_url is NULL or empty string.
 * Will NEVER overwrite existing images.
 * 
 * STRICT MATCHING: Only matches cocktails that are genuinely the same drink.
 * Will NOT match variants like "Kiwi Margarita" to "Margarita".
 * 
 * Usage:
 *   npx tsx scripts/scrapeIBAImages.ts --dry-run          # Preview matches without changes
 *   npx tsx scripts/scrapeIBAImages.ts --apply            # Apply updates to database
 *   npx tsx scripts/scrapeIBAImages.ts --dry-run --verbose # Show detailed matching info
 *   npx tsx scripts/scrapeIBAImages.ts --list-missing     # Just list cocktails missing images
 *   npx tsx scripts/scrapeIBAImages.ts --exact-only       # Only use 100% exact matches
 *   npx tsx scripts/scrapeIBAImages.ts --min-score 0.98   # Set minimum match score (default 0.95)
 *   npx tsx scripts/scrapeIBAImages.ts --iba-only         # Only use IBA source
 *   npx tsx scripts/scrapeIBAImages.ts --cocktaildb-only  # Only use TheCocktailDB source
 * 
 * Environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Types
interface Cocktail {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
}

interface IBACocktail {
  name: string;
  slug: string;
  url: string;
  imageUrl: string | null;
}

interface PlannedUpdate {
  cocktailId: string;
  cocktailSlug: string;
  cocktailName: string;
  oldImageUrl: string | null;
  newImageUrl: string;
  sourceName: string;  // Name from the source (IBA or TheCocktailDB)
  source: 'IBA' | 'TheCocktailDB';
  matchType: 'exact' | 'slug' | 'fuzzy';
  matchScore: number;
}

interface CocktailDBDrink {
  strDrink: string;
  strDrinkThumb: string | null;
  idDrink: string;
}

// IBA cocktail categories
const IBA_CATEGORIES = [
  'the-unforgettables',
  'contemporary-classics',
  'new-era-drinks',
];

// Known IBA cocktails list (scraped from https://iba-world.com/cocktails/)
// This serves as a fallback if scraping fails
const KNOWN_IBA_COCKTAILS = [
  'alexander', 'americano', 'angel-face', 'aviation', 'bacardi', 
  'bees-knees', 'bellini', 'between-the-sheets', 'black-russian', 
  'bloody-mary', 'boulevardier', 'bramble', 'brandy-crusta', 
  'caipirinha', 'canchanchara', 'casino', 'champagne-cocktail',
  'clover-club', 'corpse-reviver-2', 'cosmopolitan', 'cuba-libre',
  'daiquiri', 'dark-n-stormy', 'dirty-martini', 'dry-martini',
  'espresso-martini', 'french-connection', 'french-martini', 'french-75',
  'gimlet', 'gin-fizz', 'godfather', 'godmother', 'golden-dream',
  'grasshopper', 'hanky-panky', 'harvey-wallbanger', 'hemingway-special',
  'horse-neck', 'illegal', 'irish-coffee', 'john-collins', 'jungle-bird',
  'kamikaze', 'kir', 'kir-royale', 'last-word', 'lemon-drop-martini',
  'long-island-iced-tea', 'mai-tai', 'manhattan', 'margarita',
  'martinez', 'mary-pickford', 'mimosa', 'mint-julep', 'mojito',
  'monkey-gland', 'moscow-mule', 'naked-and-famous', 'negroni',
  'new-york-sour', 'old-fashioned', 'old-cuban', 'paloma',
  'paper-plane', 'paradise', 'penicillin', 'pina-colada',
  'pisco-sour', 'planters-punch', 'porto-flip', 'ramos-gin-fizz',
  'russian-spring-punch', 'rusty-nail', 'sazerac', 'screwdriver',
  'sea-breeze', 'sex-on-the-beach', 'sidecar', 'singapore-sling',
  'south-side', 'spicy-fifty', 'spritz', 'stinger', 'tequila-sunrise',
  'tipperary', 'tommy-margarita', 'tuxedo', 'vesper', 'vieux-carre',
  'whiskey-sour', 'white-lady', 'white-russian', 'yellow-bird', 'zombie',
];

// Normalize string for comparison
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]/g, ' ') // Replace non-alphanumeric with space
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
}

// Convert string to slug
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens
}

// Remove common suffixes/prefixes that indicate variants
function getBaseName(str: string): string {
  const normalized = normalizeString(str);
  
  // Remove version indicators
  let base = normalized
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheticals like "(1934)"
    .replace(/\s*#\d+\s*/g, '') // Remove "#1", "#2" etc
    .replace(/\s*v\d+\s*/g, '') // Remove "v2" etc
    .replace(/\s+variant\s*/gi, '')
    .replace(/\s+version\s*/gi, '')
    .trim();
  
  return base;
}

// Check if one name is a variant of another (stricter check)
function isVariantOf(name1: string, name2: string): boolean {
  const base1 = getBaseName(name1);
  const base2 = getBaseName(name2);
  
  // If base names are identical, they're the same cocktail (not a variant)
  if (base1 === base2) return false;
  
  // Check if one is a prefix/suffix variant of the other
  // e.g., "Kiwi Margarita" contains "Margarita" but is NOT the same
  const words1 = base1.split(' ');
  const words2 = base2.split(' ');
  
  // If one has significantly more words, it's likely a variant
  if (Math.abs(words1.length - words2.length) >= 1) {
    // Check if the shorter one is fully contained in the longer one
    const shorter = words1.length < words2.length ? words1 : words2;
    const longer = words1.length < words2.length ? words2 : words1;
    
    const shorterStr = shorter.join(' ');
    const longerStr = longer.join(' ');
    
    // "Margarita" in "Kiwi Margarita" = variant, don't match
    if (longerStr.includes(shorterStr) && longerStr !== shorterStr) {
      return true;
    }
  }
  
  return false;
}

// Calculate similarity score - STRICT version
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Check base names (handles version differences like "Pisco Sour" vs "pisco-sour-v2")
  const base1 = getBaseName(s1);
  const base2 = getBaseName(s2);
  
  if (base1 === base2) return 0.98; // Very high score for base name match
  
  // STRICT: Do NOT match variants to base cocktails
  // e.g., "Kiwi Margarita" should NOT match "Margarita"
  if (isVariantOf(s1, s2)) {
    return 0; // No match for variants
  }
  
  // Check for very minor differences (typos, spacing)
  const words1 = s1.split(' ').filter(w => w.length > 1);
  const words2 = s2.split(' ').filter(w => w.length > 1);
  
  // Must have same number of significant words for a good match
  if (words1.length !== words2.length) {
    return 0; // Different word counts = different cocktails
  }
  
  // All words must match for a valid score
  const allWordsMatch = words1.every(w => words2.includes(w));
  if (allWordsMatch && words1.length === words2.length) {
    return 0.95;
  }
  
  return 0; // No partial matches allowed
}

// Fetch HTML from a URL
async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MixWise/1.0; +https://getmixwise.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`Error fetching ${url}:`, error);
    return null;
  }
}

// Extract image URL from cocktail page HTML
function extractImageUrl(html: string, cocktailSlug: string): string | null {
  // Try og:image meta tag first (most reliable)
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  
  if (ogImageMatch && ogImageMatch[1]) {
    return ogImageMatch[1];
  }
  
  // Try twitter:image meta tag
  const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i);
  
  if (twitterImageMatch && twitterImageMatch[1]) {
    return twitterImageMatch[1];
  }
  
  // Try to find featured image in content
  const featuredImageMatch = html.match(/class=["'][^"']*wp-post-image[^"']*["'][^>]*src=["']([^"']+)["']/i)
    || html.match(/src=["']([^"']+)["'][^>]*class=["'][^"']*wp-post-image[^"']*["']/i);
  
  if (featuredImageMatch && featuredImageMatch[1]) {
    return featuredImageMatch[1];
  }
  
  // Look for any image containing the cocktail name
  const slugPattern = cocktailSlug.replace(/-/g, '[-_]?');
  const imageRegex = new RegExp(`<img[^>]*src=["']([^"']*${slugPattern}[^"']*\\.(jpg|jpeg|png|webp))[^"']*["']`, 'i');
  const namedImageMatch = html.match(imageRegex);
  
  if (namedImageMatch && namedImageMatch[1]) {
    return namedImageMatch[1];
  }
  
  return null;
}

// Extract cocktail list from all cocktails page
function extractCocktailListFromHTML(html: string): { name: string; url: string }[] {
  const cocktails: { name: string; url: string }[] = [];
  
  // Look for links to individual cocktail pages
  // Pattern matches links like <a href="https://iba-world.com/iba-cocktail/margarita/">Margarita</a>
  const linkRegex = /<a[^>]*href=["'](https:\/\/iba-world\.com\/(?:iba-cocktail\/)?([^"'/]+)\/?)[^"']*["'][^>]*>([^<]+)<\/a>/gi;
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const slug = match[2];
    const name = match[3].trim();
    
    // Skip non-cocktail pages
    if (slug.includes('category') || slug.includes('page') || 
        slug.includes('cocktails') || slug.includes('about') ||
        slug.includes('contact') || slug.includes('privacy') ||
        name.length < 2 || name.length > 50) {
      continue;
    }
    
    // Check if this looks like a cocktail (not navigation)
    if (KNOWN_IBA_COCKTAILS.includes(slug) || 
        !['IBA', 'Menu', 'Home', 'Contact', 'About', 'Guild', 'Event'].includes(name)) {
      cocktails.push({ name, url });
    }
  }
  
  // Deduplicate by URL
  const uniqueCocktails = new Map<string, { name: string; url: string }>();
  for (const cocktail of cocktails) {
    if (!uniqueCocktails.has(cocktail.url)) {
      uniqueCocktails.set(cocktail.url, cocktail);
    }
  }
  
  return Array.from(uniqueCocktails.values());
}

// Scrape IBA website for cocktail images
async function scrapeIBACocktails(verbose: boolean): Promise<IBACocktail[]> {
  const results: IBACocktail[] = [];
  const processedSlugs = new Set<string>();
  
  console.log('\n🔍 Scraping IBA website for cocktail images...');
  
  // First try to get the all cocktails page
  const allCocktailsUrl = 'https://iba-world.com/cocktails/all-cocktails/';
  const allCocktailsHtml = await fetchHTML(allCocktailsUrl);
  
  let cocktailUrls: { name: string; url: string }[] = [];
  
  if (allCocktailsHtml) {
    cocktailUrls = extractCocktailListFromHTML(allCocktailsHtml);
    if (verbose) {
      console.log(`  Found ${cocktailUrls.length} cocktail links on all cocktails page`);
    }
  }
  
  // Also try individual category pages
  for (const category of IBA_CATEGORIES) {
    const categoryUrl = `https://iba-world.com/category/iba-official-cocktails/${category}/`;
    const categoryHtml = await fetchHTML(categoryUrl);
    
    if (categoryHtml) {
      const categoryCocktails = extractCocktailListFromHTML(categoryHtml);
      cocktailUrls.push(...categoryCocktails);
      if (verbose) {
        console.log(`  Found ${categoryCocktails.length} cocktail links in ${category}`);
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Deduplicate cocktail URLs
  const uniqueUrls = new Map<string, { name: string; url: string }>();
  for (const cocktail of cocktailUrls) {
    const urlKey = cocktail.url.toLowerCase();
    if (!uniqueUrls.has(urlKey)) {
      uniqueUrls.set(urlKey, cocktail);
    }
  }
  
  // Also add known IBA cocktails that might not have been found
  for (const slug of KNOWN_IBA_COCKTAILS) {
    const url = `https://iba-world.com/iba-cocktail/${slug}/`;
    if (!uniqueUrls.has(url.toLowerCase())) {
      // Convert slug to name
      const name = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      uniqueUrls.set(url.toLowerCase(), { name, url });
    }
  }
  
  console.log(`  Found ${uniqueUrls.size} unique cocktail URLs to process`);
  
  // Fetch each cocktail page and extract image
  let processed = 0;
  for (const [, cocktail] of uniqueUrls) {
    const slug = cocktail.url.match(/\/([^/]+)\/?$/)?.[1] || '';
    
    if (processedSlugs.has(slug)) continue;
    processedSlugs.add(slug);
    
    if (verbose) {
      console.log(`  Processing ${cocktail.name} (${slug})...`);
    }
    
    const html = await fetchHTML(cocktail.url);
    let imageUrl: string | null = null;
    
    if (html) {
      imageUrl = extractImageUrl(html, slug);
    }
    
    // Also try alternative URL pattern
    if (!imageUrl) {
      const altUrl = `https://iba-world.com/${slug}/`;
      const altHtml = await fetchHTML(altUrl);
      if (altHtml) {
        imageUrl = extractImageUrl(altHtml, slug);
      }
    }
    
    results.push({
      name: cocktail.name,
      slug,
      url: cocktail.url,
      imageUrl,
    });
    
    processed++;
    if (processed % 10 === 0) {
      console.log(`  Processed ${processed}/${uniqueUrls.size} cocktails...`);
    }
    
    // Rate limiting to be respectful
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`✅ Found images for ${results.filter(r => r.imageUrl).length} of ${results.length} IBA cocktails`);
  
  return results;
}

// =========================
// TheCocktailDB FUNCTIONS
// =========================

/**
 * Search TheCocktailDB for a cocktail by name
 * Returns the image URL if an exact match is found
 */
async function searchTheCocktailDB(
  cocktailName: string,
  verbose: boolean = false
): Promise<{ name: string; imageUrl: string } | null> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cocktailName)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MixWise/1.0; +https://getmixwise.com)',
      },
    });
    
    if (!response.ok) {
      if (verbose) console.warn(`  TheCocktailDB API error for "${cocktailName}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.drinks || data.drinks.length === 0) {
      return null;
    }
    
    // Normalize for comparison
    const searchNormalized = normalizeString(cocktailName);
    const searchBase = getBaseName(cocktailName);
    
    // Look for exact match first
    for (const drink of data.drinks as CocktailDBDrink[]) {
      const drinkNormalized = normalizeString(drink.strDrink);
      const drinkBase = getBaseName(drink.strDrink);
      
      // Exact match or base name match
      if (drinkNormalized === searchNormalized || drinkBase === searchBase) {
        if (drink.strDrinkThumb) {
          return {
            name: drink.strDrink,
            imageUrl: drink.strDrinkThumb,
          };
        }
      }
    }
    
    // Check if it's a variant (should not match)
    for (const drink of data.drinks as CocktailDBDrink[]) {
      if (isVariantOf(cocktailName, drink.strDrink)) {
        // This is a variant match - skip it
        continue;
      }
      
      // Check similarity score
      const score = calculateSimilarity(cocktailName, drink.strDrink);
      if (score >= 0.95 && drink.strDrinkThumb) {
        return {
          name: drink.strDrink,
          imageUrl: drink.strDrinkThumb,
        };
      }
    }
    
    return null;
  } catch (error) {
    if (verbose) console.warn(`  TheCocktailDB error for "${cocktailName}":`, error);
    return null;
  }
}

/**
 * Search TheCocktailDB for multiple cocktails
 */
async function searchTheCocktailDBBatch(
  cocktails: Cocktail[],
  verbose: boolean = false
): Promise<Map<string, { name: string; imageUrl: string }>> {
  const results = new Map<string, { name: string; imageUrl: string }>();
  
  console.log(`\n🔍 Searching TheCocktailDB for ${cocktails.length} cocktails...`);
  
  let found = 0;
  let processed = 0;
  
  for (const cocktail of cocktails) {
    const result = await searchTheCocktailDB(cocktail.name, verbose);
    
    if (result) {
      results.set(cocktail.id, result);
      found++;
      if (verbose) {
        console.log(`  ✅ ${cocktail.name} -> ${result.name}`);
      }
    } else {
      if (verbose) {
        console.log(`  ❌ ${cocktail.name} - no match`);
      }
    }
    
    processed++;
    if (processed % 20 === 0) {
      console.log(`  Processed ${processed}/${cocktails.length}...`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log(`✅ Found ${found} matches on TheCocktailDB`);
  
  return results;
}

// Find best matching IBA cocktail for a local cocktail
// STRICT MATCHING: Only matches cocktails that are genuinely the same drink
function findBestMatch(
  cocktail: Cocktail, 
  ibaCocktails: IBACocktail[],
  minScore: number = 0.95 // Default: require 95% match
): { match: IBACocktail; type: 'exact' | 'slug' | 'fuzzy'; score: number } | null {
  const cocktailSlug = toSlug(cocktail.slug);
  const cocktailName = normalizeString(cocktail.name);
  const cocktailBaseName = getBaseName(cocktail.name);
  
  // 1. Try exact slug match
  const exactSlugMatch = ibaCocktails.find(iba => 
    toSlug(iba.slug) === cocktailSlug && iba.imageUrl
  );
  if (exactSlugMatch) {
    return { match: exactSlugMatch, type: 'exact', score: 1.0 };
  }
  
  // 2. Try exact name match
  const exactNameMatch = ibaCocktails.find(iba => 
    normalizeString(iba.name) === cocktailName && iba.imageUrl
  );
  if (exactNameMatch) {
    return { match: exactNameMatch, type: 'exact', score: 1.0 };
  }
  
  // 3. Try base name match (handles "Pisco Sour" vs "pisco-sour-v2")
  const baseNameMatch = ibaCocktails.find(iba => {
    const ibaBaseName = getBaseName(iba.name);
    return ibaBaseName === cocktailBaseName && iba.imageUrl;
  });
  if (baseNameMatch) {
    return { match: baseNameMatch, type: 'exact', score: 0.98 };
  }
  
  // 4. Try high-confidence similarity match (STRICT)
  // This will NOT match variants like "Kiwi Margarita" to "Margarita"
  const similarityMatches = ibaCocktails
    .filter(iba => iba.imageUrl)
    .map(iba => {
      const slugScore = calculateSimilarity(cocktail.slug, iba.slug);
      const nameScore = calculateSimilarity(cocktail.name, iba.name);
      return {
        iba,
        score: Math.max(slugScore, nameScore),
      };
    })
    .filter(m => m.score >= minScore) // Must meet minimum threshold
    .sort((a, b) => b.score - a.score);
  
  if (similarityMatches.length > 0) {
    const best = similarityMatches[0];
    return { 
      match: best.iba, 
      type: best.score >= 0.98 ? 'exact' : 'slug', 
      score: best.score 
    };
  }
  
  return null;
}

async function main() {
  const {
    values: { 
      'dry-run': dryRun = true, 
      apply = false, 
      verbose = false,
      'list-missing': listMissing = false,
      'exact-only': exactOnly = false,
      'min-score': minScoreStr,
      'iba-only': ibaOnly = false,
      'cocktaildb-only': cocktaildbOnly = false,
    }
  } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: true },
      'apply': { type: 'boolean', default: false },
      'verbose': { type: 'boolean', default: false },
      'list-missing': { type: 'boolean', default: false },
      'exact-only': { type: 'boolean', default: false },
      'min-score': { type: 'string' }, // e.g., "0.98" for 98% match
      'iba-only': { type: 'boolean', default: false },
      'cocktaildb-only': { type: 'boolean', default: false },
    },
    args: process.argv.slice(2)
  });
  
  // Parse minimum score (default 0.95 = 95%, or 1.0 for exact-only)
  const minScore = exactOnly ? 1.0 : (minScoreStr ? parseFloat(minScoreStr) : 0.95);
  
  // Determine which sources to use
  const useIBA = !cocktaildbOnly;
  const useCocktailDB = !ibaOnly;
  
  console.log('🍸 Cocktail Image Scraper (IBA + TheCocktailDB)');
  console.log('==============================================');
  
  if (apply) {
    console.log('🚨 APPLY MODE: This will update the database!');
  } else {
    console.log('🔍 DRY RUN MODE: No changes will be made');
  }
  
  console.log('⚠️  ONLY updates cocktails with EMPTY/NULL images');
  
  // Show which sources are enabled
  const sources = [];
  if (useIBA) sources.push('IBA');
  if (useCocktailDB) sources.push('TheCocktailDB');
  console.log(`📚 Sources: ${sources.join(' + ')}`);
  
  if (exactOnly) {
    console.log('🎯 EXACT ONLY MODE: Only 100% exact matches will be used');
  } else {
    console.log(`🎯 Minimum match score: ${Math.round(minScore * 100)}%`);
  }
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\n❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
    console.error('   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    console.error('\n   Make sure you have a .env.local file with these variables set.');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // Fetch all cocktails
  console.log('\n📂 Fetching cocktails from database...');
  const { data: allCocktails, error: fetchError } = await supabase
    .from('cocktails')
    .select('id, slug, name, image_url')
    .order('name');
  
  if (fetchError) {
    console.error('❌ Failed to fetch cocktails:', fetchError.message);
    process.exit(1);
  }
  
  if (!allCocktails || allCocktails.length === 0) {
    console.log('ℹ️ No cocktails found in database');
    return;
  }
  
  console.log(`✅ Found ${allCocktails.length} total cocktails`);
  
  // Find cocktails missing images
  const missingImageCocktails = allCocktails.filter(c => 
    !c.image_url || c.image_url.trim() === ''
  );
  
  console.log(`📊 ${missingImageCocktails.length} cocktails are missing images (${Math.round(100 * missingImageCocktails.length / allCocktails.length)}%)`);
  
  // If just listing missing images, print and exit
  if (listMissing) {
    console.log('\n📋 COCKTAILS MISSING IMAGES');
    console.log('===========================');
    missingImageCocktails.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.slug})`);
    });
    return;
  }
  
  if (missingImageCocktails.length === 0) {
    console.log('\n✅ All cocktails have images! Nothing to do.');
    return;
  }
  
  // Track which cocktails still need images
  let cocktailsStillNeedingImages = [...missingImageCocktails];
  const plannedUpdates: PlannedUpdate[] = [];
  
  // =========================
  // SOURCE 1: IBA Website
  // =========================
  if (useIBA) {
    const ibaCocktails = await scrapeIBACocktails(verbose);
    
    console.log('\n🔗 Finding matches from IBA...');
    
    for (const cocktail of cocktailsStillNeedingImages) {
      const bestMatch = findBestMatch(cocktail, ibaCocktails, minScore);
      
      if (bestMatch && bestMatch.match.imageUrl) {
        plannedUpdates.push({
          cocktailId: cocktail.id,
          cocktailSlug: cocktail.slug,
          cocktailName: cocktail.name,
          oldImageUrl: cocktail.image_url,
          newImageUrl: bestMatch.match.imageUrl,
          sourceName: bestMatch.match.name,
          source: 'IBA',
          matchType: bestMatch.type,
          matchScore: bestMatch.score,
        });
        
        if (verbose) {
          console.log(`  ✅ ${cocktail.name} → ${bestMatch.match.name} (IBA, ${bestMatch.type}, ${Math.round(bestMatch.score * 100)}%)`);
        }
      } else if (verbose) {
        console.log(`  ❌ ${cocktail.name} - no IBA match`);
      }
    }
    
    // Remove cocktails that got IBA matches from the list
    const ibaMatchedIds = new Set(plannedUpdates.map(u => u.cocktailId));
    cocktailsStillNeedingImages = cocktailsStillNeedingImages.filter(c => !ibaMatchedIds.has(c.id));
    
    console.log(`  Found ${plannedUpdates.length} matches from IBA`);
  }
  
  // =========================
  // SOURCE 2: TheCocktailDB
  // =========================
  if (useCocktailDB && cocktailsStillNeedingImages.length > 0) {
    console.log(`\n🔗 Searching TheCocktailDB for ${cocktailsStillNeedingImages.length} remaining cocktails...`);
    
    const cocktailDBResults = await searchTheCocktailDBBatch(cocktailsStillNeedingImages, verbose);
    
    for (const cocktail of cocktailsStillNeedingImages) {
      const result = cocktailDBResults.get(cocktail.id);
      
      if (result) {
        plannedUpdates.push({
          cocktailId: cocktail.id,
          cocktailSlug: cocktail.slug,
          cocktailName: cocktail.name,
          oldImageUrl: cocktail.image_url,
          newImageUrl: result.imageUrl,
          sourceName: result.name,
          source: 'TheCocktailDB',
          matchType: 'exact',
          matchScore: 1.0,
        });
      }
    }
    
    console.log(`  Found ${cocktailDBResults.size} matches from TheCocktailDB`);
  }
  
  // Calculate cocktails with no match from any source
  const matchedIds = new Set(plannedUpdates.map(u => u.cocktailId));
  const noMatch = missingImageCocktails.filter(c => !matchedIds.has(c.id));
  
  // Print summary
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Total cocktails in database: ${allCocktails.length}`);
  console.log(`Cocktails missing images: ${missingImageCocktails.length}`);
  console.log(`Found matches: ${plannedUpdates.length}`);
  console.log(`No match found: ${noMatch.length}`);
  
  if (plannedUpdates.length === 0) {
    console.log('\n✅ No updates needed - no matching images found from any source');
    return;
  }
  
  // Show planned updates by source
  const bySource = {
    IBA: plannedUpdates.filter(u => u.source === 'IBA'),
    TheCocktailDB: plannedUpdates.filter(u => u.source === 'TheCocktailDB'),
  };
  
  console.log(`\n  From IBA: ${bySource.IBA.length}`);
  console.log(`  From TheCocktailDB: ${bySource.TheCocktailDB.length}`);
  
  // Show planned updates
  console.log('\n🔧 PLANNED UPDATES');
  console.log('==================');
  plannedUpdates.forEach((update, i) => {
    console.log(`\n${i + 1}. ${update.cocktailName}`);
    console.log(`   Local:  ${update.cocktailSlug}`);
    console.log(`   Source: ${update.sourceName} (${update.source}, ${update.matchType}, ${Math.round(update.matchScore * 100)}%)`);
    console.log(`   Image:  ${update.newImageUrl}`);
  });
  
  // Show cocktails without matches
  if (noMatch.length > 0) {
    console.log('\n❌ NO MATCH FOUND (from any source)');
    console.log('===================================');
    noMatch.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.slug})`);
    });
  }
  
  if (!apply) {
    console.log('\n💡 Run with --apply to execute these updates');
    return;
  }
  
  // Execute updates
  console.log('\n⚡ EXECUTING UPDATES');
  console.log('====================');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const update of plannedUpdates) {
    try {
      const { error } = await supabase
        .from('cocktails')
        .update({ image_url: update.newImageUrl })
        .eq('id', update.cocktailId);
      
      if (error) {
        console.error(`❌ Failed to update ${update.cocktailName}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Updated ${update.cocktailName} (${update.source})`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.cocktailName}:`, error);
      errorCount++;
    }
    
    // Small delay between updates
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n🎉 UPDATE COMPLETE');
  console.log('==================');
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed updates: ${errorCount}`);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

