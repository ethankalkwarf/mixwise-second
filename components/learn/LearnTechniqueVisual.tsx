/**
 * Lightweight instructional diagrams for technique pages.
 * SVG stills — clear teaching beats without stock-photo clutter.
 */

const VISUALS: Record<
  string,
  { steps: string[]; caption: string }
> = {
  "dry-shake": {
    caption: "Foam first, chill second",
    steps: ["Shake without ice", "Open · add ice", "Shake again · strain"],
  },
  "fine-strain": {
    caption: "Two strainers, one smooth pour",
    steps: ["Hawthorne over tin", "Fine mesh under", "Catch chips & pulp"],
  },
  express: {
    caption: "Oils on the surface, not juice in the glass",
    steps: ["Cut a thin peel", "Squeeze oils over drink", "Optional wipe on rim"],
  },
  muddle: {
    caption: "Press to release — don’t shred",
    steps: ["Add herbs or fruit", "Press gently 3–4×", "Build or shake next"],
  },
  swizzle: {
    caption: "Spin until the glass frosts",
    steps: ["Pack crushed ice", "Spin stick in palms", "Top with more ice"],
  },
  rinse: {
    caption: "Coat, don’t drown",
    steps: ["Pour a splash in glass", "Tilt to coat sides", "Discard excess"],
  },
  float: {
    caption: "Slow pour over a spoon",
    steps: ["Base drink ready", "Spoon on the surface", "Pour slowly onto spoon"],
  },
  layer: {
    caption: "Density order, slow hands",
    steps: ["Heaviest liquid first", "Spoon on the surface", "Lighter liquid last"],
  },
  build: {
    caption: "Made in the glass you’ll drink from",
    steps: ["Ice in the glass", "Spirit + modifiers", "Lengthener last · brief stir"],
  },
};

export function LearnTechniqueVisual({ slug, label }: { slug: string; label: string }) {
  const visual = VISUALS[slug];
  if (!visual) return null;

  return (
    <figure className="rounded-3xl border border-mist bg-white overflow-hidden">
      <div className="bg-forest px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive font-bold mb-1">
          How it looks
        </p>
        <figcaption className="font-display text-xl font-bold text-cream capitalize">
          {label}: {visual.caption}
        </figcaption>
      </div>
      <ol className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-mist">
        {visual.steps.map((step, index) => (
          <li key={step} className="px-5 py-5 sm:px-4 text-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta font-mono text-sm font-bold mb-3">
              {index + 1}
            </span>
            <p className="text-sm font-medium text-charcoal leading-snug">{step}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
