<!-- Internal map: current cocktail data dependencies prior to Supabase migration -->

## Sanity touchpoints (cocktail queries)
- Sanity now only powers ingredient/content data; cocktails are fetched from Supabase.
- Remaining Sanity usage for cocktails exists only in legacy scripts (`scripts/exportSanityCocktails.ts`, `scripts/migrate-to-sanity.ts`) and schema history.

## Existing Supabase usage tied to cocktails
- Cocktails now live in `public.cocktails`; server helpers (`lib/cocktails.ts`) expose `getAllCocktails`, `getCocktailBySlug`, `getCocktailSlugs`.
- Client-side access (mix tool, ready badges, dashboard) uses the typed Supabase client via `@/lib/supabase/client`.
- Seed + verification scripts: `scripts/seedCocktailsFromExcel.ts`, `scripts/verifyCocktails.ts`.
- Hooks/components (`useFavorites`, `useRecentlyViewed`, `useDashboard` recommendations) now read/write Supabase cocktail data.

## Key consumers of cocktail data
- Pages/components now pull cocktail data from Supabase only: `/`, `/cocktails`, `/cocktails/[slug]`, `/mix`, `/dashboard`, `/bar/[userId]`, `/ingredients/*`, `/sitemap`, `components/home/*`, `components/cocktails/*`, `components/layout/CocktailsReadyBadge`.
- Legacy scripts (`scripts/exportSanityCocktails.ts`, `scripts/importEnrichedCocktails.ts`, `scripts/migrate-to-sanity.ts`) remain for historical reference but no longer drive production data.

<!-- End of current-state map -->
