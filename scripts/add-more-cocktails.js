// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function addMoreCocktails() {
  console.log('🍸 Adding ingredients for more common cocktails...\n');

  try {
    // Get cocktails and their positions
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name');

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    // Create position to UUID mapping
    const positionToUUID = new Map();
    cocktails.forEach((cocktail, index) => {
      positionToUUID.set(index + 1, cocktail.id);
    });

    // Find common cocktails and their positions - using correct ingredient IDs
    const cocktailMappings = [
      { name: 'Gin and Tonic', ingredients: [2, 168] }, // Gin (2), Tonic Water (168)
      { name: 'Vodka Soda', ingredients: [2024, 2033] }, // Absolut Vodka (2024), Club soda (2033)
    ];

    console.log('Finding cocktail positions...');
    const cocktailsToAdd = [];

    cocktailMappings.forEach(mapping => {
      const cocktail = cocktails.find(c => c.name.toLowerCase().includes(mapping.name.toLowerCase()));
      if (cocktail) {
        const position = cocktails.findIndex(c => c.id === cocktail.id) + 1;
        cocktailsToAdd.push({
          name: cocktail.name,
          position,
          uuid: cocktail.id,
          ingredients: mapping.ingredients
        });
        console.log(`  ${mapping.name} → Position ${position}`);
      } else {
        console.log(`  ${mapping.name} → Not found`);
      }
    });

    // Add ingredients for these cocktails
    console.log('\nAdding ingredients...');
    const ingredientsToInsert = [];

    cocktailsToAdd.forEach(cocktail => {
      cocktail.ingredients.forEach((ingredientId, index) => {
        ingredientsToInsert.push({
          cocktail_id: cocktail.position,
          ingredient_id: ingredientId,
          measure: `${Math.floor(Math.random() * 2) + 1} oz`
        });
      });
    });

    console.log(`Inserting ${ingredientsToInsert.length} ingredient relationships...`);

    const { error: insertError } = await supabase
      .from('cocktail_ingredients')
      .insert(ingredientsToInsert);

    if (insertError) {
      throw new Error(`Failed to insert ingredients: ${insertError.message}`);
    }

    console.log('✅ Successfully added ingredients for common cocktails!');
    console.log('\nCocktails now available:');
    cocktailsToAdd.forEach(c => console.log(`  - ${c.name}`));

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

addMoreCocktails();
