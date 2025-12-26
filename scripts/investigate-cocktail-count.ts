#!/usr/bin/env tsx

/**
 * Deep investigation of cocktail count discrepancy
 * User reports ~190 cocktails but queries show 434
 */

import { sanityClient } from '../lib/sanityClient.js';

async function investigateCocktailCount() {
  console.log('🔍 DEEP INVESTIGATION: Cocktail Count Discrepancy');
  console.log('=================================================\n');

  try {
    // Method 1: Simple count query
    console.log('📊 Method 1: Simple count query');
    const simpleCount = await sanityClient.fetch('count(*[_type == "cocktail"])');
    console.log(`   Total cocktails (simple count): ${simpleCount}\n`);

    // Method 2: Fetch all cocktails with basic info
    console.log('📋 Method 2: Fetch all cocktails with basic info');
    const allCocktails = await sanityClient.fetch('*[_type == "cocktail"] { _id, name, slug, hidden }');
    console.log(`   Total cocktails fetched: ${allCocktails.length}\n`);

    // Method 3: Check for duplicates by name
    console.log('🔍 Method 3: Check for duplicates by name');
    const nameCounts = allCocktails.reduce((acc, cocktail) => {
      const name = cocktail.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicates = Object.entries(nameCounts)
      .filter(([name, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`   Unique cocktail names: ${Object.keys(nameCounts).length}`);
    console.log(`   Duplicate names found: ${duplicates.length}`);

    if (duplicates.length > 0) {
      console.log('\n   Top duplicate names:');
      duplicates.slice(0, 10).forEach(([name, count]) => {
        console.log(`     - "${name}": ${count} times`);
      });
    }
    console.log('');

    // Method 4: Check for duplicates by slug
    console.log('🔍 Method 4: Check for duplicates by slug');
    const slugCounts = allCocktails.reduce((acc, cocktail) => {
      const slug = cocktail.slug?.current;
      if (slug) {
        acc[slug] = (acc[slug] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const slugDuplicates = Object.entries(slugCounts)
      .filter(([slug, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`   Unique cocktail slugs: ${Object.keys(slugCounts).length}`);
    console.log(`   Duplicate slugs found: ${slugDuplicates.length}`);

    if (slugDuplicates.length > 0) {
      console.log('\n   Top duplicate slugs:');
      slugDuplicates.slice(0, 10).forEach(([slug, count]) => {
        console.log(`     - "${slug}": ${count} times`);
      });
    }
    console.log('');

    // Method 5: Check hidden status
    console.log('👁️  Method 5: Check hidden status');
    const visibleCocktails = allCocktails.filter(c => !c.hidden);
    const hiddenCocktails = allCocktails.filter(c => c.hidden);
    console.log(`   Visible cocktails: ${visibleCocktails.length}`);
    console.log(`   Hidden cocktails: ${hiddenCocktails.length}`);
    console.log(`   Cocktails with undefined hidden status: ${allCocktails.filter(c => c.hidden === undefined).length}\n`);

    // Method 6: Check for empty or invalid entries
    console.log('🧹 Method 6: Check for empty or invalid entries');
    const emptyNames = allCocktails.filter(c => !c.name || c.name.trim() === '');
    const emptySlugs = allCocktails.filter(c => !c.slug?.current || c.slug.current.trim() === '');
    console.log(`   Cocktails with empty names: ${emptyNames.length}`);
    console.log(`   Cocktails with empty slugs: ${emptySlugs.length}\n`);

    // Method 7: Check slug patterns
    console.log('🔗 Method 7: Check slug patterns');
    const slugPatterns = allCocktails.reduce((acc, cocktail) => {
      const slug = cocktail.slug?.current;
      if (slug) {
        // Extract pattern (e.g., "margarita-recipe" -> "recipe")
        const parts = slug.split('-');
        const lastPart = parts[parts.length - 1];
        acc[lastPart] = (acc[lastPart] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    console.log('   Slug ending patterns:');
    Object.entries(slugPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([pattern, count]) => {
        console.log(`     - "${pattern}": ${count} cocktails`);
      });
    console.log('');

    // Method 8: Sample of cocktail data
    console.log('📝 Method 8: Sample cocktail data');
    console.log('   First 5 cocktails:');
    allCocktails.slice(0, 5).forEach((cocktail, i) => {
      console.log(`     ${i + 1}. "${cocktail.name}" (${cocktail.slug?.current}) [Hidden: ${cocktail.hidden}]`);
    });
    console.log('');

    // Method 9: Check if this matches the production data
    console.log('🌐 Method 9: Check dataset configuration');
    const config = await sanityClient.fetch('*[_type == "siteSettings"] { title }');
    console.log(`   Site settings found: ${config.length}`);
    if (config.length > 0) {
      console.log(`   Site title: ${config[0].title}`);
    }
    console.log('');

    // Method 10: Summary and analysis
    console.log('📊 SUMMARY & ANALYSIS');
    console.log('===================');
    console.log(`Total cocktails in database: ${allCocktails.length}`);
    console.log(`Visible cocktails: ${visibleCocktails.length}`);
    console.log(`Hidden cocktails: ${hiddenCocktails.length}`);
    console.log(`Duplicate names: ${duplicates.length}`);
    console.log(`Duplicate slugs: ${slugDuplicates.length}`);
    console.log(`Empty names: ${emptyNames.length}`);
    console.log(`Empty slugs: ${emptySlugs.length}`);

    if (allCocktails.length > 200) {
      console.log('\n⚠️  POTENTIAL ISSUES:');
      console.log('   - High cocktail count suggests possible data duplication');
      console.log('   - Check for bulk imports that may have created duplicates');
      console.log('   - Verify if this is the correct Sanity dataset');
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('   1. Check Sanity Studio directly for the actual count');
    console.log('   2. Look for duplicate entries and clean them up');
    console.log('   3. Verify the dataset configuration');
    console.log('   4. Check if there are unpublished drafts');

  } catch (error) {
    console.error('❌ Error in investigation:', error);
    process.exit(1);
  }
}

// Run the investigation
investigateCocktailCount();
