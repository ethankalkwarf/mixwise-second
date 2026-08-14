"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { HardNavLink } from "@/components/layout/HardNavLink";

export const MEGA_ROOT_ID = "mixwise-mega-root";

export type NavMegaId = "daily" | "mix" | "recipes";

export type NavMegaController = {
  openId: NavMegaId | null;
  mounted: boolean;
  openMenu: (id: NavMegaId) => void;
  scheduleClose: () => void;
  closeMenu: () => void;
};

type TriggerArgs = {
  open: boolean;
  panelId: string;
  toggle: () => void;
};

type Props = {
  id: NavMegaId;
  controller: NavMegaController;
  trigger: (args: TriggerArgs) => ReactNode;
  children: ReactNode;
};

export function navMegaTriggerClass(active: boolean, open: boolean) {
  return [
    "text-sm transition-colors duration-200",
    active || open
      ? "font-semibold text-forest"
      : "font-medium text-charcoal hover:text-terracotta",
  ].join(" ");
}

export function NavMegaTrigger({
  href,
  label,
  active,
  open,
  panelId,
  toggle,
}: {
  href: string;
  label: string;
  active: boolean;
  open: boolean;
  panelId: string;
  toggle: () => void;
}) {
  return (
    <div className="inline-flex items-center">
      <HardNavLink href={href} className={navMegaTriggerClass(active, open)}>
        {label}
      </HardNavLink>
      <button
        type="button"
        className={`-ml-0.5 inline-flex items-center p-0.5 ${navMegaTriggerClass(active, open)}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        aria-label={`${label} menu`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }}
      >
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180 text-terracotta" : "text-sage"
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}

export function NavMegaShell({ id, controller, trigger, children }: Props) {
  // Stable across SSR/client — React useId() was mismatching in the navbar and
  // regenerating the whole page tree (looks like a crash on every load).
  const panelId = `mixwise-mega-${id}`;
  const open = controller.openId === id;
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(MEGA_ROOT_ID));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") controller.closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, controller]);

  const panel =
    open && slot
      ? createPortal(
          <div
            id={panelId}
            className="border-b border-mist bg-cream shadow-[0_18px_40px_-28px_rgba(44,54,40,0.45)]"
            onMouseEnter={() => controller.openMenu(id)}
            onMouseLeave={controller.scheduleClose}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
          </div>,
          slot
        )
      : null;

  return (
    <>
      <div
        onMouseEnter={() => controller.openMenu(id)}
        onMouseLeave={controller.scheduleClose}
      >
        {trigger({
          open,
          panelId,
          toggle: () => controller.openMenu(id),
        })}
      </div>
      {panel}
    </>
  );
}
