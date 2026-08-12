# MixWise Architecture & QA Audit Notes

## Overview

This document summarizes the comprehensive QA audit and structural refactor performed on the MixWise codebase. The project is a modern cocktail web app built with Next.js 14, TypeScript, Supabase, and Sanity CMS.

## Project Structure

### Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (auth + database), Sanity CMS (content)
- **Deployment**: Vercel
- **Production Domain**: https://getmixwise.com

### Key Directories & Files
- `app/` - Next.js App Router pages and layouts
- `components/` - React components organized by feature
- `lib/` - Shared utilities, types, and service clients
- `hooks/` - Custom React hooks for data fetching
- `sanity/` - CMS schemas and configuration
- `supabase/` - Database migrations

## Database & Schema Audit

### Supabase Tables
All core tables are properly implemented with RLS policies:

- `profiles` - User profile data
- `bar_ingredients` - User's saved bar inventory
- `favorites` - User's favorited cocktails
- `recently_viewed_cocktails` - View history
- `ratings` - Cocktail ratings (1-5 stars)
- `shopping_list` - User's shopping list
- `user_preferences` - Onboarding data (spirits, flavors, skill level)
- `user_badges` - Achievement system
- `feature_usage` - Usage tracking
- `email_signups` - Newsletter signups

### Database Types
- Updated `lib/supabase/database.types.ts` to include missing `user_preferences` and `user_badges` tables
- All tables have proper TypeScript types with Insert/Update variants
- Foreign key constraints and RLS policies are correctly implemented

### Sanity CMS
- Ingredient and cocktail schemas are well-structured
- Consistent field naming and types
- Proper use of `drinkCategories` (not legacy `categories` field)
- All content properly separated from app data

## Onboarding Wizard

### Implementation Status: ✅ WORKING
- Data persistence: ✅ Reliable storage in `user_preferences` table
- Flow: ✅ 3-step wizard (spirits → flavors → skill level)
- Error handling: ✅ Graceful fallbacks and user feedback
- Auth integration: ✅ Redirects new users to onboarding
- Badge system: ✅ Awards "Home Bartender" badge on completion

### Key Fixes Applied
- Removed duplicate `UserPreferences` interface from hook (now uses shared types)
- Console logging provides good debugging visibility
- Proper upsert logic prevents data loss

## Cocktail & Ingredient Models

### Type Consistency: ✅ VERIFIED
- All TypeScript interfaces align between Supabase, Sanity, and frontend
- Field naming is consistent (`primarySpirit`, `drinkCategories`, etc.)
- Units and measures are properly handled
- Difficulty levels properly typed as enum

### Schema Alignment
- Sanity cocktail schema matches TypeScript types
- Mix types properly bridge Sanity and Supabase data
- No conflicting field definitions

## Code Quality Improvements

### Removed Dead Code
- `ConditionalLayout.tsx` - Unused conditional layout system
- `BrutalHeader.tsx` & `BrutalFooter.tsx` - Alternative design not in use
- Duplicate type definitions consolidated

### Type Safety
- Eliminated duplicate interfaces
- Proper imports from shared type definitions
- All API responses are typed

### Error Handling
- Console statements provide debugging visibility (appropriate for production monitoring)
- Graceful fallbacks in onboarding flow
- Proper try/catch blocks in async operations

## Performance & UX Optimizations

### Build Performance
- ✅ Linting passes: `npm run lint` ✓
- ✅ TypeScript compilation: `npm run build` ✓
- ✅ Static generation working for content pages
- ✅ Dynamic rendering for user-specific pages

### Static Generation Fixes
- Fixed dynamic server usage warnings by removing server-side session fetching from root layout
- Properly marked user-specific pages as dynamic (`/cocktails/[slug]`, `/bar/[userId]`)
- Maintained static generation for content-heavy pages

### User Experience
- Onboarding flow is reliable and state-preserving
- Auth callbacks properly redirect users through onboarding
- Dashboard shows personalized recommendations based on user preferences
- All core user flows (cocktail browsing, favorites, shopping list) work correctly

## Security & Configuration

### Environment Variables
- Production URLs correctly configured
- Supabase and Sanity clients properly configured
- No hardcoded secrets in codebase

### Auth & Sessions
- Supabase RLS policies protect all user data
- Session handling works across server and client components
- Auth callbacks handle new user onboarding flow

## Auth and Personalization

### Single Source of Truth

The `UserProvider` component (`components/auth/UserProvider.tsx`) is the **single source of truth** for all authentication state in the app.

**Location:** `components/auth/UserProvider.tsx`
**Hook:** `useUser()` or `useCurrentUser()` (exported from `hooks/useUser.ts`)

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         app/layout.tsx                          │
│                               │                                 │
│                    ┌──────────▼──────────┐                      │
│                    │  SupabaseProvider   │                      │
│                    │   (providers.tsx)   │                      │
│                    └──────────┬──────────┘                      │
│                               │                                 │
│              ┌────────────────▼────────────────┐                │
│              │  SessionContextProvider         │                │
│              │  (provides shared Supabase      │                │
│              │   client to all children)       │                │
│              └────────────────┬────────────────┘                │
│                               │                                 │
│                    ┌──────────▼──────────┐                      │
│                    │    UserProvider     │  ◄── SINGLE SOURCE   │
│                    │ (manages auth state)│      OF TRUTH        │
│                    └──────────┬──────────┘                      │
│                               │                                 │
│           ┌───────────────────┼───────────────────┐             │
│           ▼                   ▼                   ▼             │
│     ┌─────────┐        ┌─────────────┐    ┌─────────────┐       │
│     │ Header  │        │  Features   │    │   Pages     │       │
│     │ (auth UI│        │ (useRatings │    │ (useUser)   │       │
│     │  menu)  │        │  useFavorites    │             │       │
│     └─────────┘        │  etc.)      │    └─────────────┘       │
│                        └─────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Initialization**: On mount, `UserProvider` calls `supabase.auth.getSession()` to check for an existing session
2. **Real-time updates**: Subscribes to `onAuthStateChange` to handle login/logout events immediately
3. **Profile loading**: When a user is authenticated, their profile is fetched from the `profiles` table
4. **State exposure**: Provides `user`, `profile`, `isLoading`, `isAuthenticated`, and `error` to all children

### Usage in Components

```typescript
import { useUser } from "@/hooks/useUser";
// or
import { useCurrentUser } from "@/hooks/useUser";

function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, error } = useUser();
  
  // Always check loading state first
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Then check authentication
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  // Render authenticated content
  return <UserContent user={user} profile={profile} />;
}
```

### Context Values Provided

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Supabase auth user object |
| `profile` | `Profile \| null` | User's profile from `profiles` table |
| `session` | `Session \| null` | Current auth session |
| `isLoading` | `boolean` | True while auth state is being determined |
| `isAuthenticated` | `boolean` | True if user is logged in |
| `error` | `Error \| null` | Any auth error that occurred |
| `signInWithGoogle` | `() => Promise<void>` | Start Google OAuth flow |
| `signInWithEmail` | `(email: string) => Promise<{error?: string}>` | Send magic link email |
| `signOut` | `() => Promise<void>` | Sign out current user |
| `refreshProfile` | `() => Promise<void>` | Reload profile from database |

### Feature Hooks

All feature hooks use `useUser()` internally and share the same Supabase client:

| Hook | Table | Description |
|------|-------|-------------|
| `useRatings(cocktailId)` | `ratings` | Manages cocktail ratings |
| `useFavorites()` | `favorites` | Manages saved cocktails |
| `useShoppingList()` | `shopping_list` | Manages shopping list items |
| `useBarIngredients()` | `bar_ingredients` | Manages bar inventory |
| `useUserPreferences()` | `user_preferences` | Manages onboarding data |

### RLS Policies

All user data tables have Row Level Security enabled:

- **profiles**: Users can only read/write their own profile
- **ratings**: Anyone can read (for averages), users can only write their own
- **favorites**: Users can only access their own favorites
- **shopping_list**: Users can only access their own list
- **bar_ingredients**: Users can only access their own inventory
- **user_preferences**: Users can only access their own preferences
- **user_badges**: Users can read all badges (for public profiles), write only their own

### Auth Flow

1. **Login**: User clicks "Log In" → `AuthDialog` opens → User authenticates via Google/Email
2. **Callback**: Supabase redirects to `/auth/callback` → Code exchanged for session → Cookies set
3. **Detection**: `onAuthStateChange` fires `SIGNED_IN` event → `UserProvider` updates state
4. **Profile**: Profile is fetched from `profiles` table (auto-created on first login via trigger)
5. **Onboarding**: If `user_preferences.onboarding_completed` is false, redirect to `/onboarding`

### Debugging

The `UserProvider` logs auth state changes to the console:
- `[UserProvider] Auth state change: SIGNED_IN user@example.com`
- `[UserProvider] Auth state change: SIGNED_OUT no user`

Check browser console for these logs when debugging auth issues.

### Legacy Cleanup
- Old Vercel preview domains properly redirected in `vercel.json`
- Documentation updated with correct production URLs
- No obsolete configuration files

## Architecture Decisions

### Data Layer Separation
- **Supabase**: User data, preferences, interactions (favorites, ratings, inventory)
- **Sanity**: Editorial content, cocktail recipes, ingredient details
- Clear separation prevents confusion and enables proper caching strategies

### Component Architecture
- Feature-based organization in `components/`
- Shared hooks in `hooks/` for data fetching logic
- Consistent use of client vs server components

### Build Strategy
- Static generation for content pages (cocktails, ingredients)
- Dynamic rendering for user-specific pages
- ISR (Incremental Static Regeneration) for content updates

## Remaining TODOs

### Future Enhancements (Not Critical)
- Analytics integration (ConvertKit, email platform)
- Feature usage quotas implementation
- Advanced personalization algorithms

### Monitoring & Maintenance
- Console logging in auth/onboarding flows should be monitored in production
- Database performance monitoring for complex queries
- User feedback collection for UX improvements

## Testing Status

### Automated Tests
- No existing test suite found
- Recommended: Add integration tests for onboarding flow
- Recommended: Add E2E tests for critical user journeys

### Manual QA Completed
- ✅ User registration and onboarding
- ✅ Cocktail browsing and search
- ✅ Favorites and ratings functionality
- ✅ Shopping list management
- ✅ Bar inventory management
- ✅ Mix tool with ingredient matching
- ✅ Authentication flows
- ✅ Responsive design across devices

## Deployment Readiness

### Production Checklist
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Sanity content populated
- ✅ Domain redirects configured
- ✅ Build passes without warnings
- ✅ Static generation working
- ✅ Auth flows tested

The MixWise codebase is now production-ready with a clean architecture, reliable user flows, and proper separation of concerns between content and application data.

