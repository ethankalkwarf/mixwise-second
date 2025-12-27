#!/usr/bin/env node

/**
 * RLS Policy Verification Script
 *
 * Verifies that RLS policies are correctly configured for security.
 * Run this script to check that user data is properly protected.
 *
 * Usage: node scripts/verify-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyRLSPolicies() {
  console.log('🔍 Verifying RLS Policies...\n');

  const tables = [
    'profiles',
    'bar_ingredients',
    'favorites',
    'recently_viewed_cocktails',
    'feature_usage',
    'ratings',
    'shopping_list',
    'user_preferences',
    'user_badges',
    'cocktails',
    'ingredients'
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Checking ${table}...`);

      // Get policies for this table
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, qual')
        .eq('tablename', table)
        .eq('schemaname', 'public');

      if (error) {
        console.error(`❌ Error checking ${table}:`, error.message);
        continue;
      }

      if (!policies || policies.length === 0) {
        console.error(`❌ No policies found for ${table} - RLS may not be enabled`);
        continue;
      }

      // Analyze policies for security issues
      const hasPublicRead = policies.some(p =>
        p.cmd === 'SELECT' && (!p.qual || p.qual.includes('true'))
      );

      const hasOwnerOnlyRead = policies.some(p =>
        p.cmd === 'SELECT' && p.qual && p.qual.includes('auth.uid() = user_id')
      );

      if (hasPublicRead && !hasOwnerOnlyRead) {
        console.error(`⚠️  SECURITY ISSUE: ${table} allows public read access`);
        console.log(`   Policies: ${policies.map(p => p.policyname).join(', ')}`);
      } else if (hasOwnerOnlyRead) {
        console.log(`✅ ${table} has secure owner-only access`);
      } else {
        console.log(`⚠️  ${table} has mixed policies - review manually`);
      }

      console.log('');

    } catch (err) {
      console.error(`❌ Failed to check ${table}:`, err.message);
    }
  }

  console.log('🔍 RLS Policy Verification Complete');
  console.log('\n📝 Manual Verification Steps:');
  console.log('1. Log in as a regular user');
  console.log('2. Try to query other users\' data:');
  console.log('   SELECT * FROM ratings WHERE user_id != auth.uid() LIMIT 1;');
  console.log('   SELECT * FROM user_badges WHERE user_id != auth.uid() LIMIT 1;');
  console.log('3. These should return no results');
}

// Run verification
verifyRLSPolicies().catch(console.error);

