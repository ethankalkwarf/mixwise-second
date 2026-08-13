"use client";

import { useId, useState } from "react";
import { getMethodTip } from "@/lib/cocktailTechniqueGlossary";

interface TechniqueCueProps {
  technique?: string | null;
}

/**
 * Quiet method cue above the recipe steps.
 * Expands on tap for the fuller tip — no bolted-on tip card below.
 */
export function TechniqueCue({ technique }: TechniqueCueProps) {
  const method = getMethodTip(technique);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!method) return null;

  return (
    <div className="mb-5">
      <button
        type="button"
        className="group inline-flex max-w-full items-baseline gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 rounded-sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm text-muted-foreground group-hover:text-forest transition-colors">
          {method.cue}
        </span>
        <span className="text-xs text-sage/80 group-hover:text-sage transition-colors">
          {open ? "Hide tip" : "Tip"}
        </span>
      </button>

      {open && (
        <p
          id={panelId}
          className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground"
        >
          {method.summary} {method.tip}
        </p>
      )}
    </div>
  );
}
