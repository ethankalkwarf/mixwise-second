#!/usr/bin/env tsx

/**
 * Import ingredients from Sanity to Supabase
 *
 * This script fetches all ingredients from Sanity CMS and imports them
 * into the Supabase ingredients table.
 */

import { sanityClient } from '../lib/sanityClient';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SanityIngredient {
  _id: string;
  name: string;
  slug: { current: string };
  type: string;
  image?: any;
  externalImageUrl?: string;
  description?: string;
  abv?: number;
  origin?: string;
  flavorProfile?: string[];
  isStaple?: boolean;
}

async function importIngredients() {
  console.log('🚀 Starting ingredient import from Sanity to Supabase...');

  try {
    // Check if ingredients table exists and has the right structure
    console.log('📋 Checking if ingredients table exists with correct schema...');
    const { data: sampleData, error: checkError } = await supabase
      .from('ingredients')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === 'PGRST204') {
      console.log('❌ Ingredients table does not exist. Please create it manually in your Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  is_staple BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingredients_name_idx ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS ingredients_type_idx ON public.ingredients(type);
CREATE INDEX IF NOT EXISTS ingredients_category_idx ON public.ingredients(category);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view ingredients"
  ON public.ingredients FOR SELECT
  USING (TRUE);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage ingredients"
  ON public.ingredients FOR ALL
  USING (auth.role() = 'authenticated');
      `);
      process.exit(1);
    } else {
      // Check if the table has the expected columns
      const sample = sampleData[0];
      const hasExpectedColumns = 'name' in sample && 'type' in sample;

      if (!hasExpectedColumns) {
        console.log('❌ Ingredients table exists but has wrong schema. Expected columns: name, type, etc.');
        console.log('Please drop the table and recreate it with the proper schema.');
        process.exit(1);
      }

      console.log('✅ Ingredients table exists with correct schema');
    }
    // Fetch all ingredients from Sanity
    console.log('📥 Fetching ingredients from Sanity...');
    const sanityIngredients = await sanityClient.fetch<SanityIngredient[]>(`
      *[_type == "ingredient"] {
        _id,
        name,
        slug,
        type,
        image,
        externalImageUrl,
        description,
        abv,
        origin,
        flavorProfile,
        isStaple
      }
    `);

    console.log(`📊 Found ${sanityIngredients.length} ingredients in Sanity`);

    // Transform and insert into Supabase
    const supabaseIngredients = sanityIngredients.map(ing => ({
      legacy_id: ing._id,
      name: ing.name,
      type: ing.type,
      category: ing.type, // Keep for backward compatibility
      image_url: ing.externalImageUrl || null,
      is_staple: ing.isStaple || false,
    }));

    console.log('📤 Inserting ingredients into Supabase...');

    // Insert in batches to avoid overwhelming the database
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < supabaseIngredients.length; i += batchSize) {
      const batch = supabaseIngredients.slice(i, i + batchSize);
      console.log(`  Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(supabaseIngredients.length / batchSize)}...`);

      const { error } = await supabase
        .from('ingredients')
        .upsert(batch, {
          onConflict: 'legacy_id',
        });

      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }

      inserted += batch.length;
    }

    console.log(`✅ Successfully imported ${inserted} ingredients to Supabase!`);

    // Verify the import
    const { count, error: countError } = await supabase
      .from('ingredients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error verifying import:', countError);
    } else {
      console.log(`📈 Total ingredients in Supabase: ${count}`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importIngredients();
