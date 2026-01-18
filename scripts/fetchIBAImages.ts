#!/usr/bin/env tsx

/**
 * Fetch Image URLs from IBA and Update CSV
 * 
 * Reads a CSV file, fetches image URLs from IBA website for each cocktail,
 * and updates the CSV with the image URLs.
 * 
 * Usage:
 *   npx tsx scripts/fetchIBAImages.ts data/iba-cocktails-review.csv
 *   npx tsx scripts/fetchIBAImages.ts data/iba-cocktails-review.csv --output data/updated.csv
 */

import { parseArgs } from 'node:util';
import * as fs from 'fs';
import * as path from 'path';

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

// Escape CSV field
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Fetch HTML from URL
async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MixWise/1.0; +https://getmixwise.com)',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`  Error fetching ${url}:`, error);
    return null;
  }
}

// Extract image URL from IBA page HTML
function extractImageURL(html: string): string | null {
  // Try multiple patterns to find the cocktail image
  const patterns = [
    // Pattern 1: Direct image in cocktail content
    /<img[^>]+src=["']([^"']*\/wp-content\/uploads\/[^"']*cocktail[^"']*\.(jpg|jpeg|png|webp))["']/i,
    // Pattern 2: Featured image
    /<img[^>]+class=["'][^"']*featured[^"']*["'][^>]+src=["']([^"']+)["']/i,
    // Pattern 3: Any image in the content area
    /<div[^>]+class=["'][^"']*(?:entry|content|cocktail)[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']*\.(jpg|jpeg|png|webp))["']/i,
    // Pattern 4: Image from cocktails directory
    /<img[^>]+src=["']([^"']*\/cocktails\/[^"']+\.(jpg|jpeg|png|webp))["']/i,
    // Pattern 5: Image from images directory
    /<img[^>]+src=["']([^"']*\/images\/[^"']+\.(jpg|jpeg|png|webp))["']/i,
    // Pattern 6: Any image tag
    /<img[^>]+src=["']([^"']*\.(jpg|jpeg|png|webp))["']/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let imageUrl = match[1];
      
      // Skip very small images (icons, logos, etc.)
      if (imageUrl.includes('logo') || imageUrl.includes('icon') || imageUrl.includes('avatar')) {
        continue;
      }
      
      // Make absolute URL if relative
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = 'https://iba-world.com' + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://iba-world.com/' + imageUrl;
      }
      
      return imageUrl;
    }
  }
  
  return null;
}

// Get IBA URL from CSV row (from metadata_json or construct from slug)
function getIBAURL(row: Record<string, string>): string | null {
  // Try to extract from metadata_json
  try {
    const metadata = row.metadata_json ? JSON.parse(row.metadata_json) : null;
    if (metadata && metadata.sourceUrl) {
      return metadata.sourceUrl;
    }
  } catch (e) {
    // Invalid JSON, continue
  }
  
  // Construct from slug
  const slug = row.slug;
  if (slug) {
    return `https://iba-world.com/iba-cocktail/${slug}/`;
  }
  
  return null;
}

// Main function
async function main() {
  const { values, positionals } = parseArgs({
    options: {
      'output': { type: 'string' },
    },
    allowPositionals: true,
  });
  
  const inputFile = positionals[0];
  
  if (!inputFile) {
    console.error('❌ Please provide a CSV file path');
    console.error('Usage: npx tsx scripts/fetchIBAImages.ts <input.csv> [--output <output.csv>]');
    process.exit(1);
  }
  
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(process.cwd(), inputFile);
  const outputPath = values.output 
    ? (path.isAbsolute(values.output) ? values.output : path.join(process.cwd(), values.output))
    : inputPath; // Overwrite by default
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }
  
  console.log('🖼️  IBA Image Fetcher');
  console.log('=====================\n');
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}\n`);
  
  // Read CSV
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    console.error('❌ Empty CSV file');
    process.exit(1);
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  const imageUrlIndex = headers.indexOf('image_url');
  
  if (imageUrlIndex === -1) {
    console.error('❌ CSV does not have "image_url" column');
    process.exit(1);
  }
  
  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`⚠️  Skipping row ${i + 1}: incorrect column count`);
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  console.log(`📊 Found ${rows.length} cocktails to process\n`);
  
  // Fetch images
  let updated = 0;
  let found = 0;
  let skipped = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name || row.slug || `Row ${i + 2}`;
    
    // Skip if image already exists
    if (row.image_url && row.image_url.trim()) {
      console.log(`⏭️  [${i + 1}/${rows.length}] ${name} - Already has image`);
      skipped++;
      continue;
    }
    
    console.log(`🔍 [${i + 1}/${rows.length}] ${name} - Fetching image...`);
    
    const ibaUrl = getIBAURL(row);
    if (!ibaUrl) {
      console.warn(`  ⚠️  No IBA URL found for ${name}`);
      continue;
    }
    
    const html = await fetchHTML(ibaUrl);
    if (!html) {
      console.warn(`  ⚠️  Could not fetch page: ${ibaUrl}`);
      continue;
    }
    
    const imageUrl = extractImageURL(html);
    if (imageUrl) {
      row.image_url = imageUrl;
      row.image_alt = row.image_alt || `${name} cocktail`;
      updated++;
      found++;
      console.log(`  ✅ Found image: ${imageUrl}`);
    } else {
      console.warn(`  ⚠️  No image found on page`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Write updated CSV
  const outputLines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(header => escapeCSVField(row[header] || ''));
    outputLines.push(values.join(','));
  }
  
  fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');
  
  console.log(`\n✅ Complete!`);
  console.log(`   📊 Processed: ${rows.length} cocktails`);
  console.log(`   ✅ Found images: ${found}`);
  console.log(`   ⏭️  Skipped (already had image): ${skipped}`);
  console.log(`   📁 Updated file: ${outputPath}`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

