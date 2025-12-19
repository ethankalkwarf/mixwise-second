// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function findWorkingIngredients() {
  console.log('🔍 Finding ingredients that actually exist for Margarita...\n');

  try {
    // Get all ingredients
    const { data: allIngredients, error } = await supabase
      .from('ingredients')
      .select('id, name')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch ingredients: ${error.message}`);
    }

    console.log(`Total ingredients: ${allIngredients.length}`);

    // Look for tequila-like ingredients
    console.log('\n🥃 Tequila-like ingredients:');
    const tequilaLike = allIngredients.filter(i =>
      i.name.toLowerCase().includes('tequila') ||
      i.name.toLowerCase().includes('reposado') ||
      i.name.toLowerCase().includes('añejo') ||
      i.name.toLowerCase().includes('blanco')
    );
    tequilaLike.slice(0, 5).forEach(ing => {
      console.log(`  ${ing.id}: ${ing.name}`);
    });

    // Look for triple sec-like ingredients
    console.log('\n🍊 Triple Sec-like ingredients:');
    const tripleSecLike = allIngredients.filter(i =>
      i.name.toLowerCase().includes('triple sec') ||
      i.name.toLowerCase().includes('cointreau') ||
      i.name.toLowerCase().includes('grand marnier') ||
      i.name.toLowerCase().includes('orange liqueur') ||
      i.name.toLowerCase().includes('curacao')
    );
    tripleSecLike.slice(0, 5).forEach(ing => {
      console.log(`  ${ing.id}: ${ing.name}`);
    });

    // Lime juice
    console.log('\n🍋 Lime-like ingredients:');
    const limeLike = allIngredients.filter(i =>
      i.name.toLowerCase().includes('lime')
    );
    limeLike.slice(0, 5).forEach(ing => {
      console.log(`  ${ing.id}: ${ing.name}`);
    });

    // Check if we have any that match the Margarita requirements
    console.log('\n🎯 Margarita ingredient analysis:');
    console.log('Current Margarita requires IDs: 135 (Tequila), 2102 (Lime), 121 (Triple Sec)');

    const margaritaIngredients = {
      tequila: tequilaLike.length > 0 ? tequilaLike[0] : null,
      lime: limeLike.find(i => i.id === 2102) || limeLike[0],
      tripleSec: tripleSecLike.length > 0 ? tripleSecLike[0] : null
    };

    console.log('\nAvailable substitutes:');
    console.log(`  Tequila: ${margaritaIngredients.tequila ? `${margaritaIngredients.tequila.id} (${margaritaIngredients.tequila.name})` : 'NONE'}`);
    console.log(`  Lime: ${margaritaIngredients.lime ? `${margaritaIngredients.lime.id} (${margaritaIngredients.lime.name})` : 'NONE'}`);
    console.log(`  Triple Sec: ${margaritaIngredients.tripleSec ? `${margaritaIngredients.tripleSec.id} (${margaritaIngredients.tripleSec.name})` : 'NONE'}`);

    if (margaritaIngredients.tequila && margaritaIngredients.lime && margaritaIngredients.tripleSec) {
      console.log('\n✅ SOLUTION: Update Margarita to use existing ingredient IDs');
      console.log('New Margarita ingredients:');
      console.log(`  ${margaritaIngredients.tequila.id} (${margaritaIngredients.tequila.name})`);
      console.log(`  ${margaritaIngredients.lime.id} (${margaritaIngredients.lime.name})`);
      console.log(`  ${margaritaIngredients.tripleSec.id} (${margaritaIngredients.tripleSec.name})`);
    } else {
      console.log('\n❌ PROBLEM: Missing key ingredients for Margarita');
      console.log('Need to add generic ingredients to the ingredients table');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

findWorkingIngredients();
