#!/usr/bin/env tsx

/**
 * Review duplicate cocktails - shows full details for comparison
 * Helps identify if duplicates should be merged or renamed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CocktailDetail {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  base_spirit: string | null;
  category_primary: string | null;
  ingredients: any;
  instructions: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

function formatIngredients(ingredients: any): string {
  if (!ingredients) return 'No ingredients';
  if (typeof ingredients === 'string') return ingredients;
  if (Array.isArray(ingredients)) {
    return ingredients.map((ing: any) => {
      if (typeof ing === 'string') return ing;
      if (ing.name) return `${ing.name}${ing.amount ? ` (${ing.amount})` : ''}`;
      return JSON.stringify(ing);
    }).join(', ');
  }
  return JSON.stringify(ingredients);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function compareCocktails(cocktail1: CocktailDetail, cocktail2: CocktailDetail) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 COMPARING: "${cocktail1.name}"`);
  console.log('='.repeat(80));
  
  // Side-by-side comparison
  const fields = [
    { label: 'ID', key: 'id' },
    { label: 'Slug', key: 'slug' },
    { label: 'Base Spirit', key: 'base_spirit' },
    { label: 'Category', key: 'category_primary' },
    { label: 'Description', key: 'short_description', maxLength: 100 },
    { label: 'Ingredients', key: 'ingredients', format: formatIngredients },
    { label: 'Instructions', key: 'instructions', maxLength: 200 },
    { label: 'Image URL', key: 'image_url', maxLength: 50 },
    { label: 'Created', key: 'created_at', format: formatDate },
    { label: 'Updated', key: 'updated_at', format: formatDate },
  ];

  fields.forEach(field => {
    const val1 = cocktail1[field.key as keyof CocktailDetail];
    const val2 = cocktail2[field.key as keyof CocktailDetail];
    
    const display1 = field.format 
      ? field.format(val1 as any)
      : (val1 ? String(val1).substring(0, field.maxLength || 1000) : 'null');
    const display2 = field.format
      ? field.format(val2 as any)
      : (val2 ? String(val2).substring(0, field.maxLength || 1000) : 'null');
    
    const match = display1 === display2 ? '✅' : '❌';
    
    console.log(`\n${field.label}:`);
    console.log(`  ${match} Version 1: ${display1 || '(empty)'}`);
    console.log(`  ${match} Version 2: ${display2 || '(empty)'}`);
    
    if (display1 !== display2) {
      console.log(`     ⚠️  DIFFERENCE DETECTED`);
    }
  });

  // Similarity score
  let matches = 0;
  let total = 0;
  fields.forEach(field => {
    const val1 = cocktail1[field.key as keyof CocktailDetail];
    const val2 = cocktail2[field.key as keyof CocktailDetail];
    total++;
    if (val1 === val2 || (!val1 && !val2)) matches++;
  });

  const similarity = Math.round((matches / total) * 100);
  console.log(`\n📊 Similarity Score: ${similarity}% (${matches}/${total} fields match)`);

  // Recommendation
  console.log('\n💡 RECOMMENDATION:');
  if (similarity >= 90) {
    console.log('   ⚠️  HIGH SIMILARITY - These appear to be duplicates');
    console.log('   → Consider merging: Keep the more complete version, delete the other');
  } else if (similarity >= 70) {
    console.log('   ⚠️  MODERATE SIMILARITY - These might be variations');
    console.log('   → Review manually: May be different recipes with same name');
    console.log('   → Consider renaming one to distinguish (e.g., add "(Classic)" or "(Modern)")');
  } else {
    console.log('   ✅ LOW SIMILARITY - These appear to be different recipes');
    console.log('   → Consider renaming one to avoid confusion');
  }
}

async function reviewDuplicates() {
  console.log('🔍 Reviewing Duplicate Cocktails\n');
  console.log('='.repeat(80));

  try {
    // Find duplicates by name
    const { data: allCocktails, error } = await supabase
      .from('cocktails')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!allCocktails) {
      console.log('No cocktails found');
      return;
    }

    // Group by name
    const nameGroups = new Map<string, string[]>();
    allCocktails.forEach(cocktail => {
      const name = cocktail.name?.toLowerCase().trim();
      if (!name) return;
      
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name)!.push(cocktail.id);
    });

    // Find duplicates
    const duplicates = Array.from(nameGroups.entries())
      .filter(([_, ids]) => ids.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate names found');
      return;
    }

    console.log(`Found ${duplicates.length} duplicate name(s):\n`);

    // Review each duplicate
    for (const [name, ids] of duplicates) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 REVIEWING: "${name}" (${ids.length} versions)`);
      console.log('='.repeat(80));

      // Fetch full details for each duplicate
      const { data: cocktails, error: fetchError } = await supabase
        .from('cocktails')
        .select('*')
        .in('id', ids)
        .order('created_at');

      if (fetchError || !cocktails || cocktails.length < 2) {
        console.error('❌ Error fetching details:', fetchError);
        continue;
      }

      // Compare each pair
      for (let i = 0; i < cocktails.length; i++) {
        for (let j = i + 1; j < cocktails.length; j++) {
          compareCocktails(
            cocktails[i] as CocktailDetail,
            cocktails[j] as CocktailDetail
          );
        }
      }

      // Show all IDs for easy reference
      console.log(`\n📝 All IDs for "${name}":`);
      cocktails.forEach((c, idx) => {
        console.log(`   ${idx + 1}. ID: ${c.id} | Slug: ${c.slug} | Created: ${formatDate(c.created_at)}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total duplicate groups: ${duplicates.length}`);
    console.log(`Total duplicate cocktails: ${duplicates.reduce((sum, [_, ids]) => sum + ids.length, 0)}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Review the comparisons above');
    console.log('   2. Decide which duplicates to merge or rename');
    console.log('   3. Use the IDs provided to make changes in Supabase dashboard or via SQL');
    console.log('\n💡 SQL to delete a duplicate (replace ID):');
    console.log('   DELETE FROM cocktails WHERE id = \'<cocktail-id-here>\';');
    console.log('\n💡 SQL to rename a duplicate (replace ID and name):');
    console.log('   UPDATE cocktails SET name = \'New Name Here\' WHERE id = \'<cocktail-id-here>\';');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

reviewDuplicates();

