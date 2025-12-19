-- =============================================
-- Migration 007: Fix cocktail_ingredients table structure
-- =============================================
-- Add missing columns to cocktail_ingredients table:
-- - id (UUID primary key)
-- - is_optional (boolean)
-- - notes (text)
-- - created_at, updated_at (timestamps)
-- =============================================

-- Add missing columns to existing cocktail_ingredients table
ALTER TABLE public.cocktail_ingredients
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add primary key constraint if id column was added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cocktail_ingredients_pkey'
    AND table_name = 'cocktail_ingredients'
  ) THEN
    ALTER TABLE public.cocktail_ingredients
    ADD CONSTRAINT cocktail_ingredients_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Update existing rows to have UUID cocktail_id instead of numeric
-- First, we need to map the numeric cocktail_id to UUID using legacy_id
UPDATE public.cocktail_ingredients ci
SET cocktail_id = c.id::text
FROM public.cocktails c
WHERE ci.cocktail_id::integer = c.legacy_id::integer
AND ci.cocktail_id ~ '^[0-9]+$'; -- Only numeric IDs

-- Change cocktail_id column type to UUID and add foreign key
ALTER TABLE public.cocktail_ingredients
ALTER COLUMN cocktail_id TYPE UUID USING cocktail_id::uuid,
ADD CONSTRAINT cocktail_ingredients_cocktail_id_fkey
FOREIGN KEY (cocktail_id) REFERENCES public.cocktails(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER update_cocktail_ingredients_updated_at
  BEFORE UPDATE ON public.cocktail_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update indexes (drop old ones and create new with proper names)
DROP INDEX IF EXISTS cocktail_ingredients_cocktail_id_idx;
DROP INDEX IF EXISTS cocktail_ingredients_ingredient_id_idx;

CREATE INDEX IF NOT EXISTS cocktail_ingredients_cocktail_id_idx ON public.cocktail_ingredients(cocktail_id);
CREATE INDEX IF NOT EXISTS cocktail_ingredients_ingredient_id_idx ON public.cocktail_ingredients(ingredient_id);

-- Set default values for existing rows
UPDATE public.cocktail_ingredients
SET is_optional = FALSE
WHERE is_optional IS NULL;

UPDATE public.cocktail_ingredients
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE public.cocktail_ingredients
SET updated_at = NOW()
WHERE updated_at IS NULL;
