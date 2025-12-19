#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCocktailIngredients() {
  console.log('Checking cocktail_ingredients_uuid table...');

  try {
    // Check total count
    const { data: countData, error: countError } = await supabase
      .from('cocktail_ingredients_uuid')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting cocktail ingredients:', countError);
      return;
    }

    console.log(`Total cocktail ingredients: ${countData}`);

    if (countData === 0) {
      console.log('❌ cocktail_ingredients_uuid table is EMPTY!');
      return;
    }

    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('cocktail_ingredients_uuid')
      .select('*')
      .limit(5);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      return;
    }

    console.log('Sample cocktail ingredients:');
    console.table(sampleData);

    // Check if cocktail IDs exist in cocktails table
    const cocktailIds = sampleData.map(ci => ci.cocktail_id);
    const { data: cocktailCheck, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .in('id', cocktailIds);

    if (cocktailError) {
      console.error('Error checking cocktails:', cocktailError);
      return;
    }

    console.log('Matching cocktails:');
    console.table(cocktailCheck);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkCocktailIngredients();
