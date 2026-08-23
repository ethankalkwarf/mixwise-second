export const PARTNERS_HERO = {
  title: "Partners",
  subtitle:
    "We work with distilleries, content creators, and press who care about home mixology. If you want to reach people who actually pour at home, we’d like to hear from you.",
  image: {
    src: "/media/partners/hero.webp",
    alt: "A bright home kitchen bar with bottles, citrus, and a cocktail being poured",
  },
};

export const PARTNERS_INTRO =
  "MixWise is built for curious home bartenders: people stocking a cabinet, learning a classic, and sharing what they pour. We look for editorial collaborations, co-promotion, and stories that help people pour at home. Partnerships should feel useful to that audience, not like an ad interrupting the recipe.";

export type PartnerAudience = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  highlights: string[];
  image: { src: string; alt: string; objectPosition?: string };
  contactTopic?: string;
  secondaryLink?: { href: string; label: string };
};

export const PARTNER_AUDIENCES: PartnerAudience[] = [
  {
    id: "distilleries",
    eyebrow: "Distilleries",
    title: "Put your bottles in context",
    body:
      "Home drinkers discover spirits through cocktails. We can show how your product fits real recipes, ingredient pages, and cabinet matching so people understand what to buy and what to pour with it.",
    highlights: [
      "Ingredient pages and cocktail coverage tied to your portfolio",
      "Educational framing that respects the craft, not just the logo",
      "Home-bar storytelling that reaches people building a cabinet",
    ],
    image: {
      src: "/media/partners/distillery-shelf.webp",
      alt: "Spirit bottles and bar tools on a home kitchen shelf",
      objectPosition: "center 40%",
    },
    contactTopic: "distillery",
  },
  {
    id: "creators",
    eyebrow: "Content creators",
    title: "Share MixWise with your audience",
    body:
      "If you teach cocktails on video, podcast, or social, MixWise can be a natural companion: curated recipes, Learn paths, and tools your audience can use after the episode ends.",
    highlights: [
      "Cross-promotion and deep links when it fits your show or channel",
      "Episode-friendly links to recipes, Learn lessons, and the mixer",
      "Co-created ideas that help viewers pour, not just watch",
    ],
    image: {
      src: "/media/partners/creators-sharing.webp",
      alt: "Friends toasting with cocktails at a home kitchen counter",
      objectPosition: "center 35%",
    },
    contactTopic: "creator",
  },
  {
    id: "press",
    eyebrow: "Press",
    title: "Cover the product with substance",
    body:
      "MixWise is a home bartending companion: curated library, cabinet matching, Learn, and a small social layer for people who pour together. We’re happy to help you tell that story accurately.",
    highlights: [
      "Boilerplate, product facts, and founder background on request",
      "Approved logos and lockups ready to download",
      "Screenshots, walkthroughs, and interview availability when timing allows",
    ],
    image: {
      src: "/media/three-cocktails-dark.webp",
      alt: "Three cocktails on a dark wood surface",
      objectPosition: "center center",
    },
    contactTopic: "press",
    secondaryLink: { href: "/brand/logos", label: "Download logos" },
  },
];

export const PARTNERS_CONTACT = {
  email: "hello@getmixwise.com",
  note: "Tell us who you are, what you’re proposing, and who you’re trying to reach. We read every note.",
};

export const PARTNERS_FAQ = [
  {
    id: "who",
    question: "What kinds of partners does MixWise work with?",
    answer:
      "MixWise partners with distilleries and spirit brands, cocktail educators and content creators, and press outlets covering food, drink, apps, and lifestyle. The common thread is home mixology: people learning and pouring at home.",
  },
  {
    id: "distilleries",
    question: "How does MixWise work with distilleries?",
    answer:
      "We connect bottles to real cocktails through ingredient pages, recipe coverage, and cabinet matching. The goal is education and context: helping home drinkers understand what to buy and what to pour with a spirit, not logo placement alone.",
  },
  {
    id: "creators",
    question: "Can cocktail creators collaborate with MixWise?",
    answer:
      "Yes. Educators on video, podcast, or social can share MixWise as a companion for their audience: deep links to recipes, Learn lessons, and the mixer tool people use after an episode ends.",
  },
  {
    id: "press",
    question: "How should press cover MixWise?",
    answer:
      "MixWise is a home bartending companion with a curated cocktail library, cabinet matching (/mix), Learn paths for technique, and a small social layer for friends who pour together. Press can use boilerplate and logos at getmixwise.com/brand/logos.",
  },
  {
    id: "contact",
    question: "How do I contact MixWise about a partnership?",
    answer:
      "Email hello@getmixwise.com or use the contact form at getmixwise.com/contact?topic=partners. Include who you are, what you’re proposing, and the audience you want to reach.",
  },
] as const;

/** Plain-text summary for llms.txt and answer engines. */
export const PARTNERS_LLMS_BLOCK = `## Partners

MixWise partners with distilleries, cocktail content creators, and press covering home mixology.

- Partner page: {url}/partners
- Contact: hello@getmixwise.com or {url}/contact?topic=partners
- Logos and boilerplate: {url}/brand/logos
- About MixWise: {url}/about

### Distilleries
Spirit brands can connect bottles to recipes, ingredient pages, and cabinet matching so home drinkers see what to pour.

### Content creators
Cocktail educators can share deep links to recipes, Learn lessons, and the mixer for audiences who want to pour after watching.

### Press
MixWise is a home bartending app: curated recipes, /mix cabinet matching, Learn paths, and friends activity. Download logos and boilerplate at /brand/logos.`;
