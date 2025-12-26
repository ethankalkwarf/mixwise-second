#!/usr/bin/env tsx

/**
 * Script to find ingredients that are not used in any cocktail recipes
 * This helps identify ingredients that can be removed or hidden from the site
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
  ingredients: Array<{
    ingredient: {
      _id: string;
      name: string;
    };
  }>;
}

async function findUnusedIngredients() {
  console.log('🔍 Analyzing ingredients usage in cocktail recipes...\n');

  try {
    // Query all ingredients
    console.log('📋 Fetching all ingredients...');
    const ingredientsQuery = `*[_type == "ingredient"] {
      _id,
      name,
      slug,
      type
    }`;
    const ingredients: Ingredient[] = await sanityClient.fetch(ingredientsQuery);
    console.log(`✅ Found ${ingredients.length} ingredients\n`);

    // Query all cocktails with their ingredients
    console.log('🍹 Fetching all cocktails with ingredients...');
    const cocktailsQuery = `*[_type == "cocktail" && !hidden] {
      _id,
      name,
      ingredients[] {
        ingredient-> {
          _id,
          name
        }
      }
    }`;
    const cocktails: Cocktail[] = await sanityClient.fetch(cocktailsQuery);
    console.log(`✅ Found ${cocktails.length} cocktails\n`);

    // Extract all used ingredient IDs
    console.log('🔗 Extracting ingredient references...');
    const usedIngredientIds = new Set<string>();
    cocktails.forEach(cocktail => {
      cocktail.ingredients?.forEach(ingredientRef => {
        if (ingredientRef.ingredient?._id) {
          usedIngredientIds.add(ingredientRef.ingredient._id);
        }
      });
    });
    console.log(`✅ Found ${usedIngredientIds.size} unique ingredients used in recipes\n`);

    // Find unused ingredients
    console.log('🚨 Finding unused ingredients...');
    const unusedIngredients = ingredients.filter(ingredient =>
      !usedIngredientIds.has(ingredient._id)
    );

    // Group unused ingredients by type
    const unusedByType = unusedIngredients.reduce((acc, ingredient) => {
      const type = ingredient.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);

    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('📊 UNUSED INGREDIENTS REPORT');
    console.log('='.repeat(80));
    console.log(`\nTotal ingredients: ${ingredients.length}`);
    console.log(`Ingredients used in recipes: ${usedIngredientIds.size}`);
    console.log(`Unused ingredients: ${unusedIngredients.length}`);
    console.log(`Usage rate: ${((usedIngredientIds.size / ingredients.length) * 100).toFixed(1)}%\n`);

    if (unusedIngredients.length === 0) {
      console.log('🎉 All ingredients are being used! No unused ingredients found.');
      return;
    }

    // Display unused ingredients by type
    const typeOrder = ['spirit', 'liqueur', 'wine', 'beer', 'mixer', 'citrus', 'syrup', 'bitters', 'garnish', 'other'];
    typeOrder.forEach(type => {
      if (unusedByType[type] && unusedByType[type].length > 0) {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        console.log(`\n${typeLabel}s (${unusedByType[type].length}):`);
        unusedByType[type].forEach(ingredient => {
          console.log(`  - ${ingredient.name} (${ingredient.slug.current})`);
        });
      }
    });

    // Show any other types not in the predefined list
    Object.keys(unusedByType).forEach(type => {
      if (!typeOrder.includes(type)) {
        console.log(`\n${type.charAt(0).toUpperCase() + type.slice(1)}s (${unusedByType[type].length}):`);
        unusedByType[type].forEach(ingredient => {
          console.log(`  - ${ingredient.name} (${ingredient.slug.current})`);
        });
      }
    });

    // Summary for action items
    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(80));
    console.log('\nTo clean up unused ingredients, you can:');
    console.log('1. Remove them entirely from Sanity Studio');
    console.log('2. Add a "hidden" or "disabled" field to the ingredient schema');
    console.log('3. Update the ingredients page to filter out unused ingredients');
    console.log('\nThe following ingredients should be reviewed:');

    // List all unused ingredients with their IDs for easy reference
    unusedIngredients.forEach(ingredient => {
      console.log(`  - ${ingredient.name} (ID: ${ingredient._id})`);
    });

  } catch (error) {
    console.error('❌ Error analyzing ingredients:', error);
    process.exit(1);
  }
}

// Run the analysis
findUnusedIngredients();
