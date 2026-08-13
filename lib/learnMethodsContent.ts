/**
 * Layered enrichment for Learn methods — merge onto LEARN_METHODS sections.
 */

import type { LearnLessonLayers, LearnSection, LearnSource } from "@/lib/learnTypes";

export type LearnMethodLayers = {
  bigIdea: string;
  keyTakeaways: string[];
  deepDive?: LearnSection[];
  sources?: LearnSource[];
};

/** Merge method body sections with layered enrichment for LearnLessonArticle. */
export function getMethodLessonLayers(method: {
  slug: string;
  summary: string;
  tip: string;
  sections: LearnSection[];
}): LearnLessonLayers {
  const layers = LEARN_METHODS_CONTENT[method.slug];
  return {
    bigIdea: layers?.bigIdea ?? method.summary,
    keyTakeaways: layers?.keyTakeaways ?? [method.tip],
    sections: method.sections,
    deepDive: layers?.deepDive,
    sources: layers?.sources,
  };
}

export const LEARN_METHODS_CONTENT: Record<string, LearnMethodLayers> = {
  shake: {
    bigIdea:
      "A hard shake chill-dilutes and aerates in one motion — use it whenever citrus, egg, or dairy needs full integration and a lighter texture.",
    keyTakeaways: [
      "Shake cloudy or acidic builds; stop when the tin is painfully cold (~10–15 seconds).",
      "Pack with ice — sparse ice melts too fast and warms the drink.",
      "Fine-strain drinks served up to catch chips and pulp.",
      "Air from shaking emulsifies egg and brightens citrus; that texture is intentional.",
      "Spirit-only classics usually prefer a stir for clarity and denser mouthfeel.",
    ],
    deepDive: [
      {
        heading: "Chill curve vs dilution curve",
        body: [
          "Most useful cooling happens in the first hard seconds of contact with ice. Past the point where the tin frosts and hurts to hold, extra shaking mostly adds water. Soft home ice reaches that over-dilution point faster than dense bar ice — shorten the shake if the drink tastes thin.",
          "A dry shake (no ice) builds foam for egg drinks; a follow-up wet shake sets temperature and dilution. Don’t skip the wet half or you’ll serve warm foam.",
        ],
      },
      {
        heading: "Why the loud rattle matters",
        kind: "tip",
        body: [
          "Vigorous agitation breaks ice edges and circulates liquid so every milliliter hits cold surface area. A gentle rock under-chills the core. Seal firmly; a loose tin wastes energy (and sprays).",
        ],
      },
    ],
    sources: [
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Measured take on shake timing, dilution, and aeration.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Working technique for shaken sours and emulsified drinks.",
      },
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Practical shaking standards and fine-straining.",
      },
    ],
  },
  stir: {
    bigIdea:
      "Stirring chills all-spirit drinks with minimal aeration so they stay clear, dense, and silky — dilution is the seasoning.",
    keyTakeaways: [
      "Reserve stirring for spirit-and-liqueur drinks without citrus, egg, or dairy.",
      "Pack the mixing glass; stir smooth circles 20–30 seconds with the spoon on the glass.",
      "Taste for cold and softness — hot alcohol means under-stirred; thin means over-stirred.",
      "Avoid whipping air; clarity and viscosity are the point.",
      "Express citrus oils after straining when the recipe calls for aroma on top.",
    ],
    deepDive: [
      {
        heading: "Target dilution without a lab",
        body: [
          "Many stirred classics land near roughly one-fifth to one-quarter water by volume once properly cold. You won’t measure that at home — use sensory cues: the drink should lose harsh ethanol heat, gain slight viscosity from cold, and still taste concentrated.",
          "Wet, soft ice dumps water before the drink is cold. Prefer hard cubes and a full mixing glass so chill and dilution rise together.",
        ],
      },
      {
        heading: "Spoon path and why it matters",
        kind: "tip",
        body: [
          "Keep the bowl of the barspoon against the glass and rotate from the wrist so liquid slides rather than churns. Churning incorporates air and can cloud a Martini the way a short shake would.",
        ],
      },
    ],
    sources: [
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Stirring form, timing, and spirit-forward service.",
      },
      {
        label: "Dave Arnold, Liquid Intelligence",
        note: "Why stirred drinks dilute differently than shaken ones.",
      },
      {
        label: "David A. Embury, The Fine Art of Mixing Drinks",
        note: "Classic expectations for Manhattan/Martini-style balance.",
      },
    ],
  },
  build: {
    bigIdea:
      "Building in the glass prioritizes cold lengtheners and gentle mixing so carbonation and ice do the work — speed without sacrificing structure.",
    keyTakeaways: [
      "Use for highballs, G&Ts, Palomas, and spritzes where bubbles matter.",
      "Ice first (usually), spirit and modifiers next, carbonated lengthener last.",
      "A brief stir is enough — over-stirring knocks out fizz.",
      "Keep sodas and ginger beer cold; warm bubbles die fast.",
      "Proper ice volume prevents instant watery thinness.",
    ],
    deepDive: [
      {
        heading: "Order of operations and CO₂",
        body: [
          "Carbonated lengtheners lose gas when agitated and when they hit warm surfaces. Pouring tonic or ginger beer last over cold ice preserves sparkle; a long stir is the enemy.",
          "If a highball tastes dull within a minute, check ice quantity and fridge-cold soda before changing ratios.",
        ],
      },
      {
        heading: "Built ≠ unfinished",
        kind: "tip",
        body: [
          "A built drink still wants balance: spirit strength, acid or bitter modifier when called for, and enough length to refresh. Measure the spirit; freestyle only the soda top if you’re tasting as you go.",
        ],
      },
    ],
    sources: [
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Highball construction and service basics.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Built drinks as a disciplined method, not a shortcut.",
      },
      {
        label: "Difford's Guide — Highballs",
        note: "Reference specs and lengthener pairings.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  blend: {
    bigIdea:
      "Blending is a texture method — crushed ice and short blend cycles create a frozen body that should be served immediately before it separates.",
    keyTakeaways: [
      "Use for frozen Margaritas, Piña Coladas, and similar texture-first drinks.",
      "Prefer crushed or small ice so the blender doesn’t stall.",
      "Pulse first, then blend smooth — don’t obliterate herbs into bitterness unless the recipe wants puree.",
      "Serve at once; melted separation ruins the point.",
      "Sweetness reads louder when ice-cold — taste and adjust syrup with that in mind.",
    ],
    deepDive: [
      {
        heading: "Ice as structure, not afterthought",
        body: [
          "In a blender drink, ice is both refrigerant and body. Too little and the mix is soupy; too much and flavors mute under freeze. Start with the recipe’s ice cue, then adjust by texture — it should mound on a spoon, not pour like juice.",
        ],
      },
      {
        heading: "Fruit and dairy behavior",
        kind: "tip",
        body: [
          "Fatty coconut and cream bases help emulsion hold; watery fruit can ice-crystal and separate faster. A brief re-blend before pouring leftovers is fine; don’t let a pitcher sit and weep.",
        ],
      },
    ],
    sources: [
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Frozen drink practicalities and blender technique.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Tropical and blended classics in a bar context.",
      },
      {
        label: "Difford's Guide — Frozen cocktails",
        note: "Style reference for blended serves.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  layer: {
    bigIdea:
      "Layering stacks liquids by density — sweet and heavy first, lighter spirits and creams floated slowly over a spoon for bands of flavor and color.",
    keyTakeaways: [
      "Density usually tracks sugar content; pour heaviest first.",
      "Use the back of a barspoon to spread each layer instead of plunging.",
      "Floats on sours (e.g. red wine on a New York Sour) are the most useful home application.",
      "Patience beats volume — fast pours pierce layers.",
      "Serve promptly; diffusion blurs bands over time.",
    ],
    deepDive: [
      {
        heading: "Density intuition without a chart",
        body: [
          "Rich syrups and cordials sink; high-proof spirits and lightly sweetened wines often ride higher; cream can float when poured gently over a cold surface. When unsure, practice with small volumes in a clear glass before committing a full drink.",
        ],
      },
      {
        heading: "Flavor staging vs pure visuals",
        kind: "tip",
        body: [
          "A wine float on a sour isn’t only pretty — the first sips alternate bright citrus and tannic fruit. Build layers that make sense as a tasting sequence, not only as stripes.",
        ],
      },
    ],
    sources: [
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Classic layered drinks and float technique.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Service technique for floats and pousse-café-style builds.",
      },
      {
        label: "Difford's Guide — Layered cocktails",
        note: "Visual reference and method notes.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  swizzle: {
    bigIdea:
      "Swizzling spins crushed ice in the glass until the exterior frosts — rapid chill without shaking away the ice’s texture.",
    keyTakeaways: [
      "Built for crushed-ice Caribbean and tiki-style drinks.",
      "Pack crushed ice, add ingredients, spin a stick or barspoon between your palms.",
      "Stop when the glass frosts; top with more ice if the mound settles.",
      "You’re mixing and diluting in place — keep proportions measured.",
      "A metal barspoon works at home if you lack a traditional swizzle stick.",
    ],
    deepDive: [
      {
        heading: "Why crushed ice is non-negotiable",
        body: [
          "High surface area lets the spin create fast equilibrium between liquid and ice. Cubes won’t frost the glass the same way and leave hot spots. If you only have cubes, crack them hard in a towel before packing.",
        ],
      },
      {
        heading: "Herb and syrup placement",
        kind: "tip",
        body: [
          "Mint or other herbs often sit in the glass before ice so the swizzle wakes aroma without a separate muddle. Sweetener should be dissolved (or poured as syrup) before you spin so it doesn’t linger undissolved at the bottom.",
        ],
      },
    ],
    sources: [
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "Swizzle method in a modern craft-bar framing.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Caribbean crushed-ice drinks and service cues.",
      },
      {
        label: "Difford's Guide — Swizzle",
        note: "Method overview and classic examples.",
        href: "https://www.diffordsguide.com/",
      },
    ],
  },
  muddle: {
    bigIdea:
      "Muddling presses aroma and juice from herbs or fruit — firm and brief for mint, more thorough for hard fruit, never a shredding contest.",
    keyTakeaways: [
      "Press to release oils and juice; don’t pulverize herbs into chlorophyll bitterness.",
      "Mint needs a few presses; citrus wedges and berries need more to yield juice.",
      "Muddle in the glass you’ll build in when the recipe is a smash, Mojito, or Caipirinha.",
      "Sugar can act as an abrasive to help extract — useful with citrus peels in some builds.",
      "Under-muddled fruit leaves drinks thin; over-muddled mint tastes grassy.",
    ],
    deepDive: [
      {
        heading: "Cell walls and bitterness",
        body: [
          "Herb leaves store aromatic oils in glands that bruise easily; grinding the whole leaf tears chlorophyll-rich tissue and floods the drink with green bitterness. Think perfume, not pesto.",
          "Fruit muddling is the opposite problem: you need enough pressure to break pulp and release juice into the sugar or spirit base. Taste the build before you shake or lengthen.",
        ],
      },
      {
        heading: "Tool pressure",
        kind: "mistakes",
        body: [
          "A heavy muddler invites overdoing mint. Use controlled presses and look for aroma, not puree. If you’re shredding leaves against the glass, lighten up.",
        ],
      },
    ],
    sources: [
      {
        label: "Jeffrey Morgenthaler, The Bar Book",
        note: "Muddling technique and herb handling.",
      },
      {
        label: "Dale DeGroff, The Craft of the Cocktail",
        note: "Smashes, Mojitos, and fruit-muddled classics.",
      },
      {
        label: "Jim Meehan, Meehan's Bartender Manual",
        note: "When muddling belongs in the method vs. when to slap or express instead.",
      },
    ],
  },
};
