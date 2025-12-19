// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function debugFrontendIds() {
  console.log('🔍 Debugging frontend ingredient IDs...\n');

  try {
    // 1. Check what getMixIngredients returns
    console.log('🥃 Step 1: What does getMixIngredients return?');

    const { data: mixIngredients, error: mixError } = await supabase
      .from('ingredients')
      .select('id, name')
      .order('name')
      .limit(10);

    if (mixError) {
      console.error('Error fetching mix ingredients:', mixError);
    } else {
      console.log('First 10 mix ingredients:');
      mixIngredients.forEach(ing => {
        console.log(`  ID: ${ing.id} (${typeof ing.id}) → ${ing.name}`);
      });
    }

    // 2. Check what ingredients are available for selection
    console.log('\n📊 Step 2: Available ingredients for Mix Tool selection');
    const { data: allIngredients, error: allError } = await supabase
      .from('ingredients')
      .select('id, name')
      .order('name');

    if (allError) {
      console.error('Error fetching all ingredients:', allError);
    } else {
      // Find Margarita ingredients
      const tequila = allIngredients.find(i => i.name.toLowerCase().includes('tequila'));
      const lime = allIngredients.find(i => i.name.toLowerCase().includes('lime'));
      const tripleSec = allIngredients.find(i => i.name.toLowerCase().includes('triple sec'));

      console.log('Margarita ingredient IDs in ingredients table:');
      console.log(`  Tequila: ${tequila ? `${tequila.id} (${tequila.name})` : 'NOT FOUND'}`);
      console.log(`  Lime: ${lime ? `${lime.id} (${lime.name})` : 'NOT FOUND'}`);
      console.log(`  Triple Sec: ${tripleSec ? `${tripleSec.id} (${tripleSec.name})` : 'NOT FOUND'}`);
    }

    // 3. Check what's in cocktail_ingredients for Margarita
    console.log('\n🍸 Step 3: Margarita ingredients in cocktail_ingredients');

    // Find Margarita's position
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name');

    if (cocktailError) {
      console.error('Error fetching cocktails:', cocktailError);
    } else {
      const margaritaIndex = cocktails.findIndex(c => c.name === 'Margarita');
      if (margaritaIndex >= 0) {
        const margaritaPosition = margaritaIndex + 1;
        console.log(`Margarita is at position ${margaritaPosition}`);

        const { data: margaritaIngredients, error: margError } = await supabase
          .from('cocktail_ingredients')
          .select('cocktail_id, ingredient_id, measure')
          .eq('cocktail_id', margaritaPosition);

        if (margError) {
          console.error('Error fetching Margarita ingredients:', margError);
        } else {
          console.log('Margarita cocktail_ingredients:');
          margaritaIngredients.forEach(ing => {
            console.log(`  Cocktail ${ing.cocktail_id} → Ingredient ${ing.ingredient_id} (${ing.measure})`);
          });
        }
      }
    }

    // 4. Simulate what the frontend receives
    console.log('\n🎯 Step 4: Simulating frontend data flow');

    // What IDs does the user select in the UI?
    const userSelectedNames = ['Tequila', 'Lime', 'Triple Sec'];
    console.log(`User selects: ${userSelectedNames.join(', ')}`);

    // What IDs should these map to?
    const userSelectedIds = [];
    const tequila = allIngredients.find(i => i.name.toLowerCase().includes('tequila'));
    const lime = allIngredients.find(i => i.name.toLowerCase().includes('lime'));
    const tripleSec = allIngredients.find(i => i.name.toLowerCase().includes('triple sec'));

    if (tequila) userSelectedIds.push(tequila.id.toString());
    if (lime) userSelectedIds.push(lime.id.toString());
    if (tripleSec) userSelectedIds.push(tripleSec.id.toString());

    console.log(`User selected IDs: ${userSelectedIds.join(', ')}`);

    // What does Margarita require? (from cocktail_ingredients)
    const margaritaRequiredIds = ['135', '2102', '121']; // From our test data
    console.log(`Margarita requires: ${margaritaRequiredIds.join(', ')}`);

    // Check if these IDs exist in ingredients table
    console.log('\n🔍 Checking if Margarita required IDs exist in ingredients table:');
    for (const id of margaritaRequiredIds) {
      const ingredient = allIngredients.find(i => i.id.toString() === id);
      console.log(`  ID ${id}: ${ingredient ? `✅ ${ingredient.name}` : '❌ NOT FOUND'}`);
    }

    // What IDs does the frontend actually have available?
    console.log(`\n🎮 Frontend ingredient IDs: ${userSelectedIds.join(', ')}`);

    // Do they match?
    const matches = margaritaRequiredIds.filter(id => userSelectedIds.includes(id));
    const missing = margaritaRequiredIds.filter(id => !userSelectedIds.includes(id));

    console.log(`✅ Matches: ${matches.join(', ')}`);
    console.log(`❌ Missing: ${missing.join(', ')}`);
    console.log(`📊 Match ratio: ${matches.length}/${margaritaRequiredIds.length}`);

    if (matches.length === margaritaRequiredIds.length) {
      console.log('🎉 Margarita should appear in "Cocktails Ready"!');
    } else {
      console.log('❌ Margarita will not appear - ID mismatch');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

debugFrontendIds();
