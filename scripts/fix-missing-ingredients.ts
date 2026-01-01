#!/usr/bin/env node

/**
 * Fix script for missing ingredient data
 * 
 * This script attempts to repair cocktails with missing ingredient data by:
 * 1. Checking the cocktail_ingredients junction table
 * 2. Populating the cocktails.ingredients JSONB field from junction table
 * 3. Verifying ingredient mappings
 * 4. Reporting what was fixed
 * 
 * Usage:
 *   npx ts-node scripts/fix-missing-ingredients.ts --dry-run
 *   npx ts-node scripts/fix-missing-ingredients.ts --apply
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Missing SUPABASE credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface FixReport {
  timestamp: string;
  dryRun: boolean;
  totalCocktails: number;
  fixedCount: number;
  alreadyValidCount: number;
  failedCount: number;
  skippedCount: number;
  fixed: Array<{
    id: string;
    name: string;
    ingredientCount: number;
  }>;
  failed: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');

  if (!dryRun && !apply) {
    console.log(`
📋 Fix Missing Ingredients Script

Usage:
  npx ts-node scripts/fix-missing-ingredients.ts --dry-run    (Preview changes)
  npx ts-node scripts/fix-missing-ingredients.ts --apply      (Apply fixes)

This script will:
1. Find cocktails with missing/empty ingredients in the ingredients JSONB field
2. Look for ingredient data in the cocktail_ingredients table
3. Populate the cocktails.ingredients field
4. Report what was fixed

Run with --dry-run first to see what would happen!
    `);
    process.exit(0);
  }

  try {
    console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made\n' : '⚠️  LIVE MODE - Changes will be applied\n');
    console.log('Starting ingredient data repair...\n');

    const report: FixReport = {
      timestamp: new Date().toISOString(),
      dryRun,
      totalCocktails: 0,
      fixedCount: 0,
      alreadyValidCount: 0,
      failedCount: 0,
      skippedCount: 0,
      fixed: [],
      failed: [],
    };

    // Get all cocktails with their current ingredients
    console.log('📥 Fetching cocktails from database...');
    const { data: cocktails, error: fetchError } = await supabase
      .from('cocktails')
      .select('id, name, ingredients')
      .order('name');

    if (fetchError || !cocktails) {
      console.error('❌ Failed to fetch cocktails:', fetchError);
      process.exit(1);
    }

    report.totalCocktails = cocktails.length;
    console.log(`✅ Retrieved ${cocktails.length} cocktails\n`);

    // Get all ingredient names for mapping
    console.log('📥 Fetching ingredients list...');
    const { data: ingredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name');

    if (ingError || !ingredients) {
      console.error('❌ Failed to fetch ingredients:', ingError);
      process.exit(1);
    }

    const ingredientNameToId = new Map<string, string>();
    ingredients.forEach(ing => {
      ingredientNameToId.set(ing.name.toLowerCase(), String(ing.id));
    });

    console.log(`✅ Retrieved ${ingredients.length} ingredients\n`);

    // Process each cocktail
    console.log('🔧 Processing cocktails...\n');

    for (const cocktail of cocktails) {
      try {
        // Check if cocktail already has valid ingredients
        const hasValidIngredients =
          cocktail.ingredients &&
          Array.isArray(cocktail.ingredients) &&
          cocktail.ingredients.length > 0;

        if (hasValidIngredients) {
          report.alreadyValidCount++;
          continue;
        }

        // Try to get ingredients from cocktail_ingredients table
        const { data: cocktailIngredients, error: ingError } = await supabase
          .from('cocktail_ingredients')
          .select('id, ingredient_id, measure, is_optional')
          .eq('cocktail_id', cocktail.id);

        if (ingError) {
          report.failed.push({
            id: cocktail.id,
            name: cocktail.name,
            reason: `Failed to query ingredients: ${ingError.message}`,
          });
          report.failedCount++;
          continue;
        }

        if (!cocktailIngredients || cocktailIngredients.length === 0) {
          report.skippedCount++;
          continue;
        }

        // Build new ingredients array
        const newIngredients = cocktailIngredients
          .map(ci => {
            const ingredientId = String(ci.ingredient_id);
            const ingredientName = ingredients.find(i => String(i.id) === ingredientId)?.name || 'Unknown';

            return {
              id: ingredientId,
              name: ingredientName,
              amount: ci.measure || null,
              isOptional: ci.is_optional || false,
              notes: null,
            };
          })
          .filter(ing => ing.name !== 'Unknown');

        if (newIngredients.length === 0) {
          report.skippedCount++;
          continue;
        }

        // Apply the fix
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('cocktails')
            .update({ ingredients: newIngredients })
            .eq('id', cocktail.id);

          if (updateError) {
            report.failed.push({
              id: cocktail.id,
              name: cocktail.name,
              reason: `Update failed: ${updateError.message}`,
            });
            report.failedCount++;
            continue;
          }
        }

        report.fixed.push({
          id: cocktail.id,
          name: cocktail.name,
          ingredientCount: newIngredients.length,
        });
        report.fixedCount++;

        if (report.fixedCount % 20 === 0) {
          console.log(`  ... processed ${report.fixedCount} fixes so far`);
        }
      } catch (error) {
        report.failed.push({
          id: cocktail.id,
          name: cocktail.name,
          reason: `Unexpected error: ${error}`,
        });
        report.failedCount++;
      }
    }

    // Print report
    console.log(`
╔════════════════════════════════════════╗
║       INGREDIENT REPAIR REPORT          ║
╠════════════════════════════════════════╣
║ Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}
║ Total cocktails: ${report.totalCocktails}
║ Already valid: ${report.alreadyValidCount}
║ Fixed: ${report.fixedCount} ${dryRun ? '(would fix)' : '(FIXED)'}
║ Failed: ${report.failedCount}
║ Skipped (no ingredient data): ${report.skippedCount}
╚════════════════════════════════════════╝
    `);

    if (report.fixedCount > 0) {
      console.log(`✅ First 10 fixed cocktails:`);
      report.fixed.slice(0, 10).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} (${c.ingredientCount} ingredients)`);
      });
    }

    if (report.failedCount > 0) {
      console.log(`\n❌ Failed cocktails:`);
      report.failed.slice(0, 10).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name}: ${c.reason}`);
      });
    }

    // Save report
    const fs = await import('fs/promises');
    await fs.writeFile(
      'ingredient-repair-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    console.log('\n📁 Full report saved to: ingredient-repair-report.json');

    // Final message
    if (dryRun) {
      console.log('\n✅ Dry run complete! Review the results above.');
      console.log('   To apply these fixes, run: npx ts-node scripts/fix-missing-ingredients.ts --apply\n');
    } else {
      console.log('\n✅ Ingredient repair complete!');
      console.log('   Reload the app to see fixed cocktails.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Repair script failed:', error);
    process.exit(1);
  }
}

main();

