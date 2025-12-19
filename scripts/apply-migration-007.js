#!/usr/bin/env node

/**
 * Apply Migration 007: Fix cocktail_ingredients table structure
 *
 * This script applies the changes from migration 007 to fix the cocktail_ingredients table
 * on databases where the migration hasn't been run yet.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying Migration 007: Fix cocktail_ingredients table structure');

  try {
    // Check current table structure
    console.log('📊 Checking current table structure...');
    const { data: sample, error: checkError } = await supabase
      .from('cocktail_ingredients')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking table:', checkError.message);
      return;
    }

    const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
    console.log('Current columns:', columns.join(', '));

    // Apply migration changes
    console.log('\n🔧 Applying migration changes...');

    // Add missing columns
    console.log('Adding missing columns...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.cocktail_ingredients
        ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      `
    });

    if (alterError && !alterError.message.includes('already exists')) {
      console.error('❌ Error adding columns:', alterError.message);
    }

    // Rename amount to measure if needed
    console.log('Renaming amount to measure column...');
    const { error: renameError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'cocktail_ingredients'
            AND column_name = 'amount'
            AND table_schema = 'public'
          ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'cocktail_ingredients'
            AND column_name = 'measure'
            AND table_schema = 'public'
          ) THEN
            ALTER TABLE public.cocktail_ingredients RENAME COLUMN amount TO measure;
          END IF;
        END $$;
      `
    });

    if (renameError) {
      console.error('❌ Error renaming column:', renameError.message);
    }

    // Update UUID cocktail_ids
    console.log('Updating cocktail_id to UUID format...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.cocktail_ingredients ci
        SET cocktail_id = c.id::text
        FROM public.cocktails c
        WHERE ci.cocktail_id::integer = c.legacy_id::integer
        AND ci.cocktail_id ~ '^[0-9]+$';
      `
    });

    if (updateError) {
      console.error('❌ Error updating cocktail_ids:', updateError.message);
    }

    console.log('✅ Migration applied successfully!');
    console.log('🔄 You may need to restart your application for changes to take effect.');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
