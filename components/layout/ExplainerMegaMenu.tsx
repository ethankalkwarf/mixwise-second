"use client";

import Image from "next/image";
import {
  NavMegaShell,
  NavMegaTrigger,
  type NavMegaController,
  type NavMegaId,
} from "@/components/layout/MegaMenuFrame";
import { HardNavLink } from "@/components/layout/HardNavLink";

type Props = {
  id: NavMegaId;
  controller: NavMegaController;
  active: boolean;
  href: string;
  label: string;
  compactLabel?: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  imageUrl: string;
  imageAlt?: string;
  imageFocusClass?: string;
};

export function ExplainerMegaMenu({
  id,
  controller,
  active,
  href,
  label,
  compactLabel,
  eyebrow,
  title,
  body,
  cta,
  imageUrl,
  imageAlt,
  imageFocusClass,
}: Props) {
  return (
    <NavMegaShell
      id={id}
      controller={controller}
      trigger={({ open, panelId, toggle }) => (
        <NavMegaTrigger
          href={href}
          label={label}
          compactLabel={compactLabel}
          active={active}
          open={open}
          panelId={panelId}
          toggle={toggle}
        />
      )}
    >
      <HardNavLink
        href={href}
        onClick={controller.closeMenu}
        className="group flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:gap-8 sm:py-6"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-mist sm:w-64 lg:w-72">
          <Image
            src={imageUrl}
            alt={imageAlt || ""}
            fill
            className={[
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
              imageFocusClass || "",
            ].join(" ")}
            sizes="(max-width: 640px) 100vw, 288px"
          />
        </div>

        <div className="min-w-0 max-w-md">
          <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
            {eyebrow}
          </p>
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-charcoal transition-colors group-hover:text-terracotta sm:text-2xl">
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-sage">{body}</p>
          <span className="mt-3 inline-flex items-center text-sm font-semibold text-forest transition-colors group-hover:text-terracotta">
            {cta}
            <span className="ml-1.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </span>
        </div>
      </HardNavLink>
    </NavMegaShell>
  );
}
