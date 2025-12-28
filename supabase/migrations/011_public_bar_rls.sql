-- =============================================
-- Migration 011: Public Bar RLS Policies
-- =============================================
-- Adds Row Level Security policies for public bar profiles
-- Allows anonymous users to view public profiles and bar inventories
-- =============================================

-- ============================================================================
-- 1. ADD PUBLIC_BAR_ENABLED COLUMN
-- ============================================================================
-- Add the public_bar_enabled column to control visibility
-- This column controls public access, not profiles.is_public

ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS public_bar_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================================
-- 2. UPDATE PROFILES RLS POLICIES
-- ============================================================================
-- Allow anyone to view profiles that have public_bar_enabled = true
-- Keep existing owner-only policies for INSERT/UPDATE/DELETE

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;

-- Create new SELECT policy allowing public access for enabled profiles
CREATE POLICY "Profiles are viewable by owner or public when enabled"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = profiles.id AND up.public_bar_enabled = true
    )
  );

-- Keep existing owner-only policies for other operations
-- (INSERT, UPDATE, DELETE policies should remain as-is from migration 009)

-- ============================================================================
-- 3. UPDATE BAR INGREDIENTS RLS POLICIES
-- ============================================================================
-- Allow anyone to view bar ingredients for users with public_bar_enabled = true
-- Keep owner-only policies for modifications

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users manage their own bar ingredients" ON public.bar_ingredients;

-- Create separate policies for different operations
CREATE POLICY "Bar ingredients viewable by owner or public when enabled"
  ON public.bar_ingredients
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = bar_ingredients.user_id AND up.public_bar_enabled = true
    )
  );

CREATE POLICY "Users can insert their own bar ingredients"
  ON public.bar_ingredients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bar ingredients"
  ON public.bar_ingredients
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bar ingredients"
  ON public.bar_ingredients
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. UPDATE FAVORITES RLS POLICIES (OPTIONAL)
-- ============================================================================
-- If you want to show favorite cocktails publicly, uncomment these

-- DROP POLICY IF EXISTS "Users manage their own favorites" ON public.favorites;
--
-- CREATE POLICY "Favorites viewable by owner or public when enabled"
--   ON public.favorites
--   FOR SELECT
--   USING (
--     auth.uid() = user_id OR
--     EXISTS (
--       SELECT 1 FROM public.user_preferences up
--       WHERE up.user_id = favorites.user_id AND up.public_bar_enabled = true
--     )
--   );
--
-- CREATE POLICY "Users can manage their own favorites"
--   ON public.favorites
--   FOR ALL
--   USING (auth.uid() = user_id);

-- ============================================================================
-- 5. UPDATE USER BADGES RLS POLICIES
-- ============================================================================
-- Keep existing "Users can view all badges for public profiles" policy
-- This already allows public viewing of badges

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
