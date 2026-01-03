# MixWise

**A smarter way to make cocktails at home.**

MixWise is a cocktail platform designed to help people make better drinks at home with curated recipes, clear instructions, and tools that make cocktail discovery easy.

🌐 **Live Site**: [https://getmixwise.com](https://getmixwise.com)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: Sanity
- **Auth & Database**: Supabase
- **Deployment**: Vercel

## Features

- 🍸 **Cocktail Directory**: Browse 400+ cocktail recipes with detailed ingredients and instructions
- 🧪 **Mix Tool**: Find cocktails you can make with ingredients you have at home
- ❤️ **Favorites**: Save cocktails to your personal collection
- ⭐ **Ratings**: Rate cocktails and see community ratings
- 🛒 **Shopping List**: Track missing ingredients for your next store run
- 👤 **User Accounts**: Google OAuth and email magic link authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- Sanity project

### Environment Variables

Create a `.env.local` file with:

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://getmixwise.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Supabase Setup

1. Run the migrations in `/supabase/migrations/` in order
2. Configure Auth providers:
   - **Google OAuth**: Add redirect URL `https://getmixwise.com/auth/callback`
   - **Email**: Enable magic link authentication
3. Set Site URL to `https://getmixwise.com`

### Sanity Studio

Access the CMS at `/studio` to manage cocktails, ingredients, and content.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── cocktails/         # Cocktail directory and detail pages
│   ├── mix/               # Mix tool page
│   ├── account/           # User account page
│   └── auth/callback/     # Auth callback handler
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── cocktails/        # Cocktail-related components
│   ├── layout/           # Header, footer, containers
│   └── mix/              # Mix tool components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client helpers
│   └── seo.ts            # SEO utilities
├── sanity/               # Sanity schema definitions
└── supabase/migrations/  # Database migrations
```

## Scripts

### Backfill Scripts

#### Cocktail Image URLs

Updates `cocktails.image_url` with public URLs from Supabase Storage bucket `cocktail-images-fullsize`.

**Required Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Never commit this key!)

**Usage:**
```bash
# Dry run (recommended first)
npm run backfill:images:dry

# Apply updates
npm run backfill:images:apply

# Apply with overwrite (updates existing URLs too)
npm run backfill:images:apply -- --overwrite

# Test with limited rows
npm run backfill:images:dry -- --limit 10
```

**Behavior:**
- Matches cocktails by `slug` to storage files
- Prefers WebP > JPG/JPEG > PNG extensions
- Only updates rows where `image_url` is null/empty (unless `--overwrite` is used)
- Prints detailed summary of planned changes

## Documentation

- [Debugging Guide](./docs/debugging-guide.md) - **Start here for debugging** - Common patterns, pitfalls, and quick fixes
- [Authentication & Profiles](./docs/auth-and-profiles.md) - Auth setup and user management
- [Post-Login Fixes](./POST_LOGIN_FIXES.md) - Session handling documentation
- [QA Auth Fixes](./QA_AUTH_FIXES.md) - Auth testing checklist

## Deployment

The site is configured for Vercel deployment with automatic redirects from legacy domains:
- `mw.phase5digital.com` → `getmixwise.com`
- `mw2.phase5digital.com` → `getmixwise.com`

## License

Private - All rights reserved.
