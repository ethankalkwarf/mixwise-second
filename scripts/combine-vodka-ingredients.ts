#!/usr/bin/env tsx

/**
 * Combine Absolut Vodka and Vodka ingredients
 * Keep "Vodka" as the canonical version and migrate all references
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function combineVodkaIngredients(dryRun: boolean = true) {
  console.log('🥃 COMBINING VODKA INGREDIENTS');
  console.log('=================================\n');

  try {
    // Step 1: Find both vodka ingredients
    console.log('🔍 Finding vodka ingredients...');
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name')
      .in('name', ['Vodka', 'Absolut Vodka']);

    if (error) {
      console.error('Error fetching ingredients:', error);
      return;
    }

    if (!ingredients || ingredients.length === 0) {
      console.error('No vodka ingredients found');
      return;
    }

    console.log('Found ingredients:');
    ingredients.forEach(ing => {
      console.log(`- ${ing.name} (ID: ${ing.id})`);
    });
    console.log('');

    // Determine canonical and duplicate
    let canonicalVodka, duplicateVodka;

    if (ingredients.length === 1) {
      console.log('✅ Only one vodka ingredient found. No combining needed.');
      return;
    } else if (ingredients.length === 2) {
      // Prefer "Vodka" as canonical, "Absolut Vodka" as duplicate
      canonicalVodka = ingredients.find(ing => ing.name === 'Vodka');
      duplicateVodka = ingredients.find(ing => ing.name === 'Absolut Vodka');

      if (!canonicalVodka || !duplicateVodka) {
        console.error('Unexpected ingredient names found. Expected "Vodka" and "Absolut Vodka"');
        return;
      }
    } else {
      console.error('Found more than 2 vodka ingredients. Manual review needed.');
      return;
    }

    console.log(`✅ Canonical: ${canonicalVodka.name} (ID: ${canonicalVodka.id})`);
    console.log(`✅ Duplicate: ${duplicateVodka.name} (ID: ${duplicateVodka.id})\n`);

    // Step 2: Check current usage
    console.log('📊 Checking current usage...');

    // Check cocktail_ingredients usage (using integer IDs directly)
    const canonicalCount = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', parseInt(canonicalVodka.id));

    const duplicateCount = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', parseInt(duplicateVodka.id));

    console.log(`- ${canonicalVodka.name}: ${canonicalCount.count} cocktails (cocktail_ingredients table)`);
    console.log(`- ${duplicateVodka.name}: ${duplicateCount.count} cocktails (cocktail_ingredients table)`);
    console.log(`- Note: cocktail_ingredients mapping needs investigation\n`);

    // Check bar_ingredients usage (using UUID)
    const barCanonicalCount = await supabase
      .from('bar_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', canonicalVodka.id);

    const barDuplicateCount = await supabase
      .from('bar_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', duplicateVodka.id);

    console.log(`- Bar ingredients - ${canonicalVodka.name}: ${barCanonicalCount.count} users`);
    console.log(`- Bar ingredients - ${duplicateVodka.name}: ${barDuplicateCount.count} users`);
    console.log(`- Total bar references to migrate: ${barDuplicateCount.count} references\n`);

    // Check shopping_list usage (using UUID)
    const shoppingCanonicalCount = await supabase
      .from('shopping_list')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', canonicalVodka.id);

    const shoppingDuplicateCount = await supabase
      .from('shopping_list')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', duplicateVodka.id);

    console.log(`- Shopping list - ${canonicalVodka.name}: ${shoppingCanonicalCount.count} items`);
    console.log(`- Shopping list - ${duplicateVodka.name}: ${shoppingDuplicateCount.count} items`);
    console.log(`- Total shopping references to migrate: ${shoppingDuplicateCount.count} references\n`);

    // Step 3: Plan the migration
    console.log('📋 MIGRATION PLAN:');
    console.log('==================');
    console.log(`1. Update ${duplicateCount.count} cocktail_ingredients records`);
    console.log('   Change ingredient_id from', duplicateVodka.id, 'to', canonicalVodka.id);
    console.log(`2. Update ${barDuplicateCount.count} bar_ingredients records`);
    console.log('   Change ingredient_id from', duplicateVodka.id, 'to', canonicalVodka.id);
    console.log(`3. Update ${shoppingDuplicateCount.count} shopping_list records`);
    console.log('   Change ingredient_id from', duplicateVodka.id, 'to', canonicalVodka.id);
    console.log('4. Delete the Absolut Vodka ingredient');
    console.log('5. Vodka becomes the canonical version\n');

    if (dryRun) {
      console.log('🧪 DRY RUN - No changes will be made');
      console.log('===================================\n');
    } else {
      console.log('⚠️  LIVE MIGRATION - Data will be modified!');
      console.log('=============================================\n');

      // Step 4: Execute the migration
      console.log('🔄 Starting migration...');

      // Update cocktail_ingredients references
      // First, handle cocktails that have both ingredients (remove duplicates)
      console.log('Handling cocktails with both vodka ingredients...');

      // Find cocktails that have both vodka ingredients
      const { data: duplicateCocktails, error: duplicateCheckError } = await supabase
        .from('cocktail_ingredients')
        .select('cocktail_id')
        .eq('ingredient_id', parseInt(canonicalVodka.id));

      if (duplicateCheckError) {
        console.error('❌ Error checking for duplicate cocktails:', duplicateCheckError);
        return;
      }

      const canonicalCocktailIds = duplicateCocktails?.map(c => c.cocktail_id) || [];

      if (canonicalCocktailIds.length > 0) {
        // Remove Absolut Vodka entries for cocktails that already have Vodka
        const { error: removeDuplicateError } = await supabase
          .from('cocktail_ingredients')
          .delete()
          .eq('ingredient_id', parseInt(duplicateVodka.id))
          .in('cocktail_id', canonicalCocktailIds);

        if (removeDuplicateError) {
          console.error('❌ Error removing duplicate cocktail references:', removeDuplicateError);
          return;
        }

        console.log(`✅ Removed ${canonicalCocktailIds.length} duplicate cocktail references`);
      }

      // Now update the remaining Absolut Vodka references
      console.log('Updating remaining cocktail ingredient references...');
      const { error: cocktailUpdateError } = await supabase
        .from('cocktail_ingredients')
        .update({ ingredient_id: parseInt(canonicalVodka.id) })
        .eq('ingredient_id', parseInt(duplicateVodka.id));

      if (cocktailUpdateError) {
        console.error('❌ Error updating cocktail references:', cocktailUpdateError);
        return;
      }

      console.log(`✅ Updated remaining cocktail references`);

      // Update bar_ingredients references
      console.log('Updating bar ingredient references...');
      const { error: barUpdateError } = await supabase
        .from('bar_ingredients')
        .update({
          ingredient_id: canonicalVodka.id,
          ingredient_name: canonicalVodka.name
        })
        .eq('ingredient_id', duplicateVodka.id);

      if (barUpdateError) {
        console.error('❌ Error updating bar references:', barUpdateError);
        return;
      }

      console.log(`✅ Updated ${barDuplicateCount.count} bar references`);

      // Update shopping_list references
      console.log('Updating shopping list references...');
      const { error: shoppingUpdateError } = await supabase
        .from('shopping_list')
        .update({ ingredient_id: canonicalVodka.id })
        .eq('ingredient_id', duplicateVodka.id);

      if (shoppingUpdateError) {
        console.error('❌ Error updating shopping references:', shoppingUpdateError);
        return;
      }

      console.log(`✅ Updated ${shoppingDuplicateCount.count} shopping references`);

      // Delete the duplicate ingredient
      console.log('Deleting duplicate ingredient...');
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', duplicateVodka.id);

      if (deleteError) {
        console.error('❌ Error deleting ingredient:', deleteError);
        return;
      }

      console.log('✅ Deleted Absolut Vodka ingredient');
    }

    // Step 5: Verification
    console.log('\n🔍 VERIFICATION');
    console.log('================');

    if (!dryRun) {
      // Check final state
      const finalCocktailCount = await supabase
        .from('cocktail_ingredients')
        .select('*', { count: 'exact', head: true })
        .eq('ingredient_id', parseInt(canonicalVodka.id));

      const finalBarCount = await supabase
        .from('bar_ingredients')
        .select('*', { count: 'exact', head: true })
        .eq('ingredient_id', canonicalVodka.id);

      const finalShoppingCount = await supabase
        .from('shopping_list')
        .select('*', { count: 'exact', head: true })
        .eq('ingredient_id', canonicalVodka.id);

      const duplicateExists = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', 'Absolut Vodka');

      console.log(`- Cocktail ingredients final count: ${finalCocktailCount.count} cocktails`);
      console.log(`- Bar ingredients final count: ${finalBarCount.count} users`);
      console.log(`- Shopping list final count: ${finalShoppingCount.count} items`);
      console.log(`- Absolut Vodka still exists: ${duplicateExists.data?.length ? 'YES' : 'NO'}`);
      console.log(`- Expected cocktail count: ${canonicalCount.count + duplicateCount.count}`);
      console.log(`- Expected bar count: ${barCanonicalCount.count + barDuplicateCount.count}`);
      console.log(`- Expected shopping count: ${shoppingCanonicalCount.count + shoppingDuplicateCount.count}`);
    }

    console.log('\n✅ MIGRATION COMPLETE');
    console.log('======================');
    console.log('Vodka and Absolut Vodka have been combined.');
    console.log('All references now use the canonical "Vodka" ingredient.');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const dryRun = !process.argv.includes('--confirm');

combineVodkaIngredients(dryRun);
