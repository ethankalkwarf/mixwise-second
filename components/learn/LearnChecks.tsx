"use client";

import { useState } from "react";
import { QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { LearnCheck } from "@/lib/learnChecks";

type Props = {
  checks: LearnCheck[];
  title?: string;
};

export function LearnChecks({ checks, title = "Quick check" }: Props) {
  if (checks.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
          <QuestionMarkCircleIcon className="h-4 w-4" aria-hidden />
          Learning check
        </p>
        <h2 className="font-display text-2xl font-bold !text-charcoal">{title}</h2>
        <p className="text-sm !text-charcoal/70 mt-1">No grade — just lock in what you read.</p>
      </div>
      <div className="space-y-4">
        {checks.map((check) => (
          <CheckCard key={check.id} check={check} />
        ))}
      </div>
    </section>
  );
}

function CheckCard({ check }: { check: LearnCheck }) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const correct = revealed && selected === check.correctIndex;

  return (
    <div className="rounded-2xl border border-mist bg-white px-5 py-5 sm:px-6">
      <p className="font-medium !text-charcoal leading-relaxed mb-4">{check.prompt}</p>
      <ul className="space-y-2">
        {check.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrectOption = index === check.correctIndex;
          let styles =
            "border-mist bg-cream/60 text-forest hover:border-terracotta/40 cursor-pointer";
          if (revealed) {
            if (isCorrectOption) {
              styles = "border-olive/50 bg-olive/15 text-forest cursor-default";
            } else if (isSelected) {
              styles = "border-terracotta/40 bg-terracotta/10 text-forest/80 cursor-default";
            } else {
              styles = "border-mist bg-cream/40 text-sage cursor-default";
            }
          } else if (isSelected) {
            styles = "border-terracotta/50 bg-terracotta/10 text-forest";
          }

          return (
            <li key={option}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => setSelected(index)}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-colors ${styles}`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && (
        <p className="mt-4 text-sm leading-relaxed text-charcoal/80 flex gap-2">
          {correct ? (
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-olive" aria-hidden />
          ) : (
            <XCircleIcon className="h-5 w-5 shrink-0 text-terracotta" aria-hidden />
          )}
          <span>
            <span className="font-semibold text-terracotta">{correct ? "Nice." : "Not quite."}</span>{" "}
            {check.explanation}
          </span>
        </p>
      )}
    </div>
  );
}
