import type { ReactNode } from "react";

type DiagramSpec = {
  kicker: string;
  title: string;
  note?: string;
  node: ReactNode;
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
function SourGlass() {
  return (
    <Svg viewBox="0 0 120 140" className="w-full max-w-[140px] mx-auto h-auto">
      <path
        d="M28 18h64c-2 22-10 38-32 46C38 56 30 40 28 18Z"
        fill="#E8F0C8"
        stroke={FOREST}
        strokeWidth="2"
      />
      <path d="M34 38h52" stroke={OLIVE} strokeWidth="1.5" opacity="0.7" />
      <path d="M38 52h44" stroke={TERRACOTTA} strokeWidth="1.5" opacity="0.55" />
      <path d="M60 64v40" stroke={FOREST} strokeWidth="2" />
      <path d="M44 118h32" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="60" cy="118" rx="22" ry="5" stroke={FOREST} strokeWidth="2" fill={CREAM} />
    </Svg>
  );
}

function RocksGlass({ fill = "#C47A3A" }: { fill?: string }) {
  return (
    <Svg viewBox="0 0 120 140" className="w-full max-w-[140px] mx-auto h-auto">
      <path
        d="M32 28h56v78c0 6-5 10-12 10H44c-7 0-12-4-12-10V28Z"
        fill={fill}
        stroke={FOREST}
        strokeWidth="2"
      />
      <rect x="42" y="40" width="36" height="36" rx="4" fill="#D9E4F0" stroke={FOREST} strokeWidth="1.5" opacity="0.95" />
      <path d="M48 48h8M70 62h6" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <circle cx="78" cy="36" r="3" fill={OLIVE} />
      <circle cx="86" cy="42" r="2" fill={TERRACOTTA} />
    </Svg>
  );
}

function HighballGlass() {
  return (
    <Svg viewBox="0 0 120 140" className="w-full max-w-[140px] mx-auto h-auto">
      <path
        d="M40 16h40v100c0 6-4 10-10 10H50c-6 0-10-4-10-10V16Z"
        fill="#D7EDE4"
        stroke={FOREST}
        strokeWidth="2"
      />
      <rect x="46" y="28" width="12" height="14" rx="1.5" fill="#C5D4E8" stroke={FOREST} strokeWidth="1" />
      <rect x="62" y="36" width="12" height="14" rx="1.5" fill="#C5D4E8" stroke={FOREST} strokeWidth="1" />
      <rect x="50" y="52" width="12" height="14" rx="1.5" fill="#C5D4E8" stroke={FOREST} strokeWidth="1" />
      <rect x="64" y="64" width="10" height="12" rx="1.5" fill="#C5D4E8" stroke={FOREST} strokeWidth="1" />
      <circle cx="54" cy="84" r="2" fill="white" opacity="0.8" />
      <circle cx="70" cy="92" r="1.5" fill="white" opacity="0.8" />
      <circle cx="58" cy="100" r="1.5" fill="white" opacity="0.7" />
      <path d="M44 110h32" stroke={OLIVE} strokeWidth="3" opacity="0.4" />
    </Svg>
  );
}

function TemplatesDiagram() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5">
      <div>
        <SourGlass />
        <PanelLabel>Sour</PanelLabel>
        <PanelNote>2 · 1 · 1 spirit, citrus, sweet</PanelNote>
      </div>
      <div>
        <RocksGlass />
        <PanelLabel>Old fashioned</PanelLabel>
        <PanelNote>Spirit + sugar + bitters + ice</PanelNote>
      </div>
      <div>
        <HighballGlass />
        <PanelLabel>Highball</PanelLabel>
        <PanelNote>Spirit + packed ice + cold fizz</PanelNote>
      </div>
    </div>
  );
}

function IceTypesDiagram() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5">
      <div>
        <Svg viewBox="0 0 100 110" className="w-full max-w-[120px] mx-auto h-auto">
          <path d="M28 18h44v72c0 5-4 8-9 8H37c-5 0-9-3-9-8V18Z" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
          <rect x="36" y="32" width="28" height="28" rx="3" fill="#C9D7E6" stroke={FOREST} strokeWidth="1.5" />
        </Svg>
        <PanelLabel>Large cube</PanelLabel>
        <PanelNote>Slow melt · stir, rocks</PanelNote>
      </div>
      <div>
        <Svg viewBox="0 0 100 110" className="w-full max-w-[120px] mx-auto h-auto">
          <path d="M28 18h44v72c0 5-4 8-9 8H37c-5 0-9-3-9-8V18Z" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
          <path d="M34 34l12 6 4-10 10 8-2 12 12 2-8 10-12-4-10 8-4-12-10-2z" fill="#C9D7E6" stroke={FOREST} strokeWidth="1.2" />
        </Svg>
        <PanelLabel>Cracked</PanelLabel>
        <PanelNote>Fast chill · hard shake</PanelNote>
      </div>
      <div>
        <Svg viewBox="0 0 100 110" className="w-full max-w-[120px] mx-auto h-auto">
          <path d="M28 18h44v72c0 5-4 8-9 8H37c-5 0-9-3-9-8V18Z" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
          {[
            [36, 30],
            [48, 28],
            [60, 32],
            [40, 42],
            [52, 40],
            [34, 52],
            [46, 50],
            [58, 54],
            [42, 62],
            [54, 64],
            [38, 72],
            [50, 74],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#C9D7E6" stroke={FOREST} strokeWidth="0.8" />
          ))}
        </Svg>
        <PanelLabel>Crushed</PanelLabel>
        <PanelNote>Texture · swizzle, julep</PanelNote>
      </div>
    </div>
  );
}

function ShakeOrStirDiagram() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-mist bg-white p-4">
        <Svg viewBox="0 0 160 100" className="w-full h-auto mb-3">
          <ellipse cx="48" cy="28" rx="16" ry="12" fill="#E8F0C8" stroke={FOREST} strokeWidth="1.8" />
          <path d="M42 22c4-6 12-6 16 2" stroke={OLIVE} strokeWidth="1.5" />
          <rect x="96" y="18" width="36" height="64" rx="6" fill={MIST} stroke={FOREST} strokeWidth="2" />
          <rect x="100" y="14" width="28" height="12" rx="3" fill={FOREST} />
          <path d="M72 40h16" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" />
          <path d="M84 34l8 6-8 6" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
        <PanelLabel>Shake</PanelLabel>
        <PanelNote>Citrus, egg, dairy, anything cloudy</PanelNote>
      </div>
      <div className="rounded-2xl border border-mist bg-white p-4">
        <Svg viewBox="0 0 160 100" className="w-full h-auto mb-3">
          <rect x="28" y="22" width="18" height="50" rx="2" fill="#C4A574" stroke={FOREST} strokeWidth="1.5" />
          <rect x="50" y="18" width="16" height="54" rx="2" fill="#D8C4A0" stroke={FOREST} strokeWidth="1.5" />
          <path
            d="M96 22h32v48c0 8-6 14-16 14s-16-6-16-14V22Z"
            fill="#EAF2F6"
            stroke={FOREST}
            strokeWidth="2"
          />
          <path d="M128 18c8 18 8 40 0 58" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" />
        </Svg>
        <PanelLabel>Stir</PanelLabel>
        <PanelNote>All spirits — clear, dense, silky</PanelNote>
      </div>
    </div>
  );
}

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

function VermouthCareDiagram() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-olive/40 bg-olive/10 p-4">
        <Svg viewBox="0 0 140 90" className="w-full h-auto mb-2">
          <rect x="18" y="12" width="104" height="68" rx="6" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
          <path d="M18 28h104" stroke={FOREST} strokeWidth="1.5" />
          <rect x="36" y="36" width="18" height="36" rx="2" fill="#8B3A2A" stroke={FOREST} strokeWidth="1.2" />
          <rect x="62" y="32" width="16" height="40" rx="2" fill="#D8C4A0" stroke={FOREST} strokeWidth="1.2" />
          <rect x="88" y="38" width="16" height="34" rx="2" fill={TERRACOTTA} stroke={FOREST} strokeWidth="1.2" />
        </Svg>
        <PanelLabel>Fridge after opening</PanelLabel>
        <PanelNote>Weeks, not seasons</PanelNote>
      </div>
      <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4">
        <Svg viewBox="0 0 140 90" className="w-full h-auto mb-2">
          <rect x="20" y="40" width="100" height="10" rx="2" fill="#C4A574" stroke={FOREST} strokeWidth="1.5" />
          <rect x="28" y="18" width="16" height="32" rx="2" fill="#8B3A2A" stroke={FOREST} strokeWidth="1.2" opacity="0.45" />
          <rect x="62" y="14" width="16" height="36" rx="2" fill="#D8C4A0" stroke={FOREST} strokeWidth="1.2" opacity="0.45" />
          <path d="M108 16l8 12-8 4" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" />
        </Svg>
        <PanelLabel>Warm cart</PanelLabel>
        <PanelNote>Oxidizes — dusty Manhattans</PanelNote>
      </div>
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

function HomeKitDiagram() {
  const tools = [
    {
      label: "Shaker",
      node: (
        <Svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto">
          <rect x="18" y="10" width="28" height="22" rx="6" fill={MIST} stroke={FOREST} strokeWidth="2" />
          <rect x="20" y="30" width="24" height="24" rx="4" fill={CREAM} stroke={FOREST} strokeWidth="2" />
        </Svg>
      ),
    },
    {
      label: "Jigger",
      node: (
        <Svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto">
          <path d="M32 8l10 18H22L32 8Z" fill={TERRACOTTA} stroke={FOREST} strokeWidth="1.8" />
          <path d="M32 56L20 34h24L32 56Z" fill={OLIVE} stroke={FOREST} strokeWidth="1.8" />
        </Svg>
      ),
    },
    {
      label: "Strainer",
      node: (
        <Svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto">
          <circle cx="32" cy="34" r="16" fill={MIST} stroke={FOREST} strokeWidth="2" />
          <path d="M20 34h24M32 22v24M24 24l16 20M40 24L24 44" stroke={FOREST} strokeWidth="1.2" />
          <path d="M14 28h8" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
    },
    {
      label: "Barspoon",
      node: (
        <Svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto">
          <path d="M32 8c10 16 10 32 0 48" stroke={FOREST} strokeWidth="2" fill="none" />
          <ellipse cx="32" cy="10" rx="6" ry="4" fill={MIST} stroke={FOREST} strokeWidth="1.5" />
        </Svg>
      ),
    },
    {
      label: "Peeler",
      node: (
        <Svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto">
          <rect x="22" y="8" width="20" height="36" rx="4" fill={MIST} stroke={FOREST} strokeWidth="2" />
          <path d="M28 16v20M36 16v20" stroke={FOREST} strokeWidth="1.5" />
          <rect x="26" y="44" width="12" height="12" rx="2" fill={FOREST} />
        </Svg>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-5 gap-2">
      {tools.map((t) => (
        <div key={t.label}>
          {t.node}
          <PanelLabel>{t.label}</PanelLabel>
        </div>
      ))}
    </div>
  );
}

function NaArchitectureDiagram() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Acid", sub: "Citrus, shrub", color: OLIVE },
        { label: "Sweet", sub: "Syrup, fruit", color: "#C4A574" },
        { label: "Bitter / spice", sub: "Tea, ginger, chile", color: TERRACOTTA },
        { label: "Texture", sub: "Shake, soda, ice", color: FOREST },
      ].map((p) => (
        <div key={p.label} className="rounded-2xl border border-mist p-3 text-center bg-white">
          <div className="mx-auto mb-2 h-2 w-10 rounded-full" style={{ background: p.color }} />
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
      ].map((s, i) => (
        <div key={s.n} className="flex-1 rounded-2xl border border-mist bg-white p-4 text-center">
          <span className="font-display text-2xl text-terracotta">{s.n}</span>
          <PanelLabel>{s.t}</PanelLabel>
          <PanelNote>{s.d}</PanelNote>
          {i < 2 && (
            <p className="hidden sm:block text-terracotta mt-2" aria-hidden>
              →
            </p>
          )}
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
  "home-kit": {
    kicker: "The kit",
    title: "Five tools cover almost every MixWise method",
    node: <HomeKitDiagram />,
  },
  templates: {
    kicker: "Three skeletons",
    title: "Name the family, then pour",
    node: <TemplatesDiagram />,
  },
  "ice-types": {
    kicker: "Ice is an ingredient",
    title: "Size changes melt — pick on purpose",
    node: <IceTypesDiagram />,
  },
  "shake-or-stir": {
    kicker: "The rule",
    title: "Cloudy or acidic? Shake. All spirit? Stir.",
    node: <ShakeOrStirDiagram />,
  },
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
  "vermouth-care": {
    kicker: "Modifiers",
    title: "Vermouth is wine. Treat it that way.",
    node: <VermouthCareDiagram />,
  },
  "agave-ages": {
    kicker: "Agave",
    title: "Oak time changes what the bottle can do",
    node: <AgaveAgesDiagram />,
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

export function LearnFigure({ id }: { id: string }) {
  const spec = DIAGRAMS[id];
  if (!spec) return null;

  return (
    <figure className="rounded-3xl border border-mist bg-cream/50 overflow-hidden">
      <div className="bg-forest px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive font-bold mb-1">
          {spec.kicker}
        </p>
        <figcaption className="font-sans text-lg font-medium text-cream leading-snug">
          {spec.title}
        </figcaption>
      </div>
      <div className="px-4 py-6 sm:px-6">{spec.node}</div>
      {spec.note ? <p className="px-5 pb-5 text-sm text-sage leading-relaxed">{spec.note}</p> : null}
    </figure>
  );
}

export const LEARN_FIGURE_IDS = Object.keys(DIAGRAMS);
