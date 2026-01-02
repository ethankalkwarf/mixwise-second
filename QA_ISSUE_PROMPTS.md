# MixWise QA Issues - Individual Chat Session Prompts

Each prompt below can be used to start a new chat session. Copy the entire prompt (including the context) into a new Cursor chat.

---

## Issue #1: Auth Dialog Not Closing on Successful Signup

**Severity**: CRITICAL  
**Category**: Auth Flow  
**Affected Components**: `components/auth/AuthDialog.tsx`, `components/auth/AuthDialogProvider.tsx`

### Prompt for New Chat:

```
You are a QA engineer debugging the MixWise authentication flow.

PROBLEM:
When a user completes email signup through the AuthDialog, the dialog should close automatically after they confirm their email. Currently, the dialog behavior is inconsistent or remains open.

CURRENT FLOW:
1. User clicks "Sign Up Free"
2. Enters email, name, password in AuthDialog
3. Clicks "Create Account"
4. API call to /api/auth/signup succeeds
5. Dialog shows "Check Your Email" message with confirmation code
6. User clicks confirmation link in their email
7. Redirected to /auth/callback, which validates and redirects to /onboarding
8. User becomes authenticated
9. Dialog should now close - BUT IT DOESN'T

RELEVANT CODE:
- components/auth/AuthDialog.tsx (lines 69-74): useEffect watches isAuthenticated
- components/auth/AuthDialogProvider.tsx: manages dialog state

ROOT CAUSE HYPOTHESIS:
The dialog closure logic (lines 69-74) assumes the dialog is still open when the user becomes authenticated. However:
- The email confirmation workflow is NOT immediate
- Users are shown the "Check Your Email" screen (lines 253-277)
- After clicking email link and being redirected, the auth context updates
- But the dialog may have already closed or the event fires after navigation

TASK:
1. Test the signup flow end-to-end (use a test email account or mock service)
2. Trace when isAuthenticated becomes true relative to when the dialog closes
3. Identify why the dialog doesn't close (or when it does close)
4. Propose a fix that ensures:
   - Dialog shows "Check Email" message during email confirmation wait
   - Dialog closes when user confirms email and is authenticated
   - No redirect loops or race conditions

DELIVERABLE:
- Reproduction steps with actual vs. expected behavior
- Root cause with code evidence
- Fix that doesn't break existing auth flows
```

---

## Issue #2: Race Condition Between Email Confirmation and Onboarding Redirect

**Severity**: CRITICAL  
**Category**: Auth State  
**Affected Components**: `app/auth/callback/page.tsx`, `app/onboarding/page.tsx`, `components/auth/UserProvider.tsx`

### Prompt for New Chat:

```
You are a full-stack debugger fixing a race condition in the MixWise authentication system.

PROBLEM:
When users confirm their email via the callback link, they are redirected to /onboarding. However, there's a timing issue: the page redirects before the UserProvider has synchronized the auth state, causing potential redirect loops or loading indefinitely.

CURRENT IMPLEMENTATION (the workaround):
- app/auth/callback/page.tsx uses a 500ms delay before redirecting (lines 206-207)
- This delay is meant to "allow UserProvider context to update" before redirecting
- This is a fragile band-aid, not a proper fix

THE REAL ISSUE:
1. /auth/callback processes the confirmation code and calls router.replace()
2. router.replace() navigates immediately to /onboarding
3. /onboarding checks if (isAuthenticated) - but UserProvider's onAuthStateChange subscription hasn't fired yet
4. If auth check hasn't completed, isAuthenticated is still false/loading
5. Redirect loop or infinite loading spinner results

ARCHITECTURAL FLOW:
```
/auth/callback page:
  - Gets code from URL
  - Calls supabase.auth.exchangeCodeForSession(code)
  - Calls router.replace("/onboarding")  <-- IMMEDIATE

/onboarding page:
  - Reads useUser() hook
  - Checks if (isAuthenticated) via UserProvider context
  - If false, redirects back home
  - If loading, shows spinner

UserProvider.tsx:
  - Line 197: Subscribes to onAuthStateChange()
  - onAuthStateChange fires ASYNCHRONOUSLY
  - Updates setUser() and setSession()
  - But /onboarding may render before this fires
```

THE 500ms DELAY (app/auth/callback/page.tsx line 206):
```typescript
const target = needsOnboarding ? "/onboarding" : next;
// Current code:
router.replace(target);
// Should be something like:
setTimeout(() => {
  router.replace(target);
}, 500);  // Wait for subscription to fire
```

TASK:
1. Understand why the 500ms delay exists (look at git history or comments)
2. Propose a PROPER fix that doesn't rely on timing:
   - Option A: Wait for UserProvider to emit a "ready" signal before redirecting
   - Option B: Use a Promise that resolves when session is established
   - Option C: Move auth check to server-side (Next.js middleware)
   - Option D: Other pattern
3. Test the fix with network throttling (slow 3G) to ensure it works under load
4. Ensure the fix doesn't break:
   - Regular email confirmation flow
   - OAuth/Google login
   - Expired token handling
   - Redirect after custom "next" parameter

DELIVERABLE:
- Explanation of why 500ms is insufficient
- Proposed fix with code
- Test cases that would break old approach but pass new approach
- Removal of the delay (not just adding more delay)
```

---

## Issue #3: Ingredient ID Type Mismatches in Cocktail Matching Logic

**Severity**: HIGH  
**Category**: Data Fetching  
**Affected Components**: `app/dashboard/page.tsx`, `app/mix/page.tsx`, `hooks/useBarIngredients.ts`, `lib/mixMatching.ts`

### Prompt for New Chat:

```
You are a data engineer fixing type inconsistencies in the ingredient matching system.

PROBLEM:
Ingredient IDs are stored and compared as different types (string vs. number) throughout the app, causing cocktail matching to fail silently. Users with saved bar ingredients see 0 cocktails available even when they should see many.

THE ID TYPE MESS:
1. Database stores ingredient IDs as NUMBERS:
   - ingredients table: id (bigint/number)
   - bar_ingredients table: ingredient_id (number)

2. Frontend stores/uses as STRINGS:
   - localStorage: JSON stringifies everything → "42" or "ingredient-vodka"
   - useBarIngredients normalizes to strings
   - cocktail.ingredients[].id could be string or number

3. The matching logic compares WITHOUT proper type coercion:
   - app/mix/page.tsx line 369: getMixMatchGroups({ ownedIngredientIds: [...] })
   - ownedIngredientIds are strings like ["42", "ingredient-vodka"]
   - Cocktails may have ingredients with numeric IDs
   - Set comparison fails because "42" !== 42

EVIDENCE:
- app/mix/page.tsx line 315-323: Debug logs show Margarita required IDs
- Dashboard line 80-191: Conversion logic for ingredient IDs
- useBarIngredients line 21-70: normalizeIngredientIds() converts everything to strings
- lib/mixMatching.ts: Unknown if it does type checking

TASK:
1. Audit all ingredient ID formats across the codebase:
   - Where are IDs created/stored/compared?
   - What type is each location?
   - Where do conversions happen?

2. Pick ONE canonical format (recommend: NUMERIC strings, e.g., "42")

3. Ensure consistency at all layers:
   - Database queries: Return IDs as-is (numeric)
   - API responses: Convert to canonical format
   - Client state: Always use canonical format
   - Matching logic: Compare apples to apples

4. Test with:
   - New user (no ingredients) - should show 0 ready
   - User with 3 ingredients - should show some ready
   - User with many ingredients - should show many ready
   - Anonymous user → authenticated user transition

5. Add type safety:
   - Could use branded types (e.g., type IngredientId = string & {readonly __brand: "IngredientId"})
   - Or explicit conversion functions

DELIVERABLE:
- Inventory of all ID format conversions
- Decision on canonical format
- Code changes to enforce consistency
- Test cases that would catch future mismatches
```

---

## Issue #4: Missing Null Checks on Profile Data in Dashboard

**Severity**: HIGH  
**Category**: Rendering  
**Affected Components**: `app/dashboard/page.tsx`, `components/layout/Navbar.tsx`

### Prompt for New Chat:

```
You are a defensive programming engineer fixing null reference errors.

PROBLEM:
The Dashboard and Navbar assume the profile object exists with specific properties. However, newly created users may not have a profile row in the database yet, causing undefined errors or silent failures.

CURRENT SITUATION:
1. User signs up and gets authenticated (auth.users row created)
2. UserProvider tries to fetch profile from profiles table
3. If no profile row exists yet (new user), fetchProfile returns null
4. Component tries to access profile.display_name, profile.username, etc.
5. Some places have fallbacks, some don't

VULNERABLE CODE LOCATIONS:
- Navbar.tsx line 23-25: Uses profile?.display_name (safe, has fallback)
- Dashboard.tsx line 373-405: Uses profile?.display_name (safe with fallback)
- Dashboard.tsx line 472: Uses profile?.username (safe with optional chaining)
- Dashboard.tsx line 787: Uses profile?.username (safe)
- Account.tsx: Multiple places use profile data

REAL RISK:
1. New user may have no profile row
2. UserProvider returns profile: null
3. Components with defensive code work fine
4. But downstream features fail:
   - Share bar button (needs username)
   - Account settings page (needs existing data)
   - Badge display (needs profile linked)

ROOT CAUSE:
The database may not automatically create a profiles row when auth.users is created. This requires:
- A database trigger on auth.users INSERT
- A server-side API endpoint to create profile on signup
- Manual profile creation somewhere

TASK:
1. Verify: Does the profiles table have a row for EVERY authenticated user?
   - Check migrations in supabase/migrations/
   - Check if there's a trigger that creates profiles automatically

2. Find all places that access profile properties:
   - app/dashboard/page.tsx
   - components/layout/Navbar.tsx
   - app/account/page.tsx
   - Any other components

3. For each access:
   - Is there a null check or fallback?
   - What breaks if profile is null?

4. Options for fix:
   - A: Ensure profile ALWAYS exists (best)
     - Add migration/trigger to create profiles row on signup
     - Or create profile in UserProvider when it's null
   - B: Add defensive null checks everywhere (messy)
   - C: Don't allow users to proceed until profile exists

5. Test with:
   - Brand new signed-up user
   - User viewing their dashboard
   - User viewing their account settings
   - User sharing their bar

DELIVERABLE:
- Audit of all profile data access points
- Decision: always create profile OR add null checks everywhere
- Code to implement chosen approach
- Test that profile creation/access is bulletproof
```

---

## Issue #5: Recipe Loading Failures Due to Missing Ingredient Arrays

**Severity**: HIGH  
**Category**: Data Fetching  
**Affected Components**: `app/mix/page.tsx`, `lib/cocktails.ts`

### Prompt for New Chat:

```
You are a data migration engineer fixing incomplete cocktail records.

PROBLEM:
Some cocktails in the database are missing ingredient arrays, causing them to be silently dropped from the UI. Users see 180 cocktails when the database has 247, losing potential recipes.

EVIDENCE:
- app/mix/page.tsx line 90-112: Filters cocktails with this guard:
  ```typescript
  const validCocktails = cocktails.filter(cocktail => {
    const isValid = cocktail &&
                   cocktail.ingredients &&
                   Array.isArray(cocktail.ingredients) &&
                   cocktail.ingredients.length > 0;
    return isValid;
  });
  ```
- Console shows: "total: 247" → "valid: 180"
- 67 cocktails are silently dropped (22% of menu!)

WHY THIS IS BAD:
1. Users think 180 cocktails is the complete menu
2. Dropped cocktails are completely invisible
3. No error logging tells you which cocktails failed
4. Data integrity issue goes unnoticed

LIKELY CAUSES:
1. Data migration from old system (Sanity → Supabase?) incomplete
2. Missing ingredient population scripts
3. Race condition in data loading
4. Schema mismatch (API returns different format than expected)

TASK:
1. Investigate the data source:
   - Where do cocktails come from? (Supabase? Sanity? API?)
   - Look at lib/cocktails.ts or lib/cocktails.server.ts
   - What's the query? What does it return?

2. Find the 67 broken cocktails:
   - Query the database directly
   - Find all cocktails with NULL or empty ingredients
   - Log their IDs and names

3. Determine why ingredients are missing:
   - Was the migration incomplete?
   - Is there a script to populate ingredients?
   - Do these cocktails even HAVE recipes?

4. Fix options:
   - A: Run data repair script to populate missing ingredients
   - B: Filter out broken recipes (acceptable if data is lost)
   - C: Mark broken records and show "coming soon" UI
   - D: Prevent broken records from being created in future

5. Add monitoring:
   - Log which cocktails are being filtered out
   - Alert if the number ever spikes
   - Show this count in admin dashboard

6. Test with:
   - Fresh load of /mix → cocktail count matches expected
   - Search for specific cocktail → not dropped if it has ingredients
   - Empty ingredient query → shows only truly empty

DELIVERABLE:
- List of the 67 broken cocktails
- Root cause of why ingredients are missing
- Data repair script (if fixable) or documentation of data loss
- Code changes to log/alert on ingredient drops
- Fix for preventing future cocktails without ingredients
```

---

## Issue #6: Async Data Race Condition in Mix Page Ingredient Loading

**Severity**: HIGH  
**Category**: State Management  
**Affected Components**: `app/mix/page.tsx`

### Prompt for New Chat:

```
You are a React performance engineer fixing race conditions in data loading.

PROBLEM:
The Mix page displays cocktail counts before all data is loaded, causing the UI to show 0 cocktails initially, then jump to the correct count. If users click "Ready to Mix" during this transition, they get incorrect results.

REPRODUCTION:
1. Navigate to /mix (with slow 3G network throttling)
2. Observe the counter: shows "0 cocktails ready" initially
3. Data loads, counter jumps to actual count
4. If user clicks "Ready to Mix" during the jump, behavior is undefined

THE RACE CONDITION:
```typescript
// app/mix/page.tsx

// Line 28-29: State initialized empty
const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);

// Line 71-183: Load data asynchronously
useEffect(() => {
  const loadData = async () => {
    const { ingredients, cocktails } = await getMixDataClient(); // Takes 200-500ms
    setAllIngredients(ingredients);
    setAllCocktails(cocktails);
  };
  loadData();
}, []);

// Line 267-389: Compute match counts (memoized)
const matchCounts = useMemo(() => {
  if (dataLoading || !allCocktails || allCocktails.length === 0) {
    return { canMake: 0, almostThere: 0 };  // <-- Returns 0 while loading
  }
  // ... actual matching logic
}, [allCocktails, allIngredients, ingredientIds, dataLoading]);

// UI renders matchCounts immediately → user sees 0 → gets confusing UX
```

TIMING ISSUE:
1. Component mounts, states are empty
2. `useMemo` evaluates → returns `{ canMake: 0, almostThere: 0 }`
3. UI renders with "0 cocktails"
4. 200-500ms later, data loads
5. `useMemo` re-evaluates → returns correct count
6. UI updates to show real count
7. User sees a "flash" of 0 → correct number

EVEN WORSE:
- If user clicks "Ready to Mix" button during the transition, they trigger:
  ```typescript
  setCurrentStep('mixer');
  setIsProcessing(true);
  setTimeout(() => {
    setIsProcessing(false);
    setCurrentStep('menu');
  }, 2000);
  ```
- But if cocktails aren't loaded yet, the 'menu' step shows empty results!

TASK:
1. Identify the exact timing:
   - How long does getMixDataClient() take?
   - When is the useMemo evaluated?
   - When does the button become clickable?

2. Ensure data is fully loaded before:
   - Showing match counts
   - Enabling the "Ready to Mix" button
   - Rendering any step of the wizard

3. Options:
   - A: Don't show any counts until all data is loaded
   - B: Keep "Loading..." state for match counts
   - C: Show skeleton loaders for counts
   - D: Disable "Ready to Mix" button until data is ready

4. Test with network throttling:
   - Slow 3G (3G profile from DevTools)
   - User adds ingredients immediately (before data loads)
   - User clicks "Ready to Mix" during load
   - Verify no race condition exists

5. Consider:
   - What if getMixDataClient() fails?
   - What if load takes >5 seconds?
   - Do we need a timeout?

DELIVERABLE:
- Root cause analysis with timing breakdown
- Code to prevent user interaction before data is ready
- Test cases that catch race conditions
- Performance baseline (how long should load take?)
```

---

## Issue #7: localStorage Desynchronization When Auth State Changes

**Severity**: MEDIUM  
**Category**: State Sync  
**Affected Components**: `hooks/useBarIngredients.ts`

### Prompt for New Chat:

```
You are a state management engineer fixing localStorage ↔ server sync issues.

PROBLEM:
When an unauthenticated user builds a bar (stored in localStorage), then logs in, the localStorage and server data may not sync correctly or may lose data entirely.

REPRODUCTION SCENARIO:
1. User visits /mix (not logged in)
2. Adds 5 ingredients to bar (stored in localStorage)
3. Checks phone, sees "Want to save your bar?" prompt
4. Clicks "Save my bar" → AuthDialog opens
5. Completes signup/login flow
6. User now has account and is authenticated
7. Navigate back to /mix
8. **Expected**: Same 5 ingredients appear
9. **Actual**: Might show 0 ingredients OR duplicates OR mix of old + new

THE SYNC CODE (useBarIngredients.ts):
```typescript
// Line 182-241: When user becomes authenticated

if (isAuthenticated && user) {
  const serverData = await loadFromServer();  // Fetch ingredients from bar_ingredients table
  const localIds = loadFromLocal();           // Fetch from localStorage

  // Line 198: Merge
  const mergedIds = [...new Set([...serverIds, ...localIds])];

  // Line 201: Normalize IDs
  const normalizedMergedIds = normalizeIngredientIds(mergedIds, nameToCanonicalId, nameMap);

  // Line 207-215: Replace server data
  await supabase.from("bar_ingredients").delete().eq("user_id", user.id);
  // ⚠️  If this fails, user loses BOTH local and server data!

  const normalizedItems = normalizedMergedIds.map(id => ({...}));
  await supabase.from("bar_ingredients").insert(normalizedItems);
  // ⚠️  If this fails, data is gone AND we cleared the old data above!

  saveToLocal(normalizedMergedIds);
}
```

THE PROBLEMS:
1. **No transaction**: Delete succeeds but insert fails → data lost
2. **No error handling**: Silently swallows errors
3. **No rollback**: Can't restore if operation fails midway
4. **Race condition**: What if user closes browser during sync?
5. **No confirmation**: User doesn't know sync happened or failed

DETAILED ISSUES:
- Line 207: `delete().eq("user_id", user.id)` - no error handling
- Line 215: `insert(normalizedItems)` - if this fails, data is already deleted
- Line 218: `saveToLocal(normalizedMergedIds)` - called even if server ops failed
- No logging of what was synced or what failed

TASK:
1. Design a proper sync strategy:
   - Option A: Use Supabase transaction (if available)
   - Option B: Implement optimistic locking (check version numbers)
   - Option C: Keep old data until new data is confirmed
   - Option D: Atomic update on server side (single upsert call)

2. Implement with safety:
   - Validate data before sync
   - Handle errors gracefully
   - Never delete without confirmation of insert
   - Log what was synced
   - Provide user feedback

3. Test edge cases:
   - Network fails during sync
   - User logs in with 100 local ingredients
   - User logs in with ingredients already on server
   - Same ingredient added both locally and on server
   - Sync takes >30 seconds
   - Browser closes during sync

4. Add observability:
   - Log successful syncs
   - Alert on failed syncs
   - Show user sync status

DELIVERABLE:
- Design document for new sync strategy
- Code implementation with error handling
- Rollback/recovery mechanism
- Test cases for edge cases
- User-facing feedback (success/error notifications)
```

---

## Issue #8: Image Preload Warnings Breaking UX Perception

**Severity**: MEDIUM  
**Category**: Performance  
**Affected Components**: All pages with images

### Prompt for New Chat:

```
You are a web performance engineer fixing image preload issues.

PROBLEM:
Browser console shows warnings about preloaded images not being used, making users/developers think the app is broken or has errors.

EVIDENCE:
Console shows:
```
The resource https://...cocktail-images-fullsize/Brown%20Butter%20Old%20Fashioned.png was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate as value and it is preloaded intentionally.
```

This appears multiple times, creating noise in console.

ROOT CAUSE:
- Images are preloaded globally (in app/layout.tsx or head)
- But they're used conditionally on specific pages
- So many preloads go unused (waste of bandwidth)
- Browser warns about this

EXAMPLES OF WASTED PRELOADS:
- Cocktail images preloaded on /mix but only used if user browses /cocktails
- Dashboard images preloaded everywhere but only used on /dashboard
- Thumbnail images preloaded but lazy-loaded in app

TASK:
1. Audit current preload strategy:
   - Where are images preloaded? (find link rel="preload")
   - Which images? How many?
   - On which pages?
   - Are they actually used on those pages?

2. Decide on strategy:
   - Option A: Remove preloads entirely (images load on demand)
   - Option B: Only preload critical images (hero image, first cocktail)
   - Option C: Dynamic preloads based on page
   - Option D: Use prefetch instead of preload

3. Implement:
   - Remove unnecessary preloads
   - Keep only high-impact preloads (hero image)
   - Or move preloads to specific page layouts
   - Or use Next.js Image component properly

4. Verify:
   - No console warnings on any page
   - Images still load quickly
   - No performance regression
   - Check PageSpeed Insights score

5. Consider future:
   - Implement proper image lazy-loading
   - Use Next.js Image component
   - Optimize image sizes (WebP, AVIF)

DELIVERABLE:
- Audit of current preloads
- Decision on preload strategy
- Code to remove/refactor preloads
- Verification that warnings are gone
- Performance metrics (before/after)
```

---

## Issue #9: Auth Context Loading State Showing Spinner Indefinitely

**Severity**: MEDIUM  
**Category**: Loading States  
**Affected Components**: `app/providers.tsx`, `components/auth/UserProvider.tsx`

### Prompt for New Chat:

```
You are a UX engineer fixing loading state timeouts.

PROBLEM:
If the UserProvider's auth check takes too long or hangs, users see a loading spinner indefinitely with no recovery option or error message.

CURRENT TIMEOUT (app/providers.tsx and UserProvider.tsx):
```typescript
// UserProvider.tsx line 248-257
timeoutId = setTimeout(() => {
  if (mounted && !authCheckDone) {
    console.warn("[UserProvider] Auth initialization timeout (3s) - forcing completion");
    setIsLoading(false);
    authCheckDone = true;
  }
}, 3000);  // 3 second timeout
```

PROBLEMS WITH THIS APPROACH:
1. **3 seconds is noticeable**: On fast networks, users see spinner for no reason
2. **3 seconds may be too short**: On slow networks or with high server load, auth fails
3. **No error state**: Just stops loading, doesn't tell user what went wrong
4. **No recovery option**: User can't retry or go back
5. **Silent failure**: No console error, just stops showing spinner

SCENARIOS WHERE TIMEOUT TRIGGERS:
1. Supabase connection is slow or unavailable
2. User on very slow network (3G, rural area)
3. Server is overloaded
4. Auth session is invalid/expired
5. Race condition in subscription handling

TASK:
1. Understand the timeout better:
   - Why 3 seconds? (look at git history/comments)
   - What happens when timeout fires? (just stops loading?)
   - Does user get stuck in bad state?

2. Collect metrics:
   - How long does auth check normally take?
   - What's 95th percentile on slow networks?
   - What's your target (aim for <1s on 4G, <3s on 3G)?

3. Redesign the approach:
   - Option A: Longer timeout (5-10s) with progressive UX
     - "Checking your session..." (1s)
     - "Still checking..." (3s)
     - "This is taking longer than expected. Retry? Go to home?"
   - Option B: Fail fast with recovery
     - 3s timeout
     - Show error: "Couldn't verify your session"
     - Offer: "Retry" or "Continue as guest"
   - Option C: Use separate timeout for each operation
     - getSession: 2s
     - getUser: 2s
     - fetchProfile: 3s
   - Option D: Server-side auth check (use middleware)

4. Implement with:
   - Clear error states (not just "loading")
   - User-visible recovery options
   - Logging of timeout reasons
   - Metrics collection

5. Test with:
   - Normal fast network (should complete in <1s)
   - Slow 3G (should complete in <3s)
   - Network disconnected (should error quickly)
   - Supabase returning 500 error (should error quickly)

DELIVERABLE:
- Analysis of current timeout behavior
- Metrics on actual auth check times
- New UX design for timeout states
- Code implementation
- Test cases that verify proper timeout handling
```

---

## Issue #10: Unauthenticated Users Unable to Access Deep-linked Authenticated Content

**Severity**: MEDIUM  
**Category**: Routing  
**Affected Components**: `middleware.ts`, `app/dashboard/page.tsx`, `app/bar/[slug]/page.tsx`

### Prompt for New Chat:

```
You are a routing engineer fixing protected page access.

PROBLEM:
Unauthenticated users who try to access protected pages (via bookmark, direct URL, or deep link) may see confusing partially-loaded content instead of being redirected to login.

EXAMPLES:
1. User bookmarks /dashboard
2. Signs out or browser clears cookies
3. Visits bookmark while logged out
4. **Expected**: Redirect to / with auth dialog, or message "Log in to view this"
5. **Actual**: Page renders partially (e.g., shows empty dashboard)

ROOT CAUSE:
From middleware.ts:
```typescript
const PROTECTED_ROUTES = ["/account"];  // Only /account is protected!
```

Only `/account` is protected at middleware level. Other auth-requiring pages:
- `/dashboard` - has client-side redirect, but shows loading spinner first
- `/onboarding` - has client-side redirect, but may redirect to wrong place
- `/bar/:username` - unclear if protected at all
- `/mix` (when logged-in features) - accessible but shows empty for non-auth

CURRENT PROTECTION (client-side, dashboard example):
```typescript
// dashboard/page.tsx line 194-202
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    openAuthDialog({...});
  }
}, [authLoading, isAuthenticated, openAuthDialog]);
```

PROBLEMS:
1. Shows dialog instead of redirect (confusing UX)
2. Page renders before dialog shows
3. User sees "loading..." spinner, then dialog, then nothing
4. Deep links don't work well (users come for dashboard, see login dialog)

TASK:
1. Identify all protected pages:
   - Which pages require authentication?
   - Which can be used by both auth and non-auth?
   - Which are only for admins?

2. Choose protection strategy:
   - Option A: Protect at middleware level (server-side)
     - Add routes to PROTECTED_ROUTES
     - middleware.ts redirects unauthenticated users
     - Cleaner but requires session fetch
   - Option B: Protect at page level (client-side) - current approach
     - Each page checks auth and redirects
     - Simpler but users see content loading first
   - Option C: Hybrid approach
     - Middleware checks for obvious cases (unauthenticated)
     - Client-side for edge cases (expired tokens)

3. Implement chosen strategy:
   - Update PROTECTED_ROUTES in middleware.ts
   - Or add consistent redirect logic to each page
   - Or use a `<ProtectedRoute>` wrapper component

4. Handle edge cases:
   - Expired sessions (should redirect to login)
   - Invalid tokens (clear and redirect)
   - Role-based access (admin-only pages)
   - Public shareable pages (like /bar/:username)

5. Test:
   - Unauthenticated user visits /dashboard → redirected cleanly
   - Unauthenticated user visits /account → redirected
   - Unauthenticated user visits /bar/john → shows public profile
   - Authenticated user visits /dashboard → shows dashboard
   - User with expired token visits /dashboard → redirected to login

DELIVERABLE:
- Decision on protection strategy
- List of all pages and their auth requirements
- Code changes to implement consistent protection
- Test cases for auth/non-auth access
- Documentation for future pages
```

---

## Issue #11: Missing Error Handling for Supabase Query Failures

**Severity**: MEDIUM  
**Category**: Error Handling  
**Affected Components**: `app/dashboard/page.tsx`, `app/account/page.tsx`, `hooks/useBarIngredients.ts`

### Prompt for New Chat:

```
You are a reliability engineer adding error handling to Supabase queries.

PROBLEM:
Many Supabase queries silently fail when network errors occur or the database is unavailable. Users don't get feedback, and the app may appear broken or frozen.

EXAMPLES OF MISSING ERROR HANDLING:

1. Dashboard loading ingredients:
```typescript
// dashboard/page.tsx line 290-299
const { data, error } = await supabase
  .from('ingredients')
  .select('id, name, category, image_url, is_staple')
  .order('name');

if (error) {
  console.error("Error fetching ingredients from Supabase:", error);
  setAllIngredients(getFallbackIngredients());  // ✓ Has fallback
  return;
}
```
This one HAS error handling - good!

2. Account page loading preferences:
```typescript
// app/account/page.tsx - checking if similar
// Need to audit
```

3. useBarIngredients sync:
```typescript
// hooks/useBarIngredients.ts line 207
await supabase.from("bar_ingredients").delete().eq("user_id", user.id);
// ❌ No error handling! If this fails, data is lost

const normalizedItems = normalizedMergedIds.map(id => ({...}));
await supabase.from("bar_ingredients").insert(normalizedItems);
// ❌ No error handling! If insert fails after delete, no recovery
```

PROBLEM SCENARIOS:
1. Network goes down while loading data
   - User sees blank page or empty results
   - No error message
   - No retry button
   - User doesn't know what's wrong

2. Database connection times out
   - Query hangs indefinitely
   - User sees loading spinner forever
   - Can't interrupt or retry

3. Sync operation fails partially
   - Local data deleted but server update failed
   - User loses data silently
   - No way to recover

TASK:
1. Audit all Supabase queries in:
   - app/dashboard/page.tsx
   - app/account/page.tsx
   - app/mix/page.tsx
   - hooks/useBarIngredients.ts
   - hooks/useFavorites.ts
   - hooks/useRecentlyViewed.ts
   - Any other places making queries

2. For each query, check:
   - Is there error handling?
   - If error, what happens to user?
   - Is there a fallback?
   - Is there a user-visible error message?
   - Can user retry?

3. Implement error handling pattern:
```typescript
try {
  const { data, error } = await supabase.from(...);
  
  if (error) {
    // Log error for debugging
    console.error("[Component] Failed to fetch X:", error);
    
    // Show user-visible error
    toast.error("Failed to load your bar. Please refresh the page.");
    
    // Either: provide fallback OR show error state
    setIngredients(fallbackData);
    return;
  }
  
  // Use data
  setIngredients(data);
} catch (err) {
  // Handle network/parsing errors
  console.error("[Component] Unexpected error:", err);
  toast.error("Something went wrong. Please try again.");
  setIngredients(fallbackData);
}
```

4. Implement retry logic:
   - Add "Retry" button in error state
   - Use exponential backoff for retries
   - Limit retry attempts (max 3)

5. Test failure scenarios:
   - Disconnect network → reconnect
   - Simulate Supabase 500 error
   - Simulate query timeout
   - Simulate partial sync failure
   - Verify user gets feedback and can recover

6. Add monitoring:
   - Log all query failures
   - Alert on repeated failures
   - Track error rates per endpoint

DELIVERABLE:
- Audit report of all unhandled queries
- Error handling implementation across codebase
- Retry logic for critical operations
- User-facing error messages and recovery options
- Test cases for failure scenarios
```

---

## Issue #12: onAuthStateChange Subscription Not Properly Cleaned Up

**Severity**: LOW  
**Category**: Memory Leaks  
**Affected Components**: `components/auth/UserProvider.tsx`

### Prompt for New Chat:

```
You are a memory leak detective fixing subscription cleanup.

PROBLEM:
In some edge cases, the onAuthStateChange subscription in UserProvider may not unsubscribe properly, leading to:
- Multiple subscriptions stacking up
- Memory leaks
- Duplicate event handling
- Unexpected behavior on route changes

CURRENT CLEANUP CODE (UserProvider.tsx):
```typescript
// Line 262-267: Cleanup function
return () => {
  mounted = false;
  if (timeoutId) clearTimeout(timeoutId);
  subscription.unsubscribe();  // ✓ Looks correct
};
```

POTENTIAL ISSUES:
1. What if unsubscribe() throws an error? (catches and silent fails?)
2. What if component remounts quickly?
   - Old subscription unsubscribing while new one subscribing
   - Race condition in cleanup
3. What if user signs out → signs in quickly?
   - Multiple subscription attempts
   - Old subscription still active?

TASK:
1. Test subscription behavior:
   - Does unsubscribe() actually unsubscribe?
   - What happens if called twice?
   - Can multiple subscriptions exist?

2. Verify cleanup in these scenarios:
   - Navigate away from page with UserProvider → back to page
   - Sign out → sign in
   - Refresh page while signed in
   - Close browser tab while loading

3. Add safeguards:
   - Wrap unsubscribe in try-catch
   - Track subscription state to prevent double-unsubscribe
   - Log subscription lifecycle

4. Test with memory profiling:
   - Use Chrome DevTools Memory tab
   - Take heap snapshot before/after navigation
   - Check for retained objects
   - Verify no subscription leaks

5. Consider improvements:
   - Could use React.useEffect cleanup more safely?
   - Could use AbortController instead?
   - Could track subscription ref?

POTENTIAL CODE IMPROVEMENT:
```typescript
// Track subscription instance
const subscriptionRef = useRef<Subscription | null>(null);

useEffect(() => {
  subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
    // ... handle event
  });

  return () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;  // Clear ref
    }
  };
}, [supabase]);
```

DELIVERABLE:
- Memory leak analysis (heap snapshots before/after)
- Test cases that catch subscription leaks
- Code improvements to cleanup handling
- Documentation of subscription lifecycle
```

---

# How to Use These Prompts

1. **Pick one issue** from the list above
2. **Copy the entire prompt** (from "You are..." to "DELIVERABLE")
3. **Start a new Cursor chat session**
4. **Paste the prompt** and hit enter
5. **The new chat will focus entirely on that one issue**
6. **Share results back** in a summary comment when done

Each prompt is self-contained and provides all context needed without needing to reference this document again.

---

# Recommended Priority Order

1. **Issue #2** (Critical race condition) - blocks auth flow
2. **Issue #1** (Dialog closing) - affects signup UX
3. **Issue #3** (ID type mismatches) - affects recommendation accuracy
4. **Issue #5** (Missing ingredients) - data integrity
5. **Issue #6** (Race conditions in Mix) - UX glitches
6. Then medium/low severity issues in any order

Total estimated effort: ~2 weeks of focused work across all 12 issues.







