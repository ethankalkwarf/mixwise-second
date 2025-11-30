# MixWise Authentication and User Profiles

This document explains how authentication and user profiles work in MixWise.

## Overview

MixWise uses **Supabase Auth** for authentication, supporting:
- **Google OAuth** - One-click sign in with Google
- **Email Magic Links** - Passwordless email authentication

No GitHub login is configured or supported.

## Architecture

### Authentication Flow

1. User clicks "Sign in" in the header or is prompted during an action
2. `AuthDialog` opens with Google and email options
3. For Google: OAuth flow redirects to Google, then back to `/auth/callback`
4. For Email: Magic link is sent; clicking it redirects to `/auth/callback`
5. The callback exchanges the code for a session
6. `UserProvider` detects the session change and loads the profile

### Key Files

| File | Purpose |
|------|---------|
| `/components/auth/UserProvider.tsx` | Main auth context provider |
| `/components/auth/AuthDialog.tsx` | Sign-in modal component |
| `/components/auth/AuthDialogProvider.tsx` | Global dialog controller |
| `/app/auth/callback/route.ts` | OAuth/magic link callback handler |
| `/lib/supabase/client.ts` | Client-side Supabase client |
| `/lib/supabase/server.ts` | Server-side Supabase client |
| `/lib/supabase/database.types.ts` | TypeScript types for the database |

## Database Schema

The following tables are created by the migration in `/supabase/migrations/001_auth_and_profiles.sql`:

### profiles
Stores user profile information.
- `id` - UUID, references `auth.users`
- `email` - User's email
- `display_name` - Display name
- `avatar_url` - Profile picture URL
- `role` - 'free', 'paid', or 'admin'
- `preferences` - JSON settings

### bar_ingredients
Stores user's saved bar ingredients.
- `user_id` - References auth user
- `ingredient_id` - Sanity ingredient ID
- `ingredient_name` - Denormalized name

### favorites
Stores favorited cocktails.
- `user_id` - References auth user
- `cocktail_id` - Sanity cocktail ID
- `cocktail_name`, `cocktail_slug`, `cocktail_image_url` - Denormalized

### recently_viewed_cocktails
Tracks recently viewed cocktails.
- `user_id` - References auth user
- `cocktail_id` - Sanity cocktail ID
- `viewed_at` - Timestamp

### feature_usage
For future usage tracking and quotas.
- `user_id`, `feature`, `period_start`, `count`

### ratings (Migration 002)
Stores user cocktail ratings.
- `user_id` - References auth user
- `cocktail_id` - Sanity cocktail ID
- `rating` - 1-5 star rating
- Unique constraint on (user_id, cocktail_id)

### shopping_list (Migration 002)
Stores user's shopping list for missing ingredients.
- `user_id` - References auth user
- `ingredient_id` - Sanity ingredient ID
- `ingredient_name` - Denormalized name
- `ingredient_category` - Category for grouping
- `is_checked` - Whether item is checked off

### email_signups (Migration 002)
Stores email signups for newsletters and lead magnets.
- `email` - Email address
- `source` - Where signup came from ('newsletter', 'cocktail_guide', 'footer')
- Public insert allowed (no auth required)

## Setup Instructions

### 1. Run the Database Migration

Go to your Supabase project dashboard:
1. Navigate to **SQL Editor**
2. Open the file `/supabase/migrations/001_auth_and_profiles.sql`
3. Copy the contents and run it in the SQL Editor

### 2. Configure Supabase Auth Providers

In your Supabase dashboard:

#### Google OAuth
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials (from Google Cloud Console)
4. Add redirect URL: `https://getmixwise.com/auth/callback`

#### Email (Magic Link)
1. Go to **Authentication** → **Providers** → **Email**
2. Enable Email provider
3. Configure "Confirm email" to your preference
4. Customize email templates in **Authentication** → **Email Templates**

### 3. Set Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configure Redirect URLs

In Supabase dashboard → **Authentication** → **URL Configuration**:

Add these to **Redirect URLs**:
- `http://localhost:3000/auth/callback` (development)
- `https://getmixwise.com/auth/callback` (production)

## Usage

### Using the Auth Context

```tsx
import { useUser } from "@/components/auth/UserProvider";

function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, signOut } = useUser();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <SignInPrompt />;
  
  return <div>Hello, {profile?.display_name}!</div>;
}
```

### Opening the Auth Dialog

```tsx
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

function SaveButton() {
  const { openAuthDialog } = useAuthDialog();
  const { isAuthenticated } = useUser();
  
  const handleSave = () => {
    if (!isAuthenticated) {
      openAuthDialog({
        title: "Save your progress",
        subtitle: "Create a free account to save.",
      });
      return;
    }
    // ... save logic
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### Using Bar Ingredients

```tsx
import { useBarIngredients } from "@/hooks/useBarIngredients";

function BarManager() {
  const { ingredientIds, addIngredient, removeIngredient, clearAll } = useBarIngredients();
  
  // Automatically syncs with server for authenticated users
  // Falls back to localStorage for anonymous users
}
```

### Using Favorites

```tsx
import { useFavorites } from "@/hooks/useFavorites";

function CocktailCard({ cocktail }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  return (
    <button onClick={() => toggleFavorite(cocktail)}>
      {isFavorite(cocktail.id) ? "❤️" : "🤍"}
    </button>
  );
}
```

## Email Platform Integration

To integrate with an email platform for user onboarding:

1. Open `/lib/analytics.ts`
2. Find the `trackUserSignup` function
3. Add your email platform API call

Example with ConvertKit:
```ts
export async function trackUserSignup(userId: string, email?: string | null) {
  if (email) {
    await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email: email,
      }),
    });
  }
}
```

## Future Enhancements

### Usage Limits
The foundation for usage limits is in `/lib/features/limits.ts`. To enforce limits:
1. Update the `canAddIngredient` and `canFavoriteCocktail` functions
2. Increment usage with the `increment_feature_usage` RPC function
3. Show upgrade prompts when users approach limits

### Paid Tier
To implement a paid tier:
1. Integrate Stripe for payments
2. Update the `role` field in profiles to 'paid'
3. Adjust limits in `/lib/features/limits.ts`

## Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Server-side operations use the anon key (respects RLS)
- Service role key (if needed) should never be exposed client-side

## QA Checklist

Use this checklist to verify auth is working correctly after any changes:

### Logged-Out State
- [ ] Header shows "Sign in" button
- [ ] Can browse cocktails without signing in
- [ ] Can use Mix tool without signing in (bar stored in localStorage)
- [ ] Visiting `/account` redirects to home with `?redirect=/account`
- [ ] CocktailsReadyBadge does NOT show (requires auth + bar)
- [ ] ShoppingListBadge shows count from localStorage

### Sign-In Flow (Google)
1. [ ] Click "Sign in" button - auth dialog opens
2. [ ] Click "Continue with Google" - redirects to Google
3. [ ] Complete Google login - redirects back to `/auth/callback`
4. [ ] Callback exchanges code for session
5. [ ] Redirects to homepage (or original page if `redirect` param)
6. [ ] Header updates to show user avatar/name dropdown
7. [ ] Profile is fetched and accessible via `useUser()`

### Sign-In Flow (Email)
1. [ ] Click "Sign in" button - auth dialog opens
2. [ ] Enter email, click "Continue with email"
3. [ ] Toast shows "Check your email for the magic link"
4. [ ] Email is received with magic link
5. [ ] Clicking link opens `/auth/callback`
6. [ ] Callback exchanges code for session
7. [ ] Header updates to show logged-in state

### Logged-In State
- [ ] Header shows user avatar/name dropdown menu
- [ ] Dropdown has "My Account" and "Sign out" links
- [ ] Can access `/account` page
- [ ] Bar ingredients sync to Supabase
- [ ] Favorites sync to Supabase
- [ ] Recently viewed syncs to Supabase
- [ ] CocktailsReadyBadge shows count (if user has bar)
- [ ] Personalized homepage sections appear (if user has data)

### Sign-Out Flow
1. [ ] Click user menu, then "Sign out"
2. [ ] Session is cleared from cookies
3. [ ] Header updates to show "Sign in" button
4. [ ] Visiting `/account` redirects to home
5. [ ] Bar reverts to localStorage-only storage

### Session Persistence
- [ ] Hard refresh (Cmd+Shift+R) maintains logged-in state
- [ ] Navigating between pages maintains logged-in state
- [ ] Opening new tab shows logged-in state
- [ ] Session auto-refreshes (no expiry during active use)

### Protected Route Behavior
- [ ] Unauthenticated users are redirected from `/account`
- [ ] Redirect includes `?redirect=/account` parameter
- [ ] Auth dialog can open with custom title/subtitle via `openAuthDialog()`
- [ ] After sign-in, user is redirected to original destination

## Troubleshooting

### Auth Callback Not Working
- Check redirect URLs in Supabase dashboard
- Ensure `/auth/callback/route.ts` is properly deployed
- Check browser console for errors
- Verify the callback is using `exchangeCodeForSession()` correctly

### Profile Not Loading
- Verify the `handle_new_user` trigger is created
- Check RLS policies on the profiles table
- Look for errors in Supabase logs
- Ensure `UserProvider` fetches profile after session is set

### OAuth Errors
- Verify Google OAuth credentials
- Check callback URL configuration
- Ensure HTTPS in production

### Session Not Persisting on Refresh
- Check that middleware runs on all routes (see `middleware.ts` config)
- Verify `SessionContextProvider` receives `initialSession` from server
- Ensure cookies are being set correctly in `/auth/callback`
- Check that `createMiddlewareClient` is refreshing the session

### UI Not Updating After Login
- Check that `onAuthStateChange` listener is firing
- Verify `UserProvider` is updating state after session change
- Ensure components are using `useUser()` hook, not direct Supabase calls
- Check for React hydration mismatches between server and client

## Recent Auth Improvements (2024)

### Session Hydration Fix
- **Issue**: Session was not available on initial page load for server-rendered pages
- **Solution**: Updated `app/layout.tsx` to fetch session server-side using `createServerComponentClient` and pass it as `initialSession` to `SupabaseProvider`

### UserProvider Refactor
- **Issue**: UserProvider was fetching its own session, causing potential race conditions
- **Solution**: UserProvider now uses `useSessionContext()` from `@supabase/auth-helpers-react` to get the session from the parent `SessionContextProvider`, ensuring consistency

### Middleware Session Refresh
- **Issue**: Sessions could become stale during navigation
- **Solution**: Middleware now calls `supabase.auth.getSession()` on every request to refresh the session and update cookies

### Auth Callback Improvements
- **Issue**: Callback wasn't handling all scenarios properly
- **Solution**: Updated `/auth/callback/route.ts` to:
  - Use `exchangeCodeForSession()` for the auth code
  - Support both `next` query param and `returnTo` for redirect destinations
  - Include proper error logging

