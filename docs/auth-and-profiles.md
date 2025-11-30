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
4. Add redirect URL: `https://your-domain.com/auth/callback`

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
- `https://your-production-domain.com/auth/callback` (production)

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

## Troubleshooting

### Auth Callback Not Working
- Check redirect URLs in Supabase dashboard
- Ensure `/auth/callback/route.ts` is properly deployed
- Check browser console for errors

### Profile Not Loading
- Verify the `handle_new_user` trigger is created
- Check RLS policies on the profiles table
- Look for errors in Supabase logs

### OAuth Errors
- Verify Google OAuth credentials
- Check callback URL configuration
- Ensure HTTPS in production

