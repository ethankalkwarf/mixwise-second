-- =============================================
-- Migration 005: Ingredients Table
-- =============================================
-- Creates the ingredients table as the single source of truth
-- for ingredient data, replacing Sanity CMS usage.
-- =============================================

-- ===================
-- INGREDIENTS TABLE
-- ===================
-- Main ingredients table with all ingredient data
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('spirit', 'liqueur', 'wine', 'beer', 'mixer', 'citrus', 'syrup', 'bitters', 'garnish', 'other')),
  category TEXT, -- For backward compatibility
  description TEXT,
  abv DECIMAL(5,2),
  origin TEXT,
  flavor_profile TEXT[],
  is_staple BOOLEAN DEFAULT false,
  image_url TEXT,
  image_alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS ingredients_slug_idx ON public.ingredients(slug);
CREATE INDEX IF NOT EXISTS ingredients_name_idx ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS ingredients_type_idx ON public.ingredients(type);
CREATE INDEX IF NOT EXISTS ingredients_category_idx ON public.ingredients(category);
CREATE INDEX IF NOT EXISTS ingredients_flavor_profile_idx ON public.ingredients USING GIN(flavor_profile);
CREATE INDEX IF NOT EXISTS ingredients_created_at_idx ON public.ingredients(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow public read access for ingredients
CREATE POLICY "Anyone can view ingredients"
  ON public.ingredients FOR SELECT
  USING (TRUE);

-- Only authenticated users can insert/update/delete (for admin purposes)
CREATE POLICY "Authenticated users can manage ingredients"
  ON public.ingredients FOR ALL
  USING (auth.role() = 'authenticated');

-- ===================
-- TRIGGER FOR UPDATED_AT
-- ===================
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

