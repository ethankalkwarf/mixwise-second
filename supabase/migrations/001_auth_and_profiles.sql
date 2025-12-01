-- ============================================================================
-- MixWise Authentication and User Profiles Migration
-- ============================================================================
-- This migration creates the tables, indexes, and RLS policies needed for:
-- - User profiles
-- - Saved bar ingredients
-- - Favorited cocktails
-- - Recently viewed cocktails
-- - Feature usage tracking (for future quotas)
--
-- IMPORTANT: Run this migration in your Supabase SQL Editor or via CLI.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Stores user profile information linked to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free', -- 'free', 'paid', 'admin'
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable by owner"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles are deletable by owner"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. BAR INGREDIENTS TABLE
-- ============================================================================
-- Stores user's saved bar ingredients (their home bar inventory)
-- Note: ingredient_id is TEXT to match Sanity's _id format

CREATE TABLE IF NOT EXISTS public.bar_ingredients (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL, -- Sanity ingredient _id
  ingredient_name TEXT, -- Denormalized for display
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ingredient_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS bar_ingredients_user_idx ON public.bar_ingredients(user_id);

-- Enable RLS
ALTER TABLE public.bar_ingredients ENABLE ROW LEVEL SECURITY;

-- Policy for bar_ingredients
CREATE POLICY "Users manage their own bar ingredients"
  ON public.bar_ingredients
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. FAVORITES TABLE
-- ============================================================================
-- Stores user's favorited cocktails
-- Note: cocktail_id is TEXT to match Sanity's _id format

CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL, -- Sanity cocktail _id
  cocktail_name TEXT, -- Denormalized for display
  cocktail_slug TEXT, -- For linking
  cocktail_image_url TEXT, -- For display
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS favorites_user_idx ON public.favorites(user_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy for favorites
CREATE POLICY "Users manage their own favorites"
  ON public.favorites
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. RECENTLY VIEWED COCKTAILS TABLE
-- ============================================================================
-- Tracks cocktails the user has recently viewed

CREATE TABLE IF NOT EXISTS public.recently_viewed_cocktails (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL, -- Sanity cocktail _id
  cocktail_name TEXT, -- Denormalized for display
  cocktail_slug TEXT, -- For linking
  cocktail_image_url TEXT, -- For display
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

-- Index for fast lookups by user, ordered by recent
CREATE INDEX IF NOT EXISTS recently_viewed_user_idx 
  ON public.recently_viewed_cocktails(user_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE public.recently_viewed_cocktails ENABLE ROW LEVEL SECURITY;

-- Policy for recently_viewed_cocktails
CREATE POLICY "Users manage their own recent views"
  ON public.recently_viewed_cocktails
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. FEATURE USAGE TABLE (for future quotas/limits)
-- ============================================================================
-- Tracks usage of various features for potential future limits

CREATE TABLE IF NOT EXISTS public.feature_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'cocktail_view', 'saved_ingredient', 'favorite', etc.
  period_start DATE NOT NULL, -- Start of the counting period (e.g., month)
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, feature, period_start)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS feature_usage_user_feature_idx 
  ON public.feature_usage(user_id, feature, period_start);

-- Enable RLS
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Policy for feature_usage
CREATE POLICY "Users manage their own usage records"
  ON public.feature_usage
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to upsert recently viewed cocktail
CREATE OR REPLACE FUNCTION public.upsert_recently_viewed(
  p_user_id UUID,
  p_cocktail_id TEXT,
  p_cocktail_name TEXT DEFAULT NULL,
  p_cocktail_slug TEXT DEFAULT NULL,
  p_cocktail_image_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.recently_viewed_cocktails 
    (user_id, cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url, viewed_at)
  VALUES 
    (p_user_id, p_cocktail_id, p_cocktail_name, p_cocktail_slug, p_cocktail_image_url, NOW())
  ON CONFLICT (user_id, cocktail_id) 
  DO UPDATE SET 
    viewed_at = NOW(),
    cocktail_name = COALESCE(EXCLUDED.cocktail_name, recently_viewed_cocktails.cocktail_name),
    cocktail_slug = COALESCE(EXCLUDED.cocktail_slug, recently_viewed_cocktails.cocktail_slug),
    cocktail_image_url = COALESCE(EXCLUDED.cocktail_image_url, recently_viewed_cocktails.cocktail_image_url);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS VOID AS $$
DECLARE
  v_period_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  INSERT INTO public.feature_usage (user_id, feature, period_start, count)
  VALUES (p_user_id, p_feature, v_period_start, 1)
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET 
    count = feature_usage.count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================




