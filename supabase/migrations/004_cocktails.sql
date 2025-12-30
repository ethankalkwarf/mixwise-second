-- =============================================
-- Migration 004: Cocktails Table
-- =============================================
-- Creates the cocktails table as the single source of truth
-- for cocktail data, replacing Sanity CMS usage.
-- =============================================

-- ===================
-- COCKTAILS TABLE
-- ===================
-- Main cocktails table with all cocktail data
CREATE TABLE IF NOT EXISTS public.cocktails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  seo_description TEXT,
  base_spirit TEXT,
  category_primary TEXT,
  glassware TEXT,
  garnish TEXT,
  technique TEXT,
  difficulty TEXT,
  categories_all TEXT[],
  tags TEXT[],
  flavor_strength SMALLINT,
  flavor_sweetness SMALLINT,
  flavor_tartness SMALLINT,
  flavor_bitterness SMALLINT,
  flavor_aroma SMALLINT,
  flavor_texture SMALLINT,
  notes TEXT,
  fun_fact TEXT,
  fun_fact_source TEXT,
  metadata_json JSONB DEFAULT '{}',
  ingredients JSONB DEFAULT '[]',
  instructions TEXT,
  image_url TEXT,
  image_alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cocktails_slug_idx ON public.cocktails(slug);
CREATE INDEX IF NOT EXISTS cocktails_name_idx ON public.cocktails(name);
CREATE INDEX IF NOT EXISTS cocktails_base_spirit_idx ON public.cocktails(base_spirit);
CREATE INDEX IF NOT EXISTS cocktails_category_primary_idx ON public.cocktails(category_primary);
CREATE INDEX IF NOT EXISTS cocktails_categories_all_idx ON public.cocktails USING GIN(categories_all);
CREATE INDEX IF NOT EXISTS cocktails_tags_idx ON public.cocktails USING GIN(tags);
CREATE INDEX IF NOT EXISTS cocktails_flavor_strength_idx ON public.cocktails(flavor_strength);
CREATE INDEX IF NOT EXISTS cocktails_created_at_idx ON public.cocktails(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow public read access for cocktails
CREATE POLICY "Anyone can view cocktails"
  ON public.cocktails FOR SELECT
  USING (TRUE);

-- Only authenticated users can insert/update/delete (for admin purposes)
CREATE POLICY "Authenticated users can manage cocktails"
  ON public.cocktails FOR ALL
  USING (auth.role() = 'authenticated');

-- ===================
-- TRIGGER FOR UPDATED_AT
-- ===================
CREATE TRIGGER update_cocktails_updated_at
  BEFORE UPDATE ON public.cocktails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();



