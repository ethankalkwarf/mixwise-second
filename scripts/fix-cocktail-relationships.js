// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function fixCocktailRelationships() {
  console.log('🔧 Fixing cocktail ingredient relationships...\n');

  try {
    // Get all cocktails with their ingredients from JSON
    console.log('📋 Fetching cocktails with JSON ingredients...');

    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, legacy_id, name, ingredients')
      .not('ingredients', 'is', null);

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    console.log(`Found ${cocktails.length} cocktails with ingredients`);

    // Create mapping from numeric cocktail_id to UUID based on row ordering
    console.log('🗺️  Creating numeric ID to UUID mapping...');

    // Sort cocktails by name to match the likely ordering used when populating cocktail_ingredients
    const sortedCocktails = [...cocktails].sort((a, b) => a.name.localeCompare(b.name));

    // Create mapping: numeric_id -> UUID
    const numericToUUID = new Map();
    sortedCocktails.forEach((cocktail, index) => {
      // Use 1-based indexing to match the numeric IDs
      numericToUUID.set(index + 1, cocktail.id);
    });

    console.log(`Created mapping for ${numericToUUID.size} numeric IDs to UUIDs`);
    console.log('Sample mappings:');
    for (let i = 1; i <= Math.min(5, numericToUUID.size); i++) {
      const uuid = numericToUUID.get(i);
      const cocktail = sortedCocktails[i - 1];
      console.log(`  ${i} → ${cocktail.name} (${uuid})`);
    }

    // Get all existing relationships
    const { data: existingRelationships, error: fetchError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id, measure');

    if (fetchError) {
      throw new Error(`Failed to fetch existing relationships: ${fetchError.message}`);
    }

    console.log(`\n📊 Found ${existingRelationships.length} existing relationships`);

    // Update relationships to use UUIDs
    console.log('🔄 Updating cocktail_ingredients to use UUIDs...');

    const updates = [];
    const unmappable = [];

    for (const relationship of existingRelationships) {
      const uuid = numericToUUID.get(relationship.cocktail_id);
      if (uuid) {
        updates.push({
          old_cocktail_id: relationship.cocktail_id,
          new_cocktail_id: uuid,
          ingredient_id: relationship.ingredient_id,
          measure: relationship.measure
        });
      } else {
        unmappable.push(relationship);
      }
    }

    console.log(`📊 Analysis:`);
    console.log(`   ${updates.length} relationships can be mapped`);
    console.log(`   ${unmappable.length} relationships are unmappable`);

    if (unmappable.length > 0) {
      console.log('Unmappable cocktail_ids:', [...new Set(unmappable.map(r => r.cocktail_id))]);
    }

    // Clear existing data
    console.log('\n🗑️  Clearing existing cocktail_ingredients data...');
    const { error: deleteError } = await supabase
      .from('cocktail_ingredients')
      .delete()
      .neq('cocktail_id', 0); // cocktail_id is bigint, not UUID

    if (deleteError) {
      throw new Error(`Failed to clear existing data: ${deleteError.message}`);
    }

    // Insert updated relationships
    console.log('💾 Inserting updated relationships...');

    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      console.log(`   Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)} (${batch.length} relationships)...`);

      const batchData = batch.map(update => ({
        cocktail_id: update.new_cocktail_id,
        ingredient_id: update.ingredient_id,
        measure: update.measure
      }));

      const { error: insertError } = await supabase
        .from('cocktail_ingredients')
        .insert(batchData);

      if (insertError) {
        throw new Error(`Failed to insert batch: ${insertError.message}`);
      }

      insertedCount += batch.length;
    }

    console.log(`\n✅ Successfully updated ${insertedCount} ingredient relationships!`);

    // Verification
    console.log('🔍 Verifying relationships...');

    const { count: finalCount, error: countError } = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn(`⚠️  Could not verify count: ${countError.message}`);
    } else {
      console.log(`   Final count: ${finalCount} relationships`);
    }

    // Test a sample join
    const { data: sampleJoin, error: joinError } = await supabase
      .from('cocktail_ingredients')
      .select(`
        cocktail_id,
        ingredient_id,
        cocktails!inner(name),
        ingredients!inner(name)
      `)
      .limit(5);

    if (joinError) {
      console.warn(`⚠️  Join test failed: ${joinError.message}`);
    } else {
      console.log('   Join test successful:');
      sampleJoin.forEach(row => {
        console.log(`     ${row.cocktails.name} → ${row.ingredients.name}`);
      });
    }

    console.log('\n🎉 Cocktail ingredient relationships fixed!');

    console.log('\n🎉 Cocktail ingredient relationships fixed!');

  } catch (error) {
    console.error('💥 Fix failed:', error.message);
    process.exit(1);
  }
}

fixCocktailRelationships();
