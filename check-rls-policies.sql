-- Check if RLS policies are correctly configured for profiles and user_preferences
-- Run this in Supabase SQL Editor to verify the fixes are applied

-- 1. Check profiles UPDATE policy
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'UPDATE'
  AND schemaname = 'public';

-- 2. Check user_preferences UPDATE policy  
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'user_preferences'
  AND cmd = 'UPDATE'
  AND schemaname = 'public';

-- Expected results:
-- Both should have:
-- - using_clause: (auth.uid() = id) or (auth.uid() = user_id)
-- - with_check_clause: (auth.uid() = id) or (auth.uid() = user_id)
-- If with_check_clause is NULL, the migration hasn't been applied!

