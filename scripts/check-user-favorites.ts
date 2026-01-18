#!/usr/bin/env tsx

/**
 * Check User Favorites
 * 
 * Lists all favorites for a specific user to debug display issues.
 */

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

async function checkUserFavorites() {
  // Get user ID from command line or check all
  const userIdArg = process.argv[2];
  
  if (userIdArg) {
    console.log(`Checking favorites for user: ${userIdArg}\n`);
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userIdArg)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} favorites:\n`);
    data?.forEach(fav => {
      console.log(`- ${fav.cocktail_name || fav.cocktail_id}`);
      console.log(`  ID: ${fav.id} | Cocktail ID: ${fav.cocktail_id} | Slug: ${fav.cocktail_slug || 'N/A'}`);
      console.log(`  Created: ${new Date(fav.created_at).toLocaleString()}\n`);
    });
  } else {
    // Show all favorites
    console.log('Checking all favorites...\n');
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`Total favorites: ${data?.length || 0}\n`);
    
    // Group by user
    const byUser = new Map<string, typeof data>();
    data?.forEach(fav => {
      if (!byUser.has(fav.user_id)) {
        byUser.set(fav.user_id, []);
      }
      byUser.get(fav.user_id)!.push(fav);
    });
    
    for (const [userId, favs] of byUser.entries()) {
      console.log(`User ${userId.substring(0, 8)}... (${favs.length} favorites):`);
      favs.forEach(fav => {
        console.log(`  - ${fav.cocktail_name || fav.cocktail_id} (cocktail_id: ${fav.cocktail_id})`);
      });
      console.log('');
    }
  }
}

checkUserFavorites();
