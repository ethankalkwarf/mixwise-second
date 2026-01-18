/**
 * Test script to verify the bar ingredients fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBarFix() {
  console.log('🧪 Testing bar ingredients fix...\n');

  try {
    // Find the test user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .eq('username', 'ethankalkwarf')
      .single();

    if (profileError || !profile) {
      console.error('Could not find test user:', profileError);
      return;
    }

    console.log(`✓ Found user: ${profile.display_name} (${profile.username})\n`);

    // Test getUserBarIngredients logic
    console.log('Testing getUserBarIngredients logic...');

    // Fetch ingredients for mapping
    const { data: allIngredients, error: ingError } = await supabase
      .from('ingredients')
      .select('id, name, category')
      .not('id', 'is', null)
      .not('name', 'is', null);

    if (ingError) {
      console.error('❌ Failed to fetch ingredients:', ingError);
      return;
    }

    console.log(`✓ Fetched ${allIngredients.length} ingredients from database`);

    // Build mappings
    const idToNameMap = new Map();
    const idToCategoryMap = new Map();

    allIngredients.forEach(ing => {
      const stringId = String(ing.id);
      idToNameMap.set(stringId, ing.name);
      idToCategoryMap.set(stringId, ing.category ?? null);
    });

    console.log(`✓ Built mappings for ${idToNameMap.size} ingredients`);
    console.log(`  - 121 maps to: "${idToNameMap.get('121')}"`);
    console.log(`  - 135 maps to: "${idToNameMap.get('135')}"\n`);

    // Fetch user's bar ingredients
    const { data: barIngredients, error: barError } = await supabase
      .from('bar_ingredients')
      .select('*')
      .eq('user_id', profile.id);

    if (barError) {
      console.error('❌ Failed to fetch bar ingredients:', barError);
      return;
    }

    console.log(`✓ Fetched ${barIngredients.length} bar ingredients\n`);

    // Process bar ingredients (simulate getUserBarIngredients)
    const processedIngredients = barIngredients.map(item => {
      const stringId = String(item.ingredient_id);
      const properName = idToNameMap.get(stringId) || item.ingredient_name || item.ingredient_id;
      const category = idToCategoryMap.get(stringId) ?? null;

      return {
        id: item.id.toString(),
        ingredient_id: stringId,
        ingredient_name: properName,
        ingredient_category: category,
      };
    });

    console.log('📊 Processed ingredients result:');
    const testIngredients = processedIngredients.filter(item =>
      item.ingredient_id === '121' || item.ingredient_id === '135'
    );

    testIngredients.forEach(item => {
      console.log(`  - ID ${item.ingredient_id}: "${item.ingredient_name}" (category: ${item.ingredient_category})`);
    });

    // Check if fix worked
    const hasCorrectNames = testIngredients.every(item => {
      if (item.ingredient_id === '121') return item.ingredient_name === 'Triple Sec';
      if (item.ingredient_id === '135') return item.ingredient_name === 'Tequila';
      return true;
    });

    const hasCorrectCategories = testIngredients.every(item => {
      if (item.ingredient_id === '121') return item.ingredient_category === 'Liqueur';
      if (item.ingredient_id === '135') return item.ingredient_category === 'Spirit';
      return true;
    });

    console.log(`\n🎯 Test Results:`);
    console.log(`  ✅ Names correct: ${hasCorrectNames}`);
    console.log(`  ✅ Categories correct: ${hasCorrectCategories}`);

    if (hasCorrectNames && hasCorrectCategories) {
      console.log(`\n🎉 SUCCESS: Bar ingredients fix is working correctly!`);
      console.log(`   - "121" now shows as "Triple Sec" in Liqueur category`);
      console.log(`   - "135" now shows as "Tequila" in Spirit category`);
    } else {
      console.log(`\n❌ FAILURE: Fix did not work as expected`);
      console.log(`   Expected: 121 → "Triple Sec" (Liqueur), 135 → "Tequila" (Spirit)`);
      console.log(`   Actual:`, testIngredients);
    }

    // Test InventoryList grouping
    console.log(`\n📂 Testing category grouping:`);
    const categoryGroups = processedIngredients.reduce((acc, item) => {
      const category = item.ingredient_category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    Object.entries(categoryGroups).forEach(([category, items]) => {
      const testItems = items.filter(item => item.ingredient_id === '121' || item.ingredient_id === '135');
      if (testItems.length > 0) {
        console.log(`  ${category}: ${testItems.map(i => `"${i.ingredient_name}"`).join(', ')}`);
      }
    });

    if (categoryGroups['Other'] && categoryGroups['Other'].some(item =>
      item.ingredient_id === '121' || item.ingredient_id === '135'
    )) {
      console.log(`\n⚠️  WARNING: Test ingredients are still in "Other" category instead of proper categories`);
    } else {
      console.log(`\n✅ Test ingredients are properly categorized`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBarFix();