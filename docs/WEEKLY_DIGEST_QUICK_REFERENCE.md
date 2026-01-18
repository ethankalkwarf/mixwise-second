# Weekly Digest Email - Quick Reference

**📖 Full troubleshooting guide:** [`weekly-digest-email-troubleshooting.md`](./weekly-digest-email-troubleshooting.md)

## Quick Diagnosis

### 1. Check Vercel Logs
- Go to Vercel Dashboard → Functions → `/api/cron/weekly-digest`
- Look for: `"Found X users to email"` and `"Sent: X, Errors: Y"`

### 2. Run SQL Query (Supabase SQL Editor)
```sql
SELECT 
  p.email,
  CASE 
    WHEN p.email IS NULL THEN '❌ NO EMAIL'
    WHEN ep.user_id IS NULL THEN '✅ INCLUDED (default)'
    WHEN ep.weekly_digest = true THEN '✅ INCLUDED'
    WHEN ep.weekly_digest = false THEN '❌ EXCLUDED'
  END as status
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON p.id = ep.user_id
ORDER BY status, p.email;
```

### 3. Check Resend Dashboard
- Go to https://resend.com/emails
- Look for failed emails or rate limit warnings

## Common Fixes

### Enable for All Users
```sql
UPDATE public.email_preferences
SET weekly_digest = true
WHERE weekly_digest = false;
```

### Manual Test
```bash
curl -X GET "https://www.getmixwise.com/api/cron/weekly-digest" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Schedule
- **Runs:** Every Sunday at 10:00 AM UTC
- **Endpoint:** `/api/cron/weekly-digest`
- **Config:** `vercel.json`

