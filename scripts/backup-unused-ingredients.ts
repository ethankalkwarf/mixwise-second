#!/usr/bin/env tsx

/**
 * Backup unused ingredients before cleanup
 * Creates a comprehensive backup of all unused ingredients with full details
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';

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

async function backupUnusedIngredients() {
  console.log('💾 BACKING UP UNUSED INGREDIENTS');
  console.log('================================\n');

  try {
    // Step 1: Get all ingredients
    console.log('📋 Fetching all ingredients...');
    const { data: ingredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('*');

    if (ingredientError) {
      console.error('Error fetching ingredients:', ingredientError);
      return;
    }

    console.log(`✅ Found ${ingredients?.length || 0} ingredients\n`);

    // Step 2: Get cocktail-ingredient relationships
    console.log('🔗 Fetching cocktail-ingredient relationships...');
    const { data: cocktailIngredients, error: relationError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure');

    if (relationError) {
      console.error('Error fetching relationships:', relationError);
      return;
    }

    console.log(`✅ Found ${cocktailIngredients?.length || 0} relationships\n`);

    // Step 3: Get cocktail count
    const { count: cocktailsCount } = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true });

    // Step 4: Analyze usage
    console.log('📈 Analyzing ingredient usage...');
    const usedIngredientIds = new Set<number>();
    cocktailIngredients?.forEach(rel => {
      usedIngredientIds.add(rel.ingredient_id);
    });

    const unusedIngredients = ingredients?.filter(ing => !usedIngredientIds.has(ing.id)) || [];

    console.log(`✅ Found ${usedIngredientIds.size} used ingredients`);
    console.log(`✅ Found ${unusedIngredients.length} unused ingredients\n`);

    // Step 5: Create backup data
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      totalIngredients: ingredients?.length || 0,
      usedIngredients: usedIngredientIds.size,
      unusedIngredients: unusedIngredients.length,
      usageRate: `${((usedIngredientIds.size / (ingredients?.length || 1)) * 100).toFixed(1)}%`,
      unusedIngredients: unusedIngredients,
      metadata: {
        cocktailsCount: cocktailsCount || 0,
        relationshipsCount: cocktailIngredients?.length || 0
      }
    };

    // Step 6: Save backup to file
    const backupFilename = `unused-ingredients-backup-${new Date().toISOString().split('T')[0]}.json`;
    writeFileSync(backupFilename, JSON.stringify(backupData, null, 2));

    console.log(`💾 Backup saved to: ${backupFilename}\n`);

    // Step 7: Generate summary report
    console.log('📊 BACKUP SUMMARY');
    console.log('================');
    console.log(`Timestamp: ${backupData.timestamp}`);
    console.log(`Total Ingredients: ${backupData.totalIngredients}`);
    console.log(`Used Ingredients: ${backupData.usedIngredients}`);
    console.log(`Unused Ingredients: ${backupData.unusedIngredients}`);
    console.log(`Usage Rate: ${backupData.usageRate}`);
    console.log(`Cocktails: ${backupData.metadata.cocktailsCount}`);
    console.log(`Relationships: ${backupData.metadata.relationshipsCount}\n`);

    // Group unused ingredients by category for review
    const unusedByCategory = unusedIngredients.reduce((acc, ingredient) => {
      const category = ingredient.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ingredient);
      return acc;
    }, {} as Record<string, SupabaseIngredient[]>);

    console.log('🚨 UNUSED INGREDIENTS BY CATEGORY:');
    Object.entries(unusedByCategory)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([category, ingredients]) => {
        console.log(`  ${category}: ${ingredients.length} ingredients`);
      });

    console.log('\n✅ BACKUP COMPLETE');
    console.log('==================');
    console.log(`File: ${backupFilename}`);
    console.log('This backup contains all unused ingredients and can be used to restore them if needed.');
    console.log('Review the backup file before proceeding with cleanup.');

  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  }
}

// Run the backup
backupUnusedIngredients();
