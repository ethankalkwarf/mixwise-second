#!/usr/bin/env tsx

/**
 * Check actual cocktail count in Supabase database
 * Identifies duplicates and data quality issues
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
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCocktailCount() {
  console.log('🔍 Checking Cocktail Count in Supabase\n');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // Method 1: Simple count
    console.log('📊 Method 1: Total Count');
    const { count, error: countError } = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error:', countError);
      return;
    }

    console.log(`   Total cocktails in database: ${count}`);
    console.log('');

    // Method 2: Fetch all to check for duplicates
    console.log('📋 Method 2: Fetching All Cocktails');
    const { data: allCocktails, error: fetchError } = await supabase
      .from('cocktails')
      .select('id, name, slug')
      .order('name');

    if (fetchError) {
      console.error('❌ Error:', fetchError);
      return;
    }

    if (!allCocktails) {
      console.log('   No cocktails found');
      return;
    }

    console.log(`   Fetched ${allCocktails.length} cocktails`);
    console.log('');

    // Method 3: Check for duplicate names
    console.log('🔍 Method 3: Checking for Duplicate Names');
    const nameCounts = new Map<string, number>();
    const nameDuplicates = new Map<string, string[]>();

    allCocktails.forEach((cocktail) => {
      const name = cocktail.name?.toLowerCase().trim();
      if (!name) return;
      
      const current = nameCounts.get(name) || 0;
      nameCounts.set(name, current + 1);

      if (!nameDuplicates.has(name)) {
        nameDuplicates.set(name, []);
      }
      nameDuplicates.get(name)!.push(cocktail.id);
    });

    const duplicates = Array.from(nameCounts.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`   Unique cocktail names: ${nameCounts.size}`);
    console.log(`   Duplicate names found: ${duplicates.length}`);

    if (duplicates.length > 0) {
      console.log('\n   ⚠️  Duplicate Names:');
      duplicates.slice(0, 10).forEach(([name, count]) => {
        console.log(`     - "${name}": ${count} times`);
        const ids = nameDuplicates.get(name)!;
        console.log(`       IDs: ${ids.join(', ')}`);
      });
    }
    console.log('');

    // Method 4: Check for duplicate slugs
    console.log('🔍 Method 4: Checking for Duplicate Slugs');
    const slugCounts = new Map<string, number>();
    const slugDuplicates = new Map<string, string[]>();

    allCocktails.forEach((cocktail) => {
      const slug = cocktail.slug?.toLowerCase().trim();
      if (!slug) return;

      const current = slugCounts.get(slug) || 0;
      slugCounts.set(slug, current + 1);

      if (!slugDuplicates.has(slug)) {
        slugDuplicates.set(slug, []);
      }
      slugDuplicates.get(slug)!.push(cocktail.id);
    });

    const slugDups = Array.from(slugCounts.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`   Unique slugs: ${slugCounts.size}`);
    console.log(`   Duplicate slugs found: ${slugDups.length}`);

    if (slugDups.length > 0) {
      console.log('\n   ⚠️  Duplicate Slugs (CRITICAL - slugs must be unique):');
      slugDups.slice(0, 10).forEach(([slug, count]) => {
        console.log(`     - "${slug}": ${count} times`);
        const ids = slugDuplicates.get(slug)!;
        console.log(`       IDs: ${ids.join(', ')}`);
      });
    }
    console.log('');

    // Method 5: Check for empty/invalid data
    console.log('🧹 Method 5: Checking Data Quality');
    const emptyNames = allCocktails.filter(c => !c.name || c.name.trim() === '');
    const emptySlugs = allCocktails.filter(c => !c.slug || c.slug.trim() === '');
    const nullSlugs = allCocktails.filter(c => c.slug === null);

    console.log(`   Empty names: ${emptyNames.length}`);
    console.log(`   Empty slugs: ${emptySlugs.length}`);
    console.log(`   Null slugs: ${nullSlugs.length}`);

    if (emptyNames.length > 0) {
      console.log('\n   ⚠️  Cocktails with empty names:');
      emptyNames.slice(0, 5).forEach(c => {
        console.log(`     - ID: ${c.id}, Slug: ${c.slug || 'N/A'}`);
      });
    }

    if (emptySlugs.length > 0 || nullSlugs.length > 0) {
      console.log('\n   ⚠️  Cocktails with empty/null slugs (CRITICAL):');
      [...emptySlugs, ...nullSlugs].slice(0, 5).forEach(c => {
        console.log(`     - ID: ${c.id}, Name: ${c.name || 'N/A'}`);
      });
    }
    console.log('');

    // Method 6: Sample data
    console.log('📝 Method 6: Sample Cocktails');
    console.log('   First 10 cocktails:');
    allCocktails.slice(0, 10).forEach((cocktail, i) => {
      console.log(`     ${i + 1}. "${cocktail.name}" (${cocktail.slug})`);
    });
    console.log('');

    // Summary
    console.log('📊 SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total cocktails: ${count}`);
    console.log(`Unique names: ${nameCounts.size}`);
    console.log(`Duplicate names: ${duplicates.length}`);
    console.log(`Unique slugs: ${slugCounts.size}`);
    console.log(`Duplicate slugs: ${slugDups.length} ⚠️`);
    console.log(`Empty names: ${emptyNames.length}`);
    console.log(`Empty/null slugs: ${emptySlugs.length + nullSlugs.length} ⚠️`);

    if (slugDups.length > 0 || emptySlugs.length > 0 || nullSlugs.length > 0) {
      console.log('\n❌ DATA QUALITY ISSUES FOUND:');
      if (slugDups.length > 0) {
        console.log(`   - ${slugDups.length} duplicate slugs (must be unique)`);
      }
      if (emptySlugs.length > 0 || nullSlugs.length > 0) {
        console.log(`   - ${emptySlugs.length + nullSlugs.length} cocktails with empty/null slugs`);
      }
    } else if (duplicates.length > 0) {
      console.log('\n⚠️  WARNING: Duplicate names found (slugs are unique, so this may be OK)');
    } else {
      console.log('\n✅ No major data quality issues detected');
    }

    // Recommendation
    const actualCount = nameCounts.size; // Unique names
    if (count && count > actualCount) {
      console.log(`\n💡 RECOMMENDATION:`);
      console.log(`   Database has ${count} rows, but only ${actualCount} unique names.`);
      console.log(`   Consider cleaning up duplicates.`);
    }

    if (count && count !== 190 && count < 200) {
      console.log(`\n💡 NOTE:`);
      console.log(`   Current count (${count}) is close to your reported ~190 cocktails.`);
      console.log(`   The README says "400+" which appears to be outdated.`);
      console.log(`   Consider updating README.md to reflect actual count.`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

checkCocktailCount();

