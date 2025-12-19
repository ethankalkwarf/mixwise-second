// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function findRealIngredients() {
  console.log('🔍 Finding real ingredient IDs for Mix Tool testing...\n');

  try {
    // Find Margarita cocktail
    console.log('🍸 Finding Margarita cocktail');
    const { data: margarita, error: margaritaError } = await supabase
      .from('cocktails')
      .select('id, name')
      .ilike('name', '%margarita%')
      .limit(5);

    if (margaritaError) {
      console.error('Error finding Margarita:', margaritaError);
    } else {
      console.log('Margarita cocktails found:');
      margarita.forEach(c => console.log(`  ${c.name} → ${c.id}`));
    }

    // Find key ingredients
    const ingredientsToFind = [
      'tequila', 'lime', 'triple sec', 'gin', 'vermouth', 'campari'
    ];

    console.log('\n🥃 Finding ingredient IDs');

    for (const ingredientName of ingredientsToFind) {
      const { data: ingredients, error: ingError } = await supabase
        .from('ingredients')
        .select('id, name')
        .ilike('name', `%${ingredientName}%`)
        .limit(5);

      if (ingError) {
        console.error(`Error finding ${ingredientName}:`, ingError);
      } else {
        console.log(`${ingredientName}:`);
        ingredients.forEach(ing => {
          console.log(`  ${ing.id}: ${ing.name}`);
        });
      }
    }

    // Check what cocktail position Margarita is in
    console.log('\n📊 Finding Margarita position in sorted cocktails');
    const { data: allCocktails, error: allError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name');

    if (allError) {
      console.error('Error getting all cocktails:', allError);
    } else {
      const margaritaIndex = allCocktails.findIndex(c => c.name.toLowerCase().includes('margarita'));
      if (margaritaIndex >= 0) {
        console.log(`Margarita is at position ${margaritaIndex + 1} in sorted list`);
        console.log(`Cocktails around it:`);
        for (let i = Math.max(0, margaritaIndex - 2); i <= Math.min(allCocktails.length - 1, margaritaIndex + 2); i++) {
          const marker = i === margaritaIndex ? ' ← MARGARITA' : '';
          console.log(`  ${i + 1}. ${allCocktails[i].name}${marker}`);
        }
      } else {
        console.log('Margarita not found in cocktail list');
      }
    }

    // Check if Margarita has ingredients in cocktail_ingredients
    if (margarita && margarita.length > 0) {
      const margaritaId = margarita[0].id;
      console.log(`\n🔍 Checking if Margarita (${margaritaId}) has ingredients in cocktail_ingredients`);

      // Find its numeric ID
      const margaritaNumericId = allCocktails.findIndex(c => c.id === margaritaId) + 1;
      console.log(`Margarita numeric ID should be: ${margaritaNumericId}`);

      const { data: margaritaIngredients, error: margError } = await supabase
        .from('cocktail_ingredients')
        .select('cocktail_id, ingredient_id, measure')
        .eq('cocktail_id', margaritaNumericId);

      if (margError) {
        console.error('Error checking Margarita ingredients:', margError);
      } else {
        console.log(`Found ${margaritaIngredients.length} ingredient relationships for Margarita:`);
        margaritaIngredients.forEach(ing => {
          console.log(`  Cocktail ${ing.cocktail_id} → Ingredient ${ing.ingredient_id} (${ing.measure})`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

findRealIngredients();
