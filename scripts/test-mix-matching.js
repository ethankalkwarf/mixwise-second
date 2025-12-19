// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testMixMatching() {
  console.log('🧪 Testing Mix Tool matching logic...\n');

  try {
    // Get cocktails with ingredients (simulate getCocktailsWithIngredients)
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name')
      .limit(100); // Get first 100 to include Margarita

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    // Create mapping from numeric ID to UUID
    const numericIdToUUID = new Map();
    cocktails.forEach((cocktail, index) => {
      numericIdToUUID.set(index + 1, cocktail.id);
    });

    // Get cocktail ingredients
    const { data: cocktailIngredients, error: ciError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure');

    if (ciError) {
      throw new Error(`Failed to fetch cocktail ingredients: ${ciError.message}`);
    }

    // Get ingredient names
    const { data: ingredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name');

    if (ingError) {
      throw new Error(`Failed to fetch ingredients: ${ingError.message}`);
    }

    const ingredientNameById = new Map();
    ingredients.forEach(ing => {
      ingredientNameById.set(String(ing.id), ing.name);
    });

    // Build cocktails with ingredients
    const cocktailsWithIngredients = new Map();
    cocktailIngredients.forEach(ci => {
      const cocktailUUID = numericIdToUUID.get(ci.cocktail_id);
      if (!cocktailUUID) return;

      if (!cocktailsWithIngredients.has(cocktailUUID)) {
        const cocktail = cocktails.find(c => c.id === cocktailUUID);
        cocktailsWithIngredients.set(cocktailUUID, {
          id: cocktailUUID,
          name: cocktail?.name || 'Unknown',
          ingredientsWithIds: []
        });
      }

      const ingredient = {
        id: String(ci.ingredient_id),
        name: ingredientNameById.get(String(ci.ingredient_id)) || 'Unknown',
        amount: ci.measure || null,
        isOptional: false,
        notes: null
      };

      cocktailsWithIngredients.get(cocktailUUID).ingredientsWithIds.push(ingredient);
    });

    const cocktailsArray = Array.from(cocktailsWithIngredients.values());

    console.log(`📊 Built ${cocktailsArray.length} cocktails with ingredients`);

    // Test matching with Margarita ingredients
    console.log('\n🍸 Testing Margarita matching...');

    const margarita = cocktailsArray.find(c => c.name === 'Margarita');
    if (margarita) {
      console.log(`Found Margarita with ${margarita.ingredientsWithIds.length} ingredients:`);
      margarita.ingredientsWithIds.forEach(ing => {
        console.log(`  - ${ing.name} (${ing.id})`);
      });

      // Test matching
      const margaritaIngredientIds = margarita.ingredientsWithIds.map(i => i.id);
      console.log(`\nRequired ingredient IDs: ${margaritaIngredientIds.join(', ')}`);

    // Test with user selecting Tequila + Fresh Lime Juice + Triple Sec
    const userSelectedIds = ['135', '2296', '121']; // Tequila, Fresh Lime Juice, Triple Sec
      console.log(`User selected IDs: ${userSelectedIds.join(', ')}`);

      const hasAllIngredients = margaritaIngredientIds.every(id => userSelectedIds.includes(id));
      const matchingCount = margaritaIngredientIds.filter(id => userSelectedIds.includes(id)).length;

      console.log(`✅ Has all ingredients: ${hasAllIngredients}`);
      console.log(`📊 Matching count: ${matchingCount}/${margaritaIngredientIds.length}`);

      if (hasAllIngredients) {
        console.log('🎉 Margarita should appear in "Cocktails Ready"!');
      } else {
        console.log('❌ Margarita will not appear - missing ingredients');
      }
    } else {
      console.log('❌ Margarita not found in cocktails with ingredients');
    }

    // Test partial matching (1 ingredient away)
    console.log('\n🔍 Testing "1 ingredient away" logic...');

    const testCocktail = cocktailsArray.find(c => c.ingredientsWithIds.length >= 3);
    if (testCocktail) {
      console.log(`Testing with ${testCocktail.name}:`);
      const requiredIds = testCocktail.ingredientsWithIds.map(i => i.id);
      console.log(`Required: ${requiredIds.join(', ')}`);

      // User has all but one
      const userHas = requiredIds.slice(0, -1);
      console.log(`User has: ${userHas.join(', ')}`);

      const hasCount = requiredIds.filter(id => userHas.includes(id)).length;
      const missingCount = requiredIds.length - hasCount;

      console.log(`Has ${hasCount}/${requiredIds.length} ingredients (${missingCount} missing)`);

      if (missingCount === 1) {
        console.log('✅ Should appear in "Almost there" section');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testMixMatching();
