"use client";

import { useMemo, useState } from "react";
import type { EmailThemeVariant } from "@/lib/email/theme-variants";

const WIDTHS = [
  { id: "phone", label: "Phone", px: 390 },
  { id: "email", label: "Email", px: 600 },
] as const;

export function EmailThemeBrowser({ themes }: { themes: EmailThemeVariant[] }) {
  const [activeId, setActiveId] = useState(themes[0]?.id ?? "studio-white");
  const [widthId, setWidthId] = useState<(typeof WIDTHS)[number]["id"]>("email");

  const active = useMemo(
    () => themes.find((t) => t.id === activeId) ?? themes[0],
    [activeId, themes]
  );

  const widthPx = WIDTHS.find((w) => w.id === widthId)?.px ?? 600;

  if (!active) {
    return <p className="p-8 text-sage">No themes loaded.</p>;
  }

  return (
    <div className="flex min-h-screen bg-cream text-charcoal">
      <aside className="hidden w-[22rem] shrink-0 overflow-y-auto border-r border-stone bg-white md:block">
        <div className="sticky top-0 border-b border-stone bg-white px-5 py-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            Compare
          </p>
          <h1 className="mt-1 font-display text-2xl text-forest">Email themes</h1>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            Decision: use both.{" "}
            <span className="text-forest">Studio White</span> for marketing /
            photo emails · <span className="text-forest">Forest Masthead</span>{" "}
            for auth / transactional. Live drafts at{" "}
            <a href="/dev/email-drafts" className="underline">
              /dev/email-drafts
            </a>
            .
          </p>
        </div>
        <nav className="space-y-2 px-3 py-4">
          {themes.map((theme, index) => {
            const selected = theme.id === active.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveId(theme.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-forest bg-forest text-cream"
                    : "border-stone bg-white hover:border-sage"
                }`}
              >
                <p
                  className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                    selected ? "text-cream/70" : "text-sage"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className={`mt-1 font-display text-xl ${selected ? "text-cream" : "text-forest"}`}>
                  {theme.name}
                </p>
                <p className={`mt-1 text-xs ${selected ? "text-cream/75" : "text-sage"}`}>
                  {theme.inspiredBy}
                </p>
                <p className={`mt-2 text-sm leading-snug ${selected ? "text-cream/90" : "text-charcoal/80"}`}>
                  {theme.summary}
                </p>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-stone bg-white px-4 py-4 sm:px-6">
          <div className="md:hidden">
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sage">
              Theme
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-stone bg-cream px-3 py-2 text-sm text-forest"
              value={active.id}
              onChange={(e) => setActiveId(e.target.value as EmailThemeVariant["id"])}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3 md:mt-0">
            <div>
              <h2 className="font-display text-2xl text-forest sm:text-3xl">{active.name}</h2>
              <p className="mt-1 max-w-xl text-sm text-sage">{active.summary}</p>
            </div>
            <div className="flex gap-2">
              {WIDTHS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWidthId(w.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    widthId === w.id
                      ? "bg-forest text-cream"
                      : "bg-cream text-sage hover:text-forest"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#D8D4CB] p-4 sm:p-8">
          <div
            className="mx-auto overflow-hidden bg-white shadow-lg"
            style={{ maxWidth: widthPx || undefined, width: "100%" }}
          >
            <iframe
              title={active.name}
              srcDoc={active.html}
              className="block w-full border-0 bg-white"
              style={{ minHeight: "920px", height: "1100px" }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
