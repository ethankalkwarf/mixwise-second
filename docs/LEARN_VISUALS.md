# Learn visuals — where to get better photos

MixWise Learn copy is ahead of its photography. Prefer **real DSLR / phone photos** over AI for drinks (foam, ice, glass, and garnish are where generators fail).

## Recommended sources (in order)

| Source | Best for | Notes |
|--------|----------|--------|
| **Envato Elements** (already in workflow) | Lifestyle kitchen covers, tool stills, garnish/express | See `LEARN_ENVATO_COVERS.md`. Re-auth the Envato MCP when searching from Cursor. |
| **Wikimedia Commons** | Readable bottle labels, classic cocktail heroes | Filter by CC BY / BY-SA / CC0. Credit in `public/learn/ATTRIBUTION.md`. Great for education; trademarks still apply. |
| **Your own shoot** (best long-term) | Signature MixWise drink stills | Follow `docs/COCKTAIL_IMAGE_PROMPT.md` as a **shot list**, not an AI prompt: imperfect ice, soft kitchen light, product-first. One afternoon covers many Learn slides. |
| **Unsplash / Pexels** | Ambient kitchen texture only | Rarely good enough for hero cocktails; licenses are easy but quality is uneven. |

## Avoid as final art

- **AI generators** (including Cursor GenerateImage) for egg-white foam, crushed ice, or “perfect” coupe heroes — fine for placeholders, not for featured slides.
- Blank-label bottle mockups when the lesson is about **reading** labels.

## Priority replacements (next upgrades)

| Asset | Status | Prefer next |
|-------|--------|-------------|
| `spirit-primer-gin.webp` | Commons G&T (done) | Optional: packed-ice daylight G&T without bottle clutter |
| `spirit-primer-rum.webp` | Commons Daiquiri (done) | Optional: coupe Daiquiri, cloudy pale |
| `batching-and-hosting.webp` | Commons multi-drink + pitcher (done) | Measured Negroni pitcher + two rocks glasses, home kitchen |
| `citrus-and-syrups.webp` | Commons whole lemon/lime (done) | Cut citrus + syrup jar flat lay (Envato) |
| `glassware-and-service.webp` | Commons chilled glass rows (done) | Coupe / rocks / highball trio, empty, no brand bottles |
| `zero-proof-hosting.webp` | Commons mint highball (done) | Calmer NA highball / soft kitchen light |

Already credited in `ATTRIBUTION.md`: labels, Whiskey Sour, Manhattan, Negroni, gin, rum, batching, citrus, glassware, zero-proof.

## Workflow

1. Search Envato or Commons → download highest-res photo.
2. Crop to **1536×1024** webp (`cwebp -q 85`).
3. Drop into `public/learn/{slug}.webp`.
4. If Commons/CC: add a row to `ATTRIBUTION.md`.
5. Point `coverImage` / figure `src` at the file.

No new app required for the pipeline — **Envato + Commons + a short home shoot** beats another AI subscription for this catalog.
