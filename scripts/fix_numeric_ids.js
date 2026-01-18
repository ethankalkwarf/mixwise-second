/**
 * Fix numeric ingredient IDs in bar_ingredients table
 * This script directly fixes the issue where numeric IDs like "121" and "135"
 * are stored instead of proper UUIDs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixNumericIds() {
  console.log('🔧 Fixing numeric ingredient IDs...\n');

  try {
    // Step 1: Find the user ethankalkwarf
    console.log('Step 1: Finding user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .eq('username', 'ethankalkwarf')
      .single();

    if (profileError || !profile) {
      console.error('Could not find user ethankalkwarf:', profileError);
      return;
    }

    console.log(`   ✓ Found user: ${profile.display_name} (${profile.username}) - ID: ${profile.id}\n`);

    // Step 2: Check current bar ingredients for this user
    console.log('Step 2: Checking current bar ingredients...');
    const { data: barIngredients, error: barError } = await supabase
      .from('bar_ingredients')
      .select('*')
      .eq('user_id', profile.id);

    if (barError) {
      console.error('Error fetching bar ingredients:', barError);
      return;
    }

    console.log(`   ✓ Found ${barIngredients.length} bar ingredients\n`);

    // Find numeric IDs
    const numericIds = barIngredients.filter(item => /^\d+$/.test(item.ingredient_id));
    console.log(`   ⚠️  Found ${numericIds.length} numeric ingredient IDs:`);
    numericIds.forEach(item => {
      console.log(`      - ID: ${item.ingredient_id}, Name: ${item.ingredient_name || 'null'}`);
    });
    console.log('');

    // Step 3: Find the correct UUID mappings
    console.log('Step 3: Finding correct UUID mappings...');

    // First check what columns exist in ingredients table
    const { data: sampleIngredients, error: sampleError } = await supabase
      .from('ingredients')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error checking ingredients table structure:', sampleError);
      return;
    }

    console.log('Ingredients table columns:', Object.keys(sampleIngredients[0] || {}));

    // Based on the test data comments, we know:
    // - 121 = Triple Sec
    // - 135 = Tequila
    // Let's search by name instead
    const { data: tripleSec, error: tripleSecError } = await supabase
      .from('ingredients')
      .select('id, name')
      .ilike('name', '%triple sec%');

    const { data: tequila, error: tequilaError } = await supabase
      .from('ingredients')
      .select('id, name')
      .ilike('name', '%tequila%');

    if (tripleSecError || tequilaError) {
      console.error('Error finding ingredients by name:', { tripleSecError, tequilaError });
      return;
    }

    console.log('Triple Sec search results:', tripleSec);
    console.log('Tequila search results:', tequila);

    // Create mapping based on known mappings from test data
    const idMapping = {
      '121': {
        uuid: tripleSec && tripleSec.length > 0 ? tripleSec[0].id : null,
        name: tripleSec && tripleSec.length > 0 ? tripleSec[0].name : 'Triple Sec'
      },
      '135': {
        uuid: tequila && tequila.length > 0 ? tequila[0].id : null,
        name: tequila && tequila.length > 0 ? tequila[0].name : 'Tequila'
      }
    };

    console.log(`   ✓ Ingredient mappings:`);
    Object.entries(idMapping).forEach(([legacyId, mapping]) => {
      console.log(`      - Legacy ID: ${legacyId} → UUID: ${mapping.uuid} (${mapping.name})`);
    });
    console.log('');

    // Step 4: Update the bar_ingredients table
    console.log('Step 4: Updating bar_ingredients table...');
    let updatedCount = 0;

    for (const item of barIngredients) {
      if (idMapping[item.ingredient_id]) {
        const mapping = idMapping[item.ingredient_id];
        console.log(`   Updating: ${item.ingredient_id} → ${mapping.uuid} (${mapping.name})`);

        const { error: updateError } = await supabase
          .from('bar_ingredients')
          .update({
            ingredient_id: mapping.uuid,
            ingredient_name: mapping.name
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`      ❌ Failed to update item ${item.id}:`, updateError);
        } else {
          console.log(`      ✅ Updated item ${item.id}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n   ✓ Updated ${updatedCount} bar ingredients\n`);

    // Step 5: Verify the fix
    console.log('Step 5: Verifying the fix...');
    const { data: updatedBarIngredients, error: verifyError } = await supabase
      .from('bar_ingredients')
      .select(`
        id,
        ingredient_id,
        ingredient_name,
        ingredients!inner(name, legacy_id)
      `)
      .eq('user_id', profile.id);

    if (verifyError) {
      console.error('Error verifying fix:', verifyError);
      return;
    }

    console.log(`   ✓ Verification results:`);
    updatedBarIngredients.forEach(item => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.ingredient_id);
      console.log(`      - ${item.ingredient_id} (${item.ingredient_name}) - ${isUuid ? '✅ UUID' : '❌ Still numeric'}`);
    });

    // Check for any remaining numeric IDs
    const remainingNumeric = updatedBarIngredients.filter(item => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.ingredient_id));
    if (remainingNumeric.length === 0) {
      console.log('\n🎉 SUCCESS: All numeric IDs have been converted to UUIDs!');
    } else {
      console.log(`\n⚠️  WARNING: ${remainingNumeric.length} numeric IDs remain`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixNumericIds();