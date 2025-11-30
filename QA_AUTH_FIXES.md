# QA Auth Fixes - MixWise

## Summary

This document describes the fixes applied to resolve broken auth flows and related features in the MixWise application.

---

## Issues Fixed

### 1. Header Navigation - Missing "Log In" Option

**Problem:** The header only showed "Create Free Account" for unauthenticated users. Existing users had no obvious way to log in.

**Solution:**
- Added both "Log In" and "Create Free Account" buttons to the header
- Desktop: Shows "Log In" (text button) next to "Create Free Account" (primary button)
- Mobile: Shows both buttons in the mobile menu
- `AuthDialog` now supports two modes: `"login"` and `"signup"` with appropriate titles and subtitles
- Added mode switcher at the bottom of the dialog ("Already have an account? Log in" / "Don't have an account? Create one")

**Files Changed:**
- `components/layout/SiteHeader.tsx`
- `components/auth/AuthDialog.tsx`
- `components/auth/AuthDialogProvider.tsx`

### 2. Save a Cocktail Functionality

**Problem:** The save/favorite feature was potentially confusing for users not signed in.

**Solution:**
- When an unauthenticated user tries to save a cocktail, the auth dialog opens with clear messaging
- Updated subtitle to include both login and signup options: "Log in or create a free account to save favorite cocktails..."
- Dialog mode defaults to `"signup"` with mode switcher available

**Files Changed:**
- `hooks/useFavorites.ts`

### 3. Rating System

**Problem:** Rating prompts needed clearer auth guidance.

**Solution:**
- Updated auth dialog messaging to mention both login and signup options
- Rating component continues to work seamlessly - prompts auth on click for unauthenticated users

**Files Changed:**
- `hooks/useRatings.ts`

### 4. Shopping List Functionality

**Problem:** Shopping list needed to work for both authenticated and anonymous users.

**Solution:**
- Shopping list already supports both modes:
  - Anonymous users: Data stored in localStorage
  - Authenticated users: Data synced to Supabase
  - Automatic migration on sign-in (localStorage items sync to server)
- No changes needed - functionality was already correct

### 5. Bar Ingredients Save Prompt

**Problem:** Bar save prompt needed login option.

**Solution:**
- Updated `promptToSave` function to include login mode and updated messaging

**Files Changed:**
- `hooks/useBarIngredients.ts`

### 6. Dashboard Auth Prompt

**Problem:** Dashboard redirected users but didn't offer login option clearly.

**Solution:**
- Updated auth dialog to use login mode when prompting from dashboard
- Clear messaging for returning users

**Files Changed:**
- `app/dashboard/page.tsx`

---

## How to Test Locally

### Prerequisites
1. Run `npm install`
2. Create `.env.local` with Supabase credentials
3. Run `npm run dev`

### Test Flows

#### 1. Header Auth Buttons
- [ ] Visit homepage as logged-out user
- [ ] Verify both "Log In" and "Create Free Account" buttons are visible in header
- [ ] Click "Log In" - verify dialog opens with "Welcome back" title
- [ ] Click "Create Free Account" - verify dialog opens with "Create your free MixWise account" title
- [ ] On mobile, tap hamburger menu - verify both buttons appear

#### 2. Auth Dialog Mode Switching
- [ ] Open dialog in login mode
- [ ] Click "Create one for free" at bottom - verify mode switches to signup
- [ ] Click "Log in" at bottom - verify mode switches back to login

#### 3. Google OAuth Flow
- [ ] Click "Continue with Google"
- [ ] Complete Google sign-in
- [ ] Verify redirect back to app with session established
- [ ] Verify header shows user menu (avatar/name)

#### 4. Email Magic Link Flow
- [ ] Enter email and click "Continue with email"
- [ ] Verify "Check your email" confirmation appears
- [ ] Click magic link in email
- [ ] Verify session is established and user is logged in

#### 5. Save a Cocktail (Unauthenticated)
- [ ] Browse to any cocktail page (e.g., `/cocktails/margarita`)
- [ ] Click the heart/save button
- [ ] Verify auth dialog appears with "Save your favorites" title
- [ ] Verify mode switcher is available at bottom
- [ ] Sign in and verify cocktail is saved

#### 6. Save a Cocktail (Authenticated)
- [ ] Sign in
- [ ] Click save on a cocktail
- [ ] Verify heart icon fills/updates
- [ ] Verify toast notification appears
- [ ] Reload page - verify cocktail remains saved

#### 7. Rating System (Unauthenticated)
- [ ] Browse to any cocktail page
- [ ] Click a star rating
- [ ] Verify auth dialog appears with "Rate this cocktail" title
- [ ] Sign in and submit rating

#### 8. Rating System (Authenticated)
- [ ] Sign in
- [ ] Click a star rating on cocktail page
- [ ] Verify rating is saved and displayed
- [ ] Verify "Your rating: X" appears
- [ ] Reload page - verify rating persists

#### 9. Shopping List (Anonymous)
- [ ] Add items to shopping list from cocktail page
- [ ] Visit `/shopping-list`
- [ ] Verify items appear
- [ ] Reload page - verify items persist (localStorage)

#### 10. Shopping List (Authenticated)
- [ ] Sign in with items in local storage
- [ ] Verify items are synced to server
- [ ] Add more items
- [ ] Sign out and back in - verify items persist

#### 11. Session Persistence
- [ ] Sign in
- [ ] Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Verify still logged in
- [ ] Navigate to different pages
- [ ] Verify session persists across navigation

#### 12. Sign Out Flow
- [ ] Click user menu
- [ ] Click "Sign out"
- [ ] Verify session is cleared
- [ ] Verify header shows login/signup buttons
- [ ] Verify protected content is inaccessible

---

## Production Verification Checklist

- [ ] Supabase Auth providers configured (Google OAuth, Email)
- [ ] Redirect URLs configured in Supabase dashboard:
  - `https://your-domain.com/auth/callback`
- [ ] Google OAuth Client ID and Secret set in Supabase
- [ ] Environment variables set on Vercel/hosting:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
- [ ] All auth flows work in production environment
- [ ] No console errors in browser for auth-related operations

---

## Architecture Notes

### Auth Flow

```
User clicks auth button
        ↓
    AuthDialog opens (mode: login | signup)
        ↓
    User chooses: Google OAuth | Email Magic Link
        ↓
    Google: Redirect to Google → Callback → Session
    Email: Send magic link → User clicks → Callback → Session
        ↓
    UserProvider updates context
        ↓
    UI reactively updates across app
```

### Key Files

| File | Purpose |
|------|---------|
| `components/auth/UserProvider.tsx` | User context, session management |
| `components/auth/AuthDialog.tsx` | Sign-in/signup dialog |
| `components/auth/AuthDialogProvider.tsx` | Dialog state management |
| `app/auth/callback/route.ts` | OAuth/magic link callback handler |
| `lib/supabase/client.ts` | Client-side Supabase client |
| `lib/supabase/server.ts` | Server-side Supabase client |

### Hooks

| Hook | Purpose |
|------|---------|
| `useUser()` | Access user state, auth methods |
| `useAuthDialog()` | Open/close auth dialog |
| `useFavorites()` | Manage favorite cocktails |
| `useRatings(cocktailId)` | Manage cocktail ratings |
| `useShoppingList()` | Manage shopping list |
| `useBarIngredients()` | Manage bar inventory |

---

## Changes Made in This QA Pass

1. **AuthDialogProvider.tsx**
   - Added `mode` property support (`"login"` | `"signup"`)
   - Added `openLoginDialog()` and `openSignupDialog()` helper methods

2. **AuthDialog.tsx**
   - Added mode-aware titles and subtitles
   - Added mode switcher UI at bottom of dialog
   - Conditionally show benefits list only for signup mode

3. **SiteHeader.tsx**
   - Added "Log In" button next to "Create Free Account"
   - Updated mobile menu to show both options
   - Buttons pass appropriate mode to dialog

4. **useFavorites.ts**
   - Updated auth prompt messaging to include login option

5. **useRatings.ts**
   - Updated auth prompt messaging to include login option

6. **useBarIngredients.ts**
   - Updated `promptToSave` messaging to include login option

7. **app/dashboard/page.tsx**
   - Updated auth dialog to use login mode for dashboard access

