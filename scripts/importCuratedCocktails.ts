#!/usr/bin/env tsx

/**
 * Import Curated High-Quality Cocktails from CSV/JSON
 * 
 * This script allows you to import carefully curated cocktails from reputable sources.
 * Use this for adding cocktails from:
 * - Professional cocktail books (Death & Co, PDT, etc.)
 * - Award-winning recipes
 * - Curated lists from expert bartenders
 * - Your own high-quality recipes
 * 
 * Input format: CSV or JSON file with cocktail data
 * 
 * Usage:
 *   npx tsx scripts/importCuratedCocktails.ts data/curated-cocktails.csv
 *   npx tsx scripts/importCuratedCocktails.ts data/curated-cocktails.json
 *   npx tsx scripts/importCuratedCocktails.ts data/curated-cocktails.csv --dry-run
 *   npx tsx scripts/importCuratedCocktails.ts data/curated-cocktails.csv --skip-existing
 * 
 * CSV Format (required columns):
 *   name, ingredients, instructions, [optional fields...]
 * 
 * JSON Format:
 *   Array of cocktail objects matching the CocktailInsert type
 * 
 * See data/curated-cocktails-template.csv for example format
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// Simple CSV parser (no external dependency needed)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}
import type { Database } from '../lib/supabase/database.types';
import type { CocktailInsert } from '../lib/cocktailTypes';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

// Convert string to slug
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Parse ingredients from various formats
function parseIngredients(value: any): Array<{ text: string }> | null {
  if (!value) return null;
  
  if (typeof value === 'string') {
    // Try JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => 
          typeof item === 'string' ? { text: item } : { text: String(item.text ?? item) }
        ).filter(item => item.text.trim().length > 0);
      }
    } catch {
      // Not JSON, continue
    }
    
    // Pipe-delimited
    if (value.includes('|')) {
      return value.split('|')
        .map(s => s.trim())
        .filter(Boolean)
        .map(text => ({ text }));
    }
    
    // Comma-delimited
    if (value.includes(',')) {
      return value.split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(text => ({ text }));
    }
    
    // Single ingredient
    return [{ text: value.trim() }];
  }
  
  if (Array.isArray(value)) {
    return value.map(item => ({
      text: typeof item === 'string' ? item : String(item.text ?? item)
    })).filter(item => item.text.trim().length > 0);
  }
  
  return null;
}

// Parse array fields (pipe or comma delimited)
function parseArray(value: any): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const parts = value.split(/[|,]/).map(s => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : null;
  }
  return null;
}

// Parse number or null
function parseIntOrNull(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Parse JSON or null
function parseJsonOrNull(value: any): any | null {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

// Convert CSV row to cocktail insert
function csvRowToCocktail(row: Record<string, any>): CocktailInsert | null {
  if (!row.name || !row.ingredients) {
    console.warn('⚠️  Skipping row: missing required fields (name, ingredients)');
    return null;
  }
  
  const slug = row.slug || toSlug(row.name);
  const ingredients = parseIngredients(row.ingredients);
  
  if (!ingredients || ingredients.length === 0) {
    console.warn(`⚠️  Skipping "${row.name}": no valid ingredients`);
    return null;
  }
  
  return {
    slug,
    name: row.name.trim(),
    short_description: row.short_description?.trim() || row.description?.trim() || null,
    long_description: row.long_description?.trim() || null,
    seo_description: row.seo_description?.trim() || null,
    base_spirit: row.base_spirit?.trim() || null,
    category_primary: row.category_primary?.trim() || row.category?.trim() || null,
    categories_all: parseArray(row.categories_all || row.categories),
    tags: parseArray(row.tags),
    glassware: row.glassware?.trim() || row.glass?.trim() || null,
    garnish: row.garnish?.trim() || null,
    technique: row.technique?.trim() || row.method?.trim() || null,
    difficulty: row.difficulty?.trim() || null,
    flavor_strength: parseIntOrNull(row.flavor_strength),
    flavor_sweetness: parseIntOrNull(row.flavor_sweetness),
    flavor_tartness: parseIntOrNull(row.flavor_tartness),
    flavor_bitterness: parseIntOrNull(row.flavor_bitterness),
    flavor_aroma: parseIntOrNull(row.flavor_aroma),
    flavor_texture: parseIntOrNull(row.flavor_texture),
    notes: row.notes?.trim() || null,
    fun_fact: row.fun_fact?.trim() || null,
    fun_fact_source: row.fun_fact_source?.trim() || null,
    metadata_json: parseJsonOrNull(row.metadata_json),
    ingredients,
    instructions: row.instructions?.trim() || null,
    image_url: row.image_url?.trim() || null,
    image_alt: row.image_alt?.trim() || null,
  };
}

// Load and parse CSV file
function loadCSV(filePath: string): CocktailInsert[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parseCSV(content);
  
  const cocktails: CocktailInsert[] = [];
  for (const row of records) {
    const cocktail = csvRowToCocktail(row);
    if (cocktail) {
      cocktails.push(cocktail);
    }
  }
  
  return cocktails;
}

// Load and parse JSON file
function loadJSON(filePath: string): CocktailInsert[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of cocktails');
  }
  
  return data.map(item => {
    // If it's already in the right format, use it
    if (item.slug && item.name && item.ingredients) {
      return item as CocktailInsert;
    }
    
    // Otherwise convert from CSV-like format
    return csvRowToCocktail(item);
  }).filter(Boolean) as CocktailInsert[];
}

// Main function
async function main() {
  const { values, positionals } = parseArgs({
    options: {
      'dry-run': { type: 'boolean' },
      'skip-existing': { type: 'boolean' },
    },
    allowPositionals: true,
  });
  
  const filePath = positionals[0];
  
  if (!filePath) {
    console.error('❌ Please provide a CSV or JSON file path');
    console.error('Usage: npx tsx scripts/importCuratedCocktails.ts <file> [--dry-run] [--skip-existing]');
    process.exit(1);
  }
  
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }
  
  const isDryRun = values['dry-run'] || false;
  const skipExisting = values['skip-existing'] || false;
  
  console.log('🍸 Curated Cocktails Importer');
  console.log('==============================\n');
  console.log(`📁 File: ${fullPath}\n`);
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  // Load cocktails
  let cocktails: CocktailInsert[];
  const ext = path.extname(fullPath).toLowerCase();
  
  try {
    if (ext === '.json') {
      cocktails = loadJSON(fullPath);
    } else if (ext === '.csv') {
      cocktails = loadCSV(fullPath);
    } else {
      console.error(`❌ Unsupported file format: ${ext}`);
      console.error('Supported formats: .csv, .json');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error loading file:', error);
    process.exit(1);
  }
  
  console.log(`✅ Loaded ${cocktails.length} cocktails from file\n`);
  
  // Check existing cocktails
  const existingSlugs = new Set<string>();
  if (skipExisting) {
    const { data: existing } = await supabase
      .from('cocktails')
      .select('slug');
    
    if (existing) {
      existing.forEach(c => existingSlugs.add(c.slug));
      console.log(`📋 Found ${existingSlugs.size} existing cocktails (will skip duplicates)\n`);
    }
  }
  
  // Filter out existing cocktails
  const cocktailsToImport = skipExisting
    ? cocktails.filter(c => !existingSlugs.has(c.slug))
    : cocktails;
  
  if (cocktailsToImport.length === 0) {
    console.log('ℹ️  No new cocktails to import');
    return;
  }
  
  console.log(`📤 Ready to import ${cocktailsToImport.length} cocktails\n`);
  
  if (isDryRun) {
    console.log('Sample cocktails that would be imported:');
    cocktailsToImport.slice(0, 5).forEach(c => {
      console.log(`  - ${c.name} (${c.slug})`);
      console.log(`    Category: ${c.category_primary || 'N/A'}`);
      console.log(`    Base Spirit: ${c.base_spirit || 'N/A'}`);
      console.log(`    Ingredients: ${c.ingredients?.length || 0}`);
      console.log(`    Image: ${c.image_url ? 'Yes' : 'No'}`);
      console.log('');
    });
    if (cocktailsToImport.length > 5) {
      console.log(`... and ${cocktailsToImport.length - 5} more\n`);
    }
    return;
  }
  
  // Import to database
  console.log('📥 Importing cocktails to database...\n');
  
  const batchSize = 20;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < cocktailsToImport.length; i += batchSize) {
    const batch = cocktailsToImport.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('cocktails')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`✅ Imported ${imported}/${cocktailsToImport.length} cocktails...`);
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors}`);
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

