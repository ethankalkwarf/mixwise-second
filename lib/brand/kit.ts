/** Canonical MixWise brand kit content for /brand (public) and related assets. */

export const BRAND_KIT_ZIP = "/brand/mixwise-brand-kit.zip";

export const BRAND_LOCKUP_VERSION = "20260820c";

export type BrandAsset = {
  id: string;
  name: string;
  description: string;
  /** Preview background for the asset tile */
  surface: "cream" | "forest" | "mist" | "white";
  files: Array<{
    label: string;
    href: string;
    format: "SVG" | "PNG";
  }>;
};

export const APPROVED_ASSETS: BrandAsset[] = [
  {
    id: "lockup-forest",
    name: "Lockup — forest",
    description: "Default wordmark for cream and light surfaces.",
    surface: "cream",
    files: [
      {
        label: "SVG",
        href: `/brand/mixwise-lockup.svg?v=${BRAND_LOCKUP_VERSION}`,
        format: "SVG",
      },
      { label: "PNG", href: "/brand/mixwise-lockup.png", format: "PNG" },
    ],
  },
  {
    id: "lockup-cream",
    name: "Lockup — cream",
    description: "Wordmark for forest, charcoal, and photography.",
    surface: "forest",
    files: [
      {
        label: "SVG",
        href: `/brand/mixwise-lockup-cream.svg?v=${BRAND_LOCKUP_VERSION}`,
        format: "SVG",
      },
      { label: "PNG", href: "/brand/mixwise-lockup-cream.png", format: "PNG" },
    ],
  },
  {
    id: "lockup-olive",
    name: "Lockup — olive",
    description: "Optional lockup for olive or mist accent surfaces.",
    surface: "mist",
    files: [
      {
        label: "SVG",
        href: `/brand/mixwise-lockup-olive.svg?v=${BRAND_LOCKUP_VERSION}`,
        format: "SVG",
      },
      { label: "PNG", href: "/brand/mixwise-lockup-olive.png", format: "PNG" },
    ],
  },
  {
    id: "app-icon",
    name: "App icon",
    description: "Home-screen and store icon. Do not use as a website wordmark.",
    surface: "white",
    files: [
      { label: "SVG", href: "/brand/mixwise-app-icon.svg", format: "SVG" },
      { label: "PNG", href: "/brand/mixwise-app-icon.png", format: "PNG" },
    ],
  },
  {
    id: "lime-wheel",
    name: "Lime wheel",
    description: "Standalone mark for favicons and compact UI. Not a substitute for the lockup.",
    surface: "cream",
    files: [
      {
        label: "SVG",
        href: "/brand/mixwise-lime-wheel-vector.svg",
        format: "SVG",
      },
    ],
  },
];

export const BRAND_HERO = {
  title: "Home mixology, for everyone",
  subtitle:
    "MixWise helps you make better cocktails at home. Learn a classic, match drinks to your cabinet, follow friends who pour, and keep a memory of what you’d actually make again.",
};

export const BRAND_STORY = [
  {
    eyebrow: "Where it began",
    title: "A question at the counter",
    body:
      "Friends would point at the bottles on their kitchen counter and ask what they could pour tonight. They wanted something good from what was already there. That question became MixWise: a home for the craft, built for real cabinets and real weeknights.",
    image: {
      src: "/media/kitchen-pour.webp",
      alt: "Pouring a cocktail at a home kitchen counter",
    },
  },
  {
    eyebrow: "What we believe",
    title: "Better drinks belong at home",
    body:
      "Great cocktails belong on sunny counters, back decks, and tables where someone is still learning which bottle to buy next. MixWise exists so curious beginners and returning enthusiasts can pour with more confidence, curiosity, and joy.",
    image: {
      src: "/media/kitchen-gathering.webp",
      alt: "Friends gathered around cocktails at a home table",
    },
  },
] as const;

export const BRAND_PILLARS = [
  {
    title: "Learn the craft",
    body:
      "A curated library of cocktails with clear measures, technique, and context that helps you understand each drink.",
  },
  {
    title: "Pour from your cabinet",
    body:
      "Add what you own and see what’s ready tonight, what’s one bottle away, and what your shelf is quietly capable of.",
  },
  {
    title: "Remember what you love",
    body:
      "Favorites, tasting notes, skips, and a shopping list so home bartending becomes a practice you return to.",
  },
] as const;

export const BRAND_COMPANION = {
  eyebrow: "How we help",
  title: "A companion for your home bar",
  intro:
    "MixWise is designed to help everyone make better cocktails at home: learn, match, improve, and share the craft.",
  image: {
    src: "/media/kitchen-shelf.webp",
    alt: "Bottles and bar tools arranged on a home kitchen shelf",
  },
} as const;

export const BRAND_LEARN = {
  eyebrow: "Learn",
  title: "Paths, skills, and technique",
  body:
    "MixWise Learn is built for people who want to improve, not just browse. Follow structured paths from your first pour to confident classics. Study shake vs. stir, muddling, dilution, templates, and smart swaps when you’re missing a bottle.",
  highlights: [
    "Learning paths that sequence guides and skills",
    "Deep dives on shaking, stirring, building, and garnish",
    "Smart swaps when a recipe calls for something you don’t have",
  ],
  image: {
    src: "/learn/method-shake.webp",
    alt: "Shaking a cocktail in a home bar setup",
  },
  href: "/learn",
};

export const BRAND_SOCIAL = {
  eyebrow: "Community",
  title: "Pour together",
  body:
    "Home bartending is more fun with company. Follow friends and fellow mixologists, see what they’re saving and earning, share invite links, and watch a simple activity feed of pours worth noticing. Your bar gets better when you learn from people you actually know.",
  highlights: [
    "Follow bartenders and see saves, badges, and activity",
    "Invite links to grow a small circle of home mixologists",
    "A feed that celebrates curiosity, not performance",
  ],
  image: {
    src: "/media/kitchen-friends.webp",
    alt: "Friends making cocktails together in a bright kitchen",
  },
  href: "/friends",
};

export const EDITORIAL_NOTE =
  "Each cocktail page is edited for history, practical tips, and precise recipes at a standard we’re proud to publish.";

export const BRAND_GALLERY = [
  {
    src: "/media/three-cocktails-dark.webp",
    alt: "Three cocktails on a dark wood surface",
  },
  {
    src: "/media/cocktails-overhead.webp",
    alt: "Cocktails photographed from above",
  },
  {
    src: "/media/kitchen-pour.webp",
    alt: "Straining a cocktail into a glass",
  },
] as const;

export const COCKTAIL_CRAFT = {
  intro:
    "Every cocktail page on MixWise is written and edited to a high standard. We treat recipes as small pieces of craft journalism.",
  standards: [
    {
      title: "History and context",
      body:
        "Where the drink came from, why it matters, and how it fits in the canon. Enough story to respect the glass without losing the thread.",
    },
    {
      title: "Practical tips",
      body:
        "Ice, dilution, garnish, substitutions, and the small decisions that separate a flat pour from a great one. Written for home kitchens.",
    },
    {
      title: "Precise, pourable recipes",
      body:
        "Measures you can follow at the counter. Ingredients named clearly. Instructions that reflect how the drink is actually built.",
    },
    {
      title: "Curated library",
      body:
        "We add drinks deliberately. Quality and usefulness over volume. A library you can trust when you’re standing in front of your bottles.",
    },
  ],
} as const;

export const BOILERPLATE = {
  oneLiner:
    "MixWise helps everyone make better cocktails at home with curated recipes, smart cabinet matching, Learn paths, and tools to remember what you’d pour again.",
  short:
    "MixWise is a free home bartending companion. Learn classic and modern cocktails with history and practical tips, match drinks to the bottles you already own, follow friends who pour, and keep favorites, notes, and skips as you improve. Craft without complexity for weeknights, guests, and the drink you’ve always wanted to try.",
  long: `MixWise helps everyone make better cocktails at home.

It’s a curated library and a practical bar companion. Browse cocktails with clear measures, context, and tips written for real kitchens. Add the bottles on your shelf and see what you can pour tonight, what’s one ingredient away, and what your cabinet is capable of. Study with Learn paths, methods, and techniques. Follow friends, share invite links, and see what people you know are pouring.

Save favorites, jot tasting notes, skip drinks you won’t remake, and treat home mixology like a craft you can grow into. Whether you’re matching what you have, learning a classic, or refining your palate, MixWise is built to make home bartending more confident, more curious, and more enjoyable.`,
  about:
    "MixWise began when friends asked a simple question at the kitchen counter: what can I make with these? Ethan built a product around that moment and the belief that better drinks belong at home, for everyone willing to learn and pour.",
};

export const PRESS_VOICE_SUMMARY =
  "Approachable craft: warm, clear, and honest about home bartending. Say MixWise (capital M and W). Site: getmixwise.com.";

export const BRAND_VOICE = {
  positioning:
    "Approachable craft. MixWise welcomes beginners and gives enthusiasts a library and tools worth returning to.",
  tone: [
    "Warm and welcoming. Your kitchen, not a velvet-rope bar.",
    "Clear and practical. Respect the reader’s time at the counter.",
    "Confident without jargon. Teach technique without gatekeeping.",
  ],
  do: [
    "Say MixWise (capital M and W). Site: getmixwise.com.",
    "Lead with making better drinks at home: learning, matching, and improving over time.",
    "Keep product claims honest: free to use without an account; accounts save your bar across devices.",
  ],
  dont: [
    "Don’t write Mixwise, Mix Wise, or mixwise in product copy (URLs and filenames excepted).",
    "Don’t position MixWise as only a recipe dump or SEO content farm.",
    "Don’t use exclusive or luxury tone that makes home bartending feel inaccessible.",
  ],
  naming: {
    product: "MixWise",
    url: "getmixwise.com",
    mixer: "the mixer (/mix). Matches recipes to your bottles.",
    library: "the library. Curated cocktail and ingredient pages.",
    learn: "Learn (/learn). Paths, methods, guides, and techniques.",
    friends: "Friends (/friends). Follow, invite, and activity.",
  },
};

export const EDITORIAL_FOCUS = {
  product: [
    "Curated cocktail pages with history, tips, and precise measures",
    "Cabinet matching: ready to pour, and one ingredient away",
    "Learn paths, methods, and smart swaps",
    "Friends, invites, and a simple social feed",
    "A home bar that remembers: favorites, notes, skips, shopping list",
  ],
  imagery: [
    "DSLR recipe-photo realism",
    "Drink-first with soft lifestyle context kept secondary",
    "Slightly imperfect ice, asymmetric garnish, muted real-camera color",
    "Vary composition across the catalog",
  ],
};

/** Design tokens mirrored from tailwind.config.js — single source for the private design-system page. */
export const DESIGN_COLORS = [
  {
    name: "cream",
    hex: "#F9F7F2",
    tw: "cream",
    role: "Page background, light surfaces",
  },
  {
    name: "mist",
    hex: "#E6EBE4",
    tw: "mist",
    role: "Secondary surface, borders, muted panels",
  },
  {
    name: "stone",
    hex: "#D1DAD0",
    tw: "stone",
    role: "Stronger borders, dividers",
  },
  {
    name: "forest",
    hex: "#3A4D39",
    tw: "forest",
    role: "Primary text, dark chrome, secondary buttons",
  },
  {
    name: "charcoal",
    hex: "#2C3628",
    tw: "charcoal",
    role: "Deepest text / photo overlays",
  },
  {
    name: "sage",
    hex: "#5F6F5E",
    tw: "sage",
    role: "Body / supporting text",
  },
  {
    name: "terracotta",
    hex: "#BC5A45",
    tw: "terracotta",
    role: "Primary CTA, eyebrows, accent",
  },
  {
    name: "terracotta-dark",
    hex: "#A04532",
    tw: "terracotta-dark",
    role: "CTA hover",
  },
  {
    name: "olive",
    hex: "#8A9A5B",
    tw: "olive",
    role: "Secondary botanical accent",
  },
  {
    name: "lime",
    hex: "#C5D46A",
    tw: "— (lockup / email)",
    role: "Lime wheel in lockup and email themes — not a Tailwind token yet",
  },
] as const;

export const DESIGN_TYPE = {
  display: {
    family: "DM Serif Display",
    tw: "font-display",
    use: "Headlines, section titles, cocktail names",
  },
  sans: {
    family: "Jost",
    tw: "font-sans",
    use: "Body, UI, navigation",
  },
  mono: {
    family: "Space Mono (fallback: system mono)",
    tw: "font-mono",
    use: "Eyebrows — uppercase, tracking-widest, terracotta",
  },
} as const;

export const DESIGN_RADIUS = [
  { name: "xl", value: "1rem", tw: "rounded-xl" },
  { name: "2xl", value: "1.5rem", tw: "rounded-2xl", note: "Buttons, inputs, cards" },
  { name: "3xl", value: "2rem", tw: "rounded-3xl" },
] as const;

export const DESIGN_SHADOWS = [
  { name: "soft", tw: "shadow-soft", css: "0 4px 20px -2px rgba(0,0,0,0.08)" },
  { name: "card", tw: "shadow-card", css: "0 8px 30px -8px rgba(0,0,0,0.1)" },
  {
    name: "card-hover",
    tw: "shadow-card-hover",
    css: "0 20px 40px -12px rgba(0,0,0,0.15)",
  },
  {
    name: "terracotta",
    tw: "shadow-terracotta",
    css: "0 4px 12px -2px rgba(188,90,69,0.22)",
  },
] as const;
