import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  description?: ReactNode;
  /** Optional mono eyebrow above the title (marketing surfaces only). */
  eyebrow?: string;
  /** Secondary line under the description (counts, status). */
  meta?: ReactNode;
  /** Controls / filters that belong with the header. */
  children?: ReactNode;
  className?: string;
  /** Use h1 on the page hero; demote when another h1 already leads the page. */
  as?: "h1" | "h2";
};

/**
 * Shared web directory / tool page header.
 * Matches Cocktail Recipes sizing and spacing so Mix, Recipes, etc. feel like one system.
 */
export function WebPageHero({
  title,
  description,
  eyebrow,
  meta,
  children,
  className,
  as = "h1",
}: Props) {
  const Heading = as;

  return (
    <header className={clsx("mb-10 min-w-0", className)}>
      {eyebrow ? (
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="mb-4 font-display text-3xl font-bold text-forest [text-wrap:balance] sm:text-4xl md:text-5xl">
        {title}
      </Heading>
      {description ? (
        <div className="max-w-2xl text-sage [text-wrap:pretty]">{description}</div>
      ) : null}
      {meta ? (
        <div className="mt-3 text-sm font-semibold leading-snug text-forest">{meta}</div>
      ) : null}
      {children ? <div className={clsx(description || meta ? "mt-6" : "mt-4")}>{children}</div> : null}
    </header>
  );
}
