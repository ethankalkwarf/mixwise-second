import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { MainContainer } from "@/components/layout/MainContainer";

type Props = {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  summary?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Shorter hero for secondary pages */
  compact?: boolean;
  children?: React.ReactNode;
  priority?: boolean;
};

/**
 * Learn page hero — cream-left scrim so titles stay readable over busy photos.
 */
export function LearnHero({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  summary,
  backHref,
  backLabel = "Learn library",
  compact = false,
  children,
  priority = true,
}: Props) {
  return (
    <section
      className={`relative overflow-hidden border-b border-mist ${
        compact ? "min-h-[32vh] sm:min-h-[36vh]" : "min-h-[38vh] sm:min-h-[44vh]"
      }`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      {/* Keep the photo present; only soften behind the type column */}
      <div className="absolute inset-0 bg-forest/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/55 to-transparent sm:via-cream/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream/80 via-transparent to-transparent" />

      <MainContainer
        className={`relative z-10 ${compact ? "py-10 sm:py-12" : "py-12 sm:py-16"} ${
          backHref ? "max-w-3xl" : "max-w-5xl"
        }`}
      >
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm font-semibold text-forest hover:text-terracotta transition-colors"
          >
            ← {backLabel}
          </Link>
        ) : null}
        <p
          className={`font-mono text-[11px] uppercase tracking-[0.16em] text-terracotta font-semibold ${
            backHref ? "mt-6" : ""
          } mb-3`}
        >
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold !text-charcoal mb-4 max-w-2xl tracking-tight">
          {title}
        </h1>
        {summary && (
          <p className="text-[17px] !text-charcoal/80 leading-[1.7] max-w-xl">
            {summary}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </MainContainer>
    </section>
  );
}
