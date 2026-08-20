import type { Metadata } from "next";
import { MixwiseTypeMark } from "@/components/brand/MixwiseTypeMark";

export const metadata: Metadata = {
  title: "Brand Preview",
  robots: { index: false, follow: false },
};

export default function BrandPreviewPage() {
  const wedgeFixes: Array<{
    key: string;
    label: string;
    src: string;
    note: string;
  }> = [
    {
      key: "original",
      label: "Your wedge concept",
      src: "/brand/mixwise-wordmark-wedge-original.png",
      note: "Strong placement at x|w. Wedge detail and baseline drop are the main risks at small size.",
    },
    {
      key: "fix-a",
      label: "Fix A — simplified 3-segment wedge",
      src: "/brand/mixwise-wordmark-wedge-fix-a.png",
      note: "Fewer segments, bolder lines, sits in the gap not under the whole word. Palette matched to site.",
    },
    {
      key: "fix-b",
      label: "Fix B — header-optimized accent",
      src: "/brand/mixwise-wordmark-wedge-fix-b-small.png",
      note: "Stripped-down fan for ~24–28px. No rind, no fine illustration — still reads as lime.",
    },
    {
      key: "fix-svg",
      label: "Vector sketch (editable)",
      src: "/brand/mixwise-wordmark-wedge-fix.svg?v=2",
      note: "Shows the structural fix: wedge in negative space, minimal baseline intrusion.",
    },
  ];

  const redesigns: Array<{
    key: string;
    label: string;
    src: string;
    note: string;
  }> = [
    {
      key: "ref",
      label: "Your concept — MixWise, lime x stroke",
      src: "/brand/concepts/wordmark-xw-ligature.png",
      note: "Sans-serif, capital M/W, lime diagonal on x at the mix|wise seam.",
    },
    {
      key: "a",
      label: "Redesign A — lowercase, sage wise half",
      src: "/brand/mixwise-wordmark-redesign-a.png",
      note: "All lowercase, lime wedge on x, wise in lighter sage. No period.",
    },
    {
      key: "b",
      label: "Redesign B — thicker lime stroke only",
      src: "/brand/mixwise-wordmark-redesign-b.png",
      note: "Same idea, bolder lime arm on x; subtle two-tone split.",
    },
    {
      key: "v10",
      label: "v10 vector sketch (editable SVG)",
      src: "/brand/mixwise-wordmark-v10-concept.svg?v=2",
      note: "Rough system-font sketch — shows structure, not final typography.",
    },
  ];

  const versions: Array<{
    key: string;
    label: string;
    forestSrc: string;
    creamSrc: string;
  }> = [
    {
      key: "v5b",
      label: "v5b — x/w gap + leaf period",
      forestSrc: "/brand/mixwise-wordmark-v5b-forest.png",
      creamSrc: "/brand/mixwise-wordmark-v5b-cream.png",
    },
    {
      key: "v6",
      label: "v6 — intermediate join (check)",
      forestSrc: "/brand/mixwise-wordmark-v6-forest.png",
      creamSrc: "/brand/mixwise-wordmark-v6-cream.png",
    },
    {
      key: "v7",
      label: "v7 — x/w gap + lime period",
      forestSrc: "/brand/mixwise-wordmark-v7-forest.png",
      creamSrc: "/brand/mixwise-wordmark-v7-cream.png",
    },
    {
      key: "v8",
      label: "v8 — thin arch bridge + lime period",
      forestSrc: "/brand/mixwise-wordmark-v8-forest.png",
      creamSrc: "/brand/mixwise-wordmark-v8-cream.png",
    },
    {
      key: "v9",
      label: "v9 — thicker fused ligature + lime period",
      forestSrc: "/brand/mixwise-wordmark-v9-forest.png",
      creamSrc: "/brand/mixwise-wordmark-v9-cream.png",
    },
  ];

  return (
    <div className="min-h-screen bg-cream py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta mb-3">
            Brand exploration
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-4">
            mixwise
          </h1>
          <p className="text-lg text-sage max-w-2xl">
            Lime lockup: same height as the e, white inner ring. Saved as
            <code className="text-forest">/brand/mixwise-lockup.svg</code> and
            applied sitewide. App icon is the lime on cream.
          </p>
        </header>

        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-sage mb-2">
              Lime = height of the e
            </p>
            <p className="text-sm text-sage max-w-3xl">
              Sized from the real ink box of “e” (not 1ex guesses), baseline-shifted
              so top/bottom match the letter. White ring between rind and flesh is
              back.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <figure className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
              <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                Live lockup
              </figcaption>
              <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                <MixwiseTypeMark />
              </div>
            </figure>
            <figure className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
              <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                From your screenshot (corrected)
              </figcaption>
              <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-lockup-lime-eheight.png"
                  alt="mixwise with lime sized to the e"
                  className="w-full max-w-md h-16 object-contain"
                />
              </div>
            </figure>
          </div>

          <div className="rounded-3xl border border-mist overflow-hidden shadow-soft mb-8">
            <p className="text-xs uppercase tracking-wider text-sage px-6 pt-6 pb-4 bg-white border-b border-mist">
              Navbar (~28px) + favicon
            </p>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-mist bg-cream">
              <div className="px-8 py-8 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-sage">
                  Header size
                </span>
                <MixwiseTypeMark size="sm" />
              </div>
              <div className="px-8 py-8 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-sage">
                  Favicon
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon.svg"
                  alt="MixWise lime favicon"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-sage mb-2">
              v8 without the top arch
            </p>
            <p className="text-sm text-sage max-w-3xl">
              The broken scribble was a failed custom-path sketch — ignore it. Real
              comparison is v8 (custom ligature + hairline) vs the same serif
              wordmark with a normal x and w, plus the lime period. No fake join.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <figure className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
              <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                v8 — current (arch on)
              </figcaption>
              <p className="text-sm text-sage/90 mb-6">
                Thin hairline closes a triangle at the top of x|w. That&apos;s the
                bit that felt fussy.
              </p>
              <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-v8-forest.png"
                  alt="v8 with top arch"
                  className="w-full max-w-sm h-16 object-contain"
                />
              </div>
            </figure>
            <figure className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft">
              <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                Without the arch — real type
              </figcaption>
              <p className="text-sm text-sage/90 mb-6">
                Same Georgia serif, two-tone mix / wise, lime period. x and w are
                normal letters — no custom ligature, so no hairline to remove.
              </p>
              <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                <MixwiseTypeMark />
              </div>
            </figure>
          </div>

          <div className="rounded-3xl border border-mist overflow-hidden shadow-soft">
            <p className="text-xs uppercase tracking-wider text-sage px-6 pt-6 pb-4 bg-white border-b border-mist">
              Navbar height (~28px)
            </p>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-mist bg-cream">
              <div className="px-8 py-8 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-sage">v8</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-v8-forest.png"
                  alt="v8 at navbar size"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="px-8 py-8 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-sage">
                  No arch
                </span>
                <MixwiseTypeMark size="sm" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-sage mb-2">
              Wedge fix — how I&apos;d refine your concept
            </p>
            <ul className="text-sm text-sage max-w-3xl space-y-1 list-disc list-inside">
              <li>Keep the wedge in the x|w gap only — don&apos;t let it hang below the whole word</li>
              <li>Simplify to 3 segments max; drop rind detail at header size</li>
              <li>Use site palette (forest #3A4D39, lime #A4B86A) not near-black green</li>
              <li>Two assets: full detail for marketing, minimal fan for navbar</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {wedgeFixes.map((w) => (
              <figure
                key={w.key}
                className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft"
              >
                <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                  {w.label}
                </figcaption>
                <p className="text-sm text-sage/90 mb-6">{w.note}</p>
                <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.src}
                    alt={w.label}
                    className="w-full max-w-sm h-16 object-contain"
                  />
                </div>
              </figure>
            ))}
          </div>

          <div className="rounded-3xl border border-mist overflow-hidden shadow-soft mb-10">
            <p className="text-xs uppercase tracking-wider text-sage px-6 pt-6 pb-4 bg-white border-b border-mist">
              Size test — original vs fix A vs fix B at navbar height (~28px)
            </p>
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-mist bg-cream">
              {[
                { label: "Original", src: "/brand/mixwise-wordmark-wedge-original.png" },
                { label: "Fix A", src: "/brand/mixwise-wordmark-wedge-fix-a.png" },
                { label: "Fix B", src: "/brand/mixwise-wordmark-wedge-fix-b-small.png" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="px-6 py-8 flex flex-col items-center gap-4"
                >
                  <span className="text-[10px] uppercase tracking-wider text-sage">
                    {item.label}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={`${item.label} at navbar size`}
                    className="h-7 w-auto object-contain"
                  />
                  <span className="text-[10px] text-sage/70">28px tall</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-sage mb-2">
              Alternate direction — identifier in the x
            </p>
            <p className="text-sm text-sage max-w-3xl">
              Drop the garnish period and the x–w bridge. Put the lime accent on one
              diagonal of the x at the mix|wise seam instead — it reads as citrus
              without a separate icon, and it scales cleanly in the navbar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {redesigns.map((r) => (
              <figure
                key={r.key}
                className="rounded-3xl border border-mist bg-white p-6 sm:p-8 shadow-soft"
              >
                <figcaption className="text-xs uppercase tracking-wider text-sage mb-2">
                  {r.label}
                </figcaption>
                <p className="text-sm text-sage/90 mb-6">{r.note}</p>
                <div className="flex items-center justify-center min-h-[120px] bg-cream/40 rounded-2xl px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.src}
                    alt={r.label}
                    className="w-full max-w-sm h-16 object-contain"
                  />
                </div>
              </figure>
            ))}
          </div>

          <div className="rounded-3xl border border-mist overflow-hidden shadow-soft">
            <p className="text-xs uppercase tracking-wider text-sage px-6 pt-6 pb-4 bg-white border-b border-mist">
              Navbar mock — ~28px tall (redesign A vs current v7)
            </p>
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 bg-cream px-8 py-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-mist">
                <span className="text-[10px] uppercase tracking-wider text-sage shrink-0 w-16">
                  New
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-redesign-a.png"
                  alt="Redesign A at navbar size"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="flex-1 bg-cream px-8 py-6 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-wider text-sage shrink-0 w-16">
                  v7
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-v7-forest.png"
                  alt="Current v7 at navbar size"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row border-t border-mist">
              <div className="flex-1 bg-forest px-8 py-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-cream/10">
                <span className="text-[10px] uppercase tracking-wider text-cream/60 shrink-0 w-16">
                  New
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-redesign-a.png"
                  alt="Redesign A on forest"
                  className="h-7 w-auto object-contain brightness-0 invert opacity-90"
                />
              </div>
              <div className="flex-1 bg-forest px-8 py-6 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-wider text-cream/60 shrink-0 w-16">
                  v7
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/mixwise-wordmark-v7-cream.png"
                  alt="Current v7 on forest"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-wider text-sage mb-6">
            Earlier variants (v5b–v9)
          </p>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-wider text-sage">On cream background</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {versions.map((v) => (
              <figure
                key={v.key}
                className="rounded-3xl border border-mist bg-white p-6 sm:p-10 shadow-soft"
              >
                <figcaption className="text-xs uppercase tracking-wider text-sage mb-8">
                  {v.label}
                </figcaption>
                <div className="flex items-center justify-center min-h-[140px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.forestSrc}
                    alt={`${v.label} (forest variant)`}
                    className="w-full max-w-md h-20 object-contain"
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-mist bg-forest p-6 sm:p-10 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-cream/70 mb-6">
            On forest background
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {versions.map((v) => (
              <figure
                key={`${v.key}-forest`}
                className="rounded-2xl bg-white/5 border border-cream/10 p-6 flex flex-col"
              >
                <figcaption className="text-[11px] uppercase tracking-wider text-cream/70 mb-4">
                  {v.label}
                </figcaption>
                <div className="flex items-center justify-center min-h-[96px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.creamSrc}
                    alt={`${v.label} (cream variant)`}
                    className="w-full max-w-md h-14 object-contain"
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
