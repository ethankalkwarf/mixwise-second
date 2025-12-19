#!/usr/bin/env ts-node

/**
 * Mix Tool Coverage Report
 *
 * Generates a comprehensive report on cocktail ingredient coverage for the Mix Tool.
 *
 * Usage:
 *   npx ts-node scripts/mixToolCoverageReport.ts [--json]
 *
 * Options:
 *   --json    Output machine-readable JSON instead of formatted text
 *
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CoverageReport {
  totalCocktails: number;
  cocktailsWithIngredients: number;
  cocktailsWithoutIngredients: Array<{
    id: string;
    name: string;
  }>;
  topUnmatchedParsedNames: Array<{
    parsed_name: string;
    count: number;
  }>;
}

async function generateCoverageReport(): Promise<CoverageReport> {
  console.log('📊 Generating Mix Tool coverage report...\n');

  // 1. Get total cocktails count
  const { count: totalCocktails, error: totalError } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    throw new Error(`Failed to get total cocktails: ${totalError.message}`);
  }

  // 2. Get cocktails with ingredient relationships
  const { data: ingredientData, error: ingredientError } = await supabase
    .from('cocktail_ingredients')
    .select('cocktail_id');

  if (ingredientError) {
    throw new Error(`Failed to get ingredient data: ${ingredientError.message}`);
  }

  const cocktailsWithIngredientsSet = new Set(ingredientData.map(row => row.cocktail_id));
  const cocktailsWithIngredients = cocktailsWithIngredientsSet.size;

  // 3. Get cocktails without relationships (id + name)
  const { data: allCocktails, error: cocktailsError } = await supabase
    .from('cocktails')
    .select('id, name')
    .order('name');

  if (cocktailsError) {
    throw new Error(`Failed to get cocktail list: ${cocktailsError.message}`);
  }

  // Create position mapping for cocktails
  const cocktailPositions = new Map<string, number>();
  allCocktails.forEach((cocktail, index) => {
    cocktailPositions.set(cocktail.id, index + 1);
  });

  const cocktailsWithoutIngredients = allCocktails.filter(cocktail => {
    const position = cocktailPositions.get(cocktail.id);
    return position && !cocktailsWithIngredientsSet.has(position);
  });

  // 4. Get top 25 unmatched parsed names (if table exists)
  let topUnmatchedParsedNames: Array<{ parsed_name: string; count: number }> = [];

  try {
    const { data: unmatchedData, error: unmatchedError } = await supabase
      .from('cocktail_ingredient_parse')
      .select('parsed_name')
      .is('matched_ingredient_id', null);

    if (!unmatchedError && unmatchedData) {
      // Count occurrences
      const nameCounts = new Map<string, number>();
      unmatchedData.forEach(row => {
        const count = nameCounts.get(row.parsed_name) || 0;
        nameCounts.set(row.parsed_name, count + 1);
      });

      // Sort by count and take top 25
      topUnmatchedParsedNames = Array.from(nameCounts.entries())
        .map(([parsed_name, count]) => ({ parsed_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25);
    }
  } catch (error) {
    // Table might not exist, continue without this data
    console.log('⚠️  cocktail_ingredient_parse table not found, skipping unmatched parsed names');
  }

  return {
    totalCocktails: totalCocktails || 0,
    cocktailsWithIngredients,
    cocktailsWithoutIngredients,
    topUnmatchedParsedNames
  };
}

function printTextReport(report: CoverageReport) {
  console.log('🍸 Mix Tool Coverage Report');
  console.log('=' .repeat(40));
  console.log();

  console.log('📊 OVERVIEW');
  console.log(`   Total cocktails: ${report.totalCocktails}`);
  console.log(`   With ingredients: ${report.cocktailsWithIngredients}`);
  console.log(`   Without ingredients: ${report.totalCocktails - report.cocktailsWithIngredients}`);
  console.log(`   Coverage: ${((report.cocktailsWithIngredients / report.totalCocktails) * 100).toFixed(1)}%`);
  console.log();

  if (report.cocktailsWithoutIngredients.length > 0) {
    console.log('❌ COCKTAILS WITHOUT INGREDIENTS');
    report.cocktailsWithoutIngredients.slice(0, 10).forEach(cocktail => {
      console.log(`   - ${cocktail.name} (${cocktail.id})`);
    });

    if (report.cocktailsWithoutIngredients.length > 10) {
      console.log(`   ... and ${report.cocktailsWithoutIngredients.length - 10} more`);
    }
    console.log();
  }

  if (report.topUnmatchedParsedNames.length > 0) {
    console.log('🔍 TOP 25 UNMATCHED PARSED INGREDIENT NAMES');
    report.topUnmatchedParsedNames.forEach((item, index) => {
      console.log(`   ${String(index + 1).padStart(2)}. ${item.parsed_name} (${item.count} times)`);
    });
    console.log();
  }

  console.log('✅ Report complete!');
}

function printJsonReport(report: CoverageReport) {
  console.log(JSON.stringify(report, null, 2));
}

// Main execution
async function main() {
  const isJson = process.argv.includes('--json');

  try {
    const report = await generateCoverageReport();

    if (isJson) {
      printJsonReport(report);
    } else {
      printTextReport(report);
    }
  } catch (error) {
    console.error('💥 Report generation failed:', error);
    process.exit(1);
  }
}

main();
