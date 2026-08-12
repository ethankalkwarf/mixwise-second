/**
 * Email Delivery Diagnostic Script
 * 
 * Run this script to diagnose why users aren't receiving weekly digest emails.
 * 
 * Usage: 
 *   npx ts-node scripts/diagnose_email_issues.ts
 * 
 * Or run the SQL queries below directly in Supabase Dashboard SQL Editor.
 */

// ============================================================================
// SQL QUERIES TO RUN IN SUPABASE DASHBOARD
// ============================================================================
// Copy and paste these into your Supabase SQL Editor to diagnose the issue

const SQL_QUERIES = `
-- ============================================================================
-- DIAGNOSTIC QUERY 1: Check if users exist in profiles table with email
-- ============================================================================
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.created_at as profile_created,
  au.email as auth_email,
  au.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%ethankalkwarf%' 
   OR p.email LIKE '%hill.brynn%'
   OR au.email LIKE '%ethankalkwarf%'
   OR au.email LIKE '%hill.brynn%';

-- ============================================================================
-- DIAGNOSTIC QUERY 2: Check email_preferences for these users
-- ============================================================================
SELECT 
  ep.*,
  p.email,
  p.display_name
FROM public.email_preferences ep
JOIN public.profiles p ON ep.user_id = p.id
WHERE p.email LIKE '%ethankalkwarf%' 
   OR p.email LIKE '%hill.brynn%';

-- ============================================================================
-- DIAGNOSTIC QUERY 3: Find all users eligible for weekly digest
-- This mimics what the cron job does
-- ============================================================================
WITH eligible_users AS (
  SELECT id, email, display_name
  FROM public.profiles
  WHERE email IS NOT NULL
),
users_wanting_digest AS (
  SELECT user_id 
  FROM public.email_preferences 
  WHERE weekly_digest = true
),
users_with_prefs AS (
  SELECT user_id 
  FROM public.email_preferences
)
SELECT 
  eu.id,
  eu.email,
  eu.display_name,
  CASE 
    WHEN uwp.user_id IS NULL THEN 'No preferences (defaults to YES)'
    WHEN uwd.user_id IS NOT NULL THEN 'Explicitly opted IN'
    ELSE 'Explicitly opted OUT'
  END as digest_status,
  ep.weekly_digest,
  ep.unsubscribed_all_at,
  ep.last_digest_sent_at
FROM eligible_users eu
LEFT JOIN users_wanting_digest uwd ON eu.id = uwd.user_id
LEFT JOIN users_with_prefs uwp ON eu.id = uwp.user_id
LEFT JOIN public.email_preferences ep ON eu.id = ep.user_id
ORDER BY eu.email;

-- ============================================================================
-- DIAGNOSTIC QUERY 4: Check for users with NULL email in profiles
-- but valid email in auth.users (sync issue)
-- ============================================================================
SELECT 
  au.id,
  au.email as auth_email,
  au.email_confirmed_at,
  p.email as profile_email,
  p.display_name,
  CASE 
    WHEN p.email IS NULL AND au.email IS NOT NULL THEN '⚠️ PROFILE EMAIL NULL - WILL NOT RECEIVE DIGEST'
    WHEN p.email != au.email THEN '⚠️ EMAIL MISMATCH'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.email IS NULL 
   OR p.email != au.email;

-- ============================================================================
-- DIAGNOSTIC QUERY 5: Count total eligible vs opted-in users
-- ============================================================================
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE email IS NOT NULL) as total_users_with_email,
  (SELECT COUNT(*) FROM public.email_preferences WHERE weekly_digest = true) as users_opted_in,
  (SELECT COUNT(*) FROM public.email_preferences WHERE weekly_digest = false) as users_opted_out,
  (SELECT COUNT(*) FROM public.email_preferences WHERE unsubscribed_all_at IS NOT NULL) as users_unsubscribed_all,
  (SELECT COUNT(*) FROM public.profiles p 
   WHERE p.email IS NOT NULL 
   AND NOT EXISTS (SELECT 1 FROM public.email_preferences ep WHERE ep.user_id = p.id)
  ) as users_with_no_preferences;

-- ============================================================================
-- DIAGNOSTIC QUERY 6: Check last_digest_sent_at (should be NULL - bug!)
-- ============================================================================
SELECT 
  ep.user_id,
  p.email,
  ep.last_digest_sent_at,
  ep.welcome_email_sent_at,
  ep.unsubscribed_all_at,
  ep.weekly_digest
FROM public.email_preferences ep
JOIN public.profiles p ON ep.user_id = p.id
ORDER BY ep.last_digest_sent_at DESC NULLS LAST
LIMIT 20;
`;

console.log("=".repeat(80));
console.log("EMAIL DELIVERY DIAGNOSTIC SCRIPT");
console.log("=".repeat(80));
console.log("\nCopy and paste the SQL queries below into your Supabase Dashboard SQL Editor:\n");
console.log(SQL_QUERIES);
console.log("\n" + "=".repeat(80));
console.log("KNOWN BUGS IN THE CRON JOB");
console.log("=".repeat(80));

console.log(`
BUG 1: WRONG UNSUBSCRIBE TOKEN
-------------------------------
File: app/api/cron/weekly-digest/route.ts, Line 169

Current code uses user.id as the token:
  const unsubscribeUrl = \`\${siteUrl}/api/email/unsubscribe?token=\${user.id}&emailType=weekly_digest\`;

But the unsubscribe API expects 'unsubscribe_token' from email_preferences table.
This means ALL unsubscribe links in weekly digest emails are BROKEN.


BUG 2: last_digest_sent_at IS NEVER UPDATED
-------------------------------------------
File: app/api/cron/weekly-digest/route.ts

The database has a 'last_digest_sent_at' column, but the cron job NEVER updates it
after sending emails. This means:
- No audit trail of sent emails
- No deduplication if cron runs twice
- No way to verify what was sent


BUG 3: POTENTIAL EMAIL SYNC ISSUE
---------------------------------
The cron job reads from profiles.email, but if a user changes their email in Supabase Auth,
the profiles.email may not be updated. Run Diagnostic Query 4 to check for this.


BUG 4: NO ERROR RECOVERY
------------------------
If the Resend API fails for one user, it logs an error and continues.
But if the initial database queries fail, the entire job aborts without notification.
`);

console.log("\n" + "=".repeat(80));
console.log("NEXT STEPS");
console.log("=".repeat(80));
console.log(`
1. Run the SQL queries above in Supabase Dashboard to diagnose the issue
2. Check Vercel function logs for the cron job:
   https://vercel.com/[your-team]/[your-project]/logs?type=cron

3. Verify the cron is actually running:
   - Go to Vercel Dashboard → Project → Settings → Cron Jobs
   - Check "Last Run" timestamp

4. Test the cron manually:
   curl -X GET "https://www.getmixwise.com/api/cron/weekly-digest" \\
     -H "Authorization: Bearer YOUR_CRON_SECRET"
`);
