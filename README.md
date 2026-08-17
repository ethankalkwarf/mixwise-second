# MixWise

**A smarter way to make cocktails at home.**

MixWise is a cocktail platform for better drinks at home: curated recipes, a mix-from-your-bar tool, and accounts for favorites, tasting notes, skips, shopping lists, and a shareable bar.

**Live site:** [https://www.getmixwise.com](https://www.getmixwise.com)

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database & auth:** Supabase (cocktails, ingredients, users)
- **Email:** Resend
- **Deployment:** Vercel
- **Studio:** Sanity Studio at `/studio` is unused for public content

## Features

- Cocktail directory with ingredients and instructions
- Mix tool: find drinks you can make with what you have
- Favorites, ratings, and shopping list
- User accounts (email/password and OAuth)

## Getting started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### Environment variables

Copy `.env.example` to `.env.local` and fill in values. Public site content comes from Supabase. `CRON_SECRET`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are required for email and admin routes in production.

### Development

```bash
npm install
npm run dev
npm run build
npm start
```

### Supabase

1. Run the migrations in `/supabase/migrations/` in order
2. Configure Auth providers with redirect URL `https://www.getmixwise.com/auth/callback`
3. Set Site URL to `https://www.getmixwise.com`

## Project structure

```
├── app/                    # Next.js App Router pages
├── components/
├── hooks/
├── lib/
├── docs/                   # Project documentation
├── sanity/                 # Unused Studio schemas (not the live catalog)
└── supabase/migrations/
```

## Documentation

- [Debugging Guide](./docs/debugging-guide.md)
- [Authentication & Profiles](./docs/auth-and-profiles.md)

## Deployment

Vercel, with redirects from legacy hosts to `www.getmixwise.com`.

## License

Private — all rights reserved.
