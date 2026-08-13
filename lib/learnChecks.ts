/**
 * Occasional learning checks — one or two questions per lesson.
 */

export type LearnCheck = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

/** Checks keyed by guide slug */
export const GUIDE_CHECKS: Record<string, LearnCheck[]> = {
  "home-bar-fundamentals": [
    {
      id: "hbf-1",
      prompt: "Which tool matters most once you start serving drinks “up” (no ice in the glass)?",
      options: [
        "A second shaker tin",
        "A fine mesh strainer",
        "A blender",
        "A flaming torch",
      ],
      correctIndex: 1,
      explanation:
        "Fine-straining catches ice chips and pulp so up drinks stay smooth in coupes and Nick & Noras.",
    },
    {
      id: "hbf-2",
      prompt: "True or false: soft freezer ice is fine for stirred spirit-forward cocktails.",
      options: ["True — ice is ice", "False — soft ice melts too fast and over-dilutes"],
      correctIndex: 1,
      explanation:
        "Hard, clear(ish) cubes chill more predictably. Soft ice waters a Manhattan before it is properly cold.",
    },
  ],
  "shake-vs-stir": [
    {
      id: "svs-1",
      prompt: "You are making a Whiskey Sour with egg white. Which method fits?",
      options: ["Stir 30 seconds", "Shake (often with a dry shake first)", "Build in the glass only", "Blend until frothy"],
      correctIndex: 1,
      explanation:
        "Citrus and egg want shaking to emulsify and chill. A dry shake helps foam before you add ice.",
    },
    {
      id: "svs-2",
      prompt: "Why stir a Martini instead of shaking?",
      options: [
        "Stirring is always stronger",
        "You want clarity and a denser, silkier texture",
        "Shaking is only for vodka",
        "Stirring adds more air",
      ],
      correctIndex: 1,
      explanation:
        "All-spirit drinks stay clear and denser when stirred. Shaking clouds them and adds more dilution and air.",
    },
  ],
  "balance-and-taste": [
    {
      id: "bat-1",
      prompt: "Your Margarita tastes too sweet. What’s the first sensible fix?",
      options: [
        "Add more tequila only",
        "Add a little citrus (or check citrus freshness)",
        "Shake twice as long",
        "Remove the salt rim",
      ],
      correctIndex: 1,
      explanation:
        "Sweet/sour balance is the usual culprit. Brighten with citrus before rewriting the whole pour.",
    },
  ],
  "garnish-with-intent": [
    {
      id: "gwi-1",
      prompt: "What’s the main job of expressing a citrus peel?",
      options: [
        "Adding lots of juice",
        "Spraying aromatic oils over the drink",
        "Making the drink colder",
        "Sweetening the rim",
      ],
      correctIndex: 1,
      explanation:
        "Expression is perfume — oils on the surface — more than decoration or juice.",
    },
  ],
  "spirit-primer-agave": [
    {
      id: "spa-1",
      prompt: "For a bright Margarita, which category usually fits best?",
      options: ["Añejo", "Blanco (or restrained mezcal)", "Only mixto tequila", "Cream liqueur"],
      correctIndex: 1,
      explanation:
        "Blanco keeps bright agave and pepper. Añejo leans oaky/dessert; mixtos flatten the drink.",
    },
  ],
  "zero-proof-mindset": [
    {
      id: "zpm-1",
      prompt: "What still matters in a zero-proof drink?",
      options: [
        "Only sweetness",
        "Structure: acid, sweet, bitter/spice, and texture",
        "Skipping ice to keep flavor strong",
        "Avoiding garnish so it looks serious",
      ],
      correctIndex: 1,
      explanation:
        "NA drinks need the same architecture as cocktails — acid, sweet, bitter or spice, and satisfying texture — plus proper ice and glassware.",
    },
  ],
};

/** Checks keyed by method slug */
export const METHOD_CHECKS: Record<string, LearnCheck[]> = {
  shake: [
    {
      id: "m-shake-1",
      prompt: "About how long should a hard shake usually run?",
      options: ["3–5 seconds", "10–15 seconds", "45–60 seconds", "Until the ice disappears"],
      correctIndex: 1,
      explanation:
        "Roughly 10–15 seconds until the tin is painfully cold. Shorter leaves drinks warm; much longer over-dilutes.",
    },
  ],
  stir: [
    {
      id: "m-stir-1",
      prompt: "Which drink belongs in a mixing glass, not a shaker?",
      options: ["Daiquiri", "Whiskey Sour", "Manhattan", "Margarita"],
      correctIndex: 2,
      explanation:
        "Manhattans are all spirits — stir for clarity and silk. The others have citrus (and often egg) and want a shake.",
    },
  ],
  build: [
    {
      id: "m-build-1",
      prompt: "When building a highball, when should the soda or ginger beer usually go in?",
      options: ["First, before ice", "Last, to keep bubbles lively", "Never — stir it in hard", "Only if the drink is warm"],
      correctIndex: 1,
      explanation:
        "Add lengtheners last so carbonation stays bright, then give only a brief stir.",
    },
  ],
  muddle: [
    {
      id: "m-muddle-1",
      prompt: "How should you muddle mint for a Mojito?",
      options: [
        "Pulverize into a puree",
        "Press gently a few times to wake the oils",
        "Skip muddling and just garnish",
        "Boil the mint first",
      ],
      correctIndex: 1,
      explanation:
        "Press — don’t shred — or you release bitter chlorophyll and the drink tastes grassy.",
    },
  ],
};

export function getGuideChecks(slug: string): LearnCheck[] {
  return GUIDE_CHECKS[slug] ?? [];
}

export function getMethodChecks(slug: string): LearnCheck[] {
  return METHOD_CHECKS[slug] ?? [];
}
