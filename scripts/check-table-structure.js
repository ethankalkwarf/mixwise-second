// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  console.log('🔍 Checking table structure...\n');

  try {
    // Check cocktail_ingredients structure
    console.log('📊 cocktail_ingredients table:');
    const { data: ingredients, error: ingError } = await supabase
      .from('cocktail_ingredients')
      .select('*')
      .limit(1);

    if (ingError) {
      console.error('Error:', ingError);
    } else if (ingredients && ingredients.length > 0) {
      console.log('Columns:', Object.keys(ingredients[0]));
      console.log('Sample row:', ingredients[0]);
    } else {
      console.log('Table is empty');
    }

    // Check cocktails.ingredients structure
    console.log('\n🍸 cocktails.ingredients sample:');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name, ingredients')
      .limit(3);

    if (cocktailError) {
      console.error('Error:', cocktailError);
    } else {
      cocktails.forEach(cocktail => {
        console.log(`\n${cocktail.name}:`);
        if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
          cocktail.ingredients.slice(0, 2).forEach((ing, i) => {
            console.log(`  ${i + 1}. ${JSON.stringify(ing)}`);
          });
        } else {
          console.log('  No ingredients');
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();
