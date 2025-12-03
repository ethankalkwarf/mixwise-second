# MixWise

**A smarter way to make cocktails at home.**

MixWise is a cocktail platform designed to help people make better drinks at home with curated recipes, clear instructions, and tools that make cocktail discovery easy.

🌐 **Live Site**: [https://getmixwise.com](https://getmixwise.com)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: Sanity (site/ingredient content only)
- **Cocktail Data + Auth & Database**: Supabase
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

### Cocktail Data Workflow

1. Place the Excel source file at `data/Cocktail DB_Full.xlsx`.
2. Seed Supabase with fresh cocktail data:
   ```bash
   npm run seed:cocktails
   ```
3. (Optional) Verify a specific slug:
   ```bash
   npm run verify:cocktails old-fashioned
   ```
4. Use `npm run clear:sanity-cocktails` if you need to remove legacy cocktail docs from Sanity.

> Sanity Studio (`/studio`) now manages **ingredients, articles, pages, and collections only**. The cocktail library itself lives entirely in Supabase.

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

## Documentation

- [Authentication & Profiles](./docs/auth-and-profiles.md) - Auth setup and user management
- [Post-Login Fixes](./POST_LOGIN_FIXES.md) - Session handling documentation
- [QA Auth Fixes](./QA_AUTH_FIXES.md) - Auth testing checklist

## Deployment

The site is configured for Vercel deployment with automatic redirects from legacy domains:
- `mw.phase5digital.com` → `getmixwise.com`
- `mw2.phase5digital.com` → `getmixwise.com`

## License

Private - All rights reserved.
