-- =============================================
-- Migration 009: Complete Database Setup
-- =============================================
-- This migration creates ALL missing tables with secure RLS policies
-- Run this once to set up the complete database schema
-- =============================================

-- ============================================================================
-- 1. PROFILES TABLE (from migration 001)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free',
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Secure policies for profiles
CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable by owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles are deletable by owner"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- 2. BAR INGREDIENTS TABLE (from migration 001)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bar_ingredients (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  ingredient_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS bar_ingredients_user_idx ON public.bar_ingredients(user_id);
ALTER TABLE public.bar_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own bar ingredients"
  ON public.bar_ingredients FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. FAVORITES TABLE (from migration 001)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL,
  cocktail_name TEXT,
  cocktail_slug TEXT,
  cocktail_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON public.favorites(user_id);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. RECENTLY VIEWED COCKTAILS TABLE (from migration 001)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recently_viewed_cocktails (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL,
  cocktail_name TEXT,
  cocktail_slug TEXT,
  cocktail_image_url TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS recently_viewed_user_idx
  ON public.recently_viewed_cocktails(user_id, viewed_at DESC);

ALTER TABLE public.recently_viewed_cocktails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own recent views"
  ON public.recently_viewed_cocktails FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. FEATURE USAGE TABLE (from migration 001)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  period_start DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, feature, period_start)
);

CREATE INDEX IF NOT EXISTS feature_usage_user_feature_idx
  ON public.feature_usage(user_id, feature, period_start);

ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own usage records"
  ON public.feature_usage FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. RATINGS TABLE (from migration 002)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS ratings_cocktail_idx ON public.ratings(cocktail_id);
CREATE INDEX IF NOT EXISTS ratings_user_idx ON public.ratings(user_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- SECURE: Users can only view their own ratings (privacy protected)
CREATE POLICY "Users can view their own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. SHOPPING LIST TABLE (from migration 002)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shopping_list (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  ingredient_category TEXT,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS shopping_list_user_idx ON public.shopping_list(user_id);
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping list"
  ON public.shopping_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping list items"
  ON public.shopping_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items"
  ON public.shopping_list FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items"
  ON public.shopping_list FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. USER PREFERENCES TABLE (from migration 003)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_spirits TEXT[] DEFAULT '{}',
  flavor_profiles TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS user_preferences_user_idx ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. USER BADGES TABLE (from migration 003)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS user_badges_user_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx ON public.user_badges(badge_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- SECURE: Users can only view their own badges (privacy protected)
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. HELPER FUNCTIONS AND TRIGGERS
-- ============================================================================

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

-- Function to create user preferences on first login
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when profile is created
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON public.profiles;
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_preferences();

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
  INSERT INTO public.recently_viewed_cocktails (
    user_id, cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url, viewed_at
  ) VALUES (
    p_user_id, p_cocktail_id, p_cocktail_name, p_cocktail_slug, p_cocktail_image_url, NOW()
  )
  ON CONFLICT (user_id, cocktail_id)
  DO UPDATE SET
    viewed_at = NOW(),
    cocktail_name = COALESCE(EXCLUDED.cocktail_name, public.recently_viewed_cocktails.cocktail_name),
    cocktail_slug = COALESCE(EXCLUDED.cocktail_slug, public.recently_viewed_cocktails.cocktail_slug),
    cocktail_image_url = COALESCE(EXCLUDED.cocktail_image_url, public.recently_viewed_cocktails.cocktail_image_url);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

