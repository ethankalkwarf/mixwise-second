// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function debugSearchIssue() {
  console.log('🔍 Debugging why ingredients were not found...\n');

  try {
    // Check the exact query from the failing script
    console.log('📊 Query: ingredients table, limit 50, order by name');

    const { data: allIngredients, error } = await supabase
      .from('ingredients')
      .select('id, name')
      .order('name')
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch ingredients: ${error.message}`);
    }

    console.log(`Fetched ${allIngredients.length} ingredients (first 50 alphabetically)`);

    // Check where Tequila appears in this list
    const tequilaIndex = allIngredients.findIndex(i => i.name.toLowerCase().includes('tequila'));
    const limeIndex = allIngredients.findIndex(i => i.name.toLowerCase().includes('lime'));
    const tripleSecIndex = allIngredients.findIndex(i => i.name.toLowerCase().includes('triple sec'));

    console.log('\n🔍 Search results in first 50:');
    console.log(`  Tequila: ${tequilaIndex >= 0 ? `Found at index ${tequilaIndex} (${allIngredients[tequilaIndex].name})` : 'NOT FOUND'}`);
    console.log(`  Lime: ${limeIndex >= 0 ? `Found at index ${limeIndex} (${allIngredients[limeIndex].name})` : 'NOT FOUND'}`);
    console.log(`  Triple Sec: ${tripleSecIndex >= 0 ? `Found at index ${tripleSecIndex} (${allIngredients[tripleSecIndex].name})` : 'NOT FOUND'}`);

    // Show some ingredients around the alphabetical position where these should be
    console.log('\n📋 Ingredients around T, L, and TS positions:');

    // Find ingredients starting with T
    const tIngredients = allIngredients.filter(i => i.name.toLowerCase().startsWith('t'));
    console.log('T ingredients:', tIngredients.slice(0, 5).map(i => `${i.id}: ${i.name}`));

    // Find ingredients starting with L
    const lIngredients = allIngredients.filter(i => i.name.toLowerCase().startsWith('l'));
    console.log('L ingredients:', lIngredients.slice(0, 5).map(i => `${i.id}: ${i.name}`));

    // Find ingredients starting with TS/Triple
    const tsIngredients = allIngredients.filter(i => i.name.toLowerCase().includes('triple'));
    console.log('Triple ingredients:', tsIngredients.map(i => `${i.id}: ${i.name}`));

    // Check total count vs limit
    const { count, error: countError } = await supabase
      .from('ingredients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log(`\n📊 Total ingredients in table: ${count}`);
      console.log(`Limited query returned: ${allIngredients.length}`);
      console.log(`Were some ingredients cut off? ${count > allIngredients.length ? 'YES' : 'NO'}`);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

debugSearchIssue();
