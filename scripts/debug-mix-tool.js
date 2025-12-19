// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function debugMixTool() {
  console.log('🔍 Debugging Mix Tool data flow...\n');

  try {
    // 1. Check cocktails data
    console.log('🍸 Step 1: Checking cocktails (first 5, sorted by name)');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name')
      .limit(5);

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    cocktails.forEach((cocktail, index) => {
      console.log(`  ${index + 1}. ${cocktail.name} → ${cocktail.id}`);
    });

    // 2. Check cocktail_ingredients data
    console.log('\n📊 Step 2: Checking cocktail_ingredients data');
    const { data: ingredients, error: ingredientError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure')
      .limit(10);

    if (ingredientError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientError.message}`);
    }

    console.log(`Found ${ingredients.length} ingredient relationships:`);
    ingredients.forEach(row => {
      console.log(`  Cocktail ${row.cocktail_id} → Ingredient ${row.ingredient_id} (${row.measure})`);
    });

    // 3. Check ingredients table
    console.log('\n🥃 Step 3: Checking ingredients table');
    const { data: allIngredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name')
      .limit(10);

    if (ingError) {
      throw new Error(`Failed to fetch ingredients: ${ingError.message}`);
    }

    console.log(`First 10 ingredients:`);
    allIngredients.forEach(ing => {
      console.log(`  ${ing.id}: ${ing.name}`);
    });

    // 4. Test the mapping logic
    console.log('\n🗺️ Step 4: Testing mapping logic');
    const numericIdToUUID = new Map();
    cocktails.forEach((cocktail, index) => {
      numericIdToUUID.set(index + 1, cocktail.id);
    });

    console.log('Numeric ID → UUID mapping:');
    for (let i = 1; i <= Math.min(5, cocktails.length); i++) {
      const uuid = numericIdToUUID.get(i);
      const cocktail = cocktails[i - 1];
      console.log(`  ${i} → ${uuid} (${cocktail.name})`);
    }

    // 5. Test ingredient name mapping
    console.log('\n🏷️ Step 5: Testing ingredient name mapping');
    const ingredientNameById = new Map();
    allIngredients.forEach(ing => {
      ingredientNameById.set(String(ing.id), ing.name);
    });

    // Find ingredients used in cocktail_ingredients
    const usedIngredientIds = [...new Set(ingredients.map(ci => ci.ingredient_id))];
    console.log('Ingredients used in cocktail_ingredients:');
    usedIngredientIds.forEach(id => {
      const name = ingredientNameById.get(String(id)) || 'NOT FOUND';
      console.log(`  ${id} → ${name}`);
    });

    // 6. Simulate what getCocktailsWithIngredients would return
    console.log('\n🎯 Step 6: Simulating getCocktailsWithIngredients result');
    const ingredientsByCocktail = new Map();

    ingredients.forEach(ci => {
      const cocktailUUID = numericIdToUUID.get(ci.cocktail_id);
      if (!cocktailUUID) return;

      const ingredientId = String(ci.ingredient_id);
      const name = ingredientNameById.get(ingredientId) || 'Unknown';

      const ingredient = {
        id: ingredientId,
        name,
        amount: ci.measure || null,
        isOptional: false,
        notes: null
      };

      if (!ingredientsByCocktail.has(cocktailUUID)) {
        ingredientsByCocktail.set(cocktailUUID, []);
      }
      ingredientsByCocktail.get(cocktailUUID).push(ingredient);
    });

    console.log('Cocktails with ingredients:');
    cocktails.slice(0, 3).forEach(cocktail => {
      const cocktailIngredients = ingredientsByCocktail.get(cocktail.id) || [];
      console.log(`  ${cocktail.name}: ${cocktailIngredients.length} ingredients`);
      cocktailIngredients.forEach(ing => {
        console.log(`    - ${ing.name} (${ing.id})`);
      });
    });

    // 7. Test Mix Tool logic
    console.log('\n🔍 Step 7: Testing Mix Tool matching logic');
    const mockOwnedIngredients = ['12', '318', '47']; // tequila, lime, triple sec
    console.log(`Mock owned ingredients: ${mockOwnedIngredients.join(', ')}`);

    // Find Margarita cocktail
    const margaritaCocktail = cocktails.find(c => c.name.toLowerCase().includes('margarita'));
    if (margaritaCocktail) {
      const margaritaIngredients = ingredientsByCocktail.get(margaritaCocktail.id) || [];
      console.log(`Margarita ingredients: ${margaritaIngredients.map(i => `${i.name}(${i.id})`).join(', ')}`);

      const requiredIds = margaritaIngredients.map(i => i.id);
      const hasAllIngredients = requiredIds.every(id => mockOwnedIngredients.includes(id));
      const matchingCount = requiredIds.filter(id => mockOwnedIngredients.includes(id)).length;

      console.log(`Required ingredient IDs: ${requiredIds.join(', ')}`);
      console.log(`Has all ingredients: ${hasAllIngredients}`);
      console.log(`Matching count: ${matchingCount}/${requiredIds.length}`);
    } else {
      console.log('Margarita not found in cocktails');
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugMixTool();
