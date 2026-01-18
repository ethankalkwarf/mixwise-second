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
  const slugs = ['melon-ball', 'pearl-harbor', 'flame-of-love'];
  
  console.log('🔍 Checking cocktails in database...\n');
  
  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('cocktails')
      .select('id, slug, name, category_primary, base_spirit, created_at')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.log(`❌ ${slug}: Not found - ${error.message}`);
    } else {
      console.log(`✅ ${slug}: Found`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Category: ${data.category_primary}`);
      console.log(`   Base Spirit: ${data.base_spirit}`);
      console.log(`   Created: ${data.created_at}`);
      console.log('');
    }
  }
  
  // Count total cocktails
  const { count } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total cocktails in database: ${count}`);
  
  // Check for recent imports (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('cocktails')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneHourAgo);
  
  console.log(`📊 Cocktails created in last hour: ${recentCount}`);
}

main().catch(console.error);
