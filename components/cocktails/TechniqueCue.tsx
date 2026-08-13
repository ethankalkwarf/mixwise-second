"use client";

import { useId, useState } from "react";
import { getMethodTip } from "@/lib/cocktailTechniqueGlossary";
import { getLearnMethodByTechniqueKey } from "@/lib/learnLibrary";

interface TechniqueCueProps {
  technique?: string | null;
}

/**
 * Quiet method cue above the recipe steps.
 * Expands on tap for the fuller tip — no bolted-on tip card below.
 */
export function TechniqueCue({ technique }: TechniqueCueProps) {
  const method = getMethodTip(technique);
  const learnMethod = getLearnMethodByTechniqueKey(technique);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!method) return null;

  const learnHref = learnMethod ? `/learn/methods/${learnMethod.slug}` : "/learn";

  return (
    <div className="mb-5">
      <button
        type="button"
        className="group inline-flex max-w-full items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 rounded-sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm text-muted-foreground group-hover:text-forest transition-colors">
          {method.cue}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-sage/45 bg-white/70 px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-sage transition-colors group-hover:border-olive/55 group-hover:text-olive">
          Tip
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 4.5 L6 8 L9.5 4.5" />
          </svg>
        </span>
      </button>

      {open && (
        <div id={panelId} className="mt-2 max-w-xl space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {method.summary} {method.tip}
          </p>
          <a
            href={learnHref}
            className="inline-block text-xs font-medium text-terracotta hover:underline"
          >
            {learnMethod ? `Learn ${learnMethod.label} →` : "More in Learn →"}
          </a>
        </div>
      )}
    </div>
  );
}
