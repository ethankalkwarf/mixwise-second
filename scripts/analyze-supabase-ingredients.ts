#!/usr/bin/env tsx

/**
 * Analyze ingredient usage based on Supabase cocktail data (the actual data source for the site)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

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

interface SupabaseCocktailIngredient {
  cocktail_id: number;
  ingredient_id: number;
  measure: string;
}

async function analyzeSupabaseIngredients() {
  console.log('🔬 INGREDIENT USAGE ANALYSIS (Supabase Data)');
  console.log('=============================================\n');

  try {
    // Step 1: Get all cocktails from Supabase
    console.log('📊 Step 1: Fetching Supabase cocktails...');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name, slug');

    if (cocktailError) {
      console.error('Error fetching cocktails:', cocktailError);
      return;
    }

    console.log(`✅ Found ${cocktails?.length || 0} cocktails in Supabase\n`);

    // Step 2: Get all ingredients from Supabase
    console.log('📋 Step 2: Fetching Supabase ingredients...');
    const { data: ingredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name, category, is_staple');

    if (ingredientError) {
      console.error('Error fetching ingredients:', ingredientError);
      return;
    }

    console.log(`✅ Found ${ingredients?.length || 0} ingredients in Supabase\n`);

    // Step 3: Get all cocktail-ingredient relationships
    console.log('🔗 Step 3: Fetching cocktail-ingredient relationships...');
    const { data: cocktailIngredients, error: relationError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure');

    if (relationError) {
      console.error('Error fetching relationships:', relationError);
      return;
    }

    console.log(`✅ Found ${cocktailIngredients?.length || 0} ingredient references\n`);

    // Step 4: Analyze ingredient usage
    console.log('📈 Step 4: Analyzing ingredient usage...');
    const ingredientUsage = new Map<string, number>();
    const usedIngredientIds = new Set<string>();

    cocktailIngredients?.forEach(rel => {
      usedIngredientIds.add(rel.ingredient_id);
      ingredientUsage.set(rel.ingredient_id, (ingredientUsage.get(rel.ingredient_id) || 0) + 1);
    });

    console.log(`✅ Found ${usedIngredientIds.size} unique ingredients used in recipes\n`);

    // Step 5: Find unused ingredients
    console.log('🚨 Step 5: Finding unused ingredients...');
    const unusedIngredients = ingredients?.filter(ing => !usedIngredientIds.has(ing.id)) || [];

    // Step 6: Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUPABASE INGREDIENT USAGE REPORT');
    console.log('='.repeat(80));

    console.log(`\n📈 OVERVIEW:`);
    console.log(`   - Total cocktails: ${cocktails?.length || 0}`);
    console.log(`   - Total ingredients: ${ingredients?.length || 0}`);
    console.log(`   - Total ingredient references: ${cocktailIngredients?.length || 0}`);
    console.log(`   - Unique ingredients used: ${usedIngredientIds.size}`);
    console.log(`   - Unused ingredients: ${unusedIngredients.length}`);
    console.log(`   - Usage rate: ${ingredients?.length ? ((usedIngredientIds.size / ingredients.length) * 100).toFixed(1) : '0'}%\n`);

    // Group unused ingredients by category
    const unusedByType = unusedIngredients.reduce((acc, ingredient) => {
      const type = ingredient.category || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ingredient);
      return acc;
    }, {} as Record<string, SupabaseIngredient[]>);

    if (unusedIngredients.length > 0) {
      console.log('🚨 UNUSED INGREDIENTS BY TYPE:');

      const typeOrder = ['spirit', 'liqueur', 'wine', 'beer', 'mixer', 'citrus', 'syrup', 'bitters', 'garnish', 'other'];
      typeOrder.forEach(type => {
        if (unusedByType[type] && unusedByType[type].length > 0) {
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
          console.log(`\n${typeLabel}s (${unusedByType[type].length}):`);
          unusedByType[type].forEach(ingredient => {
            console.log(`  - ${ingredient.name}`);
          });
        }
      });

      // Show any other types
      Object.keys(unusedByType).forEach(type => {
        if (!typeOrder.includes(type)) {
          console.log(`\n${type.charAt(0).toUpperCase() + type.slice(1)}s (${unusedByType[type].length}):`);
          unusedByType[type].forEach(ingredient => {
            console.log(`  - ${ingredient.name}`);
          });
        }
      });
    } else {
      console.log('🎉 All ingredients are being used!');
    }

    // Most used ingredients
    console.log('\n🥇 MOST USED INGREDIENTS:');
    const sortedUsage = Array.from(ingredientUsage.entries())
      .map(([id, count]) => ({
        ingredient: ingredients?.find(i => i.id === id),
        count
      }))
      .filter(item => item.ingredient)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    sortedUsage.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.ingredient!.name} (${item.count} cocktails)`);
    });

    // Check for staple ingredients that are unused
    console.log('\n🏠 STAPLE INGREDIENT CHECK:');
    const stapleUnused = unusedIngredients.filter(ing => ing.is_staple);

    if (stapleUnused.length > 0) {
      console.log('⚠️  These staple ingredients are unused:');
      stapleUnused.forEach(ing => {
        console.log(`  - ${ing.name} (${ing.category})`);
      });
    } else {
      console.log('✅ All staple ingredients are in use');
    }

    console.log('\n' + '='.repeat(80));
    console.log('💡 ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    console.log(`\nThe site actually uses ${cocktails?.length || 0} cocktails from Supabase, not the 434 from Sanity.`);
    console.log(`Based on the actual site data, there are ${unusedIngredients.length} unused ingredients.`);

    if (unusedIngredients.length > 0) {
      console.log('\nRecommendations:');
      console.log('1. Remove unused ingredients from Supabase');
      console.log('2. Update ingredient directory to hide unused items');
      console.log('3. Consider if staple ingredients should be kept for future recipes');
    }

  } catch (error) {
    console.error('❌ Error in Supabase analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeSupabaseIngredients();
