/**
 * Ingredient ID Migration Script
 * 
 * Migrates legacy bar_ingredients to canonical UUID format
 * 
 * Run this ONCE after deploying the code changes:
 * npx ts-node scripts/migrate_ingredient_ids.ts
 * 
 * What it does:
 * 1. Identifies all non-UUID ingredient_id values in bar_ingredients table
 * 2. Maps legacy formats to canonical UUIDs using ingredients table
 * 3. Updates all bar_ingredients to UUID format
 * 4. Verifies no orphaned references
 * 5. Reports migration statistics
 */

import { createClient } from '@/lib/supabase/client';
import { buildNameToIdMap, normalizeToCanonical } from '@/lib/ingredientId';

interface BarIngredient {
  id: number;
  user_id: string;
  ingredient_id: string;
  ingredient_name: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  legacy_id: string | null;
}

interface MigrationStats {
  total: number;
  alreadyUuid: number;
  migrated: number;
  failed: number;
  errors: string[];
}

/**
 * Main migration function
 */
async function migrateIngredientIds(): Promise<void> {
  console.log('🔄 Starting Ingredient ID Migration...\n');

  const supabase = createClient();
  const stats: MigrationStats = {
    total: 0,
    alreadyUuid: 0,
    migrated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Step 1: Fetch all ingredients for mapping
    console.log('📚 Step 1: Fetching ingredients for mapping...');
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name, legacy_id');

    if (ingredientsError || !ingredients) {
      throw new Error(`Failed to fetch ingredients: ${ingredientsError?.message}`);
    }

    console.log(`   ✓ Loaded ${ingredients.length} ingredients\n`);

    // Build mapping
    const nameMap = buildNameToIdMap(
      ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        legacy_id: ing.legacy_id
      }))
    );

    // Step 2: Fetch all bar_ingredients
    console.log('📋 Step 2: Fetching bar_ingredients...');
    const { data: barIngredients, error: barError } = await supabase
      .from('bar_ingredients')
      .select('id, user_id, ingredient_id, ingredient_name');

    if (barError || !barIngredients) {
      throw new Error(`Failed to fetch bar_ingredients: ${barError?.message}`);
    }

    stats.total = barIngredients.length;
    console.log(`   ✓ Loaded ${barIngredients.length} bar ingredients\n`);

    // Step 3: Identify which ones need migration
    console.log('🔍 Step 3: Analyzing ingredient IDs...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const toMigrate: Array<{ item: BarIngredient; newId: string }> = [];

    for (const item of barIngredients) {
      if (uuidRegex.test(item.ingredient_id)) {
        // Already UUID - verify it exists in ingredients table
        const existsInDb = ingredients.some(i => i.id === item.ingredient_id);
        if (existsInDb) {
          stats.alreadyUuid++;
        } else {
          stats.failed++;
          stats.errors.push(
            `Orphaned UUID in bar_ingredients: user_id=${item.user_id}, ingredient_id=${item.ingredient_id}`
          );
        }
      } else {
        // Need to migrate - try to find canonical UUID
        const canonical = normalizeToCanonical(item.ingredient_id, nameMap);
        if (canonical) {
          toMigrate.push({ item, newId: canonical });
        } else {
          stats.failed++;
          stats.errors.push(
            `Could not normalize: user_id=${item.user_id}, ingredient_id="${item.ingredient_id}"`
          );
        }
      }
    }

    console.log(`   ✓ Already UUID: ${stats.alreadyUuid}`);
    console.log(`   ✓ Need migration: ${toMigrate.length}`);
    console.log(`   ✓ Failed to normalize: ${stats.failed}\n`);

    if (toMigrate.length === 0) {
      console.log('✅ All ingredients are already in canonical UUID format!\n');
      printSummary(stats);
      return;
    }

    // Step 4: Perform migration
    console.log('💾 Step 4: Migrating ingredients...');
    let migrationCount = 0;

    for (const { item, newId } of toMigrate) {
      const { error: updateError } = await supabase
        .from('bar_ingredients')
        .update({
          ingredient_id: newId,
          ingredient_name: ingredients.find(i => i.id === newId)?.name || item.ingredient_name,
        })
        .eq('id', item.id);

      if (updateError) {
        stats.errors.push(
          `Failed to update bar_ingredients id=${item.id}: ${updateError.message}`
        );
        stats.failed++;
      } else {
        migrationCount++;
        stats.migrated++;
        
        if (migrationCount % 100 === 0) {
          console.log(`   ✓ Migrated ${migrationCount} / ${toMigrate.length}...`);
        }
      }
    }

    console.log(`   ✓ Migrated ${migrationCount} ingredients\n`);

    // Step 5: Verification
    console.log('✔️  Step 5: Verifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bar_ingredients')
      .select('ingredient_id');

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    const allUuidNow = (verifyData || []).every(item => uuidRegex.test(item.ingredient_id));

    if (allUuidNow) {
      console.log('   ✓ All bar_ingredients are now UUID format\n');
    } else {
      const nonUuids = (verifyData || []).filter(item => !uuidRegex.test(item.ingredient_id));
      console.log(`   ⚠️  Found ${nonUuids.length} non-UUID values\n`);
      stats.errors.push(`After migration, ${nonUuids.length} non-UUID values remain`);
    }

    // Print results
    printSummary(stats);

    // Final check for orphaned references
    console.log('\n🔗 Step 6: Checking for orphaned references...');
    const { data: orphaned, error: orphanError } = await supabase
      .from('bar_ingredients')
      .select('id, user_id, ingredient_id')
      .then(result => {
        if (result.error) return result;

        const orphanedList = (result.data || []).filter(item => 
          !ingredients.some(i => i.id === item.ingredient_id)
        );

        return {
          data: orphanedList,
          error: null
        };
      });

    if (orphanError) {
      console.log(`   ⚠️  Could not check for orphaned references: ${orphanError.message}`);
    } else if ((orphaned || []).length === 0) {
      console.log('   ✓ No orphaned references found\n');
    } else {
      console.log(`   ⚠️  Found ${orphaned?.length} orphaned references\n`);
      for (const item of (orphaned || [])) {
        console.log(`      - user_id=${item.user_id}, ingredient_id=${item.ingredient_id}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Print migration summary
 */
function printSummary(stats: MigrationStats): void {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Total items:        ${stats.total}`);
  console.log(`Already UUID:       ${stats.alreadyUuid}`);
  console.log(`Successfully migrated: ${stats.migrated}`);
  console.log(`Failed:             ${stats.failed}`);

  const successRate = stats.total > 0 
    ? (((stats.alreadyUuid + stats.migrated) / stats.total) * 100).toFixed(1)
    : 100;

  console.log(`\nSuccess rate:       ${successRate}%`);

  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    for (const error of stats.errors.slice(0, 10)) {
      console.log(`   - ${error}`);
    }
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');

  if (stats.failed === 0 && successRate === '100') {
    console.log('✅ Migration completed successfully!\n');
  } else {
    console.log('⚠️  Migration completed with issues. Please review above.\n');
  }
}

/**
 * Verify migration using raw SQL
 * (Optional - for extra confidence)
 */
async function verifyWithSql(): Promise<void> {
  console.log('\n🔐 ADVANCED VERIFICATION (SQL)\n');

  const supabase = createClient();

  // Query to check UUID format distribution
  const { data: distribution, error: distributionError } = await supabase
    .rpc('check_ingredient_id_formats') as Promise<any>;

  if (distributionError) {
    console.log('Note: Could not run SQL verification (function may not exist)');
    console.log('This is optional - manual SQL queries in Supabase dashboard can verify:\n');

    console.log('-- Check UUID format distribution:');
    console.log('SELECT');
    console.log('  COUNT(*) as total,');
    console.log('  COUNT(CASE WHEN ingredient_id ~ \'');
    console.log('    ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
    console.log('  \' THEN 1 END) as uuid_format');
    console.log('FROM bar_ingredients;');
    console.log('\n-- Result should be: total = uuid_format');

    return;
  }

  if (distribution) {
    console.log('✓ SQL Verification Results:');
    console.log(`  ${JSON.stringify(distribution)}`);
  }
}

/**
 * Run migration
 */
async function main(): Promise<void> {
  const startTime = Date.now();

  // Welcome message
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  INGREDIENT ID MIGRATION SCRIPT                           ║');
  console.log('║  Normalizes legacy ingredient IDs to canonical UUID format║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Run migration
  await migrateIngredientIds();

  // Optional SQL verification
  await verifyWithSql();

  // Print timing
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`⏱️  Migration took ${duration}s\n`);

  console.log('📖 NEXT STEPS:');
  console.log('  1. Verify results above');
  console.log('  2. Run manual tests in Supabase dashboard (see SQL queries)');
  console.log('  3. Monitor application for any issues');
  console.log('  4. Commit this migration to your deployment log\n');
}

// Execute
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

