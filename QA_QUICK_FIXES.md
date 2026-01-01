# 🔧 QA Audit - Quick Fixes Guide

**Estimated Time**: 15-20 minutes for all critical fixes  
**Risk Level**: Very Low (all are bug fixes)  

---

## Critical Fix #1: Account Page Syntax Error

**File**: `app/account/page.tsx`  
**Line**: 87  
**Severity**: 🚨 CRITICAL - Page will crash

### Current Code (BROKEN)
```typescript
const [emailPrefs, setEmailPrefs] = ({
  weekly_digest: true,
  recommendations: true,
  product_updates: true,
});
```

### Fixed Code
```typescript
const [emailPrefs, setEmailPrefs] = useState({
  weekly_digest: true,
  recommendations: true,
  product_updates: true,
});
```

### Why
Missing `useState` hook call. The current code tries to assign an object directly to a variable without the React hook.

### Test After
- Page should load without crashes
- Account page should be accessible
- Email preferences section should render

---

## Critical Fix #2: Add Timeout to getMixDataClient

**File**: `lib/cocktails.ts`  
**Lines**: 252-284  
**Severity**: 🚨 CRITICAL - Page hangs indefinitely

### Current Code (MISSING TIMEOUT)
```typescript
export async function getMixDataClient(): Promise<{
  ingredients: MixIngredient[];
  cocktails: MixCocktail[];
}> {
  const ingredientsPromise = getMixIngredients();
  const cocktailsPromise = getMixCocktails();

  console.log('[MIX-DEBUG] Created promises, waiting for Promise.all...');

  const [ingredients, cocktails] = await Promise.all([
    ingredientsPromise,
    cocktailsPromise
  ]);
  // ...
}
```

### Fixed Code
```typescript
export async function getMixDataClient(timeoutMs = 15000): Promise<{
  ingredients: MixIngredient[];
  cocktails: MixCocktail[];
}> {
  const ingredientsPromise = getMixIngredients();
  const cocktailsPromise = getMixCocktails();

  console.log('[MIX-DEBUG] Created promises, waiting for Promise.all...');

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Mix data load timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      Promise.all([ingredientsPromise, cocktailsPromise]),
      timeoutPromise
    ]);
    
    const [ingredients, cocktails] = result;

    console.log(`[MIX-DEBUG] getMixDataClient loaded ${ingredients.length} ingredients, ${cocktails.length} cocktails`);

    // Check for data loading failures
    if (!ingredients || ingredients.length === 0) {
      throw new Error(`Failed to load ingredients (got ${ingredients?.length || 0})`);
    }
    if (!cocktails || cocktails.length === 0) {
      throw new Error(`Failed to load cocktails (got ${cocktails?.length || 0})`);
    }

    return { ingredients, cocktails };
  } catch (error) {
    console.error('[MIX-DEBUG] getMixDataClient failed:', error);
    throw error;
  }
}
```

### Why
Without a timeout, if Supabase queries hang, the page will show a loading spinner forever. The 15-second timeout ensures the page either loads or shows an error message.

### Test After
- Mix page loads within 15 seconds
- Shows ingredients and cocktails, OR
- Shows user-friendly error message
- No infinite loading spinner

---

## Critical Fix #3: Fix Dashboard/Account Redirect Loop

**File**: `middleware.ts`  
**Lines**: 18, 54-62  
**Severity**: 🚨 CRITICAL - Pages don't load

### Current Issue
```typescript
const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

if (isProtectedRoute && !session) {
  // Redirects to home, but page also tries to render auth dialog
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(redirectUrl);
}
```

### Problem
- User visits `/dashboard` or `/account`
- Middleware redirects to home if no session
- BUT pages also show auth dialog
- Creates confusion about what should happen

### Solution (Recommended)
Change `PROTECTED_ROUTES` to only include `/account` (which requires auth):

```typescript
// Routes that require authentication
const PROTECTED_ROUTES = ["/account"];  // Keep /dashboard accessible to show empty state or redirect to onboarding

// Routes that should skip middleware entirely (static assets, etc.)
const PUBLIC_ROUTES = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/studio",
];
```

### Why
- `/dashboard` should be accessible to logged-in users showing recommendations
- `/dashboard` should show empty state or redirect unauthenticated users to onboarding
- `/account` requires authentication (user settings)
- Middleware should only redirect for truly protected routes

### Test After
- Navigate to `/account` unauthenticated → Should show auth dialog
- Navigate to `/dashboard` unauthenticated → Should show empty state or redirect to onboarding
- After login, both pages should load properly

---

## High Priority Fix #1: Remove Debug Logging

**Files**: 
- `app/mix/page.tsx` (36+ logs)
- `lib/cocktails.ts` (20+ logs)

**Severity**: ⚠️ HIGH - Performance and security

### Current Pattern
```typescript
console.log('[MIX-DEBUG] Filtering cocktails, total:', cocktails.length);
console.log('[MIX-DEBUG] First cocktail sample:', JSON.stringify(cocktails[0], null, 2));
```

### Fixed Pattern (Option A: Remove)
```typescript
// Remove entirely - keep only error logs
```

### Fixed Pattern (Option B: Development Only)
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[MIX-DEBUG] Filtering cocktails, total:', cocktails.length);
  console.log('[MIX-DEBUG] First cocktail sample:', JSON.stringify(cocktails[0], null, 2));
}
```

### Why
- Production console is cluttered with 50+ debug logs
- Could expose sensitive information
- Makes real errors harder to spot
- Impacts performance with large datasets

### Recommendation
**Remove most debug logs, keep error logging**: Use error logs for actual failures, reserve debug logs for development-only code.

### Test After
- Browser console (production) has no `[MIX-DEBUG]` logs
- Only errors/warnings should appear in console
- Page performance is noticeably better

---

## High Priority Fix #2: Verify Vercel Configuration

**File**: `vercel.json`  
**Lines**: 44-53  
**Severity**: ⚠️ HIGH - Redirect loops possible

### Current Configuration
```json
{
  "source": "/:path*",
  "has": [
    {
      "type": "host",
      "value": "getmixwise.com"
    }
  ],
  "destination": "https://www.getmixwise.com/:path*",
  "permanent": true
}
```

### The Issue
If Vercel dashboard is ALSO configured to redirect `getmixwise.com` → `www.getmixwise.com`, you get a redirect loop:
1. User visits `getmixwise.com/dashboard`
2. `vercel.json` redirects to `www.getmixwise.com/dashboard`
3. Vercel dashboard redirects back to `getmixwise.com/dashboard`
4. Loop repeats

### Solution
Choose ONE place to handle domain canonicalization:

**Option A: Use Vercel Dashboard (RECOMMENDED)**
1. Go to https://vercel.com/dashboard
2. Select project "mixwise-next-sanity"
3. Project Settings → Domains
4. Set primary domain to one of:
   - `www.getmixwise.com` (recommended), OR
   - `getmixwise.com`
5. Remove this redirect from `vercel.json`

**Option B: Keep in vercel.json (if dashboard NOT configured)**
1. Verify Vercel dashboard does NOT have a redirect rule
2. Keep `vercel.json` rule as-is

### Test After
- Visit `getmixwise.com` → Should resolve without loops
- Visit `www.getmixwise.com` → Should resolve without loops
- Check Vercel logs for any 308/309 redirect chains

---

## High Priority Fix #3: RLS Policies

**File**: `supabase/migrations/`  
**Severity**: ⚠️ HIGH - Security vulnerability

### Check What's Missing

For each table, verify RLS policies exist:

```bash
# Check in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'cocktails';
SELECT * FROM pg_policies WHERE tablename = 'ingredients';
SELECT * FROM pg_policies WHERE tablename = 'cocktail_ingredients';
```

### If Policies Are Missing

Create them:

```sql
-- For cocktails (readable by all, not writable)
CREATE POLICY "cocktails_readable_by_all"
  ON public.cocktails
  FOR SELECT
  USING (true);

CREATE POLICY "cocktails_not_writable"
  ON public.cocktails
  FOR UPDATE
  USING (false);

CREATE POLICY "cocktails_not_deletable"
  ON public.cocktails
  FOR DELETE
  USING (false);

-- For ingredients (same pattern)
CREATE POLICY "ingredients_readable_by_all"
  ON public.ingredients
  FOR SELECT
  USING (true);

CREATE POLICY "ingredients_not_writable"
  ON public.ingredients
  FOR UPDATE
  USING (false);

CREATE POLICY "ingredients_not_deletable"
  ON public.ingredients
  FOR DELETE
  USING (false);

-- For cocktail_ingredients (same pattern)
CREATE POLICY "cocktail_ingredients_readable_by_all"
  ON public.cocktail_ingredients
  FOR SELECT
  USING (true);

CREATE POLICY "cocktail_ingredients_not_writable"
  ON public.cocktail_ingredients
  FOR UPDATE
  USING (false);

CREATE POLICY "cocktail_ingredients_not_deletable"
  ON public.cocktail_ingredients
  FOR DELETE
  USING (false);
```

### Test After
- Public data queries work
- Authenticated users see correct data
- Write operations are properly restricted

---

## Verification Checklist

After all fixes, verify:

### Fix #1: Account Page
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Email preferences section renders

### Fix #2: Mix Wizard Timeout
- [ ] Page starts loading immediately
- [ ] Shows ingredients within 15 seconds
- [ ] Shows error message if data fails to load
- [ ] No infinite spinner

### Fix #3: Middleware/Dashboard
- [ ] Navigate to `/dashboard` without auth → Shows empty state
- [ ] Navigate to `/account` without auth → Shows auth dialog
- [ ] After login, `/dashboard` shows data
- [ ] After login, `/account` shows settings

### Fix #4: Debug Logging (Optional but recommended)
- [ ] Open browser DevTools Console
- [ ] Navigate to `/mix`
- [ ] No `[MIX-DEBUG]` logs appear
- [ ] Only see normal page logs

### Fix #5: Vercel Config
- [ ] Visit `getmixwise.com` → Works
- [ ] Visit `www.getmixwise.com` → Works
- [ ] No redirect loops in network tab
- [ ] Page loads in <2 seconds

### Fix #6: RLS Policies
- [ ] All tables have RLS enabled
- [ ] Policies are set correctly
- [ ] Public data accessible
- [ ] Write operations blocked appropriately

---

## Deployment Checklist

Before pushing to production:

- [ ] All syntax errors fixed
- [ ] Timeouts added and tested
- [ ] Debug logs removed/wrapped
- [ ] RLS policies verified
- [ ] Environment variables confirmed in Vercel
- [ ] Middleware redirects tested
- [ ] All pages load without errors
- [ ] No console errors in DevTools
- [ ] Auth flows tested (email + Google)
- [ ] Database queries performant

---

## Rollback Plan

If anything breaks:

1. **Quick Rollback** (2 minutes)
   - Go to https://vercel.com/dashboard
   - Click "Deployments"
   - Select previous deployment
   - Click "..." → "Promote to Production"

2. **Git Rollback** (5 minutes)
   ```bash
   git log --oneline  # Find last good commit
   git revert <commit-hash>
   git push origin main
   ```

3. **Database Rollback** (15 minutes)
   - Use Supabase backup restore if changes were made

---

## Time Breakdown

| Fix | Estimated Time |
|-----|-----------------|
| Account syntax fix | 2 minutes |
| Timeout addition | 5 minutes |
| Middleware adjustment | 5 minutes |
| Debug logging cleanup | 20 minutes |
| RLS policy verification | 10 minutes |
| Vercel config check | 5 minutes |
| Testing all fixes | 10-15 minutes |
| **TOTAL** | **60 minutes** |

---

**Ready to fix?** Start with Critical Fix #1 now!

