-- =============================================
-- Migration 019: Fix profiles UPDATE RLS Policy
-- =============================================
-- Adds WITH CHECK clause to UPDATE policy for profiles
-- This ensures users can update their profile fields (like display_name) correctly
-- =============================================

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;

-- Recreate the UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- Migration complete
-- =============================================

