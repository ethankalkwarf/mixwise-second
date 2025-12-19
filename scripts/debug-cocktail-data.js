// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function debugCocktailData() {
  console.log('🔍 Debugging cocktail data...\n');

  try {
    // Check cocktails table
    console.log('🍸 Cocktails table:');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, legacy_id, name')
      .limit(10);

    if (cocktailError) {
      console.error('Error fetching cocktails:', cocktailError);
    } else {
      console.log('First 10 cocktails:');
      cocktails.forEach(c => {
        console.log(`  ID: ${c.id}, Legacy ID: ${c.legacy_id}, Name: ${c.name}`);
      });
    }

    console.log('\n📊 Cocktail ingredients table:');
    const { data: ingredients, error: ingredientError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id')
      .limit(10);

    if (ingredientError) {
      console.error('Error fetching cocktail ingredients:', ingredientError);
    } else {
      console.log('First 10 cocktail ingredients:');
      ingredients.forEach(ci => {
        console.log(`  Cocktail ID: ${ci.cocktail_id}, Ingredient ID: ${ci.ingredient_id}`);
      });
    }

    // Check if cocktail_ids in cocktail_ingredients match any IDs in cocktails
    console.log('\n🔗 Checking relationships:');
    const cocktailIds = [...new Set(ingredients.map(ci => ci.cocktail_id))];
    const cocktailUUIDs = new Set(cocktails.map(c => c.id));

    console.log(`Unique cocktail_ids in cocktail_ingredients: ${cocktailIds.length}`);
    console.log(`Cocktail UUIDs in cocktails table: ${cocktailUUIDs.size}`);

    const matches = cocktailIds.filter(id => cocktailUUIDs.has(id));
    console.log(`Matching IDs: ${matches.length}`);

    if (matches.length === 0) {
      console.log('❌ No cocktail_ids in cocktail_ingredients match cocktail UUIDs!');
      console.log('This means the data was populated incorrectly.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugCocktailData();
