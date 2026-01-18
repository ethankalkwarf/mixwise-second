/**
 * Debug script to check ingredients table and bar_ingredients
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugIngredients() {
  console.log('🔍 Debugging ingredients...\n');

  try {
    // Check ingredients with IDs 121 and 135
    console.log('Checking ingredients with IDs 121 and 135...');
    const { data: ingredients121, error: error121 } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', 121);

    const { data: ingredients135, error: error135 } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', 135);

    console.log('Ingredient 121:', ingredients121, error121);
    console.log('Ingredient 135:', ingredients135, error135);
    console.log('');

    // Check all ingredients with Triple Sec or Tequila in name
    console.log('Checking ingredients with "Triple Sec" or "Tequila" in name...');
    const { data: tripleSecIngredients, error: tsError } = await supabase
      .from('ingredients')
      .select('*')
      .ilike('name', '%triple sec%');

    const { data: tequilaIngredients, error: tError } = await supabase
      .from('ingredients')
      .select('*')
      .ilike('name', '%tequila%');

    console.log('Triple Sec ingredients:', tripleSecIngredients, tsError);
    console.log('Tequila ingredients:', tequilaIngredients, tError);
    console.log('');

    // Check the bar_ingredients for ethankalkwarf
    console.log('Checking bar_ingredients for ethankalkwarf...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', 'ethankalkwarf')
      .single();

    if (profile) {
      const { data: barItems, error: barError } = await supabase
        .from('bar_ingredients')
        .select('*')
        .eq('user_id', profile.id)
        .in('ingredient_id', ['121', '135']);

      console.log('Bar items with IDs 121 and 135:', barItems, barError);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugIngredients();