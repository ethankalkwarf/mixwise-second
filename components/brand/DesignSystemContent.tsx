"use client";

import { BrandLogo } from "@/components/common/BrandLogo";
import { Button } from "@/components/common/Button";
import { CopyTextButton } from "@/components/brand/CopyTextButton";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  DESIGN_COLORS,
  DESIGN_RADIUS,
  DESIGN_SHADOWS,
  DESIGN_TYPE,
} from "@/lib/brand/kit";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 [text-wrap:balance] font-display text-3xl leading-tight text-forest sm:text-4xl">
      {children}
    </h2>
  );
}

function ColorSwatch({
  name,
  hex,
  tw,
  role,
}: {
  name: string;
  hex: string;
  tw: string;
  role: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-white">
      <div
        className="h-24 border-b border-mist/60"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg text-forest">{name}</p>
            <p className="font-mono text-xs text-sage">{hex}</p>
          </div>
          <CopyTextButton text={hex} label="Hex" />
        </div>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-terracotta">
          {tw.startsWith("—") ? tw : `bg-${tw} / text-${tw}`}
        </p>
        <p className="text-sm leading-relaxed text-sage">{role}</p>
      </div>
    </div>
  );
}

export function DesignSystemContent() {
  return (
    <div className="bg-cream pb-20 pt-10 sm:pt-14 lg:pb-28">
      <MainContainer className="max-w-5xl">
        <div className="mb-10 sm:mb-14">
          <SectionEyebrow>Internal</SectionEyebrow>
          <h1 className="mb-3 [text-wrap:balance] font-display text-4xl leading-tight text-forest sm:text-5xl">
            Design system
          </h1>
          <p className="max-w-xl [text-wrap:pretty] text-lg leading-relaxed text-sage">
            Botanical Garden tokens and patterns for web and apps. Source of
            truth in code:{" "}
            <code className="rounded bg-mist/60 px-1.5 py-0.5 font-mono text-sm text-forest">
              tailwind.config.js
            </code>
            .
          </p>
        </div>

        {/* Principles */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Principles</SectionEyebrow>
          <SectionTitle>How we build UI</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              "Cream pages, forest type, terracotta for action — botanical, not neon.",
              "Display for headlines, Jost for everything interactive and body.",
              "Mono terracotta eyebrows introduce sections; don’t overuse.",
              "Prefer soft surfaces and rounded-2xl controls over heavy cards.",
              "Motion: short fade/slide for presence — not decorative noise.",
              "Native and web share the same palette; lockups stay static SVGs.",
            ].map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-mist bg-white p-5 text-sm leading-relaxed text-sage"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Color */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Color</SectionEyebrow>
          <SectionTitle>Botanical Garden palette</SectionTitle>
          <p className="mb-6 max-w-2xl [text-wrap:pretty] text-sage">
            Named tokens in Tailwind. Prefer token classes over raw hex in
            product UI. Lime is part of the lockup art and email themes; add a
            Tailwind token only if lime appears in product chrome.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESIGN_COLORS.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-mist">
            <div className="grid sm:grid-cols-3">
              <div className="bg-cream p-6">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  Cream surface
                </p>
                <p className="font-display text-2xl text-forest">Forest</p>
                <p className="text-sage">Sage body</p>
              </div>
              <div className="bg-forest p-6">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  Forest surface
                </p>
                <p className="font-display text-2xl text-cream">Cream</p>
                <p className="text-mist">Mist body</p>
              </div>
              <div className="bg-mist p-6">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  Mist surface
                </p>
                <p className="font-display text-2xl text-forest">Forest</p>
                <p className="text-sage">Sage body</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Typography</SectionEyebrow>
          <SectionTitle>Type stack</SectionTitle>
          <div className="mb-8 space-y-6">
            {(
              [
                DESIGN_TYPE.display,
                DESIGN_TYPE.sans,
                DESIGN_TYPE.mono,
              ] as const
            ).map((face) => (
              <div
                key={face.tw}
                className="rounded-2xl border border-mist bg-white p-5 sm:p-6"
              >
                <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  {face.tw}
                </p>
                <p className="mb-2 text-sm text-sage">{face.use}</p>
                <p
                  className={`text-forest ${
                    face.tw === "font-display"
                      ? "font-display text-4xl sm:text-5xl"
                      : face.tw === "font-mono"
                        ? "font-mono text-sm uppercase tracking-widest"
                        : "font-sans text-2xl"
                  }`}
                >
                  {face.family}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-mist bg-white p-5 sm:p-8">
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
              Section pattern
            </p>
            <h3 className="mb-3 font-display text-3xl text-forest sm:text-4xl">
              What can I make with these?
            </h3>
            <p className="max-w-lg text-lg leading-relaxed text-sage">
              Supporting sentence in sage. Display headline. Terracotta mono
              eyebrow above. This is the default marketing section rhythm.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-mist bg-white">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-mist bg-mist/30 font-mono text-[10px] uppercase tracking-widest text-sage">
                <tr>
                  <th className="px-4 py-3 font-bold">Role</th>
                  <th className="px-4 py-3 font-bold">Classes</th>
                  <th className="px-4 py-3 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="text-sage">
                {[
                  {
                    role: "Page H1",
                    classes: "font-display text-4xl sm:text-5xl text-forest",
                    notes: "Marketing heroes",
                  },
                  {
                    role: "Section H2",
                    classes: "font-display text-3xl sm:text-4xl text-forest",
                    notes: "One job per section",
                  },
                  {
                    role: "Body",
                    classes: "font-sans text-base/lg text-sage",
                    notes: "leading-relaxed",
                  },
                  {
                    role: "Eyebrow",
                    classes:
                      "font-mono text-xs font-bold uppercase tracking-widest text-terracotta",
                    notes: "Section intros only",
                  },
                  {
                    role: "UI label",
                    classes: "font-sans text-sm font-medium text-forest",
                    notes: "Tabs, nav, forms",
                  },
                ].map((row) => (
                  <tr key={row.role} className="border-b border-mist/80">
                    <td className="px-4 py-3 font-medium text-forest">
                      {row.role}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.classes}</td>
                    <td className="px-4 py-3">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Components</SectionEyebrow>
          <SectionTitle>Buttons</SectionTitle>
          <p className="mb-6 max-w-2xl text-sage">
            Shared{" "}
            <code className="rounded bg-mist/60 px-1.5 py-0.5 font-mono text-sm text-forest">
              components/common/Button.tsx
            </code>
            . Radius{" "}
            <code className="rounded bg-mist/60 px-1.5 py-0.5 font-mono text-sm text-forest">
              rounded-2xl
            </code>
            , semibold Jost.
          </p>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-mist bg-white p-6">
            <Button type="button">Primary</Button>
            <Button type="button" variant="secondary">
              Secondary
            </Button>
            <Button type="button" variant="ghost">
              Ghost
            </Button>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-mist bg-white p-4">
              <dt className="mb-1 font-medium text-forest">primary</dt>
              <dd className="text-sage">Terracotta CTA — main actions</dd>
            </div>
            <div className="rounded-xl border border-mist bg-white p-4">
              <dt className="mb-1 font-medium text-forest">secondary</dt>
              <dd className="text-sage">Forest — alternate emphasis</dd>
            </div>
            <div className="rounded-xl border border-mist bg-white p-4">
              <dt className="mb-1 font-medium text-forest">ghost</dt>
              <dd className="text-sage">White + mist border — quiet actions</dd>
            </div>
          </dl>
        </section>

        {/* Logos on surfaces */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Logo</SectionEyebrow>
          <SectionTitle>Lockup on surfaces</SectionTitle>
          <p className="mb-6 max-w-2xl text-sage">
            Use{" "}
            <code className="rounded bg-mist/60 px-1.5 py-0.5 font-mono text-sm text-forest">
              BrandLogo
            </code>{" "}
            with{" "}
            <code className="rounded bg-mist/60 px-1.5 py-0.5 font-mono text-sm text-forest">
              dark | light | olive
            </code>
            . Never compose text + LimeWheel at runtime.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex h-28 items-center justify-center rounded-2xl bg-cream ring-1 ring-mist">
              <BrandLogo variant="dark" size="lg" linked={false} />
            </div>
            <div className="flex h-28 items-center justify-center rounded-2xl bg-forest">
              <BrandLogo variant="light" size="lg" linked={false} />
            </div>
            <div className="flex h-28 items-center justify-center rounded-2xl bg-mist">
              <BrandLogo variant="olive" size="lg" linked={false} />
            </div>
          </div>
        </section>

        {/* Radius & shadow */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Shape</SectionEyebrow>
          <SectionTitle>Radius & shadow</SectionTitle>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {DESIGN_RADIUS.map((r) => (
              <div
                key={r.name}
                className={`border border-mist bg-white p-6 ${r.tw}`}
              >
                <p className="font-mono text-xs text-terracotta">
                  {r.tw} · {r.value}
                </p>
                <p className="mt-2 text-sm text-sage">
                  {"note" in r && r.note ? r.note : "General"}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {DESIGN_SHADOWS.map((s) => (
              <div
                key={s.name}
                className={`rounded-2xl border border-mist bg-white p-6 ${s.tw}`}
              >
                <p className="font-medium text-forest">{s.tw}</p>
                <p className="mt-1 font-mono text-xs text-sage">{s.css}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gradients & patterns */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Atmosphere</SectionEyebrow>
          <SectionTitle>Gradients</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-32 rounded-2xl bg-botanical-gradient ring-1 ring-mist">
              <p className="p-4 font-mono text-xs text-forest">
                bg-botanical-gradient
              </p>
            </div>
            <div className="h-32 rounded-2xl bg-cream bg-hero-pattern ring-1 ring-mist">
              <p className="p-4 font-mono text-xs text-forest">bg-hero-pattern</p>
            </div>
          </div>
        </section>

        {/* Spacing & layout */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Layout</SectionEyebrow>
          <SectionTitle>Containers & spacing</SectionTitle>
          <ul className="space-y-3 text-sm leading-relaxed text-sage">
            <li className="border-t border-forest/10 pt-3">
              <span className="font-medium text-forest">MainContainer</span> —
              max-w-7xl, responsive horizontal padding (px-4 → lg:px-8).
            </li>
            <li className="border-t border-forest/10 pt-3">
              <span className="font-medium text-forest">Marketing prose</span> —
              often max-w-3xl or max-w-5xl for readable measure.
            </li>
            <li className="border-t border-forest/10 pt-3">
              <span className="font-medium text-forest">Section rhythm</span> —
              py-20 lg:py-28 between major marketing blocks.
            </li>
            <li className="border-t border-forest/10 pt-3">
              <span className="font-medium text-forest">Focus</span> —{" "}
              focus-visible:ring-2 with terracotta or forest, ring-offset-cream.
            </li>
          </ul>
        </section>

        {/* Icons & motion */}
        <section className="mb-16 sm:mb-20">
          <SectionEyebrow>Icons & motion</SectionEyebrow>
          <SectionTitle>Supporting system</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-mist bg-white p-5 sm:p-6">
              <h3 className="mb-2 font-display text-xl text-forest">Icons</h3>
              <p className="text-sm leading-relaxed text-sage">
                @heroicons/react. Prefer outline for dense UI, solid for selected
                states. Stroke should read at 20–24px tap targets on mobile.
              </p>
            </div>
            <div className="rounded-2xl border border-mist bg-white p-5 sm:p-6">
              <h3 className="mb-2 font-display text-xl text-forest">Motion</h3>
              <p className="mb-3 text-sm leading-relaxed text-sage">
                Tailwind keyframes:{" "}
                <code className="font-mono text-xs text-forest">animate-fade-in</code>
                ,{" "}
                <code className="font-mono text-xs text-forest">animate-slide-up</code>
                ,{" "}
                <code className="font-mono text-xs text-forest">animate-float</code>
                . Keep durations ~300–500ms for UI; float only for light
                decoration.
              </p>
            </div>
          </div>
        </section>

        {/* Implementation map */}
        <section>
          <SectionEyebrow>Code map</SectionEyebrow>
          <SectionTitle>Where things live</SectionTitle>
          <div className="overflow-x-auto rounded-2xl border border-mist bg-white">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-mist bg-mist/30 font-mono text-[10px] uppercase tracking-widest text-sage">
                <tr>
                  <th className="px-4 py-3 font-bold">Concern</th>
                  <th className="px-4 py-3 font-bold">Path</th>
                </tr>
              </thead>
              <tbody className="text-sage">
                {[
                  ["Colors, radius, shadows, fonts", "tailwind.config.js"],
                  ["Font loading", "app/layout.tsx"],
                  ["Global base styles", "app/globals.css"],
                  ["Lockup component", "components/common/BrandLogo.tsx"],
                  ["Buttons", "components/common/Button.tsx"],
                  ["Brand kit content", "lib/brand/kit.ts"],
                  ["Cocktail photo rules", "docs/COCKTAIL_IMAGE_PROMPT.md"],
                ].map(([concern, path]) => (
                  <tr key={path} className="border-b border-mist/80">
                    <td className="px-4 py-3 text-forest">{concern}</td>
                    <td className="px-4 py-3 font-mono text-xs">{path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs text-sage/80">
            This page is private in production (requires{" "}
            <code className="font-mono text-[11px] text-forest">
              ?secret=
            </code>{" "}
            matching{" "}
            <code className="font-mono text-[11px] text-forest">
              EMAIL_TEST_SECRET
            </code>
            ). Open freely in local development.
          </p>
        </section>
      </MainContainer>
    </div>
  );
}
