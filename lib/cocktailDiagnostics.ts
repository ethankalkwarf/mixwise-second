/**
 * Diagnostic utilities for cocktail data quality
 * Helps identify and track cocktails with missing or invalid ingredients
 */

import { getCocktailsWithIngredients } from './cocktails.server';
import { createClient } from '@supabase/supabase-js';
import { debugLog } from "@/lib/debugLog";

// Types for diagnostic reports
export interface CocktailDiagnosticData {
  id: string;
  name: string;
  slug: string;
  ingredientsStatus: 'valid' | 'null' | 'empty' | 'invalid-type' | 'parse-error';
  ingredientsLength: number;
  rawIngredientsValue: any;
  reason: string;
}

export interface DiagnosticReport {
  timestamp: string;
  totalCocktails: number;
  validCocktails: number;
  excludedCount: number;
  excludedPercentage: number;
  breakdown: {
    null: number;
    empty: number;
    invalidType: number;
    parseError: number;
  };
  excludedCocktails: CocktailDiagnosticData[];
  summary: string;
}

/**
 * Run comprehensive diagnostics on cocktail data
 * Returns a detailed report of which cocktails are excluded and why
 */
export async function runCocktailDiagnostics(): Promise<DiagnosticReport> {
  try {
    debugLog('[DIAGNOSTICS] Starting cocktail data diagnostic...');

    // Create Supabase client for direct database access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query ALL cocktails directly from database with minimal processing
    debugLog('[DIAGNOSTICS] Querying all cocktails from database...');
    const { data: allCocktails, error: queryError } = await supabase
      .from('cocktails')
      .select('id, name, slug, ingredients')
      .order('name');

    if (queryError) {
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    if (!allCocktails) {
      throw new Error('No cocktails returned from database');
    }

    const totalCount = allCocktails.length;
    debugLog(`[DIAGNOSTICS] Retrieved ${totalCount} cocktails from database`);

    // Analyze each cocktail
    const diagnosticData: CocktailDiagnosticData[] = [];
    const breakdown = {
      null: 0,
      empty: 0,
      invalidType: 0,
      parseError: 0,
      valid: 0,
    };

    for (const cocktail of allCocktails) {
      let status: CocktailDiagnosticData['ingredientsStatus'] = 'valid';
      let reason = 'Valid ingredients array';
      let ingredientsLength = 0;
      let rawValue = null;

      try {
        // Check if ingredients field exists and is valid
        if (cocktail.ingredients === null || cocktail.ingredients === undefined) {
          status = 'null';
          reason = 'ingredients field is null or undefined';
          breakdown.null++;
        } else if (typeof cocktail.ingredients === 'string') {
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(cocktail.ingredients);
            if (Array.isArray(parsed)) {
              if (parsed.length === 0) {
                status = 'empty';
                reason = 'ingredients array is empty';
                breakdown.empty++;
              } else {
                ingredientsLength = parsed.length;
                breakdown.valid++;
              }
            } else {
              status = 'invalid-type';
              reason = `ingredients JSON is not an array, is ${typeof parsed}`;
              breakdown.invalidType++;
            }
            rawValue = parsed;
          } catch (parseError) {
            status = 'parse-error';
            reason = `Failed to parse ingredients JSON: ${parseError}`;
            breakdown.parseError++;
            rawValue = cocktail.ingredients;
          }
        } else if (Array.isArray(cocktail.ingredients)) {
          if (cocktail.ingredients.length === 0) {
            status = 'empty';
            reason = 'ingredients array is empty';
            breakdown.empty++;
          } else {
            ingredientsLength = cocktail.ingredients.length;
            breakdown.valid++;
          }
          rawValue = cocktail.ingredients;
        } else {
          status = 'invalid-type';
          reason = `ingredients is not an array or string, is ${typeof cocktail.ingredients}`;
          breakdown.invalidType++;
          rawValue = cocktail.ingredients;
        }
      } catch (error) {
        status = 'parse-error';
        reason = `Unexpected error analyzing ingredients: ${error}`;
        breakdown.parseError++;
        rawValue = cocktail.ingredients;
      }

      // Only include excluded cocktails in the detailed report
      if (status !== 'valid') {
        diagnosticData.push({
          id: cocktail.id,
          name: cocktail.name,
          slug: cocktail.slug,
          ingredientsStatus: status,
          ingredientsLength,
          rawIngredientsValue: rawValue,
          reason,
        });
      }
    }

    const excludedCount = diagnosticData.length;
    const excludedPercentage = (excludedCount / totalCount) * 100;
    const validCount = totalCount - excludedCount;

    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      totalCocktails: totalCount,
      validCocktails: validCount,
      excludedCount,
      excludedPercentage: Math.round(excludedPercentage * 100) / 100,
      breakdown: {
        null: breakdown.null,
        empty: breakdown.empty,
        invalidType: breakdown.invalidType,
        parseError: breakdown.parseError,
      },
      excludedCocktails: diagnosticData,
      summary: generateSummary(totalCount, validCount, excludedCount, breakdown),
    };

    return report;
  } catch (error) {
    console.error('[DIAGNOSTICS] Error running diagnostics:', error);
    throw error;
  }
}

/**
 * Generate human-readable summary of diagnostic findings
 */
function generateSummary(
  total: number,
  valid: number,
  excluded: number,
  breakdown: { null: number; empty: number; invalidType: number; parseError: number }
): string {
  const percentage = (excluded / total) * 100;

  return `
📊 COCKTAIL DATA QUALITY REPORT
═══════════════════════════════════

Total Cocktails in Database: ${total}
Valid Cocktails (with ingredients): ${valid} (${Math.round((valid / total) * 100)}%)
Excluded Cocktails (missing ingredients): ${excluded} (${percentage.toFixed(2)}%)

BREAKDOWN OF EXCLUDED COCKTAILS:
• Null/Undefined ingredients field: ${breakdown.null}
• Empty ingredient arrays: ${breakdown.empty}
• Invalid data type (not array): ${breakdown.invalidType}
• JSON parse errors: ${breakdown.parseError}

ROOT CAUSE DETERMINATION:
${
  breakdown.null > 0 && breakdown.empty === 0 && breakdown.invalidType === 0
    ? '⚠️  Most cocktails have NULL ingredients - likely incomplete data migration'
    : breakdown.empty > 0
      ? '⚠️  Most cocktails have empty ingredient arrays - data exists but not populated'
      : breakdown.invalidType > 0
        ? '⚠️  Ingredients are in unexpected format - possible schema mismatch'
        : breakdown.parseError > 0
          ? '⚠️  JSON parsing errors - ingredients data may be malformed'
          : '✅ All cocktails have valid ingredients'
}

RECOMMENDATION:
${
  excluded === 0
    ? '✅ No action needed - all cocktails have valid ingredients'
    : excluded < 10
      ? '⚠️  Small number of excluded cocktails - consider fixing manually or filtering'
      : '🔴 CRITICAL: Large number of excluded cocktails - investigate root cause before deploying'
}
`;
}

/**
 * Export diagnostic report as JSON for analysis
 */
export async function exportDiagnosticReport(filePath: string): Promise<void> {
  const report = await runCocktailDiagnostics();

  const fs = await import('fs/promises');
  const path = await import('path');

  const fullPath = path.join(process.cwd(), filePath);
  await fs.writeFile(fullPath, JSON.stringify(report, null, 2), 'utf-8');

  debugLog(`[DIAGNOSTICS] Report exported to: ${fullPath}`);
  debugLog(report.summary);
}

/**
 * Quick check - returns just the count of valid vs excluded
 */
export async function quickHealthCheck(): Promise<{
  total: number;
  valid: number;
  excluded: number;
  percentage: number;
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      return { total: 0, valid: 0, excluded: 0, percentage: 0 };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: allCocktails } = await supabase
      .from('cocktails')
      .select('ingredients', { count: 'exact' });

    if (!allCocktails) {
      return { total: 0, valid: 0, excluded: 0, percentage: 0 };
    }

    const total = allCocktails.length;
    let valid = 0;

    for (const cocktail of allCocktails) {
      if (cocktail.ingredients && Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0) {
        valid++;
      }
    }

    const excluded = total - valid;
    const percentage = total > 0 ? (excluded / total) * 100 : 0;

    return { total, valid, excluded, percentage: Math.round(percentage * 100) / 100 };
  } catch (error) {
    console.error('[DIAGNOSTICS] Health check failed:', error);
    return { total: 0, valid: 0, excluded: 0, percentage: 0 };
  }
}

