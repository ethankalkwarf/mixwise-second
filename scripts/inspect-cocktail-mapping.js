// scripts/inspect-cocktail-mapping.js
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('🔍 Inspecting cocktail ingredient mapping...\n');

  // Get sample cocktail_ingredients
  console.log('📊 cocktail_ingredients sample:');
  const { data: ci, error: ciError } = await supabase
    .from('cocktail_ingredients')
    .select('cocktail_id, ingredient_id')
    .limit(10);

  if (ciError) {
    console.error('❌ Error fetching cocktail_ingredients:', ciError.message);
    return;
  }

  ci.forEach((row, i) => {
    console.log(`  ${i + 1}. cocktail_id: ${row.cocktail_id} (${typeof row.cocktail_id}), ingredient_id: ${row.ingredient_id} (${typeof row.ingredient_id})`);
  });

  // Get sample cocktails
  console.log('\n🍸 cocktails sample:');
  const { data: cocktails, error: cError } = await supabase
    .from('cocktails')
    .select('id, name, legacy_id')
    .limit(10);

  if (cError) {
    console.error('❌ Error fetching cocktails:', cError.message);
    return;
  }

  cocktails.forEach((c, i) => {
    console.log(`  ${i + 1}. id: ${c.id.substring(0, 8)}..., name: ${c.name}, legacy_id: ${c.legacy_id}`);
  });

  // Check if any cocktails have legacy_id
  const { data: allCocktails, error: allError } = await supabase
    .from('cocktails')
    .select('legacy_id')
    .not('legacy_id', 'is', null);

  if (allError) {
    console.error('❌ Error checking legacy_id:', allError.message);
  } else {
    console.log(`\n📈 Cocktails with legacy_id: ${allCocktails?.length || 0}`);
  }

  // Try to find a pattern - check what cocktail_id 1, 2, 3 correspond to
  console.log('\n🔍 Checking specific cocktail_id mappings:');
  const testIds = ['1', '2', '3', '94', '54', '46'];

  for (const testId of testIds) {
    const { data: ingredients, error } = await supabase
      .from('cocktail_ingredients')
      .select('ingredient_id')
      .eq('cocktail_id', testId)
      .limit(5);

    if (error) {
      console.log(`  cocktail_id ${testId}: ERROR - ${error.message}`);
    } else {
      console.log(`  cocktail_id ${testId}: ${ingredients.length} ingredients`);
      if (ingredients.length > 0) {
        console.log(`    ingredients: ${ingredients.slice(0, 3).map(i => i.ingredient_id).join(', ')}${ingredients.length > 3 ? '...' : ''}`);
      }
    }
  }
}

inspect().catch(console.error);
