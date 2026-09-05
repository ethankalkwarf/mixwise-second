# Learn guide covers — Envato shopping list

Keep **Home bar fundamentals** on `/media/kitchen-shelf.webp`.

For source priority (Envato vs Commons vs shoot vs AI), see **`docs/LEARN_VISUALS.md`**.

Download **Photos** (not illustrations). Prefer daylight / soft kitchen or home-bar light — same vibe as MixWise cocktail shots.

Save into `public/learn/{slug}.webp`, then point `coverImage` in `lib/learnLibrary.ts` / `lib/learnGuides.ts`.

| Guide | Envato search | What “good” looks like | Avoid |
|-------|---------------|------------------------|--------|
| **When to shake vs stir** | `cocktail shaker tin close up home bar natural light` | Hands on a Boston tin, or shaker + mixing glass side by side | Neon club, flaming drinks, smile-to-camera bartender |
| **Balance** | `tasting cocktail citrus syrup bitters ingredients flat lay` | Small samples / citrus / syrup / spirit — a tasting story | Four random colorful cocktails with no point |
| **Garnish with intent** | `expressing citrus peel over cocktail twist garnish close up` | Peel expressed over a coupe/rocks; oils catching light | Strain pours, fruit piles, over-styled tiki props |
| **Agave path** | Commons field + lesson covers (done) — see `ATTRIBUTION.md` | Path stays on the Jalisco field; lessons use bottles, piñas, Paloma, mezcal lineup, Margarita | Generic “summer party” spreads that aren’t agave |
| **Zero-proof** | `non alcoholic cocktail mocktail elegant glassware garnish` | Composed NA drink in real glassware | Kid punch, juice boxes, neon mocktail stock |

### Optional pack (icons)

If you want cocktail-specific glyphs beyond Heroicons UI chrome:

- Envato search: `cocktail outline icons line` or `bar tools icon set outline`
- Prefer a **single outline set** (24px, monochrome) — not watercolor clipart

We already use **@heroicons/react** sitewide for UI (tabs, checks, tips). Don’t add a second icon library unless the Envato set is clearly better for bar tools.
