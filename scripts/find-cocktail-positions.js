// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function findCocktailPositions() {
  console.log('🔍 Finding positions of key cocktails...\n');

  try {
    // Get all cocktails in sorted order
    const { data: allCocktails, error } = await supabase
      .from('cocktails')
      .select('id, name')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch cocktails: ${error.message}`);
    }

    // Find positions of key cocktails
    const keyCocktails = [
      { search: 'margarita', exact: 'Margarita' },
      { search: 'martini', exact: 'Martini' },
      { search: 'negroni', exact: 'Negroni' }
    ];

    keyCocktails.forEach(({ search, exact }) => {
      const index = allCocktails.findIndex(c => c.name === exact);

      if (index >= 0) {
        const position = index + 1; // 1-based
        console.log(`${search.toUpperCase()}: Position ${position} - ${allCocktails[index].name}`);
      } else {
        console.log(`${search.toUpperCase()} (${exact}): Not found`);
        // Try partial match
        const partialIndex = allCocktails.findIndex(c => c.name.toLowerCase().includes(search));
        if (partialIndex >= 0) {
          console.log(`  Found similar: Position ${partialIndex + 1} - ${allCocktails[partialIndex].name}`);
        }
      }
    });

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

findCocktailPositions();
