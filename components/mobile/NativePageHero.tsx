"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Native page header — editorial type on cream, no card chrome. */
export function NativePageHero({
  title,
  eyebrow,
  description,
  meta,
  action,
  className = "",
}: Props) {
  return (
    <header className={`mb-5 px-0.5 ${className}`.trim()}>
      <div className={action ? "flex items-start justify-between gap-3" : undefined}>
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={[
              "font-display text-[1.85rem] font-bold leading-[1.08] text-forest [text-wrap:balance]",
              eyebrow ? "mt-1" : "",
            ].join(" ")}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-[22rem] text-sm leading-relaxed text-sage [text-wrap:pretty]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className={`flex-shrink-0 ${eyebrow ? "mt-5" : "mt-1"}`}>{action}</div>
        ) : null}
      </div>
      {meta ? <div className="mt-2 text-sm font-semibold leading-snug text-forest">{meta}</div> : null}
    </header>
  );
}
