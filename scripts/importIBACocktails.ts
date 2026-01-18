#!/usr/bin/env tsx

/**
 * Import IBA (International Bartenders Association) Official Cocktails
 * 
 * ⚠️ LEGAL WARNING: This script scrapes the IBA website, which may violate their Terms of Service.
 * 
 * RECOMMENDED APPROACH:
 * - IBA recipes (ingredients/instructions) are standardized public knowledge
 * - However, scraping their website may violate ToS
 * - Consider manual entry instead, or use recipes you've verified rights to
 * 
 * LEGAL CONSIDERATIONS:
 * - Recipe ingredients/instructions are generally not copyrightable (factual information)
 * - But website scraping may violate Terms of Service
 * - Creative descriptions and images ARE copyrightable
 * - This script attempts to extract only factual recipe data
 * 
 * For safer alternatives, see docs/LEGAL_COCKTAIL_IMPORT.md
 * 
 * Usage:
 *   npx tsx scripts/importIBACocktails.ts --export-csv          # Export to CSV for review (RECOMMENDED)
 *   npx tsx scripts/importIBACocktails.ts --export-csv data/iba-review.csv  # Custom output file
 *   npx tsx scripts/importIBACocktails.ts --dry-run            # Preview what would be imported
 *   npx tsx scripts/importIBACocktails.ts --apply              # Import cocktails to database
 *   npx tsx scripts/importIBACocktails.ts --apply --skip-existing  # Skip cocktails that already exist
 * 
 * RECOMMENDED WORKFLOW:
 *   1. Run --export-csv to generate a review file
 *   2. Review and edit the CSV file manually
 *   3. Import using: npx tsx scripts/importCuratedCocktails.ts data/iba-review.csv
 * 
 * Environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import type { Database } from '../lib/supabase/database.types';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

// IBA cocktail categories (URLs may have changed - using known cocktails list as fallback)
const IBA_CATEGORIES = [
  'the-unforgettables',
  'contemporary-classics',
  'new-era-drinks',
];

// Known IBA official cocktails (fallback if scraping fails)
// Convert slug to name: "old-fashioned" -> "Old Fashioned"
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bThe\b/g, 'the')
    .replace(/\bOf\b/g, 'of');
}

// Known IBA cocktail slugs (from existing list)
const KNOWN_IBA_SLUGS = [
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

interface IBACocktailData {
  name: string;
  slug: string;
  url: string;
  category: string;
  ingredients?: string[];
  instructions?: string;
  glassware?: string;
  garnish?: string;
  imageUrl?: string | null;
}

// Convert string to slug
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Fetch HTML from URL
async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MixWise/1.0; +https://getmixwise.com)',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`  Error fetching ${url}:`, error);
    return null;
  }
}

// Extract cocktail list from HTML
function extractCocktailListFromHTML(html: string): Array<{ name: string; url: string }> {
  const results: Array<{ name: string; url: string }> = [];
  
  // Look for cocktail links - IBA uses various patterns
  const linkPatterns = [
    /<a[^>]+href=["']([^"']*\/iba-cocktail\/[^"']+)["'][^>]*>([^<]+)<\/a>/gi,
    /<a[^>]+href=["']([^"']*\/cocktail\/[^"']+)["'][^>]*>([^<]+)<\/a>/gi,
  ];
  
  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1].startsWith('http') ? match[1] : `https://iba-world.com${match[1]}`;
      const name = match[2].trim();
      if (name && url) {
        results.push({ name, url });
      }
    }
  }
  
  return results;
}

// Extract cocktail details from IBA page
async function extractCocktailDetails(url: string, category: string): Promise<IBACocktailData | null> {
  const html = await fetchHTML(url);
  if (!html) return null;
  
  const slug = url.match(/\/([^/]+)\/?$/)?.[1] || toSlug(url);
  
  // Extract name from page title or h1
  let name = '';
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                     html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    name = titleMatch[1].replace(/\s*-\s*IBA.*$/i, '').trim();
  }
  
  if (!name) {
    // Fallback: derive from slug
    name = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  // Extract image
  let imageUrl: string | null = null;
  const imgMatch = html.match(/<img[^>]+src=["']([^"']*\/cocktails\/[^"']+)["']/i) ||
                   html.match(/<img[^>]+src=["']([^"']*\/images\/[^"']+)["']/i);
  if (imgMatch) {
    imageUrl = imgMatch[1].startsWith('http') ? imgMatch[1] : `https://iba-world.com${imgMatch[1]}`;
  }
  
  // Extract ingredients (look for lists or structured data)
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /<li[^>]*>([^<]+(?:oz|ml|dash|tsp|tbsp|piece|slice|wedge|leaf|sprig)[^<]*)<\/li>/gi,
    /<p[^>]*>([^<]+(?:oz|ml|dash|tsp|tbsp)[^<]*)<\/p>/gi,
  ];
  
  for (const pattern of ingredientPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const text = match[1].trim();
      if (text && !ingredients.includes(text)) {
        ingredients.push(text);
      }
    }
  }
  
  // Extract instructions
  let instructions: string | undefined;
  const instructionSection = html.match(/<div[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                           html.match(/<p[^>]*>([^<]*(?:shake|stir|pour|add|garnish)[^<]*)<\/p>/i);
  if (instructionSection) {
    instructions = instructionSection[1].replace(/<[^>]+>/g, ' ').trim();
  }
  
  // Extract glassware
  let glassware: string | undefined;
  const glassMatch = html.match(/(?:glass|served in)[^<]*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:glass|cup)/i);
  if (glassMatch) {
    glassware = glassMatch[1];
  }
  
  // Extract garnish
  let garnish: string | undefined;
  const garnishMatch = html.match(/garnish[^<]*?with[^<]*?([A-Z][a-z]+(?:\s+[a-z]+)?)/i);
  if (garnishMatch) {
    garnish = garnishMatch[1];
  }
  
  return {
    name,
    slug: toSlug(name),
    url,
    category,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    instructions,
    glassware,
    garnish,
    imageUrl,
  };
}

// Scrape IBA cocktails
async function scrapeIBACocktails(): Promise<IBACocktailData[]> {
  const results: IBACocktailData[] = [];
  const processedSlugs = new Set<string>();
  
  console.log('\n🔍 Fetching IBA official cocktails...\n');
  
  // Try scraping first
  let scrapedCount = 0;
  for (const category of IBA_CATEGORIES) {
    console.log(`📂 Trying category: ${category}`);
    const categoryUrl = `https://iba-world.com/category/iba-official-cocktails/${category}/`;
    const categoryHtml = await fetchHTML(categoryUrl);
    
    if (categoryHtml) {
      const cocktailUrls = extractCocktailListFromHTML(categoryHtml);
      console.log(`  Found ${cocktailUrls.length} cocktails via scraping`);
      
      for (const cocktail of cocktailUrls) {
        const slug = toSlug(cocktail.name);
        if (processedSlugs.has(slug)) continue;
        processedSlugs.add(slug);
        
        console.log(`  🍸 Processing: ${cocktail.name}`);
        const details = await extractCocktailDetails(cocktail.url, category);
        if (details) {
          results.push(details);
          scrapedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.warn(`  ⚠️  Could not fetch category page (website structure may have changed)`);
    }
  }
  
  // If scraping failed, use known IBA cocktails list
  if (scrapedCount === 0) {
    console.log('\n⚠️  Website scraping failed. Using known IBA cocktails list...\n');
    console.log(`   Found ${KNOWN_IBA_SLUGS.length} known IBA cocktails\n`);
    
    // Try to determine category from slug patterns (rough estimate)
    const getCategory = (slug: string): string => {
      // These are rough estimates - actual categorization may vary
      if (['old-fashioned', 'manhattan', 'negroni', 'sazerac', 'sidecar', 'daiquiri', 
           'aviation', 'gimlet', 'dry-martini', 'whiskey-sour'].includes(slug)) {
        return 'the-unforgettables';
      }
      if (['cosmopolitan', 'margarita', 'mojito', 'moscow-mule', 'long-island-iced-tea',
           'sex-on-the-beach', 'pina-colada', 'mai-tai'].includes(slug)) {
        return 'contemporary-classics';
      }
      return 'new-era-drinks'; // Default
    };
    
    for (const slug of KNOWN_IBA_SLUGS) {
      if (processedSlugs.has(slug)) continue;
      processedSlugs.add(slug);
      
      const name = slugToName(slug);
      const category = getCategory(slug);
      console.log(`  🍸 Processing: ${name}`);
      
      // Try to fetch details from individual cocktail page
      const url = `https://iba-world.com/iba-cocktail/${slug}/`;
      const details = await extractCocktailDetails(url, category);
      
      if (details) {
        results.push(details);
      } else {
        // If we can't fetch details, create a basic entry (will need manual completion)
        results.push({
          name,
          slug,
          url,
          category,
          ingredients: undefined,
          instructions: undefined,
          glassware: undefined,
          garnish: undefined,
          imageUrl: null,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`\n✅ Found ${results.length} IBA cocktails\n`);
  return results;
}

// Infer flavor profile from ingredients and instructions
function inferFlavorProfile(iba: IBACocktailData): {
  flavor_strength: number | null;
  flavor_sweetness: number | null;
  flavor_tartness: number | null;
  flavor_bitterness: number | null;
  flavor_aroma: number | null;
  flavor_texture: number | null;
} {
  const ingredients = (iba.ingredients || []).join(' ').toLowerCase();
  const instructions = (iba.instructions || '').toLowerCase();
  const allText = `${ingredients} ${instructions}`;
  
  // Strength: Based on alcohol content and spirit type
  let strength = 5; // Default moderate
  if (allText.includes('whiskey') || allText.includes('whisky') || allText.includes('bourbon') || 
      allText.includes('scotch') || allText.includes('brandy') || allText.includes('cognac')) {
    strength = 8;
  } else if (allText.includes('gin') || allText.includes('vodka') || allText.includes('rum') || 
             allText.includes('tequila')) {
    strength = 6;
  } else if (allText.includes('wine') || allText.includes('champagne') || allText.includes('beer')) {
    strength = 4;
  }
  
  // Sweetness: Based on sweet ingredients
  let sweetness = 3; // Default moderate
  if (allText.includes('simple syrup') || allText.includes('sugar') || allText.includes('honey') || 
      allText.includes('agave') || allText.includes('triple sec') || allText.includes('cointreau') ||
      allText.includes('grand marnier') || allText.includes('liqueur')) {
    sweetness = 6;
  }
  if (allText.includes('vermouth') && allText.includes('sweet')) {
    sweetness = 7;
  }
  
  // Tartness: Based on citrus
  let tartness = 3; // Default moderate
  if (allText.includes('lemon') || allText.includes('lime') || allText.includes('citrus')) {
    tartness = 7;
  }
  if (allText.includes('juice') && (allText.includes('lemon') || allText.includes('lime'))) {
    tartness = 8;
  }
  
  // Bitterness: Based on bitter ingredients
  let bitterness = 2; // Default low
  if (allText.includes('bitters') || allText.includes('campari') || allText.includes('aperol') ||
      allText.includes('amaro') || allText.includes('vermouth') && allText.includes('dry')) {
    bitterness = 6;
  }
  if (allText.includes('campari') || allText.includes('aperol')) {
    bitterness = 8;
  }
  
  // Aroma: Based on aromatic ingredients
  let aroma = 4; // Default moderate
  if (allText.includes('gin') || allText.includes('herb') || allText.includes('mint') ||
      allText.includes('basil') || allText.includes('thyme') || allText.includes('rosemary')) {
    aroma = 7;
  }
  if (allText.includes('peel') || allText.includes('zest')) {
    aroma = 6;
  }
  
  // Texture: Based on preparation and ingredients
  let texture = 5; // Default moderate
  if (allText.includes('egg white') || allText.includes('cream') || allText.includes('milk')) {
    texture = 8; // Creamy/silky
  } else if (allText.includes('shake') && !allText.includes('dry shake')) {
    texture = 6; // Light/airy from shaking
  } else if (allText.includes('stir')) {
    texture = 4; // Clear/crisp
  }
  
  return {
    flavor_strength: strength,
    flavor_sweetness: sweetness,
    flavor_tartness: tartness,
    flavor_bitterness: bitterness,
    flavor_aroma: aroma,
    flavor_texture: texture,
  };
}

// Generate SEO-friendly description
function generateSEODescription(name: string, baseSpirit: string | null, category: string): string {
  const spiritText = baseSpirit ? ` with ${baseSpirit}` : '';
  return `Learn how to make a ${name}${spiritText}. Official IBA ${category} cocktail recipe with ingredients and step-by-step instructions.`;
}

// Generate short description
function generateShortDescription(name: string, category: string, baseSpirit: string | null): string {
  const spiritText = baseSpirit ? ` made with ${baseSpirit}` : '';
  return `A classic ${category.toLowerCase()} cocktail${spiritText}, recognized by the International Bartenders Association.`;
}

// Convert IBA data to Supabase format
function convertToSupabaseFormat(iba: IBACocktailData): any {
  // Determine base spirit from category or ingredients
  let baseSpirit: string | null = null;
  if (iba.ingredients) {
    const spiritKeywords = [
      { keywords: ['gin'], name: 'Gin' },
      { keywords: ['vodka'], name: 'Vodka' },
      { keywords: ['rum'], name: 'Rum' },
      { keywords: ['whiskey', 'whisky'], name: 'Whiskey' },
      { keywords: ['tequila'], name: 'Tequila' },
      { keywords: ['brandy'], name: 'Brandy' },
      { keywords: ['cognac'], name: 'Cognac' },
      { keywords: ['bourbon'], name: 'Bourbon' },
      { keywords: ['scotch'], name: 'Scotch' },
      { keywords: ['pisco'], name: 'Pisco' },
      { keywords: ['mezcal'], name: 'Mezcal' },
    ];
    
    const allIngredients = iba.ingredients.join(' ').toLowerCase();
    for (const spirit of spiritKeywords) {
      if (spirit.keywords.some(kw => allIngredients.includes(kw))) {
        baseSpirit = spirit.name;
        break;
      }
    }
  }
  
  // Determine category
  const categoryMap: Record<string, string> = {
    'the-unforgettables': 'Classic',
    'contemporary-classics': 'Contemporary',
    'new-era-drinks': 'Modern',
  };
  const categoryPrimary = categoryMap[iba.category] || 'Classic';
  
  // Convert ingredients to JSON format
  const ingredientsJson = iba.ingredients?.map(text => ({ text })) || [];
  
  // Infer flavor profile
  const flavorProfile = inferFlavorProfile(iba);
  
  // Determine technique
  const instructionsLower = (iba.instructions || '').toLowerCase();
  let technique: string | null = null;
  if (instructionsLower.includes('shake')) {
    technique = 'shaken';
  } else if (instructionsLower.includes('stir')) {
    technique = 'stirred';
  } else if (instructionsLower.includes('build') || instructionsLower.includes('pour')) {
    technique = 'built';
  } else if (instructionsLower.includes('blend')) {
    technique = 'blended';
  } else if (instructionsLower.includes('muddle')) {
    technique = 'muddled';
  }
  
  // Determine difficulty
  let difficulty: string = 'moderate';
  const ingredientCount = ingredientsJson.length;
  if (ingredientCount <= 3 && !instructionsLower.includes('shake') && !instructionsLower.includes('stir')) {
    difficulty = 'easy';
  } else if (ingredientCount > 5 || instructionsLower.includes('layer') || 
             instructionsLower.includes('float') || instructionsLower.includes('flame')) {
    difficulty = 'advanced';
  }
  
  // Generate descriptions
  const shortDescription = generateShortDescription(iba.name, categoryPrimary, baseSpirit);
  const seoDescription = generateSEODescription(iba.name, baseSpirit, categoryPrimary);
  
  // Generate image alt text
  const imageAlt = iba.imageUrl ? `${iba.name} cocktail in a ${iba.glassware || 'glass'}` : null;
  
  return {
    slug: iba.slug,
    name: iba.name,
    short_description: shortDescription,
    long_description: null, // Can be populated manually later
    seo_description: seoDescription,
    base_spirit: baseSpirit,
    category_primary: categoryPrimary,
    categories_all: [categoryPrimary, 'IBA Official'],
    tags: ['IBA', 'Official', categoryPrimary],
    image_url: iba.imageUrl || null,
    image_alt: imageAlt,
    glassware: iba.glassware?.toLowerCase() || null,
    garnish: iba.garnish || null,
    technique,
    difficulty,
    flavor_strength: flavorProfile.flavor_strength,
    flavor_sweetness: flavorProfile.flavor_sweetness,
    flavor_tartness: flavorProfile.flavor_tartness,
    flavor_bitterness: flavorProfile.flavor_bitterness,
    flavor_aroma: flavorProfile.flavor_aroma,
    flavor_texture: flavorProfile.flavor_texture,
    notes: null, // Can be populated manually later
    fun_fact: null, // Can be populated manually later
    fun_fact_source: null,
    metadata_json: {
      isPopular: categoryPrimary === 'Classic',
      source: 'IBA Official',
      sourceUrl: iba.url,
      attribution: 'Based on IBA Official Recipe',
      // Note: We only import factual recipe data (ingredients/instructions)
      // Descriptions are generated, not copied verbatim
    },
    ingredients: ingredientsJson.length > 0 ? ingredientsJson : null,
    instructions: iba.instructions || null,
  };
}

// Escape CSV field (handles commas, quotes, newlines)
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert cocktail to CSV row
function cocktailToCSVRow(cocktail: any): string {
  const ingredients = Array.isArray(cocktail.ingredients)
    ? cocktail.ingredients.map((ing: any) => ing.text || ing).join('|')
    : '';
  
  const categories = Array.isArray(cocktail.categories_all)
    ? cocktail.categories_all.join('|')
    : '';
  
  const tags = Array.isArray(cocktail.tags)
    ? cocktail.tags.join('|')
    : '';
  
  const metadata = typeof cocktail.metadata_json === 'object' && cocktail.metadata_json !== null
    ? JSON.stringify(cocktail.metadata_json)
    : '';
  
  return [
    escapeCSVField(cocktail.slug || ''),
    escapeCSVField(cocktail.name || ''),
    escapeCSVField(ingredients),
    escapeCSVField(cocktail.instructions || ''),
    escapeCSVField(cocktail.base_spirit || ''),
    escapeCSVField(cocktail.category_primary || ''),
    escapeCSVField(categories),
    escapeCSVField(tags),
    escapeCSVField(cocktail.glassware || ''),
    escapeCSVField(cocktail.garnish || ''),
    escapeCSVField(cocktail.technique || ''),
    escapeCSVField(cocktail.difficulty || ''),
    escapeCSVField(cocktail.short_description || ''),
    escapeCSVField(cocktail.seo_description || ''),
    escapeCSVField(cocktail.image_url || ''),
    escapeCSVField(cocktail.image_alt || ''),
    escapeCSVField(cocktail.flavor_strength || ''),
    escapeCSVField(cocktail.flavor_sweetness || ''),
    escapeCSVField(cocktail.flavor_tartness || ''),
    escapeCSVField(cocktail.flavor_bitterness || ''),
    escapeCSVField(cocktail.flavor_aroma || ''),
    escapeCSVField(cocktail.flavor_texture || ''),
    escapeCSVField(metadata),
  ].join(',');
}

// Export cocktails to CSV file
function exportToCSV(cocktails: any[], outputPath: string): void {
  const headers = [
    'slug',
    'name',
    'ingredients',
    'instructions',
    'base_spirit',
    'category_primary',
    'categories_all',
    'tags',
    'glassware',
    'garnish',
    'technique',
    'difficulty',
    'short_description',
    'seo_description',
    'image_url',
    'image_alt',
    'flavor_strength',
    'flavor_sweetness',
    'flavor_tartness',
    'flavor_bitterness',
    'flavor_aroma',
    'flavor_texture',
    'metadata_json',
  ];
  
  const lines = [headers.join(',')];
  
  for (const cocktail of cocktails) {
    lines.push(cocktailToCSVRow(cocktail));
  }
  
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`\n✅ Exported ${cocktails.length} cocktails to CSV`);
  console.log(`📁 File: ${outputPath}\n`);
  console.log('📝 Next steps:');
  console.log('   1. Review the CSV file in Excel or a text editor');
  console.log('   2. Edit any fields you want to change');
  console.log('   3. Import using: npx tsx scripts/importCuratedCocktails.ts ' + outputPath);
  console.log('');
}

// Main function
async function main() {
  const { values, positionals } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      'apply': { type: 'boolean' },
      'skip-existing': { type: 'boolean' },
      'export-csv': { type: 'boolean' },
    },
    allowPositionals: true,
  });
  
  const isDryRun = values['dry-run'] && !values['apply'];
  const skipExisting = values['skip-existing'] !== false; // Default to true - always skip existing
  const exportCSV = values['export-csv'] || false;
  const outputFile = positionals[0] || 'data/iba-cocktails-review.csv';
  
  console.log('🍸 IBA Official Cocktails Importer');
  console.log('=====================================\n');
  console.log('⚠️  LEGAL WARNING: Website scraping may violate Terms of Service.');
  console.log('    Recipe data (ingredients/instructions) is factual and generally not copyrighted,');
  console.log('    but scraping websites may still violate ToS. Use at your own risk.\n');
  console.log('    For safer alternatives, see: docs/LEGAL_COCKTAIL_IMPORT.md\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  // Scrape IBA cocktails
  const ibaCocktails = await scrapeIBACocktails();
  
  if (ibaCocktails.length === 0) {
    console.log('❌ No cocktails found');
    return;
  }
  
  console.log(`\n✅ Found ${ibaCocktails.length} IBA cocktails\n`);
  
  // Always check existing cocktails (skip by default)
  const existingSlugs = new Set<string>();
  const existingNames = new Set<string>();
  const { data: existing } = await supabase
    .from('cocktails')
    .select('slug, name');
  
  if (existing) {
    existing.forEach((c: any) => {
      existingSlugs.add(c.slug);
      // Normalize name for comparison (lowercase, remove special chars, HTML entities)
      const normalizedName = (c.name || '').toLowerCase()
        .replace(/&#\d+;/g, '') // Remove HTML entities
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      if (normalizedName) {
        existingNames.add(normalizedName);
      }
    });
    console.log(`📋 Found ${existingSlugs.size} existing cocktails in database\n`);
  }
  
  // Convert to Supabase format
  const allCocktails = ibaCocktails.map(convertToSupabaseFormat);
  
  // Filter out existing cocktails by both slug AND name (case-insensitive)
  const cocktailsToImport = allCocktails.filter(c => {
    // Check by slug first
    if (existingSlugs.has(c.slug)) {
      return false;
    }
    
    // Also check by normalized name (remove HTML entities, special chars, case-insensitive)
    // Remove "IBA" suffix, HTML entities, and normalize
    let normalizedName = (c.name || '').toLowerCase()
      .replace(/&#\d+;/g, '') // Remove HTML entities like &#8211;
      .replace(/\s*–\s*iba$/i, '') // Remove " – IBA" suffix
      .replace(/\s*iba$/i, '') // Remove " IBA" suffix
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Try multiple variations
    const nameVariations = [
      normalizedName,
      normalizedName.replace(/\s+/g, ''), // Remove all spaces
      normalizedName.split(' ')[0], // Just first word (for "Old Fashioned" -> "old")
    ].filter(Boolean);
    
    for (const variation of nameVariations) {
      if (existingNames.has(variation)) {
        return false;
      }
    }
    
    return true;
  });
  
  const skippedCount = allCocktails.length - cocktailsToImport.length;
  
  if (skippedCount > 0) {
    console.log(`⏭️  Skipping ${skippedCount} cocktails that already exist\n`);
  }
  
  if (cocktailsToImport.length === 0) {
    console.log('ℹ️  All cocktails already exist in database. Nothing to import.\n');
    return;
  }
  
  console.log(`📤 Ready to process ${cocktailsToImport.length} new cocktails\n`);
  
  // Export to CSV if requested
  if (exportCSV) {
    const outputPath = path.isAbsolute(outputFile) 
      ? outputFile 
      : path.join(process.cwd(), outputFile);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    exportToCSV(cocktailsToImport, outputPath);
    return; // Don't import if exporting
  }
  
  if (isDryRun) {
    console.log('Sample cocktails that would be imported:');
    cocktailsToImport.slice(0, 5).forEach(c => {
      console.log(`  - ${c.name} (${c.slug})`);
      console.log(`    Category: ${c.category_primary}`);
      console.log(`    Ingredients: ${c.ingredients?.length || 0}`);
      console.log(`    Image: ${c.image_url ? 'Yes' : 'No'}`);
      console.log('');
    });
    console.log(`... and ${cocktailsToImport.length - 5} more\n`);
    return;
  }
  
  // Import to database
  console.log('📥 Importing cocktails to database...\n');
  
  const batchSize = 10;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < cocktailsToImport.length; i += batchSize) {
    const batch = cocktailsToImport.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('cocktails')
      .insert(batch as any);
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`✅ Imported ${imported}/${cocktailsToImport.length} cocktails...`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors}`);
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

