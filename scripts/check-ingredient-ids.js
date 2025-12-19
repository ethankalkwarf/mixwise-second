// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkIngredientIds() {
  console.log('🔍 Checking ingredient IDs used in cocktail_ingredients...\n');

  try {
    // Get all ingredient IDs used in cocktail_ingredients
    const { data: usedIngredients, error: usedError } = await supabase
      .from('cocktail_ingredients')
      .select('ingredient_id');

    if (usedError) {
      throw new Error(`Failed to fetch used ingredients: ${usedError.message}`);
    }

    const usedIds = [...new Set(usedIngredients.map(ci => ci.ingredient_id))];
    console.log(`Ingredient IDs used in cocktail_ingredients: ${usedIds.join(', ')}\n`);

    // Check which of these exist in the ingredients table
    for (const id of usedIds.slice(0, 10)) { // Check first 10
      const { data: ingredient, error: ingError } = await supabase
        .from('ingredients')
        .select('id, name')
        .eq('id', id)
        .single();

      if (ingError && ingError.code === 'PGRST116') { // Not found
        console.log(`❌ Ingredient ID ${id}: NOT FOUND in ingredients table`);
      } else if (ingError) {
        console.log(`❓ Ingredient ID ${id}: Error - ${ingError.message}`);
      } else {
        console.log(`✅ Ingredient ID ${id}: ${ingredient.name}`);
      }
    }

    // Find actual tequila, lime, triple sec in ingredients table
    console.log('\n🔍 Finding actual ingredient IDs for Margarita ingredients:');

    const ingredientsToFind = [
      { search: 'tequila', exact: true },
      { search: 'lime', exact: false },
      { search: 'triple sec', exact: false }
    ];

    for (const item of ingredientsToFind) {
      const query = item.exact
        ? supabase.from('ingredients').select('id, name').eq('name', item.search)
        : supabase.from('ingredients').select('id, name').ilike(`%${item.search}%`);

      const { data: results, error } = await query.limit(5);

      if (error) {
        console.log(`❌ Error finding ${item.search}: ${error.message}`);
      } else {
        console.log(`\n${item.search.toUpperCase()}:`);
        results.forEach(r => console.log(`  ${r.id}: ${r.name}`));
      }
    }

    // Check Margarita's ingredients specifically
    console.log('\n🍸 Checking Margarita ingredients:');
    const { data: margarita, error: margError } = await supabase
      .from('cocktails')
      .select('id, name')
      .ilike('name', '%margarita%')
      .limit(1);

    if (margError) {
      console.error('Error finding Margarita:', margError);
    } else if (margarita && margarita.length > 0) {
      const margaritaId = margarita[0].id;

      // Find its position in sorted list
      const { data: allCocktails, error: allError } = await supabase
        .from('cocktails')
        .select('id')
        .order('name');

      if (!allError) {
        const position = allCocktails.findIndex(c => c.id === margaritaId) + 1;
        console.log(`Margarita is at position ${position}`);

        // Check its ingredients
        const { data: margIngredients, error: margIngError } = await supabase
          .from('cocktail_ingredients')
          .select('cocktail_id, ingredient_id, measure')
          .eq('cocktail_id', position);

        if (margIngError) {
          console.error('Error getting Margarita ingredients:', margIngError);
        } else {
          console.log(`Margarita ingredients in cocktail_ingredients:`);
          margIngredients.forEach(ing => {
            console.log(`  Cocktail ${ing.cocktail_id} → Ingredient ${ing.ingredient_id} (${ing.measure})`);
          });
        }
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkIngredientIds();
