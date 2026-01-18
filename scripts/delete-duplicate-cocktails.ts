#!/usr/bin/env tsx

/**
 * Delete duplicate cocktail versions (the -v2 versions)
 * This script safely removes the less complete duplicate versions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// IDs of the -v2 versions to delete (the less complete ones)
const DUPLICATES_TO_DELETE = [
  {
    id: '056c2894-e8eb-4bd1-928c-fd6c282c0c06',
    name: 'Blood and Sand',
    slug: 'blood-and-sand-v2',
    reason: 'Less complete version (no garnish, simpler instructions)'
  },
  {
    id: '3d5b2436-9245-424c-b391-2a03f06cacde',
    name: "Tommy's Margarita",
    slug: 'tommys-margarita-v2',
    reason: 'Less complete version (no image)'
  }
];

async function deleteDuplicates() {
  console.log('🗑️  Deleting Duplicate Cocktails\n');
  console.log('='.repeat(80));
  console.log('');

  try {
    // First, verify the cocktails exist and show what will be deleted
    console.log('📋 Verifying cocktails to delete...\n');
    
    const idsToDelete = DUPLICATES_TO_DELETE.map(d => d.id);
    const { data: cocktails, error: fetchError } = await supabase
      .from('cocktails')
      .select('id, name, slug')
      .in('id', idsToDelete);

    if (fetchError) {
      console.error('❌ Error fetching cocktails:', fetchError);
      return;
    }

    if (!cocktails || cocktails.length === 0) {
      console.log('⚠️  No cocktails found with the specified IDs');
      return;
    }

    // Verify we found all expected duplicates
    const foundIds = new Set(cocktails.map(c => c.id));
    const missingIds = DUPLICATES_TO_DELETE.filter(d => !foundIds.has(d.id));

    if (missingIds.length > 0) {
      console.log('⚠️  WARNING: Some cocktails not found:');
      missingIds.forEach(d => {
        console.log(`   - ${d.name} (${d.id})`);
      });
      console.log('');
    }

    // Show what will be deleted
    console.log('📝 Cocktails to be deleted:\n');
    DUPLICATES_TO_DELETE.forEach((dup, idx) => {
      const found = cocktails.find(c => c.id === dup.id);
      if (found) {
        console.log(`   ${idx + 1}. "${dup.name}"`);
        console.log(`      ID: ${dup.id}`);
        console.log(`      Slug: ${dup.slug}`);
        console.log(`      Reason: ${dup.reason}`);
        console.log('');
      }
    });

    // Get current count
    const { count: beforeCount } = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Current cocktail count: ${beforeCount}`);
    console.log(`📊 After deletion: ${beforeCount! - cocktails.length}`);
    console.log('');

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete the above cocktails!');
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete the duplicates
    console.log('🗑️  Deleting duplicates...\n');
    
    let deletedCount = 0;
    let errorCount = 0;

    for (const dup of DUPLICATES_TO_DELETE) {
      const found = cocktails.find(c => c.id === dup.id);
      if (!found) {
        console.log(`⚠️  Skipping ${dup.name} - not found in database`);
        continue;
      }

      const { error: deleteError } = await supabase
        .from('cocktails')
        .delete()
        .eq('id', dup.id);

      if (deleteError) {
        console.error(`❌ Error deleting ${dup.name}:`, deleteError.message);
        errorCount++;
      } else {
        console.log(`✅ Deleted: "${dup.name}" (${dup.slug})`);
        deletedCount++;
      }
    }

    // Verify deletion
    console.log('\n📊 Verifying deletion...\n');
    const { count: afterCount } = await supabase
      .from('cocktails')
      .select('*', { count: 'exact', head: true });

    // Check for remaining duplicates
    const { data: allCocktails } = await supabase
      .from('cocktails')
      .select('id, name, slug')
      .order('name');

    const nameCounts = new Map<string, number>();
    allCocktails?.forEach(c => {
      const name = c.name?.toLowerCase().trim();
      if (name) {
        nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
      }
    });

    const remainingDuplicates = Array.from(nameCounts.entries())
      .filter(([_, count]) => count > 1);

    // Summary
    console.log('='.repeat(80));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Cocktails deleted: ${deletedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Before count: ${beforeCount}`);
    console.log(`After count: ${afterCount}`);
    console.log(`Remaining duplicates: ${remainingDuplicates.length}`);

    if (remainingDuplicates.length === 0) {
      console.log('\n✅ SUCCESS: All duplicates removed!');
      console.log(`   Final count: ${afterCount} cocktails`);
    } else {
      console.log('\n⚠️  WARNING: Some duplicates may still exist:');
      remainingDuplicates.forEach(([name, count]) => {
        console.log(`   - "${name}": ${count} versions`);
      });
    }

    console.log('\n✅ Deletion complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

deleteDuplicates();

