"use client";

import { useMemo, useState } from "react";
import type { EmailDraft } from "@/lib/email/drafts";
import { emailDraftGroups } from "@/lib/email/drafts";

const WIDTHS = [
  { id: "phone", label: "Phone", px: 390 },
  { id: "email", label: "Email", px: 600 },
  { id: "full", label: "Full", px: 0 },
] as const;

export function EmailDraftBrowser({ drafts }: { drafts: EmailDraft[] }) {
  const groups = emailDraftGroups();
  const [activeSlug, setActiveSlug] = useState(drafts[0]?.slug ?? "");
  const [widthId, setWidthId] = useState<(typeof WIDTHS)[number]["id"]>("email");
  const [view, setView] = useState<"html" | "text">("html");

  const active = useMemo(
    () => drafts.find((draft) => draft.slug === activeSlug) ?? drafts[0],
    [activeSlug, drafts]
  );

  const widthPx = WIDTHS.find((w) => w.id === widthId)?.px ?? 600;

  if (!active) {
    return <p className="p-8 text-sage">No drafts loaded.</p>;
  }

  return (
    <div className="flex min-h-screen bg-cream text-charcoal">
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-stone bg-white md:block">
        <div className="sticky top-0 border-b border-stone bg-white px-5 py-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            MixWise emails
          </p>
          <h1 className="mt-1 font-display text-2xl text-forest">Drafts</h1>
          <p className="mt-1 text-sm text-sage">{drafts.length} templates</p>
        </div>
        <nav className="px-3 py-4">
          {groups.map((group) => (
            <DraftGroup
              key={group.id}
              label={group.label}
              drafts={drafts.filter((d) => d.group === group.id)}
              activeSlug={active.slug}
              onSelect={setActiveSlug}
            />
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-stone bg-white px-4 py-4 sm:px-6">
          <div className="md:hidden">
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sage">
              Draft
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-stone bg-cream px-3 py-2 text-sm text-forest"
              value={active.slug}
              onChange={(e) => setActiveSlug(e.target.value)}
            >
              {groups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {drafts
                    .filter((d) => d.group === group.id)
                    .map((draft) => (
                      <option key={draft.slug} value={draft.slug}>
                        {draft.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            {active.sendWhen}
          </p>
          <h2 className="mt-1 font-display text-2xl text-forest sm:text-3xl">{active.name}</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-sage">Audience</dt>
              <dd className="text-charcoal">{active.audience}</dd>
            </div>
            <div>
              <dt className="text-sage">Job</dt>
              <dd className="text-charcoal">{active.job}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-xl border border-stone bg-cream px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-sage">Subject</p>
            <p className="mt-0.5 font-medium text-forest">{active.subject}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-sage">Preview</p>
            <p className="mt-0.5 text-sm text-sage">{active.preview}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Toggle
              options={[
                { id: "html", label: "HTML" },
                { id: "text", label: "Plain text" },
              ]}
              value={view}
              onChange={setView}
            />
            {view === "html" ? (
              <Toggle
                options={WIDTHS.map((w) => ({ id: w.id, label: w.label }))}
                value={widthId}
                onChange={setWidthId}
              />
            ) : null}
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-mist p-4 sm:p-6">
          {view === "text" ? (
            <pre className="mx-auto max-w-2xl whitespace-pre-wrap rounded-2xl border border-stone bg-white p-6 font-mono text-sm leading-relaxed text-charcoal">
              {active.text}
            </pre>
          ) : (
            <div
              className="mx-auto overflow-hidden rounded-2xl border border-stone bg-white shadow-sm"
              style={{ maxWidth: widthPx ? `${widthPx}px` : "100%", width: "100%" }}
            >
              <iframe
                title={active.subject}
                srcDoc={active.html}
                className="h-[calc(100vh-280px)] min-h-[720px] w-full border-0 bg-cream"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DraftGroup({
  label,
  drafts,
  activeSlug,
  onSelect,
}: {
  label: string;
  drafts: EmailDraft[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}) {
  if (drafts.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-sage">
        {label}
      </p>
      <ul className="mt-2 space-y-0.5">
        {drafts.map((draft) => {
          const selected = draft.slug === activeSlug;
          return (
            <li key={draft.slug}>
              <button
                type="button"
                onClick={() => onSelect(draft.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-forest text-cream"
                    : "text-charcoal hover:bg-cream"
                }`}
              >
                <span className="block font-medium">{draft.name}</span>
                <span className={`block truncate text-xs ${selected ? "text-mist" : "text-sage"}`}>
                  {draft.subject}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-stone bg-cream p-0.5">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selected ? "bg-forest text-cream" : "text-sage hover:text-forest"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
