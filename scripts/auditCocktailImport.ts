#!/usr/bin/env tsx

/**
 * Audit script for cocktail CSV imports
 * 
 * Validates CSV data against database schema before import
 * 
 * Usage:
 *   npx tsx scripts/auditCocktailImport.ts "data/cocktail addon.csv"
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
} else {
  console.warn('⚠️  Missing Supabase credentials - will skip database checks (existing slugs)');
}

interface AuditResult {
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  duplicates: Array<{ slug: string; count: number }>;
  existingSlugs: string[];
  schemaIssues: Array<{ field: string; issue: string }>;
}

// Parse CSV line handling quoted values
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
        i++;
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

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`⚠️  Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

// Required fields in database schema
const REQUIRED_FIELDS = ['name', 'slug'];
const VALID_DIFFICULTIES = ['Easy', 'Intermediate', 'Moderate', 'Advanced', null];
const VALID_TECHNIQUES = ['Build', 'Shake', 'Stir', 'Blend', 'Swizzle', null];
const FLAVOR_SCALE = { min: 0, max: 10 };

async function auditCSV(filePath: string): Promise<AuditResult> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  
  const result: AuditResult = {
    totalRows: rows.length,
    validRows: 0,
    errors: [],
    warnings: [],
    duplicates: [],
    existingSlugs: [],
    schemaIssues: []
  };
  
  // Check for existing slugs in database (if supabase is available)
  if (supabase) {
    const slugs = rows.map(row => row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')).filter(Boolean);
    const { data: existing } = await supabase
      .from('cocktails')
      .select('slug')
      .in('slug', slugs);
    
    if (existing) {
      result.existingSlugs = existing.map(c => c.slug);
    }
  }
  
  // Track slug occurrences for duplicate detection
  const slugCounts = new Map<string, number>();
  
  // Validate each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is header, and we're 0-indexed
    
    let isValid = true;
    
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || row[field].trim() === '') {
        if (field === 'slug' && row.name) {
          // Slug can be generated from name, so this is a warning
          result.warnings.push({
            row: rowNum,
            field,
            message: `Missing slug, will be generated from name`
          });
        } else {
          result.errors.push({
            row: rowNum,
            field,
            message: `Required field is missing or empty`
          });
          isValid = false;
        }
      }
    }
    
    // Validate slug format (if provided)
    if (row.slug) {
      const slug = row.slug.trim();
      if (!/^[a-z0-9-]+$/.test(slug)) {
        result.errors.push({
          row: rowNum,
          field: 'slug',
          message: `Invalid slug format: "${slug}". Should contain only lowercase letters, numbers, and hyphens`
        });
        isValid = false;
      }
      
      // Track for duplicates
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
      
      // Check if already exists in database
      if (result.existingSlugs.includes(slug)) {
        result.warnings.push({
          row: rowNum,
          field: 'slug',
          message: `Slug "${slug}" already exists in database (use --skip-existing to skip)`
        });
      }
    }
    
    // Validate difficulty
    if (row.difficulty && !VALID_DIFFICULTIES.includes(row.difficulty)) {
      result.warnings.push({
        row: rowNum,
        field: 'difficulty',
        message: `Unusual difficulty value: "${row.difficulty}". Expected: Easy, Intermediate, Moderate, Advanced`
      });
    }
    
    // Validate technique
    if (row.technique && !VALID_TECHNIQUES.includes(row.technique)) {
      result.warnings.push({
        row: rowNum,
        field: 'technique',
        message: `Unusual technique value: "${row.technique}". Expected: Build, Shake, Stir, Blend, Swizzle`
      });
    }
    
    // Validate flavor scores (0-10)
    const flavorFields = ['flavor_strength', 'flavor_sweetness', 'flavor_tartness', 'flavor_bitterness', 'flavor_aroma', 'flavor_texture'];
    for (const field of flavorFields) {
      if (row[field]) {
        const value = parseInt(row[field]);
        if (isNaN(value) || value < FLAVOR_SCALE.min || value > FLAVOR_SCALE.max) {
          result.errors.push({
            row: rowNum,
            field,
            message: `Invalid flavor score: "${row[field]}". Must be a number between ${FLAVOR_SCALE.min} and ${FLAVOR_SCALE.max}`
          });
          isValid = false;
        }
      }
    }
    
    // Validate ingredients (should be pipe-delimited or JSON)
    if (!row.ingredients || row.ingredients.trim() === '') {
      result.errors.push({
        row: rowNum,
        field: 'ingredients',
        message: `Missing ingredients (required for import)`
      });
      isValid = false;
    } else {
      // Check if it's parseable (pipe-delimited is fine)
      const hasPipe = row.ingredients.includes('|');
      const hasComma = row.ingredients.includes(',');
      if (!hasPipe && !hasComma) {
        // Single ingredient is okay
      }
      // Try JSON parse (optional)
      if (row.ingredients.trim().startsWith('[') || row.ingredients.trim().startsWith('{')) {
        try {
          JSON.parse(row.ingredients);
        } catch {
          result.warnings.push({
            row: rowNum,
            field: 'ingredients',
            message: `Ingredients appears to be JSON but is not valid JSON`
          });
        }
      }
    }
    
    // Validate arrays (categories_all, tags)
    const arrayFields = ['categories_all', 'tags'];
    for (const field of arrayFields) {
      if (row[field]) {
        // Should be pipe or comma delimited
        const hasDelimiter = row[field].includes('|') || row[field].includes(',');
        if (!hasDelimiter && row[field].trim() !== '') {
          // Single value is fine, just a warning
          result.warnings.push({
            row: rowNum,
            field,
            message: `Single value provided (will be converted to array)`
          });
        }
      }
    }
    
    // Check for image_url (warning if missing, not error)
    if (!row.image_url || row.image_url.trim() === '') {
      result.warnings.push({
        row: rowNum,
        field: 'image_url',
        message: `No image URL provided (can be updated later from Supabase storage)`
      });
    }
    
    if (isValid) {
      result.validRows++;
    }
  }
  
  // Find duplicate slugs
  for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) {
      result.duplicates.push({ slug, count });
    }
  }
  
  // Schema compatibility check
  const expectedFields = [
    'ID', 'slug', 'name', 'short_description', 'long_description', 'seo_description',
    'base_spirit', 'category_primary', 'categories_all', 'tags', 'image_url', 'image_alt',
    'glassware', 'garnish', 'technique', 'difficulty',
    'flavor_strength', 'flavor_sweetness', 'flavor_tartness', 'flavor_bitterness',
    'flavor_aroma', 'flavor_texture', 'notes', 'fun_fact', 'fun_fact_source',
    'metadata_json', 'ingredients', 'instructions'
  ];
  
  const actualFields = Object.keys(rows[0] || {});
  const missingFields = expectedFields.filter(f => !actualFields.includes(f));
  const extraFields = actualFields.filter(f => !expectedFields.includes(f));
  
  if (extraFields.length > 0) {
    result.schemaIssues.push({
      field: 'CSV',
      issue: `Extra fields in CSV (will be ignored): ${extraFields.join(', ')}`
    });
  }
  
  return result;
}

async function main() {
  const { positionals } = parseArgs({
    allowPositionals: true,
  });
  
  const filePath = positionals[0];
  
  if (!filePath) {
    console.error('❌ Please provide a CSV file path');
    console.error('Usage: npx tsx scripts/auditCocktailImport.ts <file>');
    process.exit(1);
  }
  
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }
  
  console.log('🔍 Cocktail Import Audit');
  console.log('========================\n');
  console.log(`📁 File: ${fullPath}\n`);
  
  try {
    const result = await auditCSV(fullPath);
    
    console.log('📊 AUDIT RESULTS');
    console.log('================\n');
    console.log(`Total rows: ${result.totalRows}`);
    console.log(`Valid rows: ${result.validRows}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    console.log(`Duplicate slugs (in CSV): ${result.duplicates.length}`);
    console.log(`Existing slugs (in DB): ${result.existingSlugs.length}`);
    console.log(`Schema issues: ${result.schemaIssues.length}\n`);
    
    if (result.errors.length > 0) {
      console.log('❌ ERRORS (must fix before import):');
      console.log('===================================');
      result.errors.slice(0, 20).forEach(err => {
        console.log(`Row ${err.row}, Field "${err.field}": ${err.message}`);
      });
      if (result.errors.length > 20) {
        console.log(`... and ${result.errors.length - 20} more errors\n`);
      } else {
        console.log('');
      }
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  WARNINGS (review before import):');
      console.log('====================================');
      result.warnings.slice(0, 20).forEach(warn => {
        console.log(`Row ${warn.row}, Field "${warn.field}": ${warn.message}`);
      });
      if (result.warnings.length > 20) {
        console.log(`... and ${result.warnings.length - 20} more warnings\n`);
      } else {
        console.log('');
      }
    }
    
    if (result.duplicates.length > 0) {
      console.log('🔄 DUPLICATE SLUGS (in CSV):');
      console.log('============================');
      result.duplicates.forEach(dup => {
        console.log(`  "${dup.slug}": appears ${dup.count} times`);
      });
      console.log('');
    }
    
    if (result.existingSlugs.length > 0) {
      console.log('📋 EXISTING SLUGS (in database):');
      console.log('================================');
      console.log(`  ${result.existingSlugs.length} slugs already exist in database`);
      console.log(`  Use --skip-existing flag to skip these\n`);
    }
    
    if (result.schemaIssues.length > 0) {
      console.log('📐 SCHEMA ISSUES:');
      console.log('=================');
      result.schemaIssues.forEach(issue => {
        console.log(`  ${issue.field}: ${issue.issue}`);
      });
      console.log('');
    }
    
    // Summary
    console.log('📋 SUMMARY');
    console.log('==========');
    if (result.errors.length === 0 && result.duplicates.length === 0) {
      console.log('✅ CSV is ready for import!');
      console.log(`   ${result.validRows} valid cocktails can be imported`);
      if (result.warnings.length > 0) {
        console.log(`   ⚠️  ${result.warnings.length} warnings to review`);
      }
      if (result.existingSlugs.length > 0) {
        console.log(`   ℹ️  ${result.existingSlugs.length} existing slugs (use --skip-existing)`);
      }
    } else {
      console.log('❌ CSV has errors that must be fixed before import');
      console.log(`   ${result.errors.length} errors found`);
      if (result.duplicates.length > 0) {
        console.log(`   ${result.duplicates.length} duplicate slugs in CSV`);
      }
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
