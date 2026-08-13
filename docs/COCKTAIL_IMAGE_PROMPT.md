# MixWise Cocktail Image Prompt

Canonical reusable prompt for generating MixWise recipe photos.
Every catalog image should be produced from this template, filled from the cocktail’s database/CSV row.

## Master template

```text
Create a single hyper-realistic photorealistic image of a **[COCKTAIL NAME]** cocktail for a recipe website.

**Global visual style:**

* [LIGHTING STYLE appropriate to the drink, ingredients, or era]
* Blurred [BACKGROUND/SETTING appropriate to the cocktail] with [BOKEH STYLE]
* 1200×630 pixel landscape aspect ratio (16:9)
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

1. **Aspect:** 16:9 landscape at 1200×630
2. **Subject:** one primary drink only
3. **Framing:** glass dominant, but **not always dead-center** — vary composition:
   - classic centered hero
   - slight off-center / rule-of-thirds
   - closer crop that fills more of the frame
   - tighter detail on ice, garnish, foam, or rim when that is the drink’s visual story
4. **Depth:** shallow depth of field
5. **Background:** contextual but blurred; never competing with the drink. **Vary the setting** so the catalog feels approachable — not a wall of dark bars. Prefer a mix of:
   - home kitchens / sunny counters
   - dining tables and casual indoor tables
   - decks, patios, and outdoor daylight
   - bright recipe-studio surfaces
   - occasional classic bar scenes (use sparingly)
6. **Forbidden:** bottles, branding, logos, text, humans, hands
7. **Realism:** deliberately introduce small physical imperfections so the image does not look like sterile CGI
8. **Mood:** welcoming and everyday; avoid making every drink look like nightlife exclusivity

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
| Crushed / pebble ice | Irregular ice texture, wet melt edges |
| Built highball | Tall silhouette, ice stack, possible light condensation |

## Critical accuracy rule

Do **not** blindly infer appearance from the drink name.

Derive the final visual from:

`ingredients` + `instructions` + `glassware` + `garnish`

(+ technique / category / tags for mood and texture)

This keeps generated images accurate even for obscure cocktails.

## Filename / storage convention

Upload to Supabase Storage bucket `cocktail-images-fullsize` as:

- Preferred: `{Cocktail Name}.png` or `{Cocktail Name}.webp`
- Also accepted: `{Cocktail Name} Cocktail.png`

Then wire `cocktails.image_url` via:

```bash
npx tsx scripts/matchReviewBatchImages.ts --apply
# or
npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply
```

## Prompt filler script

Generate filled prompts for cocktails missing images:

```bash
npx tsx scripts/fillCocktailImagePrompts.ts
npx tsx scripts/fillCocktailImagePrompts.ts --slug bobby-burns
npx tsx scripts/fillCocktailImagePrompts.ts --batch review-001
```
