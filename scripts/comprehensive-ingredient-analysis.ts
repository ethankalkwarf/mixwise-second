#!/usr/bin/env tsx

/**
 * Comprehensive analysis of ingredient usage in cocktail recipes
 * This script thoroughly investigates all aspects of ingredient-cocktail relationships
 */

import { sanityClient } from '../lib/sanityClient.js';

interface Ingredient {
  _id: string;
  name: string;
  slug: { current: string };
  type: string;
}

interface Cocktail {
  _id: string;
  name: string;
  slug: { current: string };
  ingredients: Array<{
    ingredient: {
      _id: string;
      name: string;
    };
  }>;
}

interface CocktailIngredient {
  cocktailId: string;
  cocktailName: string;
  ingredientId: string;
  ingredientName: string;
}

async function comprehensiveIngredientAnalysis() {
  console.log('🔬 COMPREHENSIVE INGREDIENT USAGE ANALYSIS');
  console.log('===========================================\n');

  try {
    // Step 1: Get all ingredients
    console.log('📋 Step 1: Fetching all ingredients...');
    const allIngredientsQuery = `*[_type == "ingredient"] {
      _id,
      name,
      slug,
      type
    }`;
    const allIngredients: Ingredient[] = await sanityClient.fetch(allIngredientsQuery);
    console.log(`✅ Found ${allIngredients.length} total ingredients\n`);

    // Step 2: Get all cocktails (including hidden ones)
    console.log('🍹 Step 2: Fetching all cocktails (including hidden)...');
    const allCocktailsQuery = `*[_type == "cocktail"] {
      _id,
      name,
      slug,
      hidden,
      ingredients[] {
        ingredient-> {
          _id,
          name
        }
      }
    }`;
    const allCocktails: Cocktail[] = await sanityClient.fetch(allCocktailsQuery);
    console.log(`✅ Found ${allCocktails.length} total cocktails\n`);

    // Step 3: Analyze cocktail visibility
    const visibleCocktails = allCocktails.filter(c => !c.hidden);
    const hiddenCocktails = allCocktails.filter(c => c.hidden);
    console.log(`📊 Cocktail breakdown:`);
    console.log(`   - Visible cocktails: ${visibleCocktails.length}`);
    console.log(`   - Hidden cocktails: ${hiddenCocktails.length}\n`);

    // Step 4: Extract ALL ingredient references from ALL cocktails
    console.log('🔗 Step 3: Extracting ALL ingredient references...');
    const allIngredientReferences: CocktailIngredient[] = [];

    allCocktails.forEach(cocktail => {
      if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
        cocktail.ingredients.forEach(ingredientRef => {
          if (ingredientRef.ingredient && ingredientRef.ingredient._id) {
            allIngredientReferences.push({
              cocktailId: cocktail._id,
              cocktailName: cocktail.name,
              ingredientId: ingredientRef.ingredient._id,
              ingredientName: ingredientRef.ingredient.name
            });
          }
        });
      }
    });

    console.log(`✅ Found ${allIngredientReferences.length} total ingredient references across all cocktails\n`);

    // Step 5: Get unique ingredient IDs used in recipes
    const usedIngredientIds = new Set(allIngredientReferences.map(ref => ref.ingredientId));
    console.log(`✅ Found ${usedIngredientIds.size} unique ingredients used in recipes\n`);

    // Step 6: Find truly unused ingredients
    console.log('🚨 Step 4: Finding unused ingredients...');
    const unusedIngredients = allIngredients.filter(ingredient =>
      !usedIngredientIds.has(ingredient._id)
    );

    // Step 7: Verify with reverse lookup (count references for each ingredient)
    console.log('🔍 Step 5: Verifying with reverse lookup...');
    const verificationResults = await Promise.all(
      allIngredients.map(async (ingredient) => {
        const countQuery = `count(*[_type == "cocktail" && references("${ingredient._id}")])`;
        const count = await sanityClient.fetch(countQuery);
        return {
          ingredient,
          directCount: count,
          foundInReferences: usedIngredientIds.has(ingredient._id)
        };
      })
    );

    // Step 8: Check for discrepancies
    const discrepancies = verificationResults.filter(result =>
      result.directCount > 0 !== result.foundInReferences
    );

    console.log(`\n🔍 VERIFICATION RESULTS:`);
    console.log(`   - Direct GROQ count matches: ${verificationResults.length - discrepancies.length}`);
    console.log(`   - Discrepancies found: ${discrepancies.length}`);

    if (discrepancies.length > 0) {
      console.log('\n⚠️  DISCREPANCIES FOUND:');
      discrepancies.forEach(d => {
        console.log(`   - ${d.ingredient.name}: Direct count = ${d.directCount}, Found in references = ${d.foundInReferences}`);
      });
    }

    // Step 9: Specifically check for "ginger" and other common ingredients
    console.log('\n🔎 Step 6: Checking specific ingredients mentioned by user...');
    const specificChecks = ['ginger', 'sugar', 'salt', 'water', 'ice', 'lime', 'lemon'];
    specificChecks.forEach(name => {
      const ingredient = allIngredients.find(i => i.name.toLowerCase().includes(name.toLowerCase()));
      if (ingredient) {
        const isUsed = usedIngredientIds.has(ingredient._id);
        const directCount = verificationResults.find(r => r.ingredient._id === ingredient._id)?.directCount || 0;
        console.log(`   - ${ingredient.name}: Used = ${isUsed}, Direct count = ${directCount}`);
      } else {
        console.log(`   - ${name}: NOT FOUND in ingredients`);
      }
    });

    // Step 10: Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE INGREDIENT USAGE REPORT');
    console.log('='.repeat(80));

    console.log(`\n📈 OVERVIEW:`);
    console.log(`   - Total ingredients: ${allIngredients.length}`);
    console.log(`   - Total cocktails: ${allCocktails.length}`);
    console.log(`   - Total ingredient references: ${allIngredientReferences.length}`);
    console.log(`   - Unique ingredients used: ${usedIngredientIds.size}`);
    console.log(`   - Unused ingredients: ${unusedIngredients.length}`);
    console.log(`   - Usage rate: ${((usedIngredientIds.size / allIngredients.length) * 100).toFixed(1)}%\n`);

    // Group unused ingredients by type
    const unusedByType = unusedIngredients.reduce((acc, ingredient) => {
      const type = ingredient.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);

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

    // Step 11: Show most used ingredients
    console.log('\n🥇 MOST USED INGREDIENTS:');
    const ingredientUsage = allIngredientReferences.reduce((acc, ref) => {
      acc[ref.ingredientId] = (acc[ref.ingredientId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedUsage = Object.entries(ingredientUsage)
      .map(([id, count]) => ({
        ingredient: allIngredients.find(i => i._id === id),
        count
      }))
      .filter(item => item.ingredient)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    sortedUsage.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.ingredient!.name} (${item.count} cocktails)`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(80));

    if (unusedIngredients.length > 0) {
      console.log(`\nFound ${unusedIngredients.length} unused ingredients that can be removed or hidden.`);
      console.log('\nOptions:');
      console.log('1. Delete from Sanity Studio');
      console.log('2. Add "hidden" field to ingredient schema');
      console.log('3. Filter out unused ingredients in the frontend');
    }

    if (discrepancies.length > 0) {
      console.log(`\n⚠️  Found ${discrepancies.length} discrepancies between direct counts and reference analysis.`);
      console.log('This indicates potential data integrity issues that should be investigated.');
    }

  } catch (error) {
    console.error('❌ Error in comprehensive analysis:', error);
    process.exit(1);
  }
}

// Run the comprehensive analysis
comprehensiveIngredientAnalysis();
