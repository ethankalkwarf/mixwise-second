#!/usr/bin/env tsx

/**
 * Import Cocktails from TheCocktailDB Public API
 * 
 * ✅ LEGALLY SAFE: Uses their free public API (no scraping, no ToS violations)
 * 
 * TheCocktailDB offers a free, public API for cocktail data. This is the safest
 * legal approach for importing cocktail recipes.
 * 
 * API Documentation: https://www.thecocktaildb.com/api.php
 * 
 * Usage:
 *   npx tsx scripts/importFromTheCocktailDBAPI.ts --list-all          # List all available cocktails
 *   npx tsx scripts/importFromTheCocktailDBAPI.ts --import-all        # Import all cocktails
 *   npx tsx scripts/importFromTheCocktailDBAPI.ts --import-all --dry-run
 *   npx tsx scripts/importFromTheCocktailDBAPI.ts --search "margarita"  # Search and import specific
 * 
 * Environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
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

// TheCocktailDB API base URL
const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

interface CocktailDBDrink {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate?: string;
  strTags?: string;
  strVideo?: string;
  strCategory?: string;
  strIBA?: string;
  strAlcoholic?: string;
  strGlass?: string;
  strInstructions?: string;
  strDrinkThumb?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  dateModified?: string;
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

// Fetch from API
async function fetchAPI(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MixWise/1.0; +https://getmixwise.com)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Get all cocktails (by first letter, A-Z)
async function getAllCocktails(): Promise<CocktailDBDrink[]> {
  const allCocktails: CocktailDBDrink[] = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  
  console.log('📡 Fetching cocktails from TheCocktailDB API...\n');
  
  for (const letter of letters) {
    const data = await fetchAPI(`/search.php?f=${letter}`);
    
    if (data && data.drinks) {
      allCocktails.push(...data.drinks);
      console.log(`  Found ${data.drinks.length} cocktails starting with "${letter}"`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Deduplicate by ID
  const unique = new Map<string, CocktailDBDrink>();
  for (const drink of allCocktails) {
    if (!unique.has(drink.idDrink)) {
      unique.set(drink.idDrink, drink);
    }
  }
  
  console.log(`\n✅ Found ${unique.size} unique cocktails total\n`);
  return Array.from(unique.values());
}

// Search for specific cocktails
async function searchCocktails(query: string): Promise<CocktailDBDrink[]> {
  const data = await fetchAPI(`/search.php?s=${encodeURIComponent(query)}`);
  return data?.drinks || [];
}

// Convert TheCocktailDB format to our format
function convertToSupabaseFormat(drink: CocktailDBDrink): any {
  // Extract ingredients
  const ingredients: Array<{ text: string }> = [];
  for (let i = 1; i <= 15; i++) {
    const ing = (drink as any)[`strIngredient${i}`];
    const measure = (drink as any)[`strMeasure${i}`];
    
    if (ing && ing.trim()) {
      const text = measure && measure.trim() 
        ? `${measure.trim()} ${ing.trim()}`
        : ing.trim();
      ingredients.push({ text });
    }
  }
  
  // Determine base spirit
  let baseSpirit: string | null = null;
  const spiritKeywords = ['gin', 'vodka', 'rum', 'whiskey', 'whisky', 'tequila', 'brandy', 'cognac', 'bourbon', 'scotch'];
  for (const ing of ingredients) {
    const lower = ing.text.toLowerCase();
    for (const spirit of spiritKeywords) {
      if (lower.includes(spirit)) {
        baseSpirit = spirit.charAt(0).toUpperCase() + spirit.slice(1);
        break;
      }
    }
    if (baseSpirit) break;
  }
  
  // Determine category
  const categoryMap: Record<string, string> = {
    'Ordinary Drink': 'Classic',
    'Cocktail': 'Classic',
    'Punch / Party Drink': 'Contemporary',
    'Beer': 'Beer',
    'Soft Drink': 'Non-Alcoholic',
    'Shot': 'Shot',
    'Coffee / Tea': 'Contemporary',
    'Homemade Liqueur': 'Contemporary',
    'Other/Unknown': 'Contemporary',
  };
  const categoryPrimary = categoryMap[drink.strCategory || ''] || 'Contemporary';
  
  // Determine technique
  let technique: string | null = null;
  const instructions = (drink.strInstructions || '').toLowerCase();
  if (instructions.includes('shake')) technique = 'shaken';
  else if (instructions.includes('stir')) technique = 'stirred';
  else if (instructions.includes('build') || instructions.includes('pour')) technique = 'built';
  else if (instructions.includes('blend')) technique = 'blended';
  
  return {
    slug: toSlug(drink.strDrink),
    name: drink.strDrink,
    short_description: `Cocktail recipe from TheCocktailDB`,
    base_spirit: baseSpirit,
    category_primary: categoryPrimary,
    categories_all: [categoryPrimary, drink.strCategory || 'Cocktail'],
    tags: drink.strTags ? drink.strTags.split(',').map(t => t.trim()) : ['TheCocktailDB'],
    glassware: drink.strGlass?.toLowerCase() || null,
    garnish: null, // Extract from instructions if needed
    technique,
    difficulty: 'moderate',
    ingredients: ingredients.length > 0 ? ingredients : null,
    instructions: drink.strInstructions || null,
    image_url: drink.strDrinkThumb || null,
    metadata_json: {
      source: 'TheCocktailDB',
      sourceId: drink.idDrink,
      sourceUrl: `https://www.thecocktaildb.com/drink/${drink.idDrink}`,
      attribution: 'Recipe from TheCocktailDB (free public API)',
      isIBA: drink.strIBA ? true : false,
    },
  };
}

// Main function
async function main() {
  const { values, positionals } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      'list-all': { type: 'boolean' },
      'import-all': { type: 'boolean' },
      'search': { type: 'string' },
      'skip-existing': { type: 'boolean' },
    },
    allowPositionals: true,
  });
  
  console.log('🍸 TheCocktailDB API Importer');
  console.log('==============================\n');
  console.log('✅ Using official public API - legally safe, no ToS violations\n');
  
  const isDryRun = values['dry-run'] || false;
  const skipExisting = values['skip-existing'] || false;
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  let cocktails: CocktailDBDrink[] = [];
  
  // List all cocktails
  if (values['list-all']) {
    cocktails = await getAllCocktails();
    console.log(`\n📋 Found ${cocktails.length} cocktails available from TheCocktailDB API`);
    console.log('\nSample cocktails:');
    cocktails.slice(0, 10).forEach(c => {
      console.log(`  - ${c.strDrink} (${c.strCategory || 'Unknown'})`);
    });
    return;
  }
  
  // Search for specific cocktails
  if (values['search']) {
    console.log(`🔍 Searching for: "${values['search']}"\n`);
    cocktails = await searchCocktails(values['search']);
    console.log(`Found ${cocktails.length} cocktails\n`);
  }
  
  // Import all
  if (values['import-all']) {
    cocktails = await getAllCocktails();
  }
  
  if (cocktails.length === 0) {
    console.log('❌ No cocktails to import. Use --list-all, --import-all, or --search');
    return;
  }
  
  // Check existing cocktails
  const existingSlugs = new Set<string>();
  if (skipExisting) {
    const { data: existing } = await supabase
      .from('cocktails')
      .select('slug');
    
    if (existing) {
      existing.forEach(c => existingSlugs.add(c.slug));
      console.log(`📋 Found ${existingSlugs.size} existing cocktails (will skip duplicates)\n`);
    }
  }
  
  // Convert to our format
  const cocktailsToImport = cocktails
    .map(convertToSupabaseFormat)
    .filter(c => !skipExisting || !existingSlugs.has(c.slug));
  
  console.log(`📤 Ready to import ${cocktailsToImport.length} cocktails\n`);
  
  if (isDryRun) {
    console.log('Sample cocktails that would be imported:');
    cocktailsToImport.slice(0, 5).forEach(c => {
      console.log(`  - ${c.name} (${c.slug})`);
      console.log(`    Category: ${c.category_primary}`);
      console.log(`    Ingredients: ${c.ingredients?.length || 0}`);
      console.log(`    Image: ${c.image_url ? 'Yes' : 'No'}`);
      console.log('');
    });
    if (cocktailsToImport.length > 5) {
      console.log(`... and ${cocktailsToImport.length - 5} more\n`);
    }
    return;
  }
  
  // Import to database
  console.log('📥 Importing cocktails to database...\n');
  
  const batchSize = 20;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < cocktailsToImport.length; i += batchSize) {
    const batch = cocktailsToImport.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('cocktails')
      .insert(batch);
    
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
  console.log(`\n📝 Note: TheCocktailDB recipes are user-submitted. Quality varies.`);
  console.log(`   Consider reviewing and curating imported cocktails.`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

