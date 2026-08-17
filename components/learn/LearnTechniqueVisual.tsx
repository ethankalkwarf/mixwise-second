import type { ReactNode } from "react";
import { formatTechniqueLabel } from "@/lib/cocktailTechniqueGlossary";

const FOREST = "#3A4D39";
const TERRACOTTA = "#BC5A45";
const OLIVE = "#8A9A5B";
const MIST = "#E6EBE4";
const CREAM = "#F9F7F2";

const VISUALS: Record<
  string,
  { steps: string[]; caption: string; icons: ReactNode[] }
> = {
  "dry-shake": {
    caption: "Foam first, chill second",
    steps: ["Shake without ice", "Open · add ice", "Shake again · strain"],
    icons: [
      <TinIcon key="a" iced={false} />,
      <TinIcon key="b" iced />,
      <StrainIcon key="c" />,
    ],
  },
  "fine-strain": {
    caption: "Two strainers, one smooth pour",
    steps: ["Hawthorne over tin", "Fine mesh under", "Catch chips & pulp"],
    icons: [<HawthorneIcon key="a" />, <MeshIcon key="b" />, <CoupeIcon key="c" />],
  },
  express: {
    caption: "Oils on the surface, not juice in the glass",
    steps: ["Cut a thin peel", "Squeeze oils over drink", "Optional wipe on rim"],
    icons: [<PeelIcon key="a" />, <MistIcon key="b" />, <RimIcon key="c" />],
  },
  muddle: {
    caption: "Press to release — don’t shred",
    steps: ["Add herbs or fruit", "Press gently 3–4×", "Build or shake next"],
    icons: [<LeafIcon key="a" />, <PressIcon key="b" />, <BuildIcon key="c" />],
  },
  swizzle: {
    caption: "Spin until the glass frosts",
    steps: ["Pack crushed ice", "Spin stick in palms", "Top with more ice"],
    icons: [<CrushedIcon key="a" />, <SpinIcon key="b" />, <FrostIcon key="c" />],
  },
  rinse: {
    caption: "Coat, don’t drown",
    steps: ["Pour a splash in glass", "Tilt to coat sides", "Discard excess"],
    icons: [<SplashIcon key="a" />, <TiltIcon key="b" />, <DumpIcon key="c" />],
  },
  float: {
    caption: "Slow pour over a spoon",
    steps: ["Base drink ready", "Spoon on the surface", "Pour slowly onto spoon"],
    icons: [<CoupeIcon key="a" />, <SpoonIcon key="b" />, <FloatIcon key="c" />],
  },
  layer: {
    caption: "Density order, slow hands",
    steps: ["Heaviest liquid first", "Spoon on the surface", "Lighter liquid last"],
    icons: [<HeavyIcon key="a" />, <SpoonIcon key="b" />, <BandsIcon key="c" />],
  },
  build: {
    caption: "Made in the glass you’ll drink from",
    steps: ["Ice in the glass", "Spirit + modifiers", "Lengthener last · brief stir"],
    icons: [<IceGlassIcon key="a" />, <JiggerIcon key="b" />, <FizzIcon key="c" />],
  },
};

function TinIcon({ iced }: { iced: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <rect x="14" y="8" width="20" height="32" rx="5" fill={MIST} stroke={FOREST} strokeWidth="2" />
      {iced ? (
        <>
          <rect x="18" y="16" width="6" height="6" rx="1" fill="#C9D7E6" />
          <rect x="26" y="20" width="6" height="6" rx="1" fill="#C9D7E6" />
        </>
      ) : (
        <ellipse cx="24" cy="24" rx="6" ry="8" fill={CREAM} stroke={FOREST} strokeWidth="1.2" />
      )}
    </svg>
  );
}

function StrainIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M12 16h24c-2 12-6 20-12 22S14 28 12 16Z" fill="#E8F0C8" stroke={FOREST} strokeWidth="2" />
      <path d="M16 14l16 4" stroke={OLIVE} strokeWidth="1.5" />
    </svg>
  );
}

function HawthorneIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <circle cx="24" cy="26" r="12" fill={MIST} stroke={FOREST} strokeWidth="2" />
      <path d="M16 26h16M24 18v16" stroke={FOREST} strokeWidth="1.2" />
      <path d="M8 22h8" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MeshIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <circle cx="24" cy="24" r="13" fill={CREAM} stroke={FOREST} strokeWidth="2" />
      <path d="M14 18h20M14 24h20M14 30h20M18 14v20M24 14v20M30 14v20" stroke={FOREST} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function CoupeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M12 12h24c-1 10-5 16-12 18S13 22 12 12Z" fill="#E8F0C8" stroke={FOREST} strokeWidth="2" />
      <path d="M24 30v10" stroke={FOREST} strokeWidth="2" />
      <ellipse cx="24" cy="42" rx="8" ry="2.5" stroke={FOREST} strokeWidth="1.6" fill={CREAM} />
    </svg>
  );
}

function PeelIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M10 30c8-18 28-18 28 0-8 8-20 8-28 0Z" fill="#E8C85A" stroke={FOREST} strokeWidth="1.8" />
    </svg>
  );
}

function MistIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <circle cx="16" cy="16" r="2" fill={OLIVE} />
      <circle cx="24" cy="12" r="1.5" fill={OLIVE} />
      <circle cx="32" cy="16" r="2" fill={OLIVE} />
      <ellipse cx="24" cy="34" rx="12" ry="6" fill="#E8F0C8" stroke={FOREST} strokeWidth="1.8" />
    </svg>
  );
}

function RimIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <ellipse cx="24" cy="22" rx="14" ry="6" stroke={TERRACOTTA} strokeWidth="2" fill="none" />
      <path d="M12 24c2 10 6 16 12 16s10-6 12-16" stroke={FOREST} strokeWidth="1.8" fill="#E8F0C8" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M24 8c12 8 14 22 0 32C10 30 12 16 24 8Z" fill={OLIVE} stroke={FOREST} strokeWidth="1.6" />
      <path d="M24 12v24" stroke={FOREST} strokeWidth="1.2" />
    </svg>
  );
}

function PressIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <rect x="20" y="6" width="8" height="22" rx="2" fill={FOREST} />
      <path d="M16 28h16v6H16z" fill={FOREST} />
      <ellipse cx="24" cy="40" rx="14" ry="5" fill={MIST} stroke={FOREST} strokeWidth="1.6" />
    </svg>
  );
}

function BuildIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M16 8h16v30c0 3-3 5-8 5s-8-2-8-5V8Z" fill="#D7EDE4" stroke={FOREST} strokeWidth="2" />
    </svg>
  );
}

function CrushedIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M16 8h16v30c0 3-3 5-8 5s-8-2-8-5V8Z" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
      <circle cx="20" cy="18" r="3" fill="#C9D7E6" />
      <circle cx="28" cy="16" r="3" fill="#C9D7E6" />
      <circle cx="24" cy="26" r="3" fill="#C9D7E6" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M24 8v32" stroke={FOREST} strokeWidth="2" />
      <path d="M16 16c8-6 16-6 20 4" stroke={TERRACOTTA} strokeWidth="1.8" fill="none" />
      <path d="M14 28c8 6 16 6 20-4" stroke={TERRACOTTA} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

function FrostIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M16 8h16v30c0 3-3 5-8 5s-8-2-8-5V8Z" fill="#D7E8F4" stroke={FOREST} strokeWidth="2" />
      <path d="M18 14h12M18 20h12M18 26h12" stroke="white" strokeWidth="1.4" opacity="0.8" />
    </svg>
  );
}

function SplashIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M22 8c0 8 10 10 10 20 0 8-6 14-12 14s-12-6-12-14C8 18 18 16 22 8Z" fill={OLIVE} stroke={FOREST} strokeWidth="1.6" />
    </svg>
  );
}

function TiltIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M10 18l22-8 6 28-22 8-6-28Z" fill="#E8F0C8" stroke={FOREST} strokeWidth="2" />
    </svg>
  );
}

function DumpIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M14 10h20v8H14z" fill={MIST} stroke={FOREST} strokeWidth="1.6" />
      <path d="M24 18v16" stroke={TERRACOTTA} strokeWidth="2" />
      <path d="M18 30l6 8 6-8" stroke={TERRACOTTA} strokeWidth="2" fill="none" />
    </svg>
  );
}

function SpoonIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <ellipse cx="16" cy="16" rx="8" ry="6" fill={MIST} stroke={FOREST} strokeWidth="1.8" />
      <path d="M22 20l18 18" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FloatIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M12 12h24c-1 10-5 16-12 18S13 22 12 12Z" fill="#E8C85A" stroke={FOREST} strokeWidth="2" />
      <path d="M14 16h20" stroke={TERRACOTTA} strokeWidth="3" opacity="0.7" />
    </svg>
  );
}

function HeavyIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <rect x="14" y="8" width="20" height="32" rx="4" fill="#7A3E1C" stroke={FOREST} strokeWidth="2" />
    </svg>
  );
}

function BandsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <rect x="14" y="8" width="20" height="10" fill="#E8C85A" stroke={FOREST} strokeWidth="1.4" />
      <rect x="14" y="18" width="20" height="10" fill={TERRACOTTA} stroke={FOREST} strokeWidth="1.4" />
      <rect x="14" y="28" width="20" height="12" fill="#7A3E1C" stroke={FOREST} strokeWidth="1.4" />
    </svg>
  );
}

function IceGlassIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M16 8h16v30c0 3-3 5-8 5s-8-2-8-5V8Z" fill="#EAF2F6" stroke={FOREST} strokeWidth="2" />
      <rect x="20" y="14" width="8" height="8" rx="1" fill="#C9D7E6" />
      <rect x="24" y="24" width="8" height="8" rx="1" fill="#C9D7E6" />
    </svg>
  );
}

function JiggerIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M24 6l8 14H16L24 6Z" fill={TERRACOTTA} stroke={FOREST} strokeWidth="1.6" />
      <path d="M24 42L14 24h20L24 42Z" fill={OLIVE} stroke={FOREST} strokeWidth="1.6" />
    </svg>
  );
}

function FizzIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 mx-auto" aria-hidden fill="none">
      <path d="M16 8h16v30c0 3-3 5-8 5s-8-2-8-5V8Z" fill="#D7EDE4" stroke={FOREST} strokeWidth="2" />
      <circle cx="22" cy="20" r="2" fill="white" />
      <circle cx="28" cy="28" r="1.5" fill="white" />
      <circle cx="24" cy="34" r="1.5" fill="white" />
    </svg>
  );
}

export function LearnTechniqueVisual({ slug, label }: { slug: string; label: string }) {
  const visual = VISUALS[slug];
  if (!visual) return null;

  return (
    <figure className="rounded-3xl border border-mist bg-white overflow-hidden">
      <div className="bg-forest px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive font-bold mb-1">
          How it looks
        </p>
        <figcaption className="font-sans text-lg font-medium text-cream leading-snug">
          {formatTechniqueLabel(label)}: {visual.caption}
        </figcaption>
      </div>
      <ol className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-mist">
        {visual.steps.map((step, index) => (
          <li key={step} className="px-5 py-5 sm:px-4 text-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-3">
              {index + 1}
            </span>
            <div className="mb-3">{visual.icons[index]}</div>
            <p className="text-sm font-medium text-charcoal leading-snug">{step}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
