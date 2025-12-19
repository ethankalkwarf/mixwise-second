// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function createTestData() {
  console.log('🧪 Creating test cocktail_ingredients data for Mix Tool...\n');

  try {
    // Clear existing data - try different approaches
    console.log('🗑️  Clearing existing data...');

    // First try to truncate the table
    const { error: truncateError } = await supabase.rpc('exec_sql', {
      sql: 'TRUNCATE TABLE public.cocktail_ingredients RESTART IDENTITY;'
    });

    if (truncateError) {
      console.log('Truncate failed, trying delete...');
      const { error: deleteError } = await supabase
        .from('cocktail_ingredients')
        .delete()
        .neq('cocktail_id', 0);

      if (deleteError) {
        console.error('Failed to clear data:', deleteError.message);
        console.log('Continuing with existing data...');
      } else {
        console.log('✅ Existing data cleared with delete');
      }
    } else {
      console.log('✅ Existing data cleared with truncate');
    }

    // Get cocktails and assign sequential numeric IDs - include at least the first 25 to get Margarita
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name')
      .limit(25); // Include Margarita (position 22)

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    // Create a mapping from UUID to sequential numeric ID
    const uuidToNumericId = new Map();
    cocktails.forEach((cocktail, index) => {
      uuidToNumericId.set(cocktail.id, index + 1); // 1-based sequential IDs
    });

    console.log(`📋 Creating test data for ${cocktails.length} cocktails (using sequential numeric IDs)`);

    // Get some common ingredients
    const { data: ingredients, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name')
      .limit(20);

    if (ingredientError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientError.message}`);
    }

    // Create test relationships using numeric cocktail_ids
    const testData = [];

    // Margarita (tequila, lime, triple sec) - classic Margarita is at position 94
    console.log('Adding Margarita manually (position 94)...');
    testData.push(
      { cocktail_id: 94, ingredient_id: 135, measure: '2 oz' },  // Tequila
      { cocktail_id: 94, ingredient_id: 2102, measure: '1 oz' }, // Lime
      { cocktail_id: 94, ingredient_id: 121, measure: '1 oz' }   // Triple Sec
    );

    // Add Espresso Martini (position 54) as a Martini example
    console.log('Adding Espresso Martini (position 54) as Martini example...');
    testData.push(
      { cocktail_id: 54, ingredient_id: 2, measure: '2 oz' },     // Gin (closest to vodka in Espresso Martini)
      { cocktail_id: 54, ingredient_id: 2039, measure: '1 oz' }   // Kahlua (coffee liqueur)
    );

    // Add Chocolate Negroni (position 46) as a Negroni example
    console.log('Adding Chocolate Negroni (position 46) as Negroni example...');
    testData.push(
      { cocktail_id: 46, ingredient_id: 2, measure: '1 oz' },     // Gin
      { cocktail_id: 46, ingredient_id: 2062, measure: '1 oz' },  // Campari
      { cocktail_id: 46, ingredient_id: 37, measure: '1 oz' }     // Sweet Vermouth
    );

    // Martini (gin, vermouth) - use correct ingredient IDs
    const martini = cocktails.find(c => c.name.toLowerCase() === 'martini');
    if (martini) {
      const numericId = uuidToNumericId.get(martini.id);
      console.log(`Found Martini: ${martini.name} at position ${cocktails.findIndex(c => c.id === martini.id) + 1}, numeric ID: ${numericId}`);

      // Use correct ingredient IDs: Gin (2), Dry Vermouth (38)
      testData.push(
        { cocktail_id: numericId, ingredient_id: 2, measure: '2.5 oz' },   // Gin
        { cocktail_id: numericId, ingredient_id: 38, measure: '0.5 oz' }  // Dry Vermouth
      );
    }

    // Negroni (gin, campari, sweet vermouth) - use correct ingredient IDs
    const negroni = cocktails.find(c => c.name.toLowerCase() === 'negroni');
    if (negroni) {
      const numericId = uuidToNumericId.get(negroni.id);
      console.log(`Found Negroni: ${negroni.name} at position ${cocktails.findIndex(c => c.id === negroni.id) + 1}, numeric ID: ${numericId}`);

      // Use correct ingredient IDs: Gin (2), Campari (2062), Sweet Vermouth (37)
      testData.push(
        { cocktail_id: numericId, ingredient_id: 2, measure: '1 oz' },     // Gin
        { cocktail_id: numericId, ingredient_id: 2062, measure: '1 oz' },  // Campari
        { cocktail_id: numericId, ingredient_id: 37, measure: '1 oz' }     // Sweet Vermouth
      );
    }

    // Add some basic relationships for other cocktails
    cocktails.forEach((cocktail) => {
      if (testData.some(td => td.cocktail_id === uuidToNumericId.get(cocktail.id))) return; // Already added

      const numericId = uuidToNumericId.get(cocktail.id);

      // Add 2-3 random ingredients to each cocktail
      const numIngredients = Math.floor(Math.random() * 2) + 2; // 2-3 ingredients
      for (let i = 0; i < numIngredients; i++) {
        const randomIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];
        testData.push({
          cocktail_id: numericId,
          ingredient_id: randomIngredient.id,
          measure: `${Math.floor(Math.random() * 2) + 1} oz`
        });
      }
    });

    // Remove duplicates based on cocktail_id + ingredient_id
    const uniqueData = testData.filter((item, index, self) =>
      index === self.findIndex(t => t.cocktail_id === item.cocktail_id && t.ingredient_id === item.ingredient_id)
    );

    console.log(`📊 Created ${testData.length} relationships (${uniqueData.length} unique)`);

    // Insert test data
    console.log('💾 Inserting test data...');

    const { error: insertError } = await supabase
      .from('cocktail_ingredients')
      .insert(uniqueData);

    if (insertError) {
      throw new Error(`Failed to insert test data: ${insertError.message}`);
    }

    console.log('✅ Test data inserted successfully!');

    // Verification
    const { count: finalCount, error: countError } = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn(`⚠️  Could not verify count: ${countError.message}`);
    } else {
      console.log(`   Final count: ${finalCount} relationships`);
    }

    console.log('\n🎉 Test data created! The Mix Tool should now work.');
    console.log('Try selecting: Tequila + Lime Juice + Triple Sec → should show Margarita');

  } catch (error) {
    console.error('💥 Error creating test data:', error.message);
  }
}

createTestData();
