"use client";

import { EducationalTerm } from "@/components/cocktails/EducationalTerm";
import {
  getSortedTechniqueTerms,
  type GlossaryTerm,
} from "@/lib/cocktailTechniqueGlossary";

interface InstructionStepTextProps {
  text: string;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; term: GlossaryTerm };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function segmentInstructionText(text: string): Segment[] {
  const terms = getSortedTechniqueTerms();
  const patternSource = terms
    .flatMap((term) => term.patterns)
    .map(escapeRegExp)
    .join("|");

  if (!patternSource) return [{ type: "text", value: text }];

  // Word boundaries so "express" does not match inside "espresso"
  const regex = new RegExp(`(?<![A-Za-z])(${patternSource})(?![A-Za-z])`, "gi");
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const value = match[1];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    const lower = value.toLowerCase();
    const matched = terms.find((term) =>
      term.patterns.some((p) => p.toLowerCase() === lower)
    );
    if (matched) {
      segments.push({ type: "term", value, term: matched });
    } else {
      segments.push({ type: "text", value });
    }
    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

/** Renders a recipe step with tappable glossary terms. */
export function InstructionStepText({ text }: InstructionStepTextProps) {
  const segments = segmentInstructionText(text);

  return (
    <span className="text-sm leading-relaxed text-charcoal">
      {segments.map((segment, index) =>
        segment.type === "term" ? (
          <EducationalTerm key={`${segment.term.label}-${index}`} term={segment.term}>
            {segment.value}
          </EducationalTerm>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </span>
  );
}
