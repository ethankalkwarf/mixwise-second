/**
 * Seed Cocktails from Excel File to Supabase
 *
 * Reads data/Cocktail DB_Full.xlsx and populates the Supabase cocktails table.
 * Maps Excel columns to Supabase schema fields with proper type conversion.
 *
 * Usage: npm run seed:cocktails
 */

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { CocktailInsert } from '../lib/cocktailTypes';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Excel file path
const EXCEL_FILE_PATH = 'data/Cocktail DB_Full.xlsx';

/**
 * Safely parse JSON string, return fallback if invalid
 */
function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`Invalid JSON: ${jsonString}, using fallback:`, fallback);
    return fallback;
  }
}

/**
 * Convert Excel row to CocktailInsert
 */
function mapExcelRowToCocktail(row: any): CocktailInsert | null {
  try {
    // Generate slug from name if not provided
    const name = row['name'] || row['Name'] || row['cocktail_name'];
    if (!name) {
      console.warn('Skipping row: no name found');
      return null;
    }

    const slug = (row['slug'] || row['Slug'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

    const cocktail: CocktailInsert = {
      legacy_id: row['id'] || row['ID'] || row['_id'] || null,
      slug,
      name,

      // Description fields
      short_description: row['short_description'] || row['description'] || row['Short Description'] || null,
      long_description: row['long_description'] || row['Long Description'] || null,
      seo_description: row['seo_description'] || row['metaDescription'] || row['SEO Description'] || null,

      // Basic cocktail fields
      base_spirit: row['base_spirit'] || row['primarySpirit'] || row['Primary Spirit'] || null,
      category_primary: row['category_primary'] || row['category'] || row['Category'] || null,
      glassware: row['glassware'] || row['glass'] || row['Glass'] || null,
      garnish: row['garnish'] || row['Garnish'] || null,
      technique: row['technique'] || row['method'] || row['Method'] || null,
      difficulty: row['difficulty'] || row['Difficulty'] || null,

      // Array fields - try JSON parsing first, then comma-separated strings
      categories_all: safeJsonParse(row['categories_all'] || row['drinkCategories'] || row['Categories'], null) ||
                     (row['categories_all'] || row['drinkCategories'] || row['Categories'] ?
                       (row['categories_all'] || row['drinkCategories'] || row['Categories']).split(',').map((s: string) => s.trim()) : null),
      tags: safeJsonParse(row['tags'] || row['Tags'], null) ||
            (row['tags'] || row['Tags'] ? (row['tags'] || row['Tags']).split(',').map((s: string) => s.trim()) : null),

      // Flavor profile fields
      flavor_strength: row['flavor_strength'] || row['Strength'] ? parseInt(row['flavor_strength'] || row['Strength']) : null,
      flavor_sweetness: row['flavor_sweetness'] || row['Sweetness'] ? parseInt(row['flavor_sweetness'] || row['Sweetness']) : null,
      flavor_tartness: row['flavor_tartness'] || row['Tartness'] ? parseInt(row['flavor_tartness'] || row['Tartness']) : null,
      flavor_bitterness: row['flavor_bitterness'] || row['Bitterness'] ? parseInt(row['flavor_bitterness'] || row['Bitterness']) : null,
      flavor_aroma: row['flavor_aroma'] || row['Aroma'] ? parseInt(row['flavor_aroma'] || row['Aroma']) : null,
      flavor_texture: row['flavor_texture'] || row['Texture'] ? parseInt(row['flavor_texture'] || row['Texture']) : null,

      // Other fields
      notes: row['notes'] || row['Notes'] || null,
      fun_fact: row['fun_fact'] || row['funFact'] || row['Fun Fact'] || null,
      fun_fact_source: row['fun_fact_source'] || row['funFactSources'] || row['Fun Fact Source'] || null,

      // JSON fields
      metadata_json: safeJsonParse(row['metadata_json'] || row['metadata'] || row['Metadata'], {}),
      ingredients: safeJsonParse(row['ingredients'] || row['Ingredients'], []),

      // Instructions - convert from Sanity blocks if needed
      instructions: row['instructions'] || row['Instructions'] ||
                   (row['instruction_blocks'] ? safeJsonParse(row['instruction_blocks'], []).map((block: any) =>
                     block.children?.map((child: any) => child.text).join('') || ''
                   ).join(' ') : null),

      // Image fields
      image_url: row['image_url'] || row['externalImageUrl'] || row['Image URL'] || null,
      image_alt: row['image_alt'] || row['imageAltOverride'] || row['Image Alt'] || null,
    };

    return cocktail;
  } catch (error) {
    console.error('Error mapping row:', row, error);
    return null;
  }
}

/**
 * Main seeding function
 */
async function seedCocktails() {
  console.log('🌱 Starting cocktail seeding from Excel...');

  try {
    // Read Excel file
    console.log(`📖 Reading Excel file: ${EXCEL_FILE_PATH}`);
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rawData.length} rows in Excel file`);

    // Clear existing data
    console.log('🗑️  Clearing existing cocktails...');
    const { error: deleteError } = await supabase
      .from('cocktails')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('Error clearing cocktails:', deleteError);
      return;
    }

    // Map and validate data
    const cocktails: CocktailInsert[] = [];
    let skippedCount = 0;

    for (const row of rawData) {
      const cocktail = mapExcelRowToCocktail(row);
      if (cocktail) {
        cocktails.push(cocktail);
      } else {
        skippedCount++;
      }
    }

    console.log(`✅ Mapped ${cocktails.length} cocktails (${skippedCount} skipped)`);

    // Insert in batches to avoid payload size limits
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < cocktails.length; i += batchSize) {
      const batch = cocktails.slice(i, i + batchSize);
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cocktails.length / batchSize)} (${batch.length} cocktails)...`);

      const { error: insertError } = await supabase
        .from('cocktails')
        .insert(batch);

      if (insertError) {
        console.error('Error inserting batch:', insertError);
        return;
      }

      insertedCount += batch.length;
    }

    console.log(`🎉 Successfully seeded ${insertedCount} cocktails!`);

  } catch (error) {
    console.error('❌ Error seeding cocktails:', error);
    process.exit(1);
  }
}

// Run the seeder
seedCocktails().then(() => {
  console.log('✅ Cocktail seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cocktail seeding failed:', error);
  process.exit(1);
});
