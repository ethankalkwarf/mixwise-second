"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { LearnCheck } from "@/lib/learnChecks";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import type { LearnLessonKind } from "@/lib/learnProgress";
import { LEARN_LABEL } from "@/components/learn/LearnSectionBlock";

type Props = {
  checks: LearnCheck[];
  kind?: Exclude<LearnLessonKind, "path">;
  slug?: string;
};

export function LearnChecks({ checks, kind, slug }: Props) {
  const { completeLesson, isAuthenticated, isComplete } = useLearnProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const saved = useRef(false);

  const allAnswered = checks.length > 0 && checks.every((check) => answers[check.id] !== undefined);

  useEffect(() => {
    if (!kind || !slug || !isAuthenticated || !allAnswered || saved.current) return;
    if (isComplete(kind, slug)) return;
    saved.current = true;
    const correct = checks.filter((check) => answers[check.id] === check.correctIndex).length;
    void completeLesson(kind, slug, { correct, total: checks.length });
  }, [allAnswered, answers, checks, completeLesson, isAuthenticated, isComplete, kind, slug]);

  if (checks.length === 0) return null;

  return (
    <section className="learn-lesson-block space-y-5">
      <div>
        <p className={LEARN_LABEL}>Quiz</p>
        <p className="text-sm text-sage mt-1">Answer to finish the lesson and save your progress.</p>
      </div>
      <div className="space-y-4">
        {checks.map((check) => (
          <CheckCard
            key={check.id}
            check={check}
            selected={answers[check.id] ?? null}
            onSelect={(index) =>
              setAnswers((prev) =>
                prev[check.id] !== undefined ? prev : { ...prev, [check.id]: index }
              )
            }
          />
        ))}
      </div>
    </section>
  );
}

function CheckCard({
  check,
  selected,
  onSelect,
}: {
  check: LearnCheck;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const revealed = selected !== null;
  const correct = revealed && selected === check.correctIndex;

  return (
    <div className="rounded-2xl border border-mist bg-white px-5 py-5 sm:px-6">
      <p className="text-[17px] font-medium !text-charcoal leading-[1.7] mb-4">{check.prompt}</p>
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
                onClick={() => onSelect(index)}
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
