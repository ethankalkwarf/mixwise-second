-- =============================================
-- Migration 006: Cocktail Ingredients UUID Migration
-- =============================================
-- Creates cocktail_ingredients table and migrates legacy numeric
-- cocktail_id values to UUIDs based on cocktails.legacy_id mapping.
-- =============================================

-- ===================
-- COCKTAIL INGREDIENTS TABLE
-- ===================
-- Table to store cocktail ingredient relationships
-- Migrated from legacy numeric cocktail_id to UUID cocktail_id
CREATE TABLE IF NOT EXISTS public.cocktail_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cocktail_id UUID NOT NULL REFERENCES public.cocktails(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL,
  amount TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cocktail_ingredients_cocktail_id_idx ON public.cocktail_ingredients(cocktail_id);
CREATE INDEX IF NOT EXISTS cocktail_ingredients_ingredient_id_idx ON public.cocktail_ingredients(ingredient_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.cocktail_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow public read access
CREATE POLICY "Anyone can view cocktail ingredients"
  ON public.cocktail_ingredients FOR SELECT
  USING (TRUE);

-- Only authenticated users can insert/update/delete (for admin purposes)
CREATE POLICY "Authenticated users can manage cocktail ingredients"
  ON public.cocktail_ingredients FOR ALL
  USING (auth.role() = 'authenticated');

-- ===================
-- TRIGGER FOR UPDATED_AT
-- ===================
CREATE TRIGGER update_cocktail_ingredients_updated_at
  BEFORE UPDATE ON public.cocktail_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===================
-- MIGRATION LOGIC
-- ===================
-- Migrate any existing numeric cocktail_id values to UUIDs
-- This handles the case where cocktail_ingredients might exist with legacy IDs

DO $$
DECLARE
    migration_record RECORD;
    target_uuid UUID;
    migrated_count INTEGER := 0;
    orphaned_count INTEGER := 0;
BEGIN
    -- Build mapping from legacy_id to UUID and migrate
    FOR migration_record IN
        SELECT ci.id as ci_id, ci.cocktail_id as legacy_cocktail_id,
               c.id as target_uuid
        FROM public.cocktail_ingredients ci
        LEFT JOIN public.cocktails c ON c.legacy_id = ci.cocktail_id::TEXT
        WHERE ci.cocktail_id::TEXT ~ '^[0-9]+$'  -- Only numeric IDs
        AND c.id IS NOT NULL
    LOOP
        -- Update the cocktail_id to the UUID
        UPDATE public.cocktail_ingredients
        SET cocktail_id = migration_record.target_uuid
        WHERE id = migration_record.ci_id;

        migrated_count := migrated_count + 1;
    END LOOP;

    -- Check for orphaned rows (numeric IDs with no matching cocktail)
    SELECT COUNT(*) INTO orphaned_count
    FROM public.cocktail_ingredients ci
    WHERE ci.cocktail_id::TEXT ~ '^[0-9]+$'  -- Still numeric
    AND NOT EXISTS (
        SELECT 1 FROM public.cocktails c
        WHERE c.legacy_id = ci.cocktail_id::TEXT
    );

    -- Log results
    RAISE NOTICE 'Migration completed: % rows migrated, % orphaned rows found',
                 migrated_count, orphaned_count;

    -- If there are orphaned rows, log them but don't fail the migration
    IF orphaned_count > 0 THEN
        RAISE WARNING '% cocktail_ingredients rows have numeric cocktail_id values that do not match any cocktail.legacy_id. These may need manual cleanup.',
                     orphaned_count;
    END IF;
END $$;
