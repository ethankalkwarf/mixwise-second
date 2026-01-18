#!/usr/bin/env tsx

/**
 * Cleanup Orphaned Favorites
 * 
 * Removes favorite records that reference cocktails that no longer exist
 * in the cocktails table. This can happen if:
 * - A cocktail was deleted from the database
 * - A cocktail ID was changed
 * - A favorite was created with an invalid cocktail_id
 * 
 * Usage:
 *   npx tsx scripts/cleanup-orphaned-favorites.ts --dry-run    # Preview what will be deleted
 *   npx tsx scripts/cleanup-orphaned-favorites.ts --apply      # Actually delete orphaned favorites
 * 
 * Environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';
import type { Database } from '../lib/supabase/database.types';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

interface OrphanedFavorite {
  id: number;
  user_id: string;
  cocktail_id: string;
  cocktail_name: string | null;
  created_at: string;
}

async function findOrphanedFavorites(): Promise<OrphanedFavorite[]> {
  console.log('🔍 Checking for orphaned favorites...\n');

  // Get all favorites
  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select('id, user_id, cocktail_id, cocktail_name, created_at');

  if (favoritesError) {
    console.error('❌ Error fetching favorites:', favoritesError);
    throw favoritesError;
  }

  if (!favorites || favorites.length === 0) {
    console.log('✅ No favorites found in database.');
    return [];
  }

  console.log(`📊 Total favorites: ${favorites.length}`);

  // Get all valid cocktail IDs (both id and legacy_id)
  const { data: cocktails, error: cocktailsError } = await supabase
    .from('cocktails')
    .select('id, legacy_id');

  if (cocktailsError) {
    console.error('❌ Error fetching cocktails:', cocktailsError);
    throw cocktailsError;
  }

  if (!cocktails || cocktails.length === 0) {
    console.log('⚠️  Warning: No cocktails found in database.');
    return favorites as OrphanedFavorite[];
  }

  // Build a Set of valid cocktail IDs
  const validCocktailIds = new Set<string>();
  cocktails.forEach(cocktail => {
    // Add UUID id as string
    if (cocktail.id) {
      validCocktailIds.add(cocktail.id);
    }
    // Add legacy_id if it exists
    if (cocktail.legacy_id) {
      validCocktailIds.add(cocktail.legacy_id);
    }
  });

  console.log(`📊 Total cocktails: ${cocktails.length}`);
  console.log(`📊 Valid cocktail IDs (including legacy): ${validCocktailIds.size}\n`);

  // Find orphaned favorites
  const orphaned = favorites.filter(fav => !validCocktailIds.has(fav.cocktail_id)) as OrphanedFavorite[];

  return orphaned;
}

async function deleteOrphanedFavorites(orphaned: OrphanedFavorite[]): Promise<void> {
  if (orphaned.length === 0) {
    console.log('✅ No orphaned favorites to delete.');
    return;
  }

  const ids = orphaned.map(f => f.id);

  console.log(`🗑️  Deleting ${orphaned.length} orphaned favorite(s)...`);

  const { error } = await supabase
    .from('favorites')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('❌ Error deleting orphaned favorites:', error);
    throw error;
  }

  console.log('✅ Successfully deleted orphaned favorites.');
}

async function main() {
  const {
    values: { 'dry-run': dryRun, apply },
  } = parseArgs({
    options: {
      'dry-run': {
        type: 'boolean',
        default: false,
      },
      apply: {
        type: 'boolean',
        default: false,
      },
    },
  });

  if (!dryRun && !apply) {
    console.error('❌ Please specify either --dry-run or --apply');
    console.error('   --dry-run: Preview what will be deleted');
    console.error('   --apply:    Actually delete orphaned favorites');
    process.exit(1);
  }

  try {
    const orphaned = await findOrphanedFavorites();

    if (orphaned.length === 0) {
      console.log('\n✅ No orphaned favorites found. Database is clean!');
      return;
    }

    console.log(`\n⚠️  Found ${orphaned.length} orphaned favorite(s):\n`);
    
    // Group by cocktail name for better readability
    const byName = new Map<string, OrphanedFavorite[]>();
    orphaned.forEach(fav => {
      const name = fav.cocktail_name || fav.cocktail_id || '(unknown)';
      if (!byName.has(name)) {
        byName.set(name, []);
      }
      byName.get(name)!.push(fav);
    });

    for (const [name, favs] of byName.entries()) {
      console.log(`   ${name} (${favs.length} favorite(s))`);
      favs.forEach(fav => {
        console.log(`      - User: ${fav.user_id.substring(0, 8)}... | Cocktail ID: ${fav.cocktail_id} | Created: ${new Date(fav.created_at).toLocaleDateString()}`);
      });
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN: No changes were made.');
      console.log('   Run with --apply to actually delete these orphaned favorites.');
    } else if (apply) {
      console.log('\n🗑️  APPLYING cleanup...');
      await deleteOrphanedFavorites(orphaned);
      console.log('\n✅ Cleanup complete!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
