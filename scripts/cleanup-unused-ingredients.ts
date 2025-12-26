#!/usr/bin/env tsx

/**
 * Safely remove unused ingredients from Supabase
 * Includes multiple safety checks and batch processing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SupabaseIngredient {
  id: number;
  name: string;
  category: string;
  image_url?: string;
  is_staple: boolean;
  name_normalized: string;
}

interface BackupData {
  timestamp: string;
  totalIngredients: number;
  usedIngredients: number;
  unusedIngredients: number;
  usageRate: string;
  unusedIngredients: SupabaseIngredient[];
  metadata: {
    cocktailsCount: number;
    relationshipsCount: number;
  };
}

async function cleanupUnusedIngredients(dryRun: boolean = true, batchSize: number = 10) {
  console.log(`🧹 CLEANUP UNUSED INGREDIENTS ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('===================================================\n');

  try {
    // Step 1: Load backup file for verification
    console.log('📂 Loading backup file...');
    const backupFiles = ['unused-ingredients-backup-2025-12-21.json'];
    let backupData: BackupData | null = null;

    for (const filename of backupFiles) {
      try {
        const data = readFileSync(filename, 'utf8');
        backupData = JSON.parse(data);
        console.log(`✅ Loaded backup: ${filename}`);
        break;
      } catch (error) {
        console.log(`⚠️  Could not load ${filename}, trying next...`);
      }
    }

    if (!backupData) {
      console.error('❌ No backup file found! Please run backup script first.');
      process.exit(1);
    }

    console.log(`Backup contains ${backupData.unusedIngredients.length} unused ingredients\n`);

    // Step 2: Verify current state matches backup
    console.log('🔍 Verifying current state matches backup...');
    const { data: currentIngredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('*');

    if (ingredientError) {
      console.error('Error fetching ingredients:', ingredientError);
      return;
    }

    const { data: currentRelationships, error: relationError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure');

    if (relationError) {
      console.error('Error fetching relationships:', relationError);
      return;
    }

    const currentUsedIngredientIds = new Set<number>();
    currentRelationships?.forEach(rel => {
      currentUsedIngredientIds.add(rel.ingredient_id);
    });

    const currentUnusedIngredients = currentIngredients?.filter(ing => !currentUsedIngredientIds.has(ing.id)) || [];

    // Verify backup matches current state
    const backupIds = new Set(backupData.unusedIngredients.map(ing => ing.id));
    const currentIds = new Set(currentUnusedIngredients.map(ing => ing.id));

    const idsMatch = backupIds.size === currentIds.size &&
                    [...backupIds].every(id => currentIds.has(id));

    if (!idsMatch) {
      console.error('❌ BACKUP DOES NOT MATCH CURRENT STATE!');
      console.error('This indicates the data has changed since backup.');
      console.error('Please create a fresh backup before proceeding.');
      process.exit(1);
    }

    console.log('✅ Backup verification passed\n');

    // Step 3: Check for any new usage since backup
    console.log('🔄 Checking for new usage since backup...');
    const newUsageFound = backupData.unusedIngredients.some(ing => {
      return currentUsedIngredientIds.has(ing.id);
    });

    if (newUsageFound) {
      console.error('❌ SOME UNUSED INGREDIENTS ARE NOW BEING USED!');
      console.error('This indicates cocktails were added/modified since backup.');
      console.error('Please create a fresh backup before proceeding.');
      process.exit(1);
    }

    console.log('✅ No new usage detected\n');

    // Step 4: Display cleanup plan
    console.log('📋 CLEANUP PLAN');
    console.log('===============');
    console.log(`Total unused ingredients: ${backupData.unusedIngredients.length}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(`Number of batches: ${Math.ceil(backupData.unusedIngredients.length / batchSize)}`);
    console.log(`Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

    // Group by category for reporting
    const unusedByCategory = backupData.unusedIngredients.reduce((acc, ingredient) => {
      const category = ingredient.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ingredient);
      return acc;
    }, {} as Record<string, SupabaseIngredient[]>);

    console.log('By category:');
    Object.entries(unusedByCategory)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([category, ingredients]) => {
        console.log(`  ${category}: ${ingredients.length} ingredients`);
      });

    console.log('');

    // Step 5: Execute cleanup in batches
    if (dryRun) {
      console.log('🧪 DRY RUN - No actual changes will be made');
      console.log('=======================================\n');
    } else {
      console.log('⚠️  LIVE CLEANUP - Ingredients will be permanently deleted!');
      console.log('=========================================================\n');

      // Require explicit confirmation for live run
      if (process.argv.includes('--confirm')) {
        console.log('✅ Confirmation flag detected, proceeding...');
      } else {
        console.error('❌ LIVE CLEANUP REQUIRES --confirm FLAG');
        console.error('Run with: npx tsx scripts/cleanup-unused-ingredients.ts --confirm');
        process.exit(1);
      }
    }

    let totalProcessed = 0;
    let totalDeleted = 0;
    const batches = [];

    for (let i = 0; i < backupData.unusedIngredients.length; i += batchSize) {
      batches.push(backupData.unusedIngredients.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Batch ${batchIndex + 1}/${batches.length}: Processing ${batch.length} ingredients...`);

      for (const ingredient of batch) {
        totalProcessed++;

        if (dryRun) {
          console.log(`  [DRY RUN] Would delete: ${ingredient.name} (ID: ${ingredient.id})`);
        } else {
          console.log(`  Deleting: ${ingredient.name} (ID: ${ingredient.id})`);

          const { error: deleteError } = await supabase
            .from('ingredients')
            .delete()
            .eq('id', ingredient.id);

          if (deleteError) {
            console.error(`  ❌ Error deleting ${ingredient.name}:`, deleteError);
          } else {
            console.log(`  ✅ Deleted ${ingredient.name}`);
            totalDeleted++;
          }

          // Small delay between deletions to be safe
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Batch ${batchIndex + 1} completed\n`);
    }

    // Step 6: Final verification
    console.log('🔍 FINAL VERIFICATION');
    console.log('====================');

    if (!dryRun) {
      const { count: finalCount } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact', head: true });

      console.log(`Ingredients remaining: ${finalCount}`);
      console.log(`Expected remaining: ${backupData.totalIngredients - backupData.unusedIngredients.length}`);
      console.log(`Total deleted: ${totalDeleted}`);
    }

    console.log('\n✅ CLEANUP COMPLETE');
    console.log('===================');
    console.log(`Processed: ${totalProcessed} ingredients`);
    console.log(`Deleted: ${totalDeleted} ingredients`);
    console.log(`Remaining: ${(backupData.totalIngredients - backupData.unusedIngredients) - totalDeleted} ingredients`);

    if (dryRun) {
      console.log('\n🔄 To perform actual cleanup, run:');
      console.log('npx tsx scripts/cleanup-unused-ingredients.ts --confirm');
    } else {
      console.log('\n📝 Backup file location: unused-ingredients-backup-2025-12-21.json');
      console.log('Use this file to restore ingredients if needed.');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const dryRun = !process.argv.includes('--confirm');
const batchSize = 10; // Conservative batch size

cleanupUnusedIngredients(dryRun, batchSize);
