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

async function checkDatabaseIngredients() {
  console.log('Checking cocktails.ingredients field in database...');

  try {
    // Get a few cocktails with ingredients field
    const { data: cocktails, error } = await supabase
      .from('cocktails')
      .select('id, name, ingredients')
      .limit(5);

    if (error) {
      console.error('Error fetching cocktails:', error);
      return;
    }

    console.log('Sample cocktails from database:');
    cocktails.forEach((cocktail, i) => {
      console.log(`\n${i + 1}. ${cocktail.name} (ID: ${cocktail.id})`);
      console.log(`   ingredients type: ${typeof cocktail.ingredients}`);
      console.log(`   ingredients isArray: ${Array.isArray(cocktail.ingredients)}`);
      console.log(`   ingredients value:`, JSON.stringify(cocktail.ingredients, null, 2));
    });

    // Count how many have ingredients
    const totalCount = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true });

    const withIngredientsCount = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true })
      .not('ingredients', 'is', null);

    console.log(`\nTotal cocktails: ${totalCount.count}`);
    console.log(`Cocktails with non-null ingredients: ${withIngredientsCount.count}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseIngredients();
