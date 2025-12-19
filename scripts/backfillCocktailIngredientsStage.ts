#!/usr/bin/env ts-node

/**
 * Backfill cocktail ingredients from cocktails.ingredients JSON field
 *
 * This script processes the existing cocktails.ingredients JSON data and
 * creates proper ingredient relationships in the cocktail_ingredients table.
 *
 * Usage: npx ts-node scripts/backfillCocktailIngredientsStage.ts --limitCocktails 25
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

interface ParsedIngredient {
  name: string;
  amount?: string;
  isOptional?: boolean;
}

interface CocktailWithIngredients {
  id: string;
  name: string;
  ingredients: any[];
}

class CocktailIngredientBackfiller {
  private ingredientNameToId = new Map<string, number>();

  async init() {
    console.log('🔍 Loading ingredient mappings...');

    // Load all ingredients for name-to-ID mapping
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name');

    if (error) {
      throw new Error(`Failed to load ingredients: ${error.message}`);
    }

    // Create case-insensitive name mappings
    ingredients.forEach(ing => {
      this.ingredientNameToId.set(ing.name.toLowerCase(), ing.id);

      // Also add common variations
      const variations = this.generateNameVariations(ing.name);
      variations.forEach(variation => {
        this.ingredientNameToId.set(variation, ing.id);
      });
    });

    console.log(`✅ Loaded ${ingredients.length} ingredients with ${this.ingredientNameToId.size} name variations`);
  }

  private generateNameVariations(name: string): string[] {
    const variations: string[] = [];
    const lowerName = name.toLowerCase();

    // Remove common prefixes/suffixes
    const prefixes = ['fresh', 'freshly', 'dried', 'ground', 'white', 'dark', 'light'];
    const suffixes = ['juice', 'syrup', 'liqueur', 'extract', 'powder', 'salt'];

    prefixes.forEach(prefix => {
      if (lowerName.startsWith(prefix + ' ')) {
        variations.push(lowerName.substring(prefix.length + 1));
      }
    });

    suffixes.forEach(suffix => {
      if (lowerName.endsWith(' ' + suffix)) {
        variations.push(lowerName.substring(0, lowerName.length - suffix.length - 1));
      }
    });

    return variations;
  }

  private parseIngredientText(text: string): ParsedIngredient | null {
    if (!text || typeof text !== 'string') return null;

    const trimmed = text.trim();
    if (!trimmed) return null;

    // Extract amount and ingredient name
    // Examples: "2 oz gin", "1.5 oz Campari", "fresh lime juice", "ice"

    const amountMatch = trimmed.match(/^([\d\s\./]+(?:\s*(?:oz|ml|cl|cup|cups|tbsp|tsp|dash|dashes|sprig|sprigs|slice|slices|wedge|wedges|peel|twist|pinch|pinches)))?\s*(.+)$/i);

    if (amountMatch) {
      const amount = amountMatch[1]?.trim();
      const ingredientText = amountMatch[2].trim();

      return {
        name: ingredientText,
        amount: amount || undefined,
        isOptional: ingredientText.toLowerCase().includes('(optional)') || ingredientText.toLowerCase().includes('optional')
      };
    }

    // No amount found, just the ingredient name
    return {
      name: trimmed,
      isOptional: trimmed.toLowerCase().includes('(optional)') || trimmed.toLowerCase().includes('optional')
    };
  }

  private findIngredientId(ingredientName: string): number | null {
    const normalizedName = ingredientName
      .toLowerCase()
      .replace(/\(optional\)/gi, '')
      .replace(/optional/gi, '')
      .trim();

    // Direct match first
    if (this.ingredientNameToId.has(normalizedName)) {
      return this.ingredientNameToId.get(normalizedName)!;
    }

    // Try partial matches
    for (const [name, id] of this.ingredientNameToId.entries()) {
      if (name.includes(normalizedName) || normalizedName.includes(name)) {
        return id;
      }
    }

    // Try fuzzy matching - remove common words
    const words = normalizedName.split(/\s+/);
    const filteredWords = words.filter(word =>
      !['fresh', 'freshly', 'dried', 'ground', 'white', 'dark', 'light', 'juice', 'syrup', 'liqueur', 'extract', 'powder', 'salt'].includes(word)
    );

    const simplifiedName = filteredWords.join(' ');
    if (this.ingredientNameToId.has(simplifiedName)) {
      return this.ingredientNameToId.get(simplifiedName)!;
    }

    return null;
  }

  async processCocktails(limit?: number) {
    console.log(`🍸 Processing cocktails${limit ? ` (limited to ${limit})` : ''}...`);

    // Get cocktails with ingredients JSON data
    let query = supabase
      .from('cocktails')
      .select('id, name, ingredients')
      .not('ingredients', 'is', null)
      .order('name'); // Ensure consistent ordering

    if (limit) {
      query = query.limit(limit);
    }

    const { data: cocktails, error } = await query;

    if (error) {
      throw new Error(`Failed to load cocktails: ${error.message}`);
    }

    console.log(`📋 Found ${cocktails.length} cocktails with ingredients data`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const cocktail of cocktails) {
      try {
        console.log(`\n🔄 Processing: ${cocktail.name}`);
        const result = await this.processSingleCocktail(cocktail);

        if (result.success) {
          successCount++;
          console.log(`  ✅ ${result.ingredientCount} ingredients processed`);
        } else {
          errorCount++;
          console.log(`  ❌ Failed: ${result.error}`);
        }

        processedCount++;

        // Progress indicator
        if (processedCount % 10 === 0) {
          console.log(`  📊 Progress: ${processedCount}/${cocktails.length} cocktails processed`);
        }

      } catch (err) {
        console.error(`  💥 Error processing ${cocktail.name}:`, err);
        errorCount++;
      }
    }

    console.log(`\n🎉 Processing complete!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${processedCount}`);
  }

  private async processSingleCocktail(cocktail: CocktailWithIngredients) {
    const ingredients = Array.isArray(cocktail.ingredients) ? cocktail.ingredients : [];

    if (ingredients.length === 0) {
      return { success: false, error: 'No ingredients array', ingredientCount: 0 };
    }

    console.log(`  📝 Raw ingredients: ${ingredients.length} items (UUID: ${cocktail.id})`);

    // Parse and map ingredients
    const ingredientRelationships: any[] = [];
    let parsedCount = 0;

    for (const ingredientData of ingredients) {
      let text = '';

      // Handle different ingredient data formats
      if (typeof ingredientData === 'string') {
        text = ingredientData;
      } else if (ingredientData && typeof ingredientData === 'object') {
        text = ingredientData.text || '';
      }

      if (!text) continue;

      const parsed = this.parseIngredientText(text);
      if (!parsed) continue;

      const ingredientId = this.findIngredientId(parsed.name);

      if (ingredientId) {
        console.log(`    ✅ "${parsed.name}" → ID ${ingredientId}${parsed.amount ? ` (${parsed.amount})` : ''}${parsed.isOptional ? ' (optional)' : ''}`);
        ingredientRelationships.push({
          cocktail_id: cocktail.id, // Use UUID directly
          ingredient_id: ingredientId,
          measure: parsed.amount || null,
          is_optional: parsed.isOptional || false
        });
        parsedCount++;
      } else {
        console.log(`    ⚠️  "${parsed.name}" → No matching ingredient found`);
      }
    }

    if (ingredientRelationships.length === 0) {
      return { success: false, error: 'No ingredients could be mapped', ingredientCount: 0 };
    }

    // Check for existing relationships to avoid duplicates
    const existingCheck = await supabase
      .from('cocktail_ingredients')
      .select('cocktail_id, ingredient_id')
      .eq('cocktail_id', cocktail.id);

    const existingPairs = new Set(
      (existingCheck.data || []).map(row => `${row.cocktail_id}-${row.ingredient_id}`)
    );

    // Filter out duplicates
    const newRelationships = ingredientRelationships.filter(rel =>
      !existingPairs.has(`${rel.cocktail_id}-${rel.ingredient_id}`)
    );

    if (newRelationships.length === 0) {
      return { success: true, ingredientCount: 0 }; // Already exists, not an error
    }

    // Insert ingredient relationships
    const { error: insertError } = await supabase
      .from('cocktail_ingredients')
      .insert(newRelationships);

    if (insertError) {
      return { success: false, error: `Insert error: ${insertError.message}`, ingredientCount: 0 };
    }

    return { success: true, ingredientCount: newRelationships.length };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const limitIndex = args.indexOf('--limitCocktails');
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : undefined;

  console.log('🚀 Starting cocktail ingredient backfill...');

  try {
    const backfiller = new CocktailIngredientBackfiller();
    await backfiller.init();
    await backfiller.processCocktails(limit);

    console.log('\n🎉 Backfill complete!');
  } catch (error) {
    console.error('💥 Backfill failed:', error);
    process.exit(1);
  }
}

main();
