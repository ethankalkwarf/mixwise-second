#!/usr/bin/env node

/**
 * Populate cocktail_ingredients table from cocktails.ingredients JSON field
 *
 * This script reads the cocktails table and extracts ingredient relationships
 * from the ingredients JSON field, then inserts them into cocktail_ingredients.
 *
 * Usage: npm run populate:cocktail-ingredients
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateCocktailIngredients() {
  console.log('🍸 Starting cocktail ingredients population...\n');

  try {
    // Step 1: Check if cocktail_ingredients table exists and has data
    console.log('📊 Checking existing cocktail_ingredients data...');

    const { data: existingData, error: checkError } = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ cocktail_ingredients table does not exist. Creating it...');

      // Try to create the table using SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.cocktail_ingredients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            cocktail_id UUID NOT NULL,
            ingredient_id INTEGER NOT NULL,
            amount TEXT,
            is_optional BOOLEAN DEFAULT FALSE,
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS cocktail_ingredients_cocktail_id_idx ON public.cocktail_ingredients(cocktail_id);
          CREATE INDEX IF NOT EXISTS cocktail_ingredients_ingredient_id_idx ON public.cocktail_ingredients(ingredient_id);

          ALTER TABLE public.cocktail_ingredients ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Anyone can view cocktail ingredients"
            ON public.cocktail_ingredients FOR SELECT
            USING (TRUE);

          CREATE POLICY "Authenticated users can manage cocktail ingredients"
            ON public.cocktail_ingredients FOR ALL
            USING (auth.role() = 'authenticated');
        `
      });

      if (createError) {
        console.error('❌ Failed to create cocktail_ingredients table:', createError.message);
        console.log('Please run the database migration manually: supabase db push');
        return;
      }

      console.log('✅ Created cocktail_ingredients table');
    } else if (existingData && existingData.length > 0) {
      console.log('ℹ️  cocktail_ingredients table already has data. Skipping population.');
      return;
    }

    console.log('✅ Table exists but is empty. Proceeding with population...\n');

    // Step 2: Fetch all cocktails with their ingredients
    console.log('📋 Fetching cocktails with ingredients...');

    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails')
      .select('id, name, ingredients')
      .not('ingredients', 'is', null);

    if (cocktailError) {
      throw new Error(`Failed to fetch cocktails: ${cocktailError.message}`);
    }

    if (!cocktails || cocktails.length === 0) {
      console.log('ℹ️  No cocktails with ingredients found.');
      return;
    }

    console.log(`📈 Found ${cocktails.length} cocktails with ingredients\n`);

    // Step 3: Process cocktails and extract ingredient relationships
    console.log('🔄 Processing cocktail ingredients...');

    const ingredientRelationships = [];
    let processedCount = 0;
    let skippedCocktails = 0;

    for (const cocktail of cocktails) {
      if (!cocktail.ingredients || !Array.isArray(cocktail.ingredients)) {
        skippedCocktails++;
        continue;
      }

      for (const ingredientData of cocktail.ingredients) {
        if (!ingredientData.ingredient || !ingredientData.ingredient.id) {
          continue; // Skip invalid ingredient entries
        }

        ingredientRelationships.push({
          cocktail_id: cocktail.id, // This should already be UUID
          ingredient_id: ingredientData.ingredient.id,
          amount: ingredientData.amount || null,
          is_optional: ingredientData.isOptional || false,
          notes: ingredientData.notes || null
        });
      }

      processedCount++;
      if (processedCount % 50 === 0) {
        console.log(`   Processed ${processedCount}/${cocktails.length} cocktails...`);
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Cocktails processed: ${processedCount}`);
    console.log(`   Cocktails skipped: ${skippedCocktails}`);
    console.log(`   Ingredient relationships found: ${ingredientRelationships.length}\n`);

    if (ingredientRelationships.length === 0) {
      console.log('⚠️  No ingredient relationships found to insert.');
      return;
    }

    // Step 4: Insert ingredient relationships in batches
    console.log('💾 Inserting ingredient relationships...');

    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < ingredientRelationships.length; i += batchSize) {
      const batch = ingredientRelationships.slice(i, i + batchSize);
      console.log(`   Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ingredientRelationships.length / batchSize)} (${batch.length} relationships)...`);

      const { error: insertError } = await supabase
        .from('cocktail_ingredients')
        .insert(batch);

      if (insertError) {
        throw new Error(`Failed to insert batch: ${insertError.message}`);
      }

      insertedCount += batch.length;
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} ingredient relationships!\n`);

    // Step 5: Verification
    console.log('🔍 Running verification...');

    const { count: finalCount, error: countError } = await supabase
      .from('cocktail_ingredients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn(`⚠️  Could not verify final count: ${countError.message}`);
    } else {
      console.log(`   Final cocktail_ingredients count: ${finalCount}`);
    }

    // Test a sample cocktail
    if (cocktails.length > 0) {
      const sampleCocktail = cocktails.find(c => c.name.toLowerCase().includes('margarita'));
      if (sampleCocktail) {
        const { data: sampleIngredients, error: sampleError } = await supabase
          .from('cocktail_ingredients')
          .select('ingredient_id, amount, is_optional')
          .eq('cocktail_id', sampleCocktail.id);

        if (!sampleError && sampleIngredients) {
          console.log(`   Sample Margarita ingredients: ${sampleIngredients.length} found`);
        }
      }
    }

    console.log('\n🎉 Cocktail ingredients population completed successfully!');
    console.log('Now run: npm run migrate:cocktail-uuids');

  } catch (error) {
    console.error('💥 Population failed:', error.message);
    process.exit(1);
  }
}

// Run the population script
populateCocktailIngredients().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
