import type { LearnSection } from "@/lib/learnTypes";

export type LearnStep = {
  title: string;
  body: string;
};

export type LearnStepDeckSpec = {
  kicker: string;
  title: string;
  steps: LearnStep[];
};

/** Step cards derived from LearnFigure “how-to” diagrams. */
export const FIGURE_STEP_DECKS: Record<string, LearnStepDeckSpec> = {
  "shake-how": {
    kicker: "How to shake",
    title: "Pack, rattle, stop when it hurts",
    steps: [
      { title: "Pack the tin", body: "Ice to the brim — sparse ice melts and warms." },
      { title: "Shake hard", body: "10–15 seconds, loud rattle, until the tin hurts." },
      { title: "Strain promptly", body: "Fine-strain if it's served up." },
    ],
  },
  "stir-how": {
    kicker: "How to stir",
    title: "Full glass, smooth circles, taste for silk",
    steps: [
      { title: "Pack the glass", body: "Hard cubes, full mixing glass." },
      { title: "Smooth circles", body: "Spoon on the glass 20–30 seconds — don't churn air." },
      { title: "Taste for silk", body: "Heat gone, still concentrated. Then strain." },
    ],
  },
  "build-order": {
    kicker: "How to build",
    title: "Ice, then spirit, lengthener last",
    steps: [
      { title: "Ice", body: "Pack the serving glass." },
      { title: "Spirit + modifiers", body: "Measure. This is still a recipe." },
      { title: "Lengthener last", body: "Cold soda or ginger beer. Brief stir." },
    ],
  },
  "layer-density": {
    kicker: "How to layer",
    title: "Heavy first, then a slow spoon pour",
    steps: [
      { title: "Bottom · densest", body: "Syrups and sweet cordials go in first." },
      { title: "Middle", body: "Liqueurs, citrus bases, and sours next." },
      { title: "Top · lightest", body: "High-proof spirits, dry wine, cream — pour over a spoon." },
    ],
  },
  "muddle-press": {
    kicker: "How to muddle",
    title: "Press herbs. Pulp fruit. Never shred mint.",
    steps: [
      { title: "Press", body: "A few firm pushes — perfume, not pesto." },
      { title: "Don't shred", body: "Chlorophyll bitterness tastes like lawn." },
    ],
  },
};

/** Step cards for technique lessons (matches LearnTechniqueVisual copy). */
export const TECHNIQUE_STEP_DECKS: Record<string, LearnStepDeckSpec> = {
  "dry-shake": {
    kicker: "How to dry-shake",
    title: "Foam first, chill second",
    steps: [
      { title: "Shake without ice", body: "Seal and shake hard 10–15 seconds until the mix sounds creamy." },
      { title: "Open · add ice", body: "Pack the tin full — sparse ice warms the drink." },
      { title: "Shake again · strain", body: "Wet-shake until painfully cold, then fine-strain into a chilled glass." },
    ],
  },
  "fine-strain": {
    kicker: "How to fine-strain",
    title: "Two strainers, one smooth pour",
    steps: [
      { title: "Hawthorne over tin", body: "Hold the coil side against the shaker or mixing glass." },
      { title: "Fine mesh under", body: "Nest a tea strainer over the serving glass." },
      { title: "Catch chips & pulp", body: "Pour slowly — the mesh catches ice chips and citrus pulp." },
    ],
  },
  express: {
    kicker: "How to express",
    title: "Oils on the surface, not juice in the glass",
    steps: [
      { title: "Cut a thin peel", body: "Wide strip, minimal pith — you're after oils, not bitterness." },
      { title: "Squeeze oils over drink", body: "Pinch peel skin-side down over the glass, then drop or discard." },
      { title: "Optional wipe on rim", body: "A light pass leaves aroma without flooding the sip with juice." },
    ],
  },
  muddle: {
    kicker: "How to muddle",
    title: "Press to release — don't shred",
    steps: [
      { title: "Add herbs or fruit", body: "Leaves or wedges go in the bottom of the glass or tin." },
      { title: "Press gently 3–4×", body: "Firm pushes release oils and juice — no grinding." },
      { title: "Build or shake next", body: "Add the rest of the ingredients right after; don't let herbs oxidize." },
    ],
  },
  swizzle: {
    kicker: "How to swizzle",
    title: "Spin until the glass frosts",
    steps: [
      { title: "Pack crushed ice", body: "Fill the glass — swizzles need plenty of ice contact." },
      { title: "Spin stick in palms", body: "Rub palms back and forth until the glass frosts outside." },
      { title: "Top with more ice", body: "Add a crown of crushed ice and garnish when the drink is cold." },
    ],
  },
  rinse: {
    kicker: "How to rinse",
    title: "Coat, don't drown",
    steps: [
      { title: "Pour a splash in glass", body: "A barspoon or two of absinthe, vermouth, or liqueur." },
      { title: "Tilt to coat sides", body: "Roll the liquid around the inside of the glass." },
      { title: "Discard excess", body: "Dump what doesn't stick — you want perfume, not volume." },
    ],
  },
  float: {
    kicker: "How to float",
    title: "Slow pour over a spoon",
    steps: [
      { title: "Base drink ready", body: "Build or pour the main drink first — no ice shift after." },
      { title: "Spoon on the surface", body: "Barspoon upside-down, touching the liquid." },
      { title: "Pour slowly onto spoon", body: "Let the lighter layer spread without diving under." },
    ],
  },
  layer: {
    kicker: "How to layer",
    title: "Density order, slow hands",
    steps: [
      { title: "Heaviest liquid first", body: "Syrups and cordials anchor the bottom." },
      { title: "Spoon on the surface", body: "Pour each lighter layer over an upside-down barspoon." },
      { title: "Lighter liquid last", body: "Spirits and cream float on top when poured slowly." },
    ],
  },
  build: {
    kicker: "How to build",
    title: "Made in the glass you'll drink from",
    steps: [
      { title: "Ice in the glass", body: "Pack the serving glass — you're not straining away." },
      { title: "Spirit + modifiers", body: "Measure into the glass; stir or roll to combine." },
      { title: "Lengthener last · brief stir", body: "Top with cold soda or ginger beer and give one gentle stir." },
    ],
  },
};

export function resolveStepDeck(
  section: LearnSection,
  options?: { techniqueSlug?: string }
): LearnStepDeckSpec | null {
  if (section.steps?.length) {
    return {
      kicker: section.deckKicker ?? section.heading,
      title: section.deckTitle ?? section.heading,
      steps: section.steps,
    };
  }

  if (section.figure && FIGURE_STEP_DECKS[section.figure]) {
    return FIGURE_STEP_DECKS[section.figure];
  }

  const techniqueSlug = options?.techniqueSlug;
  if (section.heading === "How to do it" && techniqueSlug && TECHNIQUE_STEP_DECKS[techniqueSlug]) {
    return TECHNIQUE_STEP_DECKS[techniqueSlug];
  }

  if (section.heading === "How to do it" && section.body.length >= 2) {
    return {
      kicker: "How to do it",
      title: "One step at a time",
      steps: section.body.map((para, index) => ({
        title: `Step ${index + 1}`,
        body: para,
      })),
    };
  }

  return null;
}

export function deckUsesFigure(section: LearnSection): boolean {
  return Boolean(section.figure && FIGURE_STEP_DECKS[section.figure]);
}
