# MixWise Cocktail Image Prompt

Canonical reusable prompt for generating MixWise recipe photos.
Every catalog image should be produced from this template, filled from the cocktail’s database/CSV row.

## Master template

```text
Create a single hyper-realistic photorealistic image of a **[COCKTAIL NAME]** cocktail for a recipe website.

**Global visual style:**

* [LIGHTING STYLE appropriate to the drink, ingredients, or era]
* Blurred [BACKGROUND/SETTING appropriate to the cocktail] with [BOKEH STYLE]
* 2048×1365 pixel landscape aspect ratio (3:2) — prefer the highest resolution available; avoid 1200×630
* [KEY VISUAL CHARACTERISTIC: liquid color, carbonation, foam, layers, crushed ice, creaminess, etc.]
* Avoid an overly perfect shot: [2–4 subtle realistic imperfections appropriate to the drink]
* No humans, no hands, no logos, no text

**Composition and glassware:**

* Use a [GLASSWARE]
* Center the glass perfectly in the frame
* Capture [CAMERA ANGLE appropriate to the drink]
* Place on a [SURFACE appropriate to the setting]

**Drink-specific appearance:**

* Featured cocktail: [COCKTAIL NAME]
* [PRECISE DESCRIPTION OF LIQUID COLOR, CLARITY, TEXTURE, LAYERS, FOAM, ETC.]
* [ICE TYPE / NO ICE]
* [HEAVY / LIGHT / NO] condensation on the glass
* [GARNISH INSTRUCTION or "No garnish (ungarnished)"]
```

## CSV / database field mapping

The image must represent the **finished cocktail**, not merely interpret the cocktail’s name.

| Field | How to use it |
| --- | --- |
| `name` | Exact featured cocktail name |
| `glassware` | Determines the actual vessel |
| `garnish` | Use exactly unless clarification of placement is needed visually |
| `ingredients` | Determines realistic liquid color, opacity, layers, foam, etc. |
| `instructions` | Determines ice, layering, floats, carbonation, froth, and final presentation |
| `category_primary` | Helps establish overall visual treatment |
| `categories_all` | Helps determine era, environment, and mood |
| `tags` | Helps with color, setting, season, and stylistic cues |
| `long_description` | Useful for identifying the drink’s defining visual characteristic |
| `image_alt` | Good starting point for drink-specific appearance |
| `technique` | Helps predict texture: shaken = aeration, stirred = clarity, blended = frozen texture, etc. |

## Consistency rules (every MixWise image)

1. **Aspect:** 3:2 landscape at **2048×1365** (or the model's max; never below 1536×1024). Heroes crop to 4:5 — higher source res keeps ice/glass edges sharp on retina.
2. **Subject:** one primary drink only
3. **Framing:** glass dominant, but **not always dead-center** — vary composition:
   - classic centered hero
   - slight off-center / rule-of-thirds
   - closer crop that fills more of the frame
   - tighter detail on ice, garnish, foam, or rim when that is the drink’s visual story
4. **Depth:** shallow depth of field
5. **Background:** contextual but blurred; never competing with the drink. Use **light lifestyle context**, not a full staged vignette:
   - home kitchens / sunny counters
   - dining tables and casual indoor tables
   - decks, patios, and outdoor daylight
   - bright recipe-studio surfaces
   - occasional classic bar scenes (use sparingly)
   - Keep background soft and simple: a hint of table, window, greenery, or room — **not** salad plates, fruit bowls, napkins, chairs, and props all competing
6. **Forbidden:** bottles, branding, logos, text, humans, hands
7. **Camera authenticity:** must look like a **DSLR recipe photo**, not CGI and not stock lifestyle advertising
8. **Realism:** deliberately introduce small physical imperfections so the image does not look sterile
9. **Mood:** welcoming and everyday; avoid making every drink look like nightlife exclusivity

## Anti-AI material rules (critical)

These are the details that most often look fake — get them right:

| Element | Do | Avoid |
| --- | --- | --- |
| **Ice (cubes)** | Slightly cloudy or uneven edges; natural melt; irregular chips or fractures | Perfect crystal cubes, glowing ice, geometrically flawless blocks |
| **Ice (crushed)** | Jagged broken shards and chips of mixed sizes; wet melt water in gaps; frosty/cloudy facets; uneven mound that looks hand-packed | Smooth glass-bead pebble ice; uniform spheres; dry plastic mound; fused gel-like ice cap; perfectly sculpted dome |
| **Liquid / texture** | Realistic viscosity, natural meniscus, believable opacity | Plastic-smooth surfaces, neon saturation, self-illuminated liquid |
| **Garnish** | Slight asymmetry; natural citrus pith/pores; mint that isn’t perfectly fluffed | Pristine glowing fruit, plastic mint, overly styled garnish sculpture |
| **Reflections / glass** | Soft, uneven highlights; minor smudge or fingerprint; real refraction | Mirror-perfect CGI reflections, symmetric sparkle flares, chrome-like glass |
| **Condensation** | Light, irregular, patchy where cold glass meets air | Uniform droplet grids or heavy fake dripping |
| **Color** | Muted real-camera white balance | Oversaturated “Instagram food” color |
| **Lifestyle context** | Soft hint of place behind the drink | Busy staged tablescapes with multiple prop clusters |
| **Garnish choice (batch preference)** | Prefer mint, cherry, orange, pineapple, grapefruit, celery, lime, or ungarnished when the drink still reads clearly | Avoid lemon wheels and strawberry garnishes unless the drink truly requires them visually |

### Preferred closing line for every prompt

Add this verbatim near the end:

> Shot like a DSLR recipe photo (50mm, natural light). Believable ice, garnish, glass reflections, and textures. Light lifestyle context only — background softly blurred and secondary. Not CGI, not stock lifestyle advertising, not hyper-perfect food media.


## Camera angle guidance

| Drink type | Angle |
| --- | --- |
| Highballs and shots | Straight-on, or closer crop on the upper glass |
| Rocks drinks where ice or a float matters | Slight top-front, sometimes tighter on the ice surface |
| Rim or garnish needs to read clearly | Slightly elevated or close-up on the rim/garnish |
| Elegant stemmed cocktails (silhouette matters) | Straight-on, slightly low, or three-quarter close-up |

Do **not** force the same centered full-glass hero for every drink. Keep variety across the catalog while staying product-first and photoreal.

## Category / technique visual cues

| Cue | Visual treatment |
| --- | --- |
| Sparkling / carbonated | Visible fine carbonation / tiny rising bubbles |
| Sour with egg white | Dense foam cap, soft meringue texture |
| Sour with pineapple / shaken hard | Subtle natural aeration |
| Stirred spirit-forward | Exceptional clarity, crisp reflections |
| Creamy dessert | Realistic viscosity, soft opacity |
| Layered / floated | Explicit direction and color of each layer |
| Crushed ice (swizzle, cobbler, crush, julep-style) | **Hard requirement:** broken/jagged shards and chips, mixed sizes, wet melt between pieces, cloudy facets — never smooth bead/pebble spheres or a dry plastic dome. Prefer “hand-packed crushed ice” wording over “pebble ice” unless the recipe truly uses commercial pebble ice. |
| Pebble ice (only when recipe calls for it) | Small irregular nuggets with slight cloudiness and melt — still avoid perfect spheres |
| Built highball | Tall silhouette, ice stack, possible light condensation |

### Crushed-ice prompt snippet (paste when ice is crushed)

```text
Ice MUST look like real bar crushed ice: sharp jagged shards and irregular chips of mixed sizes (not round beads, not uniform pebble spheres, not a sculpted dome). Wet melt water glistens between pieces. Some cloudy/frosty facets. Hand-packed uneven mound slightly above the rim. Avoid plastic, CGI, or gel-like ice.
```

**Model note:** Current image models often default crushed ice to glossy pebble beads. If that happens, switch wording to **fine white fluffy shaved ice / snow-cone pack** (julep-style snow) with wet melt and liquid stain — usually more believable than “crushed” or “pebble.” Avoid referencing prior AI images that already show bead ice.

## Critical accuracy rule

Do **not** blindly infer appearance from the drink name.

Derive the final visual from:

`ingredients` + `instructions` + `glassware` + `garnish`

(+ technique / category / tags for mood and texture)

This keeps generated images accurate even for obscure cocktails.

## Filename / storage convention

Upload the **master** to the private Supabase Storage bucket `cocktail-images-fullsize` as:

- Preferred: `{Cocktail Name}.png` or `{Cocktail Name}.webp`
- Also accepted: `{Cocktail Name} Cocktail.png`

Public delivery is a ~1200w WebP on Vercel Blob (`catalog/cocktails/{slug}.webp`). Wire `cocktails.image_url` to that Blob URL, not a Storage public URL:

```bash
npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply
# or migrate everything already on Storage:
npx tsx scripts/migrateCatalogImagesToBlob.ts --apply
npx tsx scripts/migrateCatalogImagesToBlob.ts --apply --ingredients
npx tsx scripts/migrateCatalogImagesToBlob.ts --make-private
```

Requires `BLOB_READ_WRITE_TOKEN` in `.env.local`.

## Prompt filler script

Generate filled prompts for cocktails missing images:

```bash
npx tsx scripts/fillCocktailImagePrompts.ts
npx tsx scripts/fillCocktailImagePrompts.ts --slug bobby-burns
npx tsx scripts/fillCocktailImagePrompts.ts --batch review-001
```
