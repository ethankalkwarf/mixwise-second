#!/usr/bin/env node

/**
 * Migrate cocktail_ingredients.cocktail_id from legacy numeric IDs to UUIDs
 *
 * This script safely converts legacy integer cocktail_id values to their
 * corresponding UUIDs from the cocktails table using the legacy_id mapping.
 *
 * Usage: npm run migrate:cocktail-uuids
 *
 * Requirements:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable (or SUPABASE_ANON_KEY as fallback)
 */

const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility function to check if a string is a UUID
function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Utility function to check if a string is numeric
function isNumeric(str) {
  return /^\d+$/.test(str);
}

async function migrateCocktailUUIDs() {
  console.log('🚀 Starting cocktail ingredient UUID migration...\n');

  try {
    // Step 1: Fetch all cocktails to build legacy_id → UUID mapping
    console.log('📋 Fetching cocktail mappings...');

    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, legacy_id, name')
      .not('legacy_id', 'is', null);

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    if (!cocktails || cocktails.length === 0) {
      console.log('ℹ️  No cocktails with legacy_id found. Migration may not be needed.');
      return;
    }

    // Build mapping from legacy_id (string) to UUID
    const legacyToUUID = new Map();
    cocktails.forEach(cocktail => {
      if (cocktail.legacy_id) {
        legacyToUUID.set(cocktail.legacy_id.toString(), cocktail.id);
      }
    });

    console.log(`✅ Built mapping for ${legacyToUUID.size} cocktails\n`);

    // Step 2: Fetch all cocktail_ingredients rows
    console.log('📊 Fetching cocktail ingredients...');

    const { data: ingredients, error: ingredientError } = await supabase
      .from('cocktail_ingredients')
      .select('id, cocktail_id');

    if (ingredientError) {
      throw new Error(`Failed to fetch cocktail ingredients: ${ingredientError.message}`);
    }

    if (!ingredients || ingredients.length === 0) {
      console.log('ℹ️  No cocktail ingredients found. Nothing to migrate.');
      return;
    }

    console.log(`📈 Found ${ingredients.length} cocktail ingredient rows\n`);

    // Step 3: Analyze and categorize rows
    const stats = {
      total: ingredients.length,
      alreadyUUID: 0,
      needsMigration: 0,
      unmappable: 0
    };

    const rowsToUpdate = [];

    for (const row of ingredients) {
      const cocktailId = row.cocktail_id?.toString();

      if (!cocktailId) {
        console.warn(`⚠️  Row ${row.id} has null/undefined cocktail_id, skipping`);
        stats.unmappable++;
        continue;
      }

      if (isUUID(cocktailId)) {
        stats.alreadyUUID++;
        continue;
      }

      if (isNumeric(cocktailId)) {
        const targetUUID = legacyToUUID.get(cocktailId);
        if (targetUUID) {
          rowsToUpdate.push({
            id: row.id,
            oldCocktailId: cocktailId,
            newCocktailId: targetUUID
          });
          stats.needsMigration++;
        } else {
          console.warn(`⚠️  Row ${row.id} has numeric cocktail_id "${cocktailId}" with no matching cocktail.legacy_id`);
          stats.unmappable++;
        }
      } else {
        console.warn(`⚠️  Row ${row.id} has unrecognized cocktail_id format: "${cocktailId}"`);
        stats.unmappable++;
      }
    }

    // Step 4: Report findings
    console.log('📊 Migration Analysis:');
    console.log(`   Total rows: ${stats.total}`);
    console.log(`   Already UUID: ${stats.alreadyUUID}`);
    console.log(`   Needs migration: ${stats.needsMigration}`);
    console.log(`   Unmappable: ${stats.unmappable}\n`);

    if (stats.needsMigration === 0) {
      console.log('✅ No migration needed - all rows are already using UUIDs or unmappable');
      return;
    }

    // Step 5: Perform migration in batches
    console.log('⚡ Starting migration...\n');

    const batchSize = 50;
    let updatedCount = 0;

    for (let i = 0; i < rowsToUpdate.length; i += batchSize) {
      const batch = rowsToUpdate.slice(i, i + batchSize);
      console.log(`   Updating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rowsToUpdate.length / batchSize)} (${batch.length} rows)...`);

      // Update each row individually to ensure data integrity
      for (const row of batch) {
        const { error: updateError } = await supabase
          .from('cocktail_ingredients')
          .update({ cocktail_id: row.newCocktailId })
          .eq('id', row.id);

        if (updateError) {
          throw new Error(`Failed to update row ${row.id}: ${updateError.message}`);
        }
      }

      updatedCount += batch.length;
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Updated ${updatedCount} rows`);
    console.log(`   Skipped ${stats.alreadyUUID} already-migrated rows`);
    console.log(`   Found ${stats.unmappable} unmappable rows (check warnings above)\n`);

    // Step 6: Final verification
    console.log('🔍 Running final verification...');

    const { data: verificationRows, error: verifyError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id')
      .limit(5);

    if (verifyError) {
      console.warn(`⚠️  Could not verify results: ${verifyError.message}`);
    } else {
      const uuidCount = verificationRows.filter(row => isUUID(row.cocktail_id?.toString())).length;
      console.log(`   Sample verification: ${uuidCount}/${verificationRows.length} rows use UUIDs`);
    }

    console.log('\n🎉 Cocktail ingredient UUID migration completed!');

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateCocktailUUIDs().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
