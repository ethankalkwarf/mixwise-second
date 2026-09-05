import type { ReactNode } from "react";
import { LearnPhotoPager, type LearnPhotoSlide } from "@/components/learn/LearnPhotoPager";

type DiagramSpec = {
  kicker: string;
  title: string;
  note?: string;
  node: ReactNode;
};

type PhotoFigureSpec = {
  kicker: string;
  title: string;
  note?: string;
  slides: LearnPhotoSlide[];
};

const FOREST = "#3A4D39";
const TERRACOTTA = "#BC5A45";
const OLIVE = "#8A9A5B";
const CREAM = "#F9F7F2";
const MIST = "#E6EBE4";

function Svg({
  children,
  viewBox,
  className = "w-full h-auto",
}: {
  children: ReactNode;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden fill="none">
      {children}
    </svg>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold text-center">
      {children}
    </p>
  );
}

function PanelNote({ children }: { children: ReactNode }) {
  return <p className="text-xs text-sage text-center leading-snug mt-1">{children}</p>;
}

/** Coupe / sour glass with three fill bands (spirit, citrus, sweet). */
function FourPartsDiagram() {
  const parts = [
    { label: "Strong", sub: "Spirit", color: TERRACOTTA, flex: "flex-[2]" },
    { label: "Sour", sub: "Citrus", color: OLIVE, flex: "flex-1" },
    { label: "Sweet", sub: "Sugar", color: "#C4A574", flex: "flex-1" },
    { label: "Weak", sub: "Dilution", color: FOREST, flex: "flex-1" },
  ];
  return (
    <div>
      <div className="flex h-16 sm:h-20 overflow-hidden rounded-2xl border border-forest/20">
        {parts.map((p) => (
          <div
            key={p.label}
            className={`${p.flex} flex flex-col items-center justify-center text-cream`}
            style={{ background: p.color }}
          >
            <span className="font-display font-bold text-sm sm:text-base">{p.label}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">{p.sub}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-sage text-center mt-3 leading-snug">
        Name the imbalance, then move the smallest lever. Hot usually means under-diluted.
      </p>
    </div>
  );
}

function ExpressPeelDiagram() {
  return (
    <div className="grid sm:grid-cols-3 gap-4 items-end">
      {[
        {
          title: "Thin peel",
          node: (
            <Svg viewBox="0 0 80 70" className="w-16 h-16 mx-auto">
              <path d="M18 40c8-22 36-22 44 0-10 8-34 8-44 0Z" fill="#E8C85A" stroke={FOREST} strokeWidth="1.6" />
              <path d="M24 38c6 6 26 6 32 0" stroke="#F6E7A8" strokeWidth="2" fill="none" />
            </Svg>
          ),
        },
        {
          title: "Pinch over the glass",
          node: (
            <Svg viewBox="0 0 80 70" className="w-16 h-16 mx-auto">
              <path d="M22 18c10 4 18 4 28 0" stroke={OLIVE} strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="28" cy="28" r="2" fill={OLIVE} />
              <circle cx="40" cy="24" r="1.5" fill={OLIVE} />
              <circle cx="52" cy="28" r="2" fill={OLIVE} />
              <ellipse cx="40" cy="52" rx="22" ry="8" fill="#E8F0C8" stroke={FOREST} strokeWidth="1.6" />
            </Svg>
          ),
        },
        {
          title: "Oils on the surface",
          node: (
            <Svg viewBox="0 0 80 70" className="w-16 h-16 mx-auto">
              <path d="M18 22h44c-2 16-8 26-22 30C26 48 20 38 18 22Z" fill="#E8F0C8" stroke={FOREST} strokeWidth="1.6" />
              <path d="M26 30h28" stroke={OLIVE} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </Svg>
          ),
        },
      ].map((step) => (
        <div key={step.title}>
          {step.node}
          <PanelLabel>{step.title}</PanelLabel>
        </div>
      ))}
    </div>
  );
}

function AgaveAgesDiagram() {
  const bottles = [
    { label: "Blanco", sub: "< 2 mo", fill: "#F4EFE4" },
    { label: "Reposado", sub: "2–12 mo", fill: "#E6C98A" },
    { label: "Añejo", sub: "1–3 yr", fill: "#C47A3A" },
    { label: "Extra", sub: "3+ yr", fill: "#7A3E1C" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {bottles.map((b) => (
        <div key={b.label}>
          <Svg viewBox="0 0 70 110" className="w-full max-w-[72px] mx-auto h-auto">
            <rect x="28" y="8" width="14" height="14" rx="2" fill={FOREST} />
            <path d="M24 22h22l4 10v60c0 6-5 10-15 10s-15-4-15-10V32l4-10Z" fill={b.fill} stroke={FOREST} strokeWidth="1.8" />
          </Svg>
          <PanelLabel>{b.label}</PanelLabel>
          <PanelNote>{b.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function WhiskeyStylesDiagram() {
  const bottles = [
    { label: "Bourbon", sub: "Corn · new oak", fill: "#C47A3A" },
    { label: "Rye", sub: "Spice · dry", fill: "#A85A32" },
    { label: "Scotch", sub: "Malt · peat?", fill: "#D4B896" },
    { label: "Irish", sub: "Soft · pot still", fill: "#E6C98A" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {bottles.map((b) => (
        <div key={b.label}>
          <Svg viewBox="0 0 70 110" className="w-full max-w-[72px] mx-auto h-auto">
            <rect x="28" y="8" width="14" height="14" rx="2" fill={FOREST} />
            <path
              d="M24 22h22l4 10v60c0 6-5 10-15 10s-15-4-15-10V32l4-10Z"
              fill={b.fill}
              stroke={FOREST}
              strokeWidth="1.8"
            />
          </Svg>
          <PanelLabel>{b.label}</PanelLabel>
          <PanelNote>{b.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function GinStylesDiagram() {
  const bottles = [
    { label: "London dry", sub: "Juniper · dry", fill: "#C5D4C0" },
    { label: "Contemporary", sub: "Citrus · floral", fill: "#E8D9A8" },
    { label: "Navy / overproof", sub: "Hot · holds citrus", fill: "#9BB0A0" },
    { label: "Old Tom", sub: "Softer · historic", fill: "#D4C4A8" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {bottles.map((b) => (
        <div key={b.label}>
          <Svg viewBox="0 0 70 110" className="w-full max-w-[72px] mx-auto h-auto">
            <rect x="28" y="8" width="14" height="14" rx="2" fill={FOREST} />
            <path
              d="M24 22h22l4 10v60c0 6-5 10-15 10s-15-4-15-10V32l4-10Z"
              fill={b.fill}
              stroke={FOREST}
              strokeWidth="1.8"
            />
          </Svg>
          <PanelLabel>{b.label}</PanelLabel>
          <PanelNote>{b.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function RumStylesDiagram() {
  const bottles = [
    { label: "Clean white", sub: "Daiquiri spine", fill: "#F4EFE4" },
    { label: "Aged", sub: "Oak · body", fill: "#C47A3A" },
    { label: "Funky", sub: "Esters · aroma", fill: "#A85A32" },
    { label: "Agricole", sub: "Cane · grassy", fill: "#8A9A5B" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {bottles.map((b) => (
        <div key={b.label}>
          <Svg viewBox="0 0 70 110" className="w-full max-w-[72px] mx-auto h-auto">
            <rect x="28" y="8" width="14" height="14" rx="2" fill={FOREST} />
            <path
              d="M24 22h22l4 10v60c0 6-5 10-15 10s-15-4-15-10V32l4-10Z"
              fill={b.fill}
              stroke={FOREST}
              strokeWidth="1.8"
            />
          </Svg>
          <PanelLabel>{b.label}</PanelLabel>
          <PanelNote>{b.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function RumProductionDiagram() {
  const steps = [
    { n: "1", t: "Cane / molasses", d: "The base you smell later." },
    { n: "2", t: "Ferment", d: "Time and yeast make esters." },
    { n: "3", t: "Still", d: "Pot keeps aroma; column cleans." },
    { n: "4", t: "Age", d: "Oak + climate do the work." },
    { n: "5", t: "Bottle", d: "Filter, color, or sugar last." },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {steps.map((s) => (
          <div key={s.n} className="text-center px-1">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-2">
              {s.n}
            </span>
            <PanelLabel>{s.t}</PanelLabel>
            <PanelNote>{s.d}</PanelNote>
          </div>
        ))}
      </div>
      <p className="text-xs text-sage text-center mt-3 leading-snug">
        Color happens late. Taste starts with the first four steps.
      </p>
    </div>
  );
}

function RumTastingProtocolDiagram() {
  const steps = [
    { n: "1", t: "Nose", d: "Smell it first — no sip yet." },
    { n: "2", t: "Sip", d: "A little, then air." },
    { n: "3", t: "Two words", d: "Write what you found." },
    { n: "4", t: "Name", d: "Then name the style." },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div key={s.n} className="text-center px-1">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-2">
              {s.n}
            </span>
            <PanelLabel>{s.t}</PanelLabel>
            <PanelNote>{s.d}</PanelNote>
          </div>
        ))}
      </div>
      <p className="text-xs text-sage text-center mt-3 leading-snug">
        Guessing the style first just trains you to confirm what you already believed.
      </p>
    </div>
  );
}

function EqualPartsDiagram() {
  const parts = [
    { label: "1 · Spirit", sub: "Gin or whiskey", color: FOREST },
    { label: "1 · Vermouth", sub: "Sweet wine", color: "#C4A574" },
    { label: "1 · Bitter", sub: "Campari family", color: TERRACOTTA },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {parts.map((p) => (
        <div key={p.label} className="rounded-2xl border border-forest/15 bg-cream/80 px-3 py-4 text-center">
          <div className="mx-auto mb-2 h-3 w-full max-w-[72px] rounded-full" style={{ background: p.color }} />
          <PanelLabel>{p.label}</PanelLabel>
          <PanelNote>{p.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function BatchingMapDiagram() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-olive/40 bg-olive/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest font-bold mb-3">Batches clean</p>
        <ul className="space-y-2 text-sm text-charcoal/85">
          <li>Negroni / Manhattan / Martini</li>
          <li>Pre-dilute · chill hard</li>
          <li>Serve from cold pitcher or bottle</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-terracotta/35 bg-terracotta/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold mb-3">Protect citrus</p>
        <ul className="space-y-2 text-sm text-charcoal/85">
          <li>Batch spirit + syrup early</li>
          <li>Juice close to service</li>
          <li>Foam = specials, not pitchers</li>
        </ul>
      </div>
    </div>
  );
}

function CitrusSyrupDiagram() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {[
        { t: "Fresh lime", d: "Bright · Daiquiri" },
        { t: "Fresh lemon", d: "Round · whiskey sour" },
        { t: "1:1 syrup", d: "Default sweet" },
        { t: "Rich 2:1", d: "Less water" },
      ].map((x) => (
        <div key={x.t} className="rounded-2xl border border-forest/15 bg-cream/80 px-3 py-3 text-center">
          <PanelLabel>{x.t}</PanelLabel>
          <PanelNote>{x.d}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function GlasswareTrioDiagram() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { t: "Coupe", d: "Up · aroma" },
        { t: "Rocks", d: "Cube · slow melt" },
        { t: "Highball", d: "Ice + lengthener" },
      ].map((x) => (
        <div key={x.t} className="text-center">
          <Svg viewBox="0 0 80 100" className="w-16 mx-auto h-auto mb-2">
            {x.t === "Coupe" && (
              <>
                <path d="M20 28h40l-6 22c-2 8-10 14-14 14s-12-6-14-14L20 28Z" fill={MIST} stroke={FOREST} strokeWidth="1.8" />
                <rect x="38" y="64" width="4" height="22" fill={FOREST} />
                <ellipse cx="40" cy="90" rx="14" ry="4" fill={FOREST} />
              </>
            )}
            {x.t === "Rocks" && (
              <rect x="22" y="28" width="36" height="52" rx="4" fill={MIST} stroke={FOREST} strokeWidth="1.8" />
            )}
            {x.t === "Highball" && (
              <rect x="26" y="12" width="28" height="72" rx="4" fill={MIST} stroke={FOREST} strokeWidth="1.8" />
            )}
          </Svg>
          <PanelLabel>{x.t}</PanelLabel>
          <PanelNote>{x.d}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function SwapMapDiagram() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-olive/40 bg-olive/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest font-bold mb-2">Keep the jobs</p>
        <p className="text-sm text-charcoal/85 leading-snug">Spirit · acid · sweet · bitter · length — swap inside one job.</p>
      </div>
      <div className="rounded-2xl border border-terracotta/35 bg-terracotta/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold mb-2">One knob</p>
        <p className="text-sm text-charcoal/85 leading-snug">Change bottle or citrus or sweetener — then taste before the next move.</p>
      </div>
    </div>
  );
}

function LabelTrustDiagram() {
  const regulated = ["Bourbon", "100% agave", "Single malt Scotch", "Bottled-in-bond", "Hecho en México"];
  const marketing = ["Small batch", "Craft reserve", "Hand-selected", "Ultra-premium", "Master’s pick"];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-olive/40 bg-olive/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest font-bold mb-3">
          Regulated
        </p>
        <ul className="space-y-2">
          {regulated.map((item) => (
            <li key={item} className="text-sm text-charcoal/85 leading-snug flex gap-2">
              <span className="text-olive font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-mist bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage font-bold mb-3">
          Marketing
        </p>
        <ul className="space-y-2">
          {marketing.map((item) => (
            <li key={item} className="text-sm text-charcoal/70 leading-snug flex gap-2">
              <span className="text-sage">—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WhiskeyLabelDiagram() {
  const rows = [
    { label: "Straight", meaning: "≥ 2 years · no added flavor/color" },
    { label: "Bottled-in-bond", meaning: "50% ABV · 4+ yr · one season" },
    { label: "Age statement", meaning: "Youngest whiskey in the bottle" },
    { label: "Small batch", meaning: "Marketing — not a legal standard" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-2xl border border-forest/15 bg-cream/80 px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold shrink-0 sm:w-36">
            {row.label}
          </p>
          <p className="text-sm text-charcoal/80 leading-snug">{row.meaning}</p>
        </div>
      ))}
    </div>
  );
}

function AgaveLabelDiagram() {
  const rows = [
    { label: "100% de agave", meaning: "All fermentable sugar from agave — skip mixto for cocktails" },
    { label: "NOM", meaning: "Norma Oficial Mexicana ID — trace the distillery on the label" },
    { label: "Blanco / reposado / añejo", meaning: "CRT aging tiers — oak time, not just color" },
    { label: "Hecho en México", meaning: "Denomination of origin — tequila & mezcal geography rules" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-2xl border border-forest/15 bg-cream/80 px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold shrink-0 sm:w-40">
            {row.label}
          </p>
          <p className="text-sm text-charcoal/80 leading-snug">{row.meaning}</p>
        </div>
      ))}
    </div>
  );
}

function ScotchLabelDiagram() {
  const rows = [
    { label: "Single malt", meaning: "One distillery · malted barley · pot still" },
    { label: "Blended Scotch", meaning: "Malt + grain recipe — usual cocktail pour" },
    { label: "12 Years", meaning: "Youngest whisky in the bottle — never an average" },
    { label: "Islay / Speyside", meaning: "Region hints — peat vs fruit, not legal quality tiers" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-2xl border border-forest/15 bg-cream/80 px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold shrink-0 sm:w-36">
            {row.label}
          </p>
          <p className="text-sm text-charcoal/80 leading-snug">{row.meaning}</p>
        </div>
      ))}
    </div>
  );
}

const PHOTO_FIGURES: Record<string, PhotoFigureSpec> = {
  templates: {
    kicker: "Three skeletons",
    title: "Name the family, then pour",
    slides: [
      {
        src: "/learn/figure-template-sour.webp",
        alt: "A citrus sour cocktail in a coupe glass",
        label: "Sour",
        note: "2 · 1 · 1 spirit, citrus, sweet",
      },
      {
        src: "/learn/figure-template-old-fashioned.webp",
        alt: "An Old Fashioned in a rocks glass with a large ice cube",
        label: "Old fashioned",
        note: "Spirit + sugar + bitters + ice",
      },
      {
        src: "/learn/figure-template-highball.webp",
        alt: "A highball cocktail with ice and soda in a tall glass",
        label: "Highball",
        note: "Spirit + packed ice + cold fizz",
      },
    ],
  },
  "home-kit": {
    kicker: "The kit",
    title: "Five tools cover almost every MixWise method",
    slides: [
      {
        src: "/learn/figure-kit-shaker.webp",
        alt: "Stainless steel Boston shaker on a kitchen counter",
        label: "Shaker",
        note: "Chill, dilute, and blend — tin on tin",
      },
      {
        src: "/learn/figure-kit-jigger.webp",
        alt: "Stainless steel double jigger on a kitchen counter",
        label: "Jigger",
        note: "Accurate pours beat free-pour guessing",
      },
      {
        src: "/learn/figure-kit-strainer.webp",
        alt: "Hawthorne cocktail strainer on a kitchen counter",
        label: "Strainer",
        note: "Hold back ice for a clean pour",
      },
      {
        src: "/learn/figure-kit-barspoon.webp",
        alt: "Twisted bar spoon on a kitchen counter",
        label: "Barspoon",
        note: "Stir, layer, and reach the bottom of the glass",
      },
      {
        src: "/learn/figure-kit-peeler.webp",
        alt: "Citrus peeler on a kitchen counter",
        label: "Peeler",
        note: "Thin peels for garnish and express",
      },
    ],
  },
  "label-reading": {
    kicker: "Shelf scan",
    title: "Category and proof before adjectives",
    slides: [
      {
        src: "/learn/spirit-labels-intro.webp",
        alt: "Evan Williams bottled-in-bond and standard bourbon labels side by side",
        label: "Find the category",
        note: "Bonded · straight · bourbon",
      },
      {
        src: "/learn/spirit-labels-whiskey.webp",
        alt: "Wild Turkey Rare Breed label with barrel proof and Kentucky straight bourbon whiskey",
        label: "Read the proof",
        note: "ABV · batch · strength",
      },
    ],
  },
  "age-on-label": {
    kicker: "Age on the label",
    title: "A printed age is a floor, not an average",
    slides: [
      {
        src: "/learn/spirit-labels-scotch.webp",
        alt: "Laphroaig bottle and tube showing Aged 10 Years and Islay single malt Scotch whisky",
        label: "“10 Years”",
        note: "Youngest whisky in the bottle is ≥10",
      },
    ],
  },
  "whiskey-drinks": {
    kicker: "Whiskey templates",
    title: "Three glasses that teach the category",
    slides: [
      {
        src: "/learn/whiskey-deep-dive.webp",
        alt: "An Old Fashioned in a rocks glass with a large ice cube and orange peel",
        label: "Old Fashioned",
        note: "Spirit + sugar + bitters — bourbon or rye",
      },
      {
        src: "/learn/learn-whiskey-manhattan.webp",
        alt: "A Manhattan in a coupe with a cherry on a pick",
        label: "Manhattan",
        note: "Whiskey + sweet vermouth — rye keeps it dry",
      },
      {
        src: "/learn/learn-whiskey-sour.webp",
        alt: "A Whiskey Sour served up in a coupe with an egg-white foam head",
        label: "Whiskey Sour",
        note: "Spirit + lemon + sweet — shake hard",
      },
    ],
  },
  "gin-drinks": {
    kicker: "Gin templates",
    title: "Three glasses that teach the category",
    slides: [
      {
        src: "/learn/spirit-primer-gin.webp",
        alt: "A gin and tonic in a highball with packed ice and lime",
        label: "G&T",
        note: "Highball — tonic reveals the gin",
      },
      {
        src: "/learn/method-stir.webp",
        alt: "Mixing glass with ice and a bar spoon for stirred drinks",
        label: "Martini / Negroni",
        note: "Stir — vermouth and bitter need silk",
      },
      {
        src: "/learn/equal-parts-bitters.webp",
        alt: "A Negroni in a rocks glass with orange peel",
        label: "Negroni",
        note: "Equal parts — gin must still read",
      },
    ],
  },
  "rum-drinks": {
    kicker: "Rum templates",
    title: "Four glasses that teach the category",
    slides: [
      {
        src: "/learn/spirit-primer-rum.webp",
        alt: "A Daiquiri in a coupe",
        label: "Daiquiri",
        note: "Clean rum + lime + sugar",
      },
      {
        src: "/learn/technique-muddle.webp",
        alt: "Muddling mint for a Mojito-style build",
        label: "Mojito",
        note: "Press mint — don’t shred",
      },
      {
        src: "/learn/method-build.webp",
        alt: "A built highball with ice and lengthener",
        label: "Rum highball",
        note: "Ginger beer · packed ice",
      },
      {
        src: "/learn/figure-rum-mai-tai.webp",
        alt: "A Mai Tai in a rocks glass with ice and lime",
        label: "Mai Tai",
        note: "Aged frame, then a funky fraction",
      },
    ],
  },
  "rum-history": {
    kicker: "In the glass",
    title: "History that changes what you pour",
    slides: [
      {
        src: "/learn/figure-rum-floridita.webp",
        alt: "El Floridita neon sign in Havana reading La cuna del daiquiri",
        label: "Two Daiquiri chapters",
        note: "A camp sour, then a Havana bar that taught the shake",
      },
      {
        src: "/learn/figure-rum-floridita-bar.webp",
        alt: "Interior of El Floridita bar in Havana",
        label: "Havana years",
        note: "Prohibition tourism popularized the drink — it did not invent lime and rum",
      },
      {
        src: "/learn/figure-rum-navy.webp",
        alt: "Royal Navy sailors lining up for the daily rum ration aboard HMS King George V in 1940",
        label: "Navy weight",
        note: "Proof that holds ginger and sugar — not a gunpowder campfire story",
      },
    ],
  },
  "ice-types": {
    kicker: "Ice is an ingredient",
    title: "Size changes melt — pick on purpose",
    slides: [
      {
        src: "/learn/figure-ice-large-cube.webp",
        alt: "A large clear ice cube in a rocks glass",
        label: "Large cube",
        note: "Slow melt · stir, rocks",
      },
      {
        src: "/learn/figure-ice-cracked.webp",
        alt: "Cracked cocktail ice shards on a tray",
        label: "Cracked",
        note: "Fast chill · hard shake",
      },
      {
        src: "/learn/figure-ice-crushed.webp",
        alt: "Crushed ice packed in a metal julep cup",
        label: "Crushed",
        note: "Texture · swizzle, julep",
      },
    ],
  },
  "shake-or-stir": {
    kicker: "The rule",
    title: "Cloudy or acidic? Shake. All spirit? Stir.",
    slides: [
      {
        src: "/learn/figure-method-shake.webp",
        alt: "Stainless steel cocktail shaker on a kitchen counter",
        label: "Shake",
        note: "Citrus, egg, dairy, anything cloudy",
      },
      {
        src: "/learn/figure-method-stir.webp",
        alt: "Mixing glass with ice and a bar spoon",
        label: "Stir",
        note: "All spirits — clear, dense, silky",
      },
    ],
  },
  "vermouth-care": {
    kicker: "Modifiers",
    title: "Vermouth is wine. Treat it that way.",
    slides: [
      {
        src: "/learn/figure-vermouth-fridge.webp",
        alt: "Unlabeled vermouth bottles chilling on a refrigerator shelf",
        label: "Do this",
        note: "Refrigerate as soon as you open it. Plan to finish the bottle in a few weeks.",
        tone: "good",
      },
      {
        src: "/learn/figure-vermouth-warm-cart.webp",
        alt: "Vermouth bottles left out on a warm wooden bar cart",
        label: "Skip this",
        note: "Leaving it out oxidizes the wine — Manhattans turn dusty and flat.",
        tone: "bad",
      },
    ],
  },
  "garnish-citrus": {
    kicker: "Citrus",
    title: "Perfume the surface — don’t juice the glass",
    slides: [
      {
        src: "/learn/figure-garnish-thin-peel.webp",
        alt: "A thin strip of orange peel with minimal pith on a counter",
        label: "Thin peel",
        note: "Wide strip, little white pith — oils without bitterness.",
      },
      {
        src: "/learn/figure-garnish-express.webp",
        alt: "Expressing citrus peel oils over a coupe cocktail",
        label: "Pinch over the glass",
        note: "Squeeze skin-side down so oils mist the surface, not the liquid.",
      },
      {
        src: "/learn/figure-garnish-oils.webp",
        alt: "Old Fashioned with an orange twist on the rim",
        label: "Oils on the surface",
        note: "Optional rim wipe, then drop or discard. The nose gets the first hit.",
      },
    ],
  },
  "garnish-mint": {
    kicker: "Herbs",
    title: "Wake the oils — don’t shred the leaves",
    slides: [
      {
        src: "/learn/figure-garnish-mint-slap.webp",
        alt: "A highball with a fresh upright mint sprig garnish",
        label: "Do this",
        note: "Slap gently, then place so the drinker smells mint on the first sip.",
        tone: "good",
      },
      {
        src: "/learn/figure-garnish-mint-shred.webp",
        alt: "Mint being shredded and over-muddled in a glass",
        label: "Skip this",
        note: "Shredding releases grassy bitterness — it tastes like lawn.",
        tone: "bad",
      },
    ],
  },
  "garnish-none": {
    kicker: "Restraint",
    title: "Sometimes the cleanest finish is nothing",
    slides: [
      {
        src: "/learn/figure-garnish-none.webp",
        alt: "An ungarnished coupe cocktail on a wooden table",
        label: "No garnish",
        note: "Equal-parts and spirit-forward drinks often read clearer without clutter.",
      },
    ],
  },
};

function NaArchitectureDiagram() {
  return (
    <div className="learn-na-grid">
      {[
        { label: "Acid", sub: "Citrus, shrub", color: OLIVE },
        { label: "Sweet", sub: "Syrup, fruit", color: "#C4A574" },
        { label: "Bitter / spice", sub: "Tea, ginger, chile", color: TERRACOTTA },
        { label: "Texture", sub: "Shake, soda, ice", color: FOREST },
      ].map((p) => (
        <div key={p.label} className="learn-na-grid__item">
          <div className="learn-na-grid__swatch" style={{ background: p.color }} />
          <PanelLabel>{p.label}</PanelLabel>
          <PanelNote>{p.sub}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function ShakeHowDiagram() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { n: "1", t: "Pack the tin", d: "Ice to the brim — sparse ice melts and warms." },
        { n: "2", t: "Shake hard", d: "10–15 seconds, loud rattle, until the tin hurts." },
        { n: "3", t: "Strain promptly", d: "Fine-strain if it’s served up." },
      ].map((s) => (
        <div key={s.n} className="text-center px-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-2">
            {s.n}
          </span>
          <PanelLabel>{s.t}</PanelLabel>
          <PanelNote>{s.d}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function StirHowDiagram() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { n: "1", t: "Pack the glass", d: "Hard cubes, full mixing glass." },
        { n: "2", t: "Smooth circles", d: "Spoon on the glass 20–30 seconds — don’t churn air." },
        { n: "3", t: "Taste for silk", d: "Heat gone, still concentrated. Then strain." },
      ].map((s) => (
        <div key={s.n} className="text-center px-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-2">
            {s.n}
          </span>
          <PanelLabel>{s.t}</PanelLabel>
          <PanelNote>{s.d}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function BuildOrderDiagram() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3">
      {[
        { n: "1", t: "Ice", d: "Pack the serving glass." },
        { n: "2", t: "Spirit + modifiers", d: "Measure. This is still a recipe." },
        { n: "3", t: "Lengthener last", d: "Cold soda or ginger beer. Brief stir." },
      ].map((s) => (
        <div key={s.n} className="flex-1 text-center py-2">
          <span className="font-display text-2xl text-terracotta">{s.n}</span>
          <PanelLabel>{s.t}</PanelLabel>
          <PanelNote>{s.d}</PanelNote>
        </div>
      ))}
    </div>
  );
}

function LayerDensityDiagram() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <Svg viewBox="0 0 100 140" className="w-28 h-auto shrink-0">
        <path
          d="M30 12h40v100c0 8-8 16-20 16s-20-8-20-16V12Z"
          fill={CREAM}
          stroke={FOREST}
          strokeWidth="2"
        />
        <path d="M32 86h36v24c0 6-6 12-18 12s-18-6-18-12V86Z" fill="#7A3E1C" />
        <rect x="32" y="58" width="36" height="28" fill={TERRACOTTA} />
        <rect x="32" y="30" width="36" height="28" fill="#E8C85A" />
        <path d="M78 28c8 6 8 16 0 22" stroke={FOREST} strokeWidth="1.8" />
        <path d="M74 24h12" stroke={FOREST} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
      <ol className="space-y-2 text-sm text-charcoal/80">
        <li>
          <span className="font-semibold text-terracotta">Bottom · densest.</span> Syrups and sweet cordials.
        </li>
        <li>
          <span className="font-semibold text-terracotta">Middle.</span> Liqueurs, citrus bases, sours.
        </li>
        <li>
          <span className="font-semibold text-terracotta">Top · lightest.</span> High-proof spirits, dry wine, cream — spoon pour.
        </li>
      </ol>
    </div>
  );
}

function MuddlePressDiagram() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-olive/40 bg-olive/10 p-4 text-center">
        <Svg viewBox="0 0 100 80" className="w-28 mx-auto h-auto mb-2">
          <rect x="30" y="8" width="12" height="36" rx="3" fill={FOREST} />
          <path d="M24 44h24v8H24z" fill={FOREST} />
          <ellipse cx="50" cy="64" rx="28" ry="10" fill={MIST} stroke={FOREST} strokeWidth="1.6" />
          <path d="M38 60c4 4 12 4 16 0" stroke={OLIVE} strokeWidth="2" />
        </Svg>
        <PanelLabel>Press</PanelLabel>
        <PanelNote>A few firm pushes — perfume, not pesto</PanelNote>
      </div>
      <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 text-center">
        <Svg viewBox="0 0 100 80" className="w-28 mx-auto h-auto mb-2">
          <rect x="44" y="4" width="12" height="40" rx="3" fill={FOREST} transform="rotate(18 50 24)" />
          <ellipse cx="50" cy="64" rx="28" ry="10" fill={MIST} stroke={FOREST} strokeWidth="1.6" />
          <path d="M32 58l8 8M48 54l4 12M62 58l-6 10" stroke={TERRACOTTA} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
        <PanelLabel>Don’t shred</PanelLabel>
        <PanelNote>Chlorophyll bitterness — tastes like lawn</PanelNote>
      </div>
    </div>
  );
}

const DIAGRAMS: Record<string, DiagramSpec> = {
  "four-parts": {
    kicker: "Balance",
    title: "Strong, sour, sweet, weak",
    node: <FourPartsDiagram />,
  },
  "express-peel": {
    kicker: "Garnish",
    title: "Perfume the surface — don’t juice the glass",
    node: <ExpressPeelDiagram />,
  },
  "agave-ages": {
    kicker: "Agave",
    title: "Oak time changes what the bottle can do",
    node: <AgaveAgesDiagram />,
  },
  "whiskey-styles": {
    kicker: "Whiskey",
    title: "Four styles — pick for the template, not the shelf flex",
    node: <WhiskeyStylesDiagram />,
  },
  "gin-styles": {
    kicker: "Gin",
    title: "Styles that change Martini and Negroni behavior",
    node: <GinStylesDiagram />,
  },
  "rum-styles": {
    kicker: "Rum",
    title: "Jobs in the glass — clean, aged, funky, agricole",
    node: <RumStylesDiagram />,
  },
  "rum-production": {
    kicker: "How rum is made",
    title: "Five levers from cane to glass",
    node: <RumProductionDiagram />,
  },
  "rum-tasting-protocol": {
    kicker: "How to taste",
    title: "Nose → sip → two words → name",
    node: <RumTastingProtocolDiagram />,
  },
  "equal-parts-grid": {
    kicker: "Equal parts",
    title: "Three audible ingredients — dilution still required",
    node: <EqualPartsDiagram />,
  },
  "batching-map": {
    kicker: "Batching",
    title: "What to pre-mix — and what to protect",
    node: <BatchingMapDiagram />,
  },
  "citrus-syrup": {
    kicker: "Citrus & syrups",
    title: "Acid aroma and sweetener strength",
    node: <CitrusSyrupDiagram />,
  },
  "glassware-trio": {
    kicker: "Glassware",
    title: "Three shapes cover most home drinks",
    node: <GlasswareTrioDiagram />,
  },
  "swap-map": {
    kicker: "Swaps",
    title: "Keep the template jobs — change one knob",
    node: <SwapMapDiagram />,
  },
  "label-trust": {
    kicker: "Labels",
    title: "Regulated words vs decoration on the neck tag",
    node: <LabelTrustDiagram />,
  },
  "whiskey-labels": {
    kicker: "American whiskey",
    title: "Words with rules vs words that sell",
    node: <WhiskeyLabelDiagram />,
  },
  "agave-labels": {
    kicker: "Agave",
    title: "Four lines that decide your Margarita",
    node: <AgaveLabelDiagram />,
  },
  "scotch-labels": {
    kicker: "Scotch",
    title: "Category, age, and region — what each claim means",
    node: <ScotchLabelDiagram />,
  },
  "na-architecture": {
    kicker: "Zero-proof",
    title: "Same jobs as a cocktail — rebuild them on purpose",
    node: <NaArchitectureDiagram />,
  },
  "shake-how": {
    kicker: "How to shake",
    title: "Pack, rattle, stop when it hurts",
    node: <ShakeHowDiagram />,
  },
  "stir-how": {
    kicker: "How to stir",
    title: "Full glass, smooth circles, taste for silk",
    node: <StirHowDiagram />,
  },
  "build-order": {
    kicker: "How to build",
    title: "Ice, then spirit, lengthener last",
    node: <BuildOrderDiagram />,
  },
  "layer-density": {
    kicker: "How to layer",
    title: "Heavy first, then a slow spoon pour",
    node: <LayerDensityDiagram />,
  },
  "muddle-press": {
    kicker: "How to muddle",
    title: "Press herbs. Pulp fruit. Never shred mint.",
    node: <MuddlePressDiagram />,
  },
};

export function LearnFigure({
  id,
  /** When true (section embed), skip duplicate kicker/title — section heading owns the title. */
  embedded = false,
}: {
  id: string;
  embedded?: boolean;
}) {
  const photo = PHOTO_FIGURES[id];
  if (photo) {
    return (
      <figure className="learn-figure learn-figure--photos">
        {!embedded ? (
          <header className="learn-figure__header learn-figure__header--flat">
            <figcaption className="learn-figure__title">{photo.title}</figcaption>
          </header>
        ) : (
          <figcaption className="sr-only">{photo.title}</figcaption>
        )}
        <LearnPhotoPager slides={photo.slides} label={photo.title} />
        {photo.note ? <p className="learn-figure__note">{photo.note}</p> : null}
      </figure>
    );
  }

  const spec = DIAGRAMS[id];
  if (!spec) return null;

  return (
    <figure className="learn-figure learn-figure--diagram">
      {!embedded ? (
        <header className="learn-figure__header learn-figure__header--flat">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
            {spec.kicker}
          </p>
          <figcaption className="learn-figure__title">{spec.title}</figcaption>
        </header>
      ) : (
        <figcaption className="sr-only">{spec.title}</figcaption>
      )}
      <div className="learn-figure__body learn-figure__body--flat">{spec.node}</div>
      {spec.note ? <p className="learn-figure__note">{spec.note}</p> : null}
    </figure>
  );
}

export const LEARN_FIGURE_IDS = [...Object.keys(PHOTO_FIGURES), ...Object.keys(DIAGRAMS)];

export function hasLearnPhotoFigure(id: string): boolean {
  return Boolean(PHOTO_FIGURES[id]);
}
