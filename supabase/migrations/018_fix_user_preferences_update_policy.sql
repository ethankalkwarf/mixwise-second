-- =============================================
-- Migration 018: Fix user_preferences UPDATE RLS Policy
-- =============================================
-- Adds WITH CHECK clause to UPDATE policy for user_preferences
-- This ensures users can update their preferences correctly
-- =============================================

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Recreate the UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Migration complete
-- =============================================

