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
  const { data, error } = await supabase
    .from('cocktails')
    .select('id, name, slug')
    .eq('slug', 'vdc')
    .single();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('📊 Database Record:');
  console.log('  ID:', data.id);
  console.log('  Name:', JSON.stringify(data.name));
  console.log('  Slug:', data.slug);
  console.log('');
  console.log('Character breakdown:');
  const name = data.name;
  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    const code = char.charCodeAt(0);
    console.log(`  [${i}] '${char}' (U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
  }
  
  // Check if it contains "VDC" vs "Vdc"
  if (name.includes('VDC')) {
    console.log('\n✅ Contains "VDC" (all caps)');
  } else if (name.includes('Vdc')) {
    console.log('\n❌ Contains "Vdc" (mixed case)');
  } else if (name.includes('vdc')) {
    console.log('\n❌ Contains "vdc" (all lowercase)');
  }
}

main().catch(console.error);
