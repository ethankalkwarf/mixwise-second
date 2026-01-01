#!/usr/bin/env node

/**
 * Diagnostic script for cocktail data quality issues
 * 
 * Usage:
 *   npx ts-node scripts/diagnose-cocktail-data.ts
 * 
 * Outputs:
 *   - Console report with cocktail data quality metrics
 *   - JSON export to diagnose-report.json for detailed analysis
 *   - List of all excluded cocktails with reasons
 */

import { runCocktailDiagnostics, exportDiagnosticReport } from '../lib/cocktailDiagnostics';

async function main() {
  try {
    console.log('🔍 Starting cocktail data diagnostics...\n');

    // Run diagnostics
    const report = await runCocktailDiagnostics();

    // Print human-readable report
    console.log(report.summary);

    // Export to JSON for further analysis
    console.log('\n📁 Exporting detailed report to JSON...');
    await exportDiagnosticReport('diagnose-report.json');

    // Print excluded cocktails list
    if (report.excludedCocktails.length > 0) {
      console.log(`\n📋 EXCLUDED COCKTAILS (${report.excludedCocktails.length} total):\n`);
      console.log('ID | Name | Status | Reason');
      console.log('---|------|--------|-------');

      report.excludedCocktails.forEach(cocktail => {
        const status = cocktail.ingredientsStatus.toUpperCase().padEnd(12);
        console.log(`${cocktail.id.substring(0, 8)}... | ${cocktail.name.substring(0, 20).padEnd(20)} | ${status} | ${cocktail.reason.substring(0, 40)}`);
      });

      if (report.excludedCocktails.length > 20) {
        console.log(`\n... and ${report.excludedCocktails.length - 20} more cocktails`);
      }
    }

    // Print actionable recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');

    if (report.excludedCount === 0) {
      console.log('✅ All cocktails have valid ingredients. No action needed!');
    } else if (report.excludedPercentage < 5) {
      console.log('⚠️  Small number of excluded cocktails:');
      console.log('   - Option A: Fix manually in Supabase');
      console.log('   - Option B: Delete broken cocktails');
      console.log('   - Option C: Add script to populate missing ingredients');
    } else if (report.excludedPercentage < 20) {
      console.log('🔴 MODERATE DATA QUALITY ISSUE:');
      console.log(`   - ${report.excludedPercentage.toFixed(1)}% of cocktails are missing ingredients`);
      console.log('   - Likely cause: Incomplete data migration');
      console.log('   - Action: Run ingredient population script or repair migration');
    } else {
      console.log('🔴 CRITICAL DATA QUALITY ISSUE:');
      console.log(`   - ${report.excludedPercentage.toFixed(1)}% of cocktails are missing ingredients!`);
      console.log('   - This is a major data integrity problem');
      console.log('   - Action: Investigate root cause immediately');
      console.log('   - Check: Is ingredients data even being loaded from the source?');
    }

    // Print root cause analysis
    console.log('\n🔍 ROOT CAUSE ANALYSIS:\n');

    if (report.breakdown.null > 0 && report.breakdown.empty === 0 && report.breakdown.invalidType === 0) {
      console.log('✓ Diagnosis: Most cocktails have NULL ingredients field');
      console.log('  This suggests:');
      console.log('    - Ingredients JSON was never populated');
      console.log('    - Data migration from old system incomplete');
      console.log('    - Cocktails created without ingredient data');
      console.log('\nNext steps:');
      console.log('  1. Check if cocktail_ingredients table has data');
      console.log('  2. Run migration script to populate ingredients JSONB field');
      console.log('  3. Verify ingredient parsing logic');
    } else if (report.breakdown.empty > report.breakdown.null) {
      console.log('✓ Diagnosis: Most cocktails have EMPTY ingredient arrays');
      console.log('  This suggests:');
      console.log('    - Ingredients array exists but has no items');
      console.log('    - Parsing logic is creating empty arrays');
      console.log('    - Missing ingredient ID mapping');
      console.log('\nNext steps:');
      console.log('  1. Check ingredient ID mapping in cocktails.server.ts');
      console.log('  2. Verify ingredient names match between tables');
      console.log('  3. Review parsing logic for bugs');
    } else if (report.breakdown.invalidType > 0) {
      console.log('✓ Diagnosis: Ingredients are not in expected format');
      console.log('  This suggests:');
      console.log('    - Schema mismatch between database and code');
      console.log('    - Ingredients stored as string or object instead of array');
      console.log('    - Different data structure than code expects');
      console.log('\nNext steps:');
      console.log('  1. Check ingredients JSONB column content in Supabase');
      console.log('  2. Review how ingredients are being stored');
      console.log('  3. Update parsing logic if needed');
    } else if (report.breakdown.parseError > 0) {
      console.log('✓ Diagnosis: JSON parsing errors in ingredient data');
      console.log('  This suggests:');
      console.log('    - Malformed JSON in ingredients field');
      console.log('    - Invalid JSON syntax');
      console.log('    - Database corruption or encoding issue');
      console.log('\nNext steps:');
      console.log('  1. Check raw ingredients field in Supabase');
      console.log('  2. Look for invalid JSON syntax');
      console.log('  3. Run cleanup script to fix malformed data');
    }

    // Print next steps
    console.log('\n📌 NEXT STEPS:\n');
    console.log('1. Review detailed report in: diagnose-report.json');
    console.log('2. Identify root cause from recommendations above');
    console.log('3. Run appropriate fix script:');
    console.log('   - scripts/fix-missing-ingredients.ts (populate from cocktail_ingredients)');
    console.log('   - scripts/cleanup-malformed-ingredients.ts (fix JSON errors)');
    console.log('   - scripts/validate-ingredient-mapping.ts (verify ID mappings)');
    console.log('\n✅ Diagnostics complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  }
}

main();

