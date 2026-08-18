-- ============================================================================
-- EMAIL DIAGNOSTICS - Run these queries in Supabase SQL Editor
-- ============================================================================

-- QUERY 1: Check specific users (ethankalkwarf and hill.brynn)
-- This will show if their profiles have email and their preferences
SELECT 
  'profiles + email_preferences' as query_type,
  p.id,
  p.email as profile_email,
  p.display_name,
  ep.marketing_emails,
  ep.unsubscribed_at,
  ep.last_digest_sent_at,
  ep.unsubscribe_token
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
WHERE p.email ILIKE '%ethankalkwarf%' 
   OR p.email ILIKE '%hill.brynn%'
   OR p.display_name ILIKE '%ethan%'
   OR p.display_name ILIKE '%brynn%';

-- QUERY 2: Check auth.users for these emails (in case profile email is NULL)
SELECT 
  'auth.users' as query_type,
  au.id,
  au.email as auth_email,
  au.email_confirmed_at,
  au.created_at,
  p.email as profile_email,
  CASE 
    WHEN p.email IS NULL THEN '⚠️ PROFILE EMAIL IS NULL - WILL NOT RECEIVE DIGEST'
    WHEN p.email != au.email THEN '⚠️ EMAIL MISMATCH'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email ILIKE '%ethankalkwarf%' 
   OR au.email ILIKE '%hill.brynn%';

-- QUERY 3: Show ALL 10 profiles with their email status
SELECT 
  p.id,
  p.email as profile_email,
  p.display_name,
  p.created_at as profile_created,
  ep.marketing_emails,
  ep.last_digest_sent_at,
  ep.unsubscribe_token IS NOT NULL as has_token
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
WHERE p.email IS NOT NULL
ORDER BY p.created_at DESC;

-- QUERY 4: Check if ANY emails have ever been sent (last_digest_sent_at populated)
SELECT 
  COUNT(*) as total_with_last_sent,
  MAX(last_digest_sent_at) as most_recent_send,
  MIN(last_digest_sent_at) as oldest_send
FROM public.email_preferences
WHERE last_digest_sent_at IS NOT NULL;

-- QUERY 5: Check for profiles with NULL email (these won't receive digests)
SELECT 
  p.id,
  p.display_name,
  p.created_at,
  au.email as auth_email
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email IS NULL;

-- QUERY 6: Show email_preferences that are missing (users without prefs row)
SELECT 
  p.id,
  p.email,
  p.display_name,
  'NO EMAIL_PREFERENCES ROW' as status
FROM public.profiles p
WHERE p.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.email_preferences ep WHERE ep.user_id = p.id
  );
