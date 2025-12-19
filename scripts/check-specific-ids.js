// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkSpecificIds() {
  console.log('🔍 Checking specific ingredient IDs...\n');

  try {
    // Check the specific IDs used in Margarita cocktail_ingredients
    const idsToCheck = [135, 2102, 121];

    for (const id of idsToCheck) {
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log(`❌ ID ${id}: NOT FOUND in ingredients table`);
      } else if (error) {
        console.log(`❓ ID ${id}: Error - ${error.message}`);
      } else {
        console.log(`✅ ID ${id}: ${ingredient.name}`);
      }
    }

    // Also check what the search finds
    console.log('\n🔍 Checking search results:');

    const { data: tequilaSearch, error: tequilaError } = await supabase
      .from('ingredients')
      .select('id, name')
      .ilike('name', '%tequila%');

    if (tequilaError) {
      console.error('Tequila search error:', tequilaError);
    } else {
      console.log('Tequila search results:');
      tequilaSearch.forEach(ing => console.log(`  ${ing.id}: ${ing.name}`));
    }

    const { data: tripleSecSearch, error: tripleSecError } = await supabase
      .from('ingredients')
      .select('id, name')
      .ilike('name', '%triple sec%');

    if (tripleSecError) {
      console.error('Triple Sec search error:', tripleSecError);
    } else {
      console.log('Triple Sec search results:');
      tripleSecSearch.forEach(ing => console.log(`  ${ing.id}: ${ing.name}`));
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkSpecificIds();
