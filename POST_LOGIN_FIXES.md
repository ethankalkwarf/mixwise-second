# Post-Login Fixes - MixWise

## Root Cause

**The core issue:** All hooks and components that needed to interact with Supabase after login were creating **separate Supabase clients** via `createClient()` instead of using the **shared client** from `useSessionContext()`.

### Why This Caused Problems

1. The `SupabaseProvider` in `app/providers.tsx` creates a single Supabase client and passes it to `SessionContextProvider`
2. The `UserProvider` correctly uses `useSessionContext()` to access this shared client
3. **BUT** all the feature hooks (`useFavorites`, `useRatings`, `useBarIngredients`, etc.) were creating NEW clients via `createClient()`
4. After login, the OAuth/magic link callback sets session cookies on the **original** client
5. The newly created clients in hooks didn't have the session cookies properly synced
6. This caused authenticated features to fail because requests were made without proper auth

### Technical Details

When a user logs in:
1. They're redirected to `/auth/callback`
2. The callback exchanges the auth code for a session
3. Session cookies are set on the server-side
4. On page reload, the `SessionContextProvider` loads the session from cookies
5. But hooks using `createClient()` created fresh clients that might not have the session

---

## What Was Changed

### Hooks Updated to Use `useSessionContext()`

All hooks now use the shared Supabase client from `useSessionContext()` instead of creating new clients:

| File | Change |
|------|--------|
| `hooks/useFavorites.ts` | Replaced `createClient()` with `useSessionContext()` |
| `hooks/useRatings.ts` | Replaced `createClient()` with `useSessionContext()` |
| `hooks/useBarIngredients.ts` | Replaced `createClient()` with `useSessionContext()` |
| `hooks/useShoppingList.ts` | Replaced `createClient()` with `useSessionContext()` |
| `hooks/useRecentlyViewed.ts` | Replaced `createClient()` with `useSessionContext()` |
| `hooks/useUserPreferences.ts` | Replaced `createClient()` with `useSessionContext()` |

### Components Updated

| File | Change |
|------|--------|
| `app/dashboard/page.tsx` | Replaced `createClient()` with `useSessionContext()` |
| `components/share/CocktailShareCard.tsx` | Replaced `createClient()` with `useSessionContext()` |
| `components/onboarding/OnboardingFlow.tsx` | Replaced `createClient()` with `useSessionContext()` |

---

## How to Test

### Local Development

1. Run the dev server:
   ```bash
   npm run dev
   ```

2. Open browser DevTools (Console + Network tabs)

3. **Test Anonymous User:**
   - Browse the home page and cocktail pages
   - Confirm content loads correctly
   - Note: Save/Rating features should prompt to log in

4. **Test Login Flow:**
   - Click "Log In" in the header
   - Complete Google OAuth or email magic link
   - Observe the redirect back to the app
   - **Expected:** No console errors, UI updates to show logged-in state

5. **Test Authenticated Features:**

   a) **Save/Favorite Cocktail:**
   - Go to any cocktail page (e.g., `/cocktails/margarita`)
   - Click the heart/save button
   - **Expected:** Toast appears "Added to favorites", heart fills
   - Reload page - heart should remain filled
   - Check DevTools Network tab - no 401/403 errors

   b) **Rating System:**
   - On a cocktail page, click the star rating
   - **Expected:** Toast appears "Rating saved!", stars update
   - Reload page - rating should persist
   - Check DevTools - no auth errors

   c) **Shopping List:**
   - Add items from a cocktail's ingredient list
   - Go to `/shopping-list`
   - **Expected:** Items appear and persist after reload

   d) **Bar Ingredients:**
   - Go to `/mix`
   - Add ingredients to your bar
   - **Expected:** Ingredients save and persist for logged-in users

6. **Test Logout:**
   - Click user menu → Sign out
   - **Expected:** UI updates to show login buttons
   - Authenticated features should prompt to log in again

### Production Testing

1. Deploy to Vercel (or your hosting)

2. Verify environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. In Supabase Dashboard, verify:
   - Google OAuth redirect URL: `https://your-domain.com/auth/callback`
   - Email auth redirect URL: `https://your-domain.com/auth/callback`

4. Run through the same test flows as local development

---

## Architecture Notes

### Session Flow After Fix

```
User completes login
        ↓
/auth/callback exchanges code for session
        ↓
Cookies are set on response
        ↓
Page reload/navigation
        ↓
SessionContextProvider reads cookies, creates client with session
        ↓
All hooks use useSessionContext() → same client
        ↓
All requests have proper auth headers
        ↓
Authenticated features work correctly ✅
```

### Key Pattern

```typescript
// ❌ OLD (broken after login)
const supabase = createClient();

// ✅ NEW (works after login)
const { supabaseClient: supabase } = useSessionContext();
```

---

## Files Changed

```
hooks/useFavorites.ts
hooks/useRatings.ts
hooks/useBarIngredients.ts
hooks/useShoppingList.ts
hooks/useRecentlyViewed.ts
hooks/useUserPreferences.ts
app/dashboard/page.tsx
components/share/CocktailShareCard.tsx
components/onboarding/OnboardingFlow.tsx
```

---

## Troubleshooting

### If features still break after login:

1. **Clear browser cookies and try again**
   - Old stale cookies might interfere

2. **Check console for errors**
   - Look for 401/403 errors indicating auth issues
   - Look for "Invalid session" or similar messages

3. **Verify Supabase dashboard**
   - Check Auth → Users to see if user was created
   - Check Database → Tables to see if data was written

4. **Check network requests**
   - Supabase requests should include `Authorization: Bearer <token>` header
   - If missing, session isn't being passed correctly

### If redirect loops occur:

1. Check `/auth/callback` route for errors
2. Verify `user_preferences` table exists in Supabase
3. Temporarily disable onboarding redirect to test

---

## Summary

The fix ensures all components and hooks use the **same Supabase client instance** that has the active session after login. This was achieved by:

1. Replacing `createClient()` calls with `useSessionContext()`
2. Using the shared `supabaseClient` from the session context
3. Ensuring all auth-dependent operations go through the properly authenticated client

