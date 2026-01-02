-- =============================================
-- Migration 015: Secure RLS Policies for Reference Tables
-- =============================================
-- This migration secures cocktails, ingredients, and cocktail_ingredients tables
-- by making them read-only for all users. Only admin operations can modify them.
--
-- Current state: Tables allow any authenticated user to INSERT/UPDATE/DELETE
-- New state: Tables are read-only for everyone, writable only by admin
-- =============================================

-- ===================
-- COCKTAILS TABLE FIX
-- ===================
-- CURRENT: "Authenticated users can manage cocktails" allows all authenticated users to modify
-- FIX: Remove this policy and add explicit deny policies for write operations

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage cocktails" ON public.cocktails;

-- Keep the read policy (already exists and is correct)
-- "Anyone can view cocktails" allows SELECT for everyone

-- Add explicit deny policies for write operations
CREATE POLICY "cocktails_not_writable"
  ON public.cocktails FOR UPDATE
  USING (false);

CREATE POLICY "cocktails_not_deletable"
  ON public.cocktails FOR DELETE
  USING (false);

CREATE POLICY "cocktails_not_insertable"
  ON public.cocktails FOR INSERT
  WITH CHECK (false);

-- ===================
-- INGREDIENTS TABLE FIX
-- ===================
-- CURRENT: "Authenticated users can manage ingredients" allows all authenticated users to modify
-- FIX: Remove this policy and add explicit deny policies for write operations

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON public.ingredients;

-- Keep the read policy (already exists and is correct)
-- "Anyone can view ingredients" allows SELECT for everyone

-- Add explicit deny policies for write operations
CREATE POLICY "ingredients_not_writable"
  ON public.ingredients FOR UPDATE
  USING (false);

CREATE POLICY "ingredients_not_deletable"
  ON public.ingredients FOR DELETE
  USING (false);

CREATE POLICY "ingredients_not_insertable"
  ON public.ingredients FOR INSERT
  WITH CHECK (false);

-- ===================
-- COCKTAIL_INGREDIENTS TABLE FIX
-- ===================
-- CURRENT: "Authenticated users can manage cocktail ingredients" allows all authenticated users to modify
-- FIX: Remove this policy and add explicit deny policies for write operations

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage cocktail ingredients" ON public.cocktail_ingredients;

-- Keep the read policy (already exists and is correct)
-- "Anyone can view cocktail ingredients" allows SELECT for everyone

-- Add explicit deny policies for write operations
CREATE POLICY "cocktail_ingredients_not_writable"
  ON public.cocktail_ingredients FOR UPDATE
  USING (false);

CREATE POLICY "cocktail_ingredients_not_deletable"
  ON public.cocktail_ingredients FOR DELETE
  USING (false);

CREATE POLICY "cocktail_ingredients_not_insertable"
  ON public.cocktail_ingredients FOR INSERT
  WITH CHECK (false);

-- ===================
-- VERIFICATION QUERIES
-- ===================
-- Run these queries after applying the migration to verify:

-- Check cocktails policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'cocktails';

-- Check ingredients policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'ingredients';

-- Check cocktail_ingredients policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'cocktail_ingredients';

-- Test queries (should work for SELECT):
-- SELECT COUNT(*) FROM cocktails;
-- SELECT COUNT(*) FROM ingredients;
-- SELECT COUNT(*) FROM cocktail_ingredients;

-- Test queries (should fail for non-admin):
-- INSERT INTO cocktails (slug, name) VALUES ('test', 'Test Cocktail');
-- UPDATE cocktails SET name = 'Updated' WHERE slug = 'test';
-- DELETE FROM cocktails WHERE slug = 'test';

-- =============================================
-- Migration complete: Reference tables are now secure
-- =============================================






