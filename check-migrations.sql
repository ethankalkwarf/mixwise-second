-- Check if required database migrations have been applied for public bar profiles
-- Run this in your Supabase SQL Editor to verify the database state

-- 1. Check if username and public_slug columns exist in profiles table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
  AND column_name IN ('username', 'public_slug')
ORDER BY column_name;

-- 2. Check if public_bar_enabled column exists in user_preferences table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_preferences'
  AND table_schema = 'public'
  AND column_name = 'public_bar_enabled';

-- 3. Check if required functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('generate_public_slug', 'handle_new_profile_slug')
  AND routine_schema = 'public';

-- 4. Check if required triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_profile_created_slug'
  AND trigger_schema = 'public';

-- 5. Check if required indexes exist
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'user_preferences')
  AND indexname IN ('profiles_username_idx', 'profiles_public_slug_idx')
  AND schemaname = 'public';

-- 6. Check RLS policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
  AND schemaname = 'public';

-- 7. Check RLS policies on bar_ingredients table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bar_ingredients'
  AND schemaname = 'public';

-- 8. Sample data check - see if any profiles have public_slugs
SELECT
  id,
  username,
  public_slug,
  created_at
FROM profiles
WHERE public_slug IS NOT NULL
LIMIT 5;

-- 9. Sample data check - see if any user_preferences have public_bar_enabled
SELECT
  user_id,
  public_bar_enabled,
  created_at
FROM user_preferences
WHERE public_bar_enabled = true
LIMIT 5;
