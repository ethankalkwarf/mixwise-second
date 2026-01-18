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
  // Search for these cocktails by name
  const names = ['Melon Ball', 'Pearl Harbor', 'Flame of Love'];
  
  console.log('🔍 Searching for imported cocktails...\n');
  
  for (const name of names) {
    const { data, error } = await supabase
      .from('cocktails')
      .select('id, slug, name, category_primary, base_spirit, created_at')
      .ilike('name', `%${name}%`);
    
    if (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
    } else if (!data || data.length === 0) {
      console.log(`❌ ${name}: Not found`);
    } else {
      data.forEach(c => {
        console.log(`✅ ${c.name}`);
        console.log(`   Slug: ${c.slug}`);
        console.log(`   Category: ${c.category_primary}`);
        console.log(`   Base Spirit: ${c.base_spirit}`);
        console.log('');
      });
    }
  }
  
  // Count total
  const { count } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total cocktails in database: ${count}`);
}

main().catch(console.error);
