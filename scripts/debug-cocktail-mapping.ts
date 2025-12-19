import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugCocktailMapping() {
  console.log('🔍 Debugging cocktail ingredient mapping...\n');

  // 1. Get all cocktails
  console.log('📋 Fetching cocktails...');
  const { data: cocktails, error: cocktailError } = await supabase
    .from('cocktails')
    .select('id, name, slug, legacy_id')
    .order('name');

  if (cocktailError) {
    console.error('❌ Error fetching cocktails:', cocktailError.message);
    return;
  }

  console.log(`✅ Found ${cocktails?.length || 0} cocktails\n`);

  // 2. Get cocktail ingredients
  console.log('📊 Fetching cocktail ingredients...');
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('cocktail_ingredients')
    .select('cocktail_id, ingredient_id, measure');

  if (ingredientsError) {
    console.error('❌ Error fetching cocktail ingredients:', ingredientsError.message);
    return;
  }

  console.log(`✅ Found ${ingredients?.length || 0} cocktail ingredient rows\n`);

  if (!cocktails || !ingredients) return;

  // 3. Analyze cocktail_id values in cocktail_ingredients
  const cocktailIdsInIngredients = new Set(ingredients.map(ci => String(ci.cocktail_id)));
  console.log('🔢 Unique cocktail_id values in cocktail_ingredients:');
  Array.from(cocktailIdsInIngredients).sort().slice(0, 20).forEach(id => console.log(`  ${id}`));
  if (cocktailIdsInIngredients.size > 20) {
    console.log(`  ... and ${cocktailIdsInIngredients.size - 20} more`);
  }
  console.log('');

  // 4. Create mappings like the app does
  const legacyToUUID = new Map<number, string>();
  const uuidToName = new Map<string, string>();
  const nameToUUID = new Map<string, string>();

  cocktails.forEach(cocktail => {
    uuidToName.set(cocktail.id, cocktail.name);
    nameToUUID.set(cocktail.name.toLowerCase(), cocktail.id);
    if (cocktail.legacy_id) {
      legacyToUUID.set(cocktail.legacy_id, cocktail.id);
    }
  });

  console.log('🔗 Mapping analysis:');
  console.log(`  UUIDs in cocktails: ${cocktails.length}`);
  console.log(`  Legacy IDs available: ${legacyToUUID.size}`);
  console.log('');

  // 5. Create sequential mapping (alphabetical by name)
  const sortedCocktails = [...cocktails].sort((a, b) => a.name.localeCompare(b.name));
  const sequentialToUUID = new Map<string, string>();

  sortedCocktails.forEach((cocktail, index) => {
    const sequentialId = String(index + 1); // 1-based
    sequentialToUUID.set(sequentialId, cocktail.id);
  });

  console.log('📈 Sequential mapping (first 10):');
  Array.from(sequentialToUUID.entries()).slice(0, 10).forEach(([seq, uuid]) => {
    console.log(`  ${seq} -> ${uuidToName.get(uuid)} (${uuid})`);
  });
  console.log('');

  // 6. Try mapping cocktail_ingredients
  let mapped = 0;
  let failed = 0;
  const failedIds = new Set<string>();

  console.log('🎯 Testing mappings...');
  for (const ci of ingredients) {
    const cocktailIdStr = String(ci.cocktail_id);
    let mappedUUID: string | null = null;

    // Try UUID direct match
    if (cocktails.some(c => c.id === cocktailIdStr)) {
      mappedUUID = cocktailIdStr;
    }
    // Try legacy_id match
    else if (legacyToUUID.has(parseInt(cocktailIdStr))) {
      mappedUUID = legacyToUUID.get(parseInt(cocktailIdStr))!;
    }
    // Try sequential match
    else if (sequentialToUUID.has(cocktailIdStr)) {
      mappedUUID = sequentialToUUID.get(cocktailIdStr)!;
    }

    if (mappedUUID) {
      mapped++;
    } else {
      failed++;
      failedIds.add(cocktailIdStr);
    }
  }

  console.log(`✅ Successfully mapped: ${mapped}`);
  console.log(`❌ Failed to map: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('🔍 Failed cocktail_id values (first 10):');
    Array.from(failedIds).sort().slice(0, 10).forEach(id => console.log(`  ${id}`));
    console.log('');

    // Check if they might be sequential but offset
    const numericFailed = Array.from(failedIds).filter(id => /^\d+$/.test(id)).map(Number).sort();
    if (numericFailed.length > 0) {
      console.log('🔢 Analyzing numeric failed IDs:');
      console.log(`  Min: ${Math.min(...numericFailed)}`);
      console.log(`  Max: ${Math.max(...numericFailed)}`);
      console.log(`  Range: ${Math.max(...numericFailed) - Math.min(...numericFailed) + 1}`);
      console.log(`  Expected cocktails: ${cocktails.length}`);

      const offset = Math.min(...numericFailed) - 1; // If 1-based, offset should be 0
      console.log(`  Possible offset: ${offset}`);

      if (offset !== 0) {
        console.log('\n💡 Trying offset correction...');
        let corrected = 0;
        for (const failedId of numericFailed.slice(0, 5)) {
          const correctedId = failedId - offset;
          const correctedUUID = sequentialToUUID.get(String(correctedId));
          if (correctedUUID) {
            console.log(`  ${failedId} -> ${correctedId} -> ${uuidToName.get(correctedUUID)}`);
            corrected++;
          }
        }
        console.log(`  Offset correction worked for ${corrected}/${Math.min(5, numericFailed.length)} samples`);
      }
    }
  }

  // 7. Check a specific cocktail
  const margarita = cocktails.find(c => c.name.toLowerCase().includes('margarita'));
  if (margarita) {
    console.log(`\n🍸 Checking Margarita (${margarita.id}):`);
    const margaritaIngredients = ingredients.filter(ci => {
      const ciStr = String(ci.cocktail_id);
      return ciStr === margarita.id ||
             (margarita.legacy_id && ciStr === String(margarita.legacy_id)) ||
             sequentialToUUID.get(ciStr) === margarita.id;
    });

    console.log(`  Found ${margaritaIngredients.length} ingredient rows`);
    margaritaIngredients.slice(0, 5).forEach(ci => {
      console.log(`    cocktail_id: ${ci.cocktail_id}, ingredient_id: ${ci.ingredient_id}, measure: ${ci.measure}`);
    });
  }
}

debugCocktailMapping().catch(console.error);
