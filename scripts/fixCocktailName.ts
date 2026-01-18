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
  const slug = 'vdc';
  const newName = 'The Yoozh (aka VDC)';
  
  // Check current name
  const { data: current, error: fetchError } = await supabase
    .from('cocktails')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  
  if (fetchError) {
    console.error(`❌ Error fetching cocktail: ${fetchError.message}`);
    process.exit(1);
  }
  
  console.log(`Current name: "${current.name}"`);
  console.log(`Updating to: "${newName}"\n`);
  
  // Update the name
  const { error: updateError } = await supabase
    .from('cocktails')
    .update({ name: newName })
    .eq('slug', slug);
  
  if (updateError) {
    console.error(`❌ Error updating: ${updateError.message}`);
    process.exit(1);
  }
  
  console.log('✅ Successfully updated cocktail name!');
  
  // Verify
  const { data: updated } = await supabase
    .from('cocktails')
    .select('name')
    .eq('slug', slug)
    .single();
  
  console.log(`Verified name: "${updated?.name}"`);
}

main().catch(console.error);
