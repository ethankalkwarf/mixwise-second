-- ============================================================================
-- MixWise Additional Features Migration
-- ============================================================================
-- This migration creates tables for:
-- - Cocktail ratings
-- - Shopping list
-- - Email signups (newsletter/lead magnets)
--
-- Run this in Supabase SQL Editor after 001_auth_and_profiles.sql
-- ============================================================================

-- ============================================================================
-- 1. RATINGS TABLE
-- ============================================================================
-- Stores user ratings for cocktails (1-5 stars)

CREATE TABLE IF NOT EXISTS public.ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL, -- Sanity cocktail _id
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS ratings_cocktail_idx ON public.ratings(cocktail_id);
CREATE INDEX IF NOT EXISTS ratings_user_idx ON public.ratings(user_id);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
CREATE POLICY "Users can view all ratings"
  ON public.ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get average rating for a cocktail
CREATE OR REPLACE FUNCTION public.get_cocktail_rating(p_cocktail_id TEXT)
RETURNS TABLE (
  average_rating NUMERIC,
  total_ratings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::NUMERIC, 1) as average_rating,
    COUNT(*) as total_ratings
  FROM public.ratings
  WHERE cocktail_id = p_cocktail_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. SHOPPING LIST TABLE
-- ============================================================================
-- Stores user's shopping list items

CREATE TABLE IF NOT EXISTS public.shopping_list (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL, -- Sanity ingredient _id
  ingredient_name TEXT NOT NULL,
  ingredient_category TEXT,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ingredient_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS shopping_list_user_idx ON public.shopping_list(user_id);

-- Enable RLS
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

-- Policies for shopping list
CREATE POLICY "Users can view their own shopping list"
  ON public.shopping_list
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping list items"
  ON public.shopping_list
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items"
  ON public.shopping_list
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items"
  ON public.shopping_list
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. EMAIL SIGNUPS TABLE
-- ============================================================================
-- Stores email signups for newsletter, lead magnets, etc.
-- Public insert allowed (no auth required)

CREATE TABLE IF NOT EXISTS public.email_signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'newsletter', -- 'newsletter', 'cocktail_guide', 'footer', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, source)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS email_signups_email_idx ON public.email_signups(email);

-- Enable RLS
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Policy for public insert (anyone can sign up)
CREATE POLICY "Anyone can insert email signups"
  ON public.email_signups
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view (for now, no select policy for regular users)
-- This keeps emails private

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to upsert a rating
CREATE OR REPLACE FUNCTION public.upsert_rating(
  p_user_id UUID,
  p_cocktail_id TEXT,
  p_rating INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ratings (user_id, cocktail_id, rating)
  VALUES (p_user_id, p_cocktail_id, p_rating)
  ON CONFLICT (user_id, cocktail_id)
  DO UPDATE SET 
    rating = p_rating,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle shopping list item checked status
CREATE OR REPLACE FUNCTION public.toggle_shopping_item(
  p_user_id UUID,
  p_ingredient_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  UPDATE public.shopping_list
  SET is_checked = NOT is_checked
  WHERE user_id = p_user_id AND ingredient_id = p_ingredient_id
  RETURNING is_checked INTO v_new_status;
  
  RETURN v_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

