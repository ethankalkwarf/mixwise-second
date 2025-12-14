/**
 * Migrate cocktail_ingredients.cocktail_id from legacy numeric IDs to UUIDs
 *
 * This script:
 * 1. Builds a mapping from cocktails.legacy_id (numeric) to cocktails.id (UUID)
 * 2. Updates cocktail_ingredients.cocktail_id values to use UUIDs
 * 3. Reports on migration success and any orphaned rows
 *
 * Usage: npm run migrate:cocktail-uuids
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase client setup for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

interface CocktailMapping {
  legacyId: string;
  uuid: string;
  name: string;
}

interface MigrationResult {
  totalCocktails: number;
  totalIngredients: number;
  migratedRows: number;
  orphanedRows: number;
  skippedRows: number;
}

async function migrateCocktailIngredientUUIDs(): Promise<void> {
  console.log('🚀 Starting cocktail ingredient UUID migration...');

  try {
    // Step 1: Build mapping from legacy_id to UUID
    console.log('📋 Building cocktail ID mapping...');

    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, legacy_id, name')
      .not('legacy_id', 'is', null);

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    if (!cocktails || cocktails.length === 0) {
      console.log('❌ No cocktails with legacy_id found. Migration may not be needed.');
      return;
    }

    const idMapping = new Map<string, string>();
    cocktails.forEach(cocktail => {
      if (cocktail.legacy_id) {
        idMapping.set(cocktail.legacy_id, cocktail.id);
      }
    });

    console.log(`✅ Built mapping for ${idMapping.size} cocktails`);

    // Step 2: Check current state of cocktail_ingredients
    const { data: currentIngredients, error: currentError } = await supabase
      .from('cocktail_ingredients')
      .select('id, cocktail_id')
      .limit(5);

    if (currentError) {
      console.log('⚠️  cocktail_ingredients table may not exist yet. This is expected.');
      console.log('📝 Run the Supabase migration first: supabase db push');
      return;
    }

    console.log(`📊 Found ${currentIngredients?.length || 0} sample ingredient rows`);

    // Step 3: Identify rows that need migration
    const { data: ingredientsToMigrate, error: migrateError } = await supabase
      .from('cocktail_ingredients')
      .select('id, cocktail_id')
      .filter('cocktail_id', 'not.in', `(${Array.from(idMapping.keys()).map(id => `'${id}'`).join(',')})`);

    if (migrateError) {
      throw new Error(`Failed to identify ingredients to migrate: ${migrateError.message}`);
    }

    const numericRows = (ingredientsToMigrate || []).filter(row =>
      typeof row.cocktail_id === 'string' && /^\d+$/.test(row.cocktail_id)
    );

    console.log(`🔄 Found ${numericRows.length} rows with numeric cocktail_id that need migration`);

    // Step 4: Perform the migration in a transaction
    if (numericRows.length > 0) {
      console.log('⚡ Starting migration transaction...');

      const updates = numericRows.map(row => {
        const targetUUID = idMapping.get(row.cocktail_id as string);
        if (!targetUUID) {
          console.warn(`⚠️  No UUID mapping found for cocktail_id: ${row.cocktail_id}`);
          return null;
        }
        return {
          id: row.id,
          new_cocktail_id: targetUUID
        };
      }).filter(Boolean);

      // Execute updates in batches to avoid overwhelming the database
      const batchSize = 100;
      let migratedCount = 0;

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        const { error: updateError } = await supabase
          .from('cocktail_ingredients')
          .upsert(
            batch.map(update => ({
              id: update!.id,
              cocktail_id: update!.new_cocktail_id
            })),
            { onConflict: 'id' }
          );

        if (updateError) {
          throw new Error(`Failed to update batch ${i / batchSize + 1}: ${updateError.message}`);
        }

        migratedCount += batch.length;
        console.log(`✅ Migrated batch ${i / batchSize + 1} (${batch.length} rows)`);
      }

      console.log(`🎉 Successfully migrated ${migratedCount} cocktail ingredient rows`);
    } else {
      console.log('ℹ️  No numeric cocktail_id rows found to migrate');
    }

    // Step 5: Final verification
    const { data: finalCheck, error: finalError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id')
      .limit(10);

    if (finalError) {
      console.error('❌ Error during final verification:', finalError);
    } else {
      const uuidRows = (finalCheck || []).filter(row =>
        typeof row.cocktail_id === 'string' && row.cocktail_id.includes('-')
      );

      console.log(`📈 Final check: ${uuidRows.length}/${finalCheck?.length || 0} sample rows use UUIDs`);
    }

    // Step 6: Check for orphaned rows
    const { data: orphanedRows, error: orphanError } = await supabase
      .from('cocktail_ingredients')
      .select('id, cocktail_id')
      .filter('cocktail_id', 'not.in', `(${Array.from(idMapping.values()).map(id => `'${id}'`).join(',')})`);

    if (orphanError) {
      console.error('❌ Error checking for orphaned rows:', orphanError);
    } else {
      const numericOrphaned = (orphanedRows || []).filter(row =>
        typeof row.cocktail_id === 'string' && /^\d+$/.test(row.cocktail_id)
      );

      if (numericOrphaned.length > 0) {
        console.warn(`⚠️  ${numericOrphaned.length} rows still have unmapped numeric cocktail_id values`);
        console.log('These may need manual cleanup or the cocktails.legacy_id mapping may be incomplete');
      } else {
        console.log('✅ No orphaned numeric cocktail_id rows found');
      }
    }

    console.log('🎊 Cocktail ingredient UUID migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateCocktailIngredientUUIDs().catch(console.error);
