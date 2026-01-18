#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { Database } from '../lib/supabase/database.types';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 Checking favorites database...\n');
  
  // Get all favorites
  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (favError) {
    console.error('❌ Error:', favError);
    return;
  }
  
  console.log(`📊 Total favorites in database: ${favorites?.length || 0}\n`);
  
  if (favorites && favorites.length > 0) {
    // Check for Whitecap
    const whitecap = favorites.filter(f => 
      f.cocktail_name?.toLowerCase().includes('whitecap') ||
      f.cocktail_name?.toLowerCase().includes('white cap')
    );
    
    if (whitecap.length > 0) {
      console.log('⚠️  FOUND WHITECAP MARGARITA FAVORITE(S):\n');
      whitecap.forEach(f => {
        console.log(JSON.stringify(f, null, 2));
        console.log('');
      });
    } else {
      console.log('✅ No Whitecap Margarita favorites found in database.\n');
    }
    
    // Show all favorites grouped by user
    const byUser = new Map<string, typeof favorites>();
    favorites.forEach(fav => {
      if (!byUser.has(fav.user_id)) {
        byUser.set(fav.user_id, []);
      }
      byUser.get(fav.user_id)!.push(fav);
    });
    
    for (const [userId, favs] of byUser.entries()) {
      console.log(`User ${userId.substring(0, 8)}... (${favs.length} favorites):`);
      favs.forEach(fav => {
        console.log(`  - ${fav.cocktail_name || fav.cocktail_id} (id: ${fav.id}, cocktail_id: ${fav.cocktail_id})`);
      });
      console.log('');
    }
  }
  
  // Check if Whitecap Margarita exists as a cocktail
  console.log('🔍 Checking for Whitecap Margarita cocktail...\n');
  const { data: cocktails, error: cocktailError } = await supabase
    .from('cocktails')
    .select('id, name, slug')
    .or('name.ilike.%whitecap%,name.ilike.%white cap%');
  
  if (cocktailError) {
    console.error('❌ Error:', cocktailError);
    return;
  }
  
  if (cocktails && cocktails.length > 0) {
    console.log('📊 Found cocktail(s) with "Whitecap" in name:');
    cocktails.forEach(c => {
      console.log(`  - ${c.name} (id: ${c.id}, slug: ${c.slug})`);
    });
  } else {
    console.log('✅ No cocktails found with "Whitecap" in name.');
  }
}

main().catch(console.error);
