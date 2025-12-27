-- =============================================
-- Migration 008: RLS Security Policy Fixes
-- =============================================
-- Fixes overly permissive RLS policies that expose user data
-- Changes public read policies to owner-only access
-- =============================================

-- ===================
-- RATINGS TABLE FIX
-- ===================
-- CURRENT: Allows anyone to read all ratings (privacy issue)
-- FIX: Only allow users to read their own ratings

-- Drop the problematic public read policy
DROP POLICY IF EXISTS "Users can view all ratings" ON public.ratings;

-- Create secure owner-only read policy
CREATE POLICY "Users can view their own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = user_id);

-- ===================
-- USER BADGES TABLE FIX
-- ===================
-- CURRENT: Allows anyone to read all badges (privacy issue)
-- FIX: Only allow users to read their own badges

-- Drop the problematic public read policy
DROP POLICY IF EXISTS "Users can view all badges for public profiles" ON public.user_badges;

-- Keep only the owner-only policy (already exists)
-- The existing "Users can view their own badges" policy is secure

-- ===================
-- VERIFICATION QUERIES
-- ===================
-- Run these after applying the migration to verify:

-- Check ratings policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'ratings';

-- Check user_badges policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'user_badges';

-- Test queries (should fail for non-owner):
-- SELECT * FROM ratings WHERE user_id != auth.uid() LIMIT 1;
-- SELECT * FROM user_badges WHERE user_id != auth.uid() LIMIT 1;

