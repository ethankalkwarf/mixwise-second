#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 Checking cocktail images...\n');
  
  // Get all cocktails
  const { data: cocktails, error } = await supabase
    .from('cocktails')
    .select('id, slug, name, image_url')
    .order('name');
  
  if (error) {
    console.error(`❌ Error fetching cocktails: ${error.message}`);
    process.exit(1);
  }
  
  if (!cocktails) {
    console.log('No cocktails found');
    return;
  }
  
  const noImage: typeof cocktails = [];
  const hasImage: typeof cocktails = [];
  const notSupabaseUrl: typeof cocktails = [];
  const hasSupabaseUrl: typeof cocktails = [];
  
  for (const cocktail of cocktails) {
    if (!cocktail.image_url || cocktail.image_url.trim() === '') {
      noImage.push(cocktail);
    } else {
      hasImage.push(cocktail);
      
      if (cocktail.image_url.includes('supabase.co/storage')) {
        hasSupabaseUrl.push(cocktail);
      } else {
        notSupabaseUrl.push(cocktail);
      }
    }
  }
  
  console.log('📊 SUMMARY');
  console.log('==========\n');
  console.log(`Total cocktails: ${cocktails.length}`);
  console.log(`✅ Have image URL: ${hasImage.length}`);
  console.log(`❌ No image URL: ${noImage.length}`);
  console.log(`🔗 Have Supabase URL: ${hasSupabaseUrl.length}`);
  console.log(`⚠️  Have non-Supabase URL: ${notSupabaseUrl.length}\n`);
  
  if (noImage.length > 0) {
    console.log('❌ COCKTAILS WITHOUT IMAGE URL');
    console.log('================================\n');
    noImage.forEach(c => {
      console.log(`  - ${c.name} (${c.slug})`);
    });
    console.log(`\nTotal: ${noImage.length}\n`);
  }
  
  if (notSupabaseUrl.length > 0) {
    console.log('⚠️  COCKTAILS WITH NON-SUPABASE URL');
    console.log('===================================\n');
    notSupabaseUrl.forEach(c => {
      const urlPreview = c.image_url?.substring(0, 60) + (c.image_url && c.image_url.length > 60 ? '...' : '');
      console.log(`  - ${c.name} (${c.slug})`);
      console.log(`    URL: ${urlPreview}`);
    });
    console.log(`\nTotal: ${notSupabaseUrl.length}\n`);
  }
  
  if (hasSupabaseUrl.length > 0) {
    console.log('✅ COCKTAILS WITH SUPABASE URL');
    console.log('===============================\n');
    console.log(`Total: ${hasSupabaseUrl.length} cocktails have Supabase storage URLs\n`);
  }
}

main().catch(console.error);
