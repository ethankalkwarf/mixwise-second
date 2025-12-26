#!/usr/bin/env tsx

/**
 * Combine Lime Juice and Fresh Lime Juice ingredients
 * Keep "Lime Juice" as the canonical version and migrate all references
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function combineLimeJuices(dryRun: boolean = true) {
  console.log('🍋 COMBINING LIME JUICE INGREDIENTS');
  console.log('=====================================\n');

  try {
    // Step 1: Find both lime juice ingredients
    console.log('🔍 Finding lime juice ingredients...');
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name')
      .in('name', ['Lime Juice', 'Fresh Lime Juice']);

    if (error) {
      console.error('Error fetching ingredients:', error);
      return;
    }

    if (!ingredients || ingredients.length !== 2) {
      console.error('Expected to find exactly 2 lime juice ingredients');
      return;
    }

    const limeJuice = ingredients.find(ing => ing.name === 'Lime Juice');
    const freshLimeJuice = ingredients.find(ing => ing.name === 'Fresh Lime Juice');

    if (!limeJuice || !freshLimeJuice) {
      console.error('Could not identify both lime juice ingredients');
      return;
    }

    console.log(`✅ Found Lime Juice (ID: ${limeJuice.id})`);
    console.log(`✅ Found Fresh Lime Juice (ID: ${freshLimeJuice.id})\n`);

    // Step 2: Check current usage
    console.log('📊 Checking current usage...');
    const limeJuiceCount = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', limeJuice.id);

    const freshLimeJuiceCount = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('ingredient_id', freshLimeJuice.id);

    console.log(`- Lime Juice: ${limeJuiceCount.count} cocktails`);
    console.log(`- Fresh Lime Juice: ${freshLimeJuiceCount.count} cocktails`);
    console.log(`- Total to migrate: ${freshLimeJuiceCount.count} references\n`);

    // Step 3: Plan the migration
    console.log('📋 MIGRATION PLAN:');
    console.log('==================');
    console.log(`1. Update ${freshLimeJuiceCount.count} cocktail_ingredients records`);
    console.log('2. Change ingredient_id from', freshLimeJuice.id, 'to', limeJuice.id);
    console.log('3. Delete the Fresh Lime Juice ingredient');
    console.log('4. Lime Juice becomes the canonical version\n');

    if (dryRun) {
      console.log('🧪 DRY RUN - No changes will be made');
      console.log('===================================\n');
    } else {
      console.log('⚠️  LIVE MIGRATION - Data will be modified!');
      console.log('=============================================\n');

      // Step 4: Execute the migration
      console.log('🔄 Starting migration...');

      // Update all cocktail_ingredients references
      console.log('Updating cocktail ingredient references...');
      const { error: updateError } = await supabase
        .from('cocktail_ingredients')
        .update({ ingredient_id: limeJuice.id })
        .eq('ingredient_id', freshLimeJuice.id);

      if (updateError) {
        console.error('❌ Error updating references:', updateError);
        return;
      }

      console.log(`✅ Updated ${freshLimeJuiceCount.count} references`);

      // Delete the duplicate ingredient
      console.log('Deleting duplicate ingredient...');
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', freshLimeJuice.id);

      if (deleteError) {
        console.error('❌ Error deleting ingredient:', deleteError);
        return;
      }

      console.log('✅ Deleted Fresh Lime Juice ingredient');
    }

    // Step 5: Verification
    console.log('\n🔍 VERIFICATION');
    console.log('================');

    if (!dryRun) {
      // Check final state
      const finalLimeJuiceCount = await supabase
        .from('cocktail_ingredients')
        .select('*', { count: 'exact', head: true })
        .eq('ingredient_id', limeJuice.id);

      const freshLimeJuiceExists = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', 'Fresh Lime Juice');

      console.log(`- Lime Juice final count: ${finalLimeJuiceCount.count} cocktails`);
      console.log(`- Fresh Lime Juice still exists: ${freshLimeJuiceExists.data?.length ? 'YES' : 'NO'}`);
      console.log(`- Expected final count: ${limeJuiceCount.count + freshLimeJuiceCount.count}`);
    }

    console.log('\n✅ MIGRATION COMPLETE');
    console.log('======================');
    console.log('Lime Juice and Fresh Lime Juice have been combined.');
    console.log('All cocktail recipes now use the canonical "Lime Juice" ingredient.');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const dryRun = !process.argv.includes('--confirm');

combineLimeJuices(dryRun);
