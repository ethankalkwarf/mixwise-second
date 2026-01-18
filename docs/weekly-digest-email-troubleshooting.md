# Weekly Digest Email Troubleshooting Guide

**Last Updated:** January 2025  
**Issue:** Only 2 of 5 users received weekly digest emails  
**Status:** Fixed unsubscribe token bug, improved error handling and logging

---

## Overview

The weekly digest email cron job runs every Sunday at 10:00 AM UTC via Vercel cron. It sends personalized cocktail recommendations to all users who have `weekly_digest = true` in their `email_preferences` table (or users without preferences, which default to enabled).

**Endpoint:** `/api/cron/weekly-digest`  
**Schedule:** `0 10 * * 0` (Sunday 10:00 AM UTC)  
**Configuration:** `vercel.json`

---

## Issues Found & Fixed

### 1. Unsubscribe Token Bug ✅ FIXED
**Problem:** The code was using `user.id` instead of `unsubscribe_token` from the `email_preferences` table for unsubscribe URLs.

**Impact:** Unsubscribe links in emails were broken (though this wouldn't prevent emails from sending).

**Fix:** Now properly fetches `unsubscribe_token` from email preferences and uses it in unsubscribe URLs.

### 2. Missing Error Details ✅ FIXED
**Problem:** Code only captured `error` from Resend API, not the full response data.

**Fix:** Now captures both `data` and `error` from Resend, logs Resend IDs for successful sends, and provides detailed error information.

### 3. Insufficient Logging ✅ FIXED
**Problem:** Limited logging made it difficult to diagnose why emails weren't sent.

**Fix:** Added comprehensive logging:
- Total users found vs. eligible users
- User IDs being processed
- Success/failure for each email with Resend IDs
- Summary statistics at completion

---

## How to Diagnose Issues

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Find the `/api/cron/weekly-digest` function
3. Check logs for the most recent cron execution
4. Look for these log messages:

```
[Weekly Digest] Starting weekly digest job...
[Weekly Digest] Found X users to email (out of Y total users with emails)
[Weekly Digest] User IDs to email: ...
[Weekly Digest] ✅ Sent to user@email.com (user-id) - Resend ID: ...
[Weekly Digest] ❌ Failed to send to user@email.com (user-id): ...
[Weekly Digest] COMPLETED
[Weekly Digest] Successfully sent: X
[Weekly Digest] Errors: Y
```

### Step 2: Check the API Response

The endpoint returns a JSON response:
```json
{
  "success": true,
  "sent": 5,
  "errors": 0,
  "totalUsers": 5,
  "totalEligibleUsers": 5
}
```

**What to look for:**
- If `sent: 2` and `errors: 3` → Resend API rejected 3 emails (check Resend dashboard)
- If `sent: 2` and `errors: 0` → Function timed out or crashed (check execution time)
- If `totalUsers: 2` → Only 2 users matched criteria (run SQL diagnostic query)

### Step 3: Run SQL Diagnostic Query

Run this in Supabase SQL Editor to see which users should receive emails:

```sql
SELECT 
  p.id as user_id,
  p.email,
  p.display_name,
  CASE 
    WHEN p.email IS NULL THEN '❌ NO EMAIL ADDRESS'
    WHEN ep.user_id IS NULL THEN '✅ INCLUDED (no preferences = default yes)'
    WHEN ep.weekly_digest = true THEN '✅ INCLUDED (weekly_digest = true)'
    WHEN ep.weekly_digest = false THEN '❌ EXCLUDED (weekly_digest = false)'
    ELSE '❓ UNKNOWN STATUS'
  END as email_status
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
ORDER BY email_status, p.email;
```

### Step 4: Check Resend Dashboard

1. Go to https://resend.com/emails
2. Check for:
   - **Failed emails** - Look for rejection reasons
   - **Rate limit warnings** - Free tier has limits (usually 100 emails/day)
   - **API errors** - Check for error messages
   - **Domain verification** - Ensure sending domain is verified

---

## Common Issues & Solutions

### Issue 1: Function Timeout
**Symptoms:** Only some emails sent, no errors logged, function execution time near limit

**Causes:**
- Vercel Hobby plan: 10-second timeout
- Vercel Pro plan: 60-second timeout
- Too many users to process in time

**Solutions:**
- Upgrade to Vercel Pro for longer timeout
- Implement batch processing (send emails in chunks)
- Optimize queries (reduce data fetched per user)

### Issue 2: Resend API Rate Limits
**Symptoms:** Some emails fail with rate limit errors

**Causes:**
- Free/trial Resend accounts have daily sending limits
- Too many emails sent too quickly

**Solutions:**
- Upgrade Resend plan
- Add longer delays between emails (currently 100ms)
- Implement exponential backoff for rate limit errors

### Issue 3: Invalid Email Addresses
**Symptoms:** Specific emails fail with validation errors

**Causes:**
- Malformed email addresses in database
- Email addresses that don't exist

**Solutions:**
- Validate email addresses before sending
- Clean up invalid emails in database
- Handle bounces and invalid addresses gracefully

### Issue 4: Users Excluded by Preferences
**Symptoms:** `totalUsers` is less than total user count

**Causes:**
- Users have `weekly_digest = false` in `email_preferences`
- Users don't have email addresses

**Solutions:**
- Run SQL diagnostic query to see excluded users
- Update preferences if needed:
  ```sql
  UPDATE public.email_preferences
  SET weekly_digest = true
  WHERE weekly_digest = false;
  ```

### Issue 5: Missing Email Preferences Rows
**Symptoms:** Users should receive emails but don't have `email_preferences` rows

**Causes:**
- Users created before email preferences migration
- Trigger didn't fire for some users

**Solutions:**
- Run backfill migration:
  ```sql
  INSERT INTO public.email_preferences (user_id)
  SELECT id FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.email_preferences)
  ON CONFLICT (user_id) DO NOTHING;
  ```

---

## Manual Testing

To manually trigger the weekly digest (for testing):

1. **Get CRON_SECRET** from Vercel environment variables

2. **Call the endpoint:**
```bash
curl -X GET "https://www.getmixwise.com/api/cron/weekly-digest" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

3. **Check the response** - Should show:
```json
{
  "success": true,
  "sent": 5,
  "errors": 0,
  "totalUsers": 5,
  "totalEligibleUsers": 5
}
```

4. **Check Vercel logs** for detailed output

---

## Code Location

**File:** `app/api/cron/weekly-digest/route.ts`

**Key Functions:**
- User filtering logic (lines 68-97)
- Email sending loop (lines 149-231)
- Error handling (lines 223-230)

**Configuration:**
- Cron schedule: `vercel.json` line 6
- Email template: `lib/email/templates.ts` → `weeklyDigestTemplate()`
- Resend client: `lib/email/resend.ts`

---

## Monitoring Checklist

After each weekly digest run, check:

- [ ] Vercel function logs show all users processed
- [ ] Response shows `sent` count matches expected user count
- [ ] No errors in Vercel logs
- [ ] Resend dashboard shows all emails sent successfully
- [ ] No rate limit warnings in Resend
- [ ] Users report receiving emails (spot check)

---

## Quick Reference

### Enable Weekly Digest for All Users
```sql
UPDATE public.email_preferences
SET weekly_digest = true
WHERE weekly_digest = false;
```

### Disable Weekly Digest for All Users
```sql
UPDATE public.email_preferences
SET weekly_digest = false;
```

### Count Users Who Will Receive Emails
```sql
SELECT COUNT(*) as will_receive
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
WHERE p.email IS NOT NULL
  AND (ep.user_id IS NULL OR ep.weekly_digest = true);
```

### View All User Email Preferences
```sql
SELECT 
  p.email,
  p.display_name,
  COALESCE(ep.weekly_digest, true) as weekly_digest_enabled
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
WHERE p.email IS NOT NULL
ORDER BY p.email;
```

---

## Related Files

- `app/api/cron/weekly-digest/route.ts` - Main cron job handler
- `lib/email/templates.ts` - Email template (`weeklyDigestTemplate`)
- `lib/email/resend.ts` - Resend client configuration
- `vercel.json` - Cron schedule configuration
- `supabase/migrations/010_email_preferences.sql` - Email preferences table schema
- `app/api/email/unsubscribe/route.ts` - Unsubscribe handler
- `app/account/page.tsx` - User email preferences UI

---

## Next Steps if Issues Persist

1. **Check Vercel logs** for the most recent cron execution
2. **Run SQL diagnostic query** to verify user eligibility
3. **Check Resend dashboard** for failed emails or rate limits
4. **Test manually** using the curl command above
5. **Review error messages** in logs for specific failure reasons
6. **Consider implementing** batch processing if timeout is the issue
7. **Upgrade Resend plan** if rate limits are the problem

---

## Notes

- The cron job processes users sequentially with a 100ms delay between emails
- Users without `email_preferences` rows are included by default (opt-in)
- Unsubscribe URLs use `unsubscribe_token` from `email_preferences` table
- All errors are logged with user email and ID for easy debugging

