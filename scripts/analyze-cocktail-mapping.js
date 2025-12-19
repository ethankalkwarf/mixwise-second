// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function analyzeCocktailMapping() {
  console.log('🔍 Analyzing cocktail ID mapping...\n');

  try {
    // Get all cocktails
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, legacy_id, name')
      .order('name');

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    // Get all unique cocktail_ids from cocktail_ingredients
    const { data: ingredients, error: ingredientError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id')
      .order('cocktail_id');

    if (ingredientError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientError.message}`);
    }

    const uniqueCocktailIds = [...new Set(ingredients.map(i => i.cocktail_id))].sort((a, b) => a - b);

    console.log(`Found ${cocktails.length} cocktails and ${uniqueCocktailIds.length} unique cocktail_ids in ingredients`);

    // Try to find patterns
    console.log('\n🔍 Looking for mapping patterns...\n');

    // Check if cocktail_ids correspond to row numbers
    console.log('Checking if cocktail_ids correspond to cocktail array indices:');
    uniqueCocktailIds.slice(0, 10).forEach((id, index) => {
      if (id <= cocktails.length) {
        const cocktail = cocktails[id - 1]; // 1-based to 0-based
        if (cocktail) {
          console.log(`  ID ${id} → Index ${id - 1}: ${cocktail.name}`);
        }
      }
    });

    // Check if cocktail_ids correspond to legacy_id patterns
    console.log('\nChecking legacy_id patterns:');
    cocktails.slice(0, 10).forEach((cocktail, index) => {
      console.log(`  ${index + 1}: ${cocktail.name} (legacy: ${cocktail.legacy_id})`);
    });

    // Try to manually map some known cocktails
    console.log('\n🎯 Attempting manual mapping for common cocktails:');

    const knownMappings = [
      { numericId: 1, possibleName: 'americano', caseInsensitive: true },
      { numericId: 3, possibleName: 'martini', caseInsensitive: true },
      { numericId: 2672, possibleName: 'margarita', caseInsensitive: true }
    ];

    knownMappings.forEach(mapping => {
      const matches = cocktails.filter(c =>
        mapping.caseInsensitive
          ? c.name.toLowerCase().includes(mapping.possibleName) || (c.legacy_id && c.legacy_id.toLowerCase().includes(mapping.possibleName))
          : c.name.includes(mapping.possibleName) || c.legacy_id === mapping.possibleName
      );

      if (matches.length > 0) {
        console.log(`  ID ${mapping.numericId} → ${matches[0].name} (UUID: ${matches[0].id})`);
      } else {
        console.log(`  ID ${mapping.numericId} → No match found for "${mapping.possibleName}"`);
      }
    });

    console.log('\n📋 SUMMARY:');
    console.log(`- ${uniqueCocktailIds.length} unique numeric cocktail_ids in cocktail_ingredients`);
    console.log(`- ${cocktails.length} cocktails in cocktails table`);
    console.log('- Need to create mapping from numeric IDs to UUIDs');

  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeCocktailMapping();
