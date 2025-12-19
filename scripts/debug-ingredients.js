const { createClient } = require('@supabase/supabase-js');

async function debugIngredients() {
  // Load from process.env directly (set in Vercel/system environment)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking cocktail ingredients structure...');

  // Get a few cocktails to see the ingredients structure
  const { data: cocktails, error } = await supabase
    .from('cocktails')
    .select('id, name, ingredients')
    .limit(3);

  if (error) {
    console.error('Error fetching cocktails:', error);
    return;
  }

  console.log('\n=== COCKTAIL INGREDIENTS STRUCTURE ===');
  cocktails.forEach((cocktail, i) => {
    console.log(`\n${i + 1}. ${cocktail.name} (${cocktail.id}):`);
    console.log('Raw ingredients:', JSON.stringify(cocktail.ingredients, null, 2));

    if (cocktail.ingredients && Array.isArray(cocktail.ingredients)) {
      console.log('Ingredients array length:', cocktail.ingredients.length);
      cocktail.ingredients.forEach((ing, j) => {
        console.log(`  ${j + 1}. Type: ${typeof ing}, Value:`, ing);
        if (typeof ing === 'object' && ing !== null) {
          console.log(`     Keys: ${Object.keys(ing).join(', ')}`);
          console.log(`     Text: ${ing.text || 'N/A'}`);
          console.log(`     Amount: ${ing.amount || 'N/A'}`);
          console.log(`     Ingredient object:`, ing.ingredient || 'N/A');
        }
      });
    } else {
      console.log('Ingredients is not an array or is null');
    }
  });

  // Also check the ingredients table structure
  console.log('\n=== INGREDIENTS TABLE SAMPLE ===');
  const { data: ingredients, error: ingError } = await supabase
    .from('ingredients')
    .select('id, name')
    .limit(10);

  if (ingError) {
    console.error('Error fetching ingredients:', ingError);
  } else {
    console.log('Sample ingredients:');
    ingredients.forEach(ing => {
      console.log(`  ${ing.id}: ${ing.name}`);
    });

  // Look for specific ingredients that should be in Margarita
  console.log('\n=== LOOKING FOR MARGARITA INGREDIENTS ===');
  const margaritaIngredients = ['tequila', 'triple sec', 'lime juice', 'cointreau'];
  margaritaIngredients.forEach(searchName => {
    const matches = ingredients.filter(ing =>
      ing.name.toLowerCase().includes(searchName.toLowerCase())
    );
    if (matches.length > 0) {
      console.log(`Found ${searchName}:`);
      matches.forEach(match => console.log(`  ${match.id}: ${match.name}`));
    } else {
      console.log(`No matches found for ${searchName}`);
    }
  });
  }
}

debugIngredients().catch(console.error);
