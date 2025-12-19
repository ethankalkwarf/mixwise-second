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

    // Get cocktails and assign sequential numeric IDs
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name')
      .limit(20); // Just create data for first 20 cocktails for testing

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

    // Margarita (tequila, lime, triple sec)
    const margarita = cocktails.find(c => c.name.toLowerCase().includes('margarita'));
    if (margarita) {
      const tequila = ingredients.find(i => i.name.toLowerCase().includes('tequila'));
      const lime = ingredients.find(i => i.name.toLowerCase().includes('lime'));
      const tripleSec = ingredients.find(i => i.name.toLowerCase().includes('triple sec'));

      if (tequila && lime && tripleSec) {
        const numericId = uuidToNumericId.get(margarita.id);
        testData.push(
          { cocktail_id: numericId, ingredient_id: tequila.id, measure: '2 oz' },
          { cocktail_id: numericId, ingredient_id: lime.id, measure: '1 oz' },
          { cocktail_id: numericId, ingredient_id: tripleSec.id, measure: '1 oz' }
        );
      }
    }

    // Martini (gin, vermouth)
    const martini = cocktails.find(c => c.name.toLowerCase().includes('martini'));
    if (martini) {
      const gin = ingredients.find(i => i.name.toLowerCase().includes('gin'));
      const vermouth = ingredients.find(i => i.name.toLowerCase().includes('vermouth'));

      if (gin && vermouth) {
        const numericId = uuidToNumericId.get(martini.id);
        testData.push(
          { cocktail_id: numericId, ingredient_id: gin.id, measure: '2.5 oz' },
          { cocktail_id: numericId, ingredient_id: vermouth.id, measure: '0.5 oz' }
        );
      }
    }

    // Negroni (gin, campari, sweet vermouth)
    const negroni = cocktails.find(c => c.name.toLowerCase().includes('negroni'));
    if (negroni) {
      const gin = ingredients.find(i => i.name.toLowerCase().includes('gin'));
      const campari = ingredients.find(i => i.name.toLowerCase().includes('campari'));
      const sweetVermouth = ingredients.find(i => i.name.toLowerCase().includes('vermouth'));

      if (gin && campari && sweetVermouth) {
        const numericId = uuidToNumericId.get(negroni.id);
        testData.push(
          { cocktail_id: numericId, ingredient_id: gin.id, measure: '1 oz' },
          { cocktail_id: numericId, ingredient_id: campari.id, measure: '1 oz' },
          { cocktail_id: numericId, ingredient_id: sweetVermouth.id, measure: '1 oz' }
        );
      }
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
