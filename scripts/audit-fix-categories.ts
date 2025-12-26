#!/usr/bin/env tsx

/**
 * Audit and fix ingredient categories
 * - Move citrus juices to "Citrus" category
 * - Move syrups to "Syrup" category
 * - Remove empty categories
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define category mappings
const categoryUpdates = [
  // Citrus ingredients to move from Mixer to Citrus
  { names: ['Fresh Lemon Juice', 'Fresh Lime Juice', 'Grapefruit Juice', 'Lemon Juice', 'Lime Juice', 'Orange Juice'], newCategory: 'Citrus' },

  // Syrup ingredients to move to Syrup
  { names: ['Honey Syrup', 'Mint Syrup', 'Honey', 'Sugar Syrup', 'Simple Syrup', 'Orgeat Syrup', 'Raspberry Syrup', 'Agave Syrup'], newCategory: 'Syrup' },

  // Ginger Syrup is currently in Spirit, move to Syrup
  { names: ['Ginger Syrup'], newCategory: 'Syrup' }
];

async function auditAndFixCategories(dryRun: boolean = true) {
  console.log(`🔧 CATEGORY AUDIT & FIX ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('=====================================\n');

  try {
    // Get all current ingredients
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name, category');

    if (error) {
      console.error('Error fetching ingredients:', error);
      return;
    }

    console.log(`📊 Current ingredients: ${ingredients?.length}\n`);

    // Show current category breakdown
    const currentCategories = {};
    ingredients?.forEach(ing => {
      const cat = ing.category || 'Uncategorized';
      currentCategories[cat] = (currentCategories[cat] || 0) + 1;
    });

    console.log('📂 Current category breakdown:');
    Object.entries(currentCategories).sort().forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} ingredients`);
    });

    console.log('\n🔄 PLANNED CATEGORY UPDATES:');
    let totalUpdates = 0;

    for (const update of categoryUpdates) {
      console.log(`\\nMoving to "${update.newCategory}":`);
      for (const name of update.names) {
        const ingredient = ingredients?.find(ing => ing.name === name);
        if (ingredient) {
          console.log(`  - ${name} (${ingredient.category} → ${update.newCategory})`);
          totalUpdates++;
        } else {
          console.log(`  ⚠️  ${name} not found`);
        }
      }
    }

    console.log(`\\n📈 Total planned updates: ${totalUpdates}\\n`);

    // Execute updates
    if (dryRun) {
      console.log('🧪 DRY RUN - No changes will be made');
      console.log('==================================\\n');
    } else {
      console.log('⚠️  LIVE UPDATE - Categories will be changed!');
      console.log('==============================================\\n');

      for (const update of categoryUpdates) {
        for (const name of update.names) {
          const ingredient = ingredients?.find(ing => ing.name === name);
          if (ingredient) {
            console.log(`Updating ${name}...`);

            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ category: update.newCategory })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error(`❌ Error updating ${name}:`, updateError);
            } else {
              console.log(`✅ Updated ${name} to ${update.newCategory}`);
            }

            // Small delay to be safe
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    }

    // Show final state
    console.log('\\n🔍 FINAL VERIFICATION');
    console.log('======================');

    if (!dryRun) {
      const { data: updatedIngredients, error: verifyError } = await supabase
        .from('ingredients')
        .select('id, name, category');

      if (verifyError) {
        console.error('Error verifying updates:', verifyError);
        return;
      }

      const finalCategories = {};
      updatedIngredients?.forEach(ing => {
        const cat = ing.category || 'Uncategorized';
        finalCategories[cat] = (finalCategories[cat] || 0) + 1;
      });

      console.log('\\n📂 Final category breakdown:');
      Object.entries(finalCategories).sort().forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} ingredients`);
      });

      console.log('\\n✅ CATEGORY UPDATES COMPLETE');
    }

  } catch (error) {
    console.error('❌ Error during category audit/fix:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const dryRun = !process.argv.includes('--confirm');

auditAndFixCategories(dryRun);
