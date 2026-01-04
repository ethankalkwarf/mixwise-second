# Production Deployment Notes

## Domain Configuration

**Primary domain**: `getmixwise.com`

## Redirect Loop Issue (Fixed)

### Problem
Production pages (`/cocktails`, `/mix`, `/about`) were causing redirect loops.

### Root Cause
The `vercel.json` file had a redirect rule:
```
www.getmixwise.com/* → getmixwise.com/*
```

If the Vercel dashboard is also configured to redirect the apex domain to www (or vice versa), this creates a loop:
1. User visits `www.getmixwise.com/cocktails`
2. vercel.json redirects to `getmixwise.com/cocktails`
3. Vercel dashboard redirects back to `www.getmixwise.com/cocktails`
4. Loop continues

### Solution
Removed the www redirect from `vercel.json`. Domain canonicalization should be handled in **one place only** - either:
- Vercel Dashboard (Domains → Set primary domain)
- OR vercel.json (not both)

We chose to handle it in Vercel Dashboard only.

### Current vercel.json Redirects
Only legacy domain redirects remain:
- `mw.phase5digital.com/*` → `getmixwise.com/*` (301)
- `mw2.phase5digital.com/*` → `getmixwise.com/*` (301)

## OAuth Redirect Issue (Fixed)

### Problem
After Google login, users were redirected to the Vercel preview URL instead of `getmixwise.com`.

### Root Cause
The auth code used `window.location.origin` for redirect URLs:
```javascript
redirectTo: `${window.location.origin}/auth/callback`
```

On Vercel preview deployments, this resulted in URLs like:
`mixwise-next-git-main-xxx.vercel.app/auth/callback`

### Solution
Updated `UserProvider.tsx` to use the `NEXT_PUBLIC_SITE_URL` environment variable:
```javascript
const getAuthRedirectUrl = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return `${siteUrl}/auth/callback`;
  }
  return `${window.location.origin}/auth/callback`;
};
```

## Required Vercel Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://getmixwise.com
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-sanity-project-id>
NEXT_PUBLIC_SANITY_DATASET=production
```

## Required Supabase Configuration

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL**: `https://getmixwise.com`

**Redirect URLs** (add all of these):
- `https://getmixwise.com/auth/callback` (production)
- `http://localhost:3000/auth/callback` (development)

In Supabase Dashboard → Authentication → Providers:
- **Google**: Ensure redirect URL is `https://getmixwise.com/auth/callback`
- **Apple**: Ensure redirect URL is `https://getmixwise.com/auth/callback` (if enabled)

## Vercel Domain Configuration

In Vercel Dashboard → Project Settings → Domains:

1. Add `getmixwise.com` as the primary domain
2. Add `www.getmixwise.com` (will auto-redirect to primary)
3. Do NOT add conflicting redirect rules in vercel.json for www

## Testing Routes Locally

```bash
# Build and start production server
npm run build
npm run start

# Test routes (should all return 200)
curl -sI http://localhost:3000/ | head -1
curl -sI http://localhost:3000/cocktails | head -1
curl -sI http://localhost:3000/mix | head -1
curl -sI http://localhost:3000/about | head -1
```

## Common Issues

### Redirect Loop in Production
- Check Vercel Dashboard domain settings
- Ensure only ONE place handles www/apex canonicalization
- Check vercel.json for conflicting redirects

### OAuth Returns to Wrong Domain
- Verify `NEXT_PUBLIC_SITE_URL` is set in Vercel environment variables
- Verify Supabase redirect URLs include the production domain
- Check browser console for "OAuth redirect URL:" log

### Session Not Persisting After Login
- Verify `/auth/callback/route.ts` is deployed
- Check Supabase redirect URL configuration
- Ensure cookies are being set (check Application → Cookies in DevTools)





