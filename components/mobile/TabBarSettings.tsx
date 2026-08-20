"use client";

import { useMemo, useState } from "react";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  ALL_MOBILE_TAB_DESTINATION_IDS,
  DEFAULT_MOBILE_TAB_BAR,
  MOBILE_TAB_DESTINATIONS,
  MOBILE_TAB_SLOT_COUNT,
  type MobileTabDestinationId,
} from "@/lib/mobile/tabBarConfig";
import { useMobileTabBar } from "@/hooks/useMobileTabBar";

export function TabBarSettings() {
  const { bar, setSlot, resetBar } = useMobileTabBar();
  const [selectedSlot, setSelectedSlot] = useState(0);
  const isDefault = useMemo(
    () => DEFAULT_MOBILE_TAB_BAR.every((id, index) => bar[index] === id),
    [bar]
  );

  const selectedId = bar[selectedSlot] ?? DEFAULT_MOBILE_TAB_BAR[selectedSlot];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <p className="text-sm text-sage">Tap a tab, then pick what goes there.</p>
        {!isDefault ? (
          <button
            type="button"
            onClick={() => {
              resetBar();
              setSelectedSlot(0);
            }}
            className="native-menu-row flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-forest shadow-sm"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Reset
          </button>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-3 shadow-sm">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sage">
          Your tabs
        </p>
        <div
          className="flex items-stretch rounded-2xl border border-mist/80 bg-cream px-0.5 py-0.5"
          role="tablist"
          aria-label="Tab bar slots"
        >
          {Array.from({ length: MOBILE_TAB_SLOT_COUNT }, (_, index) => {
            const id = bar[index] ?? DEFAULT_MOBILE_TAB_BAR[index];
            const tab = MOBILE_TAB_DESTINATIONS[id];
            const Icon = tab.icon;
            const selected = selectedSlot === index;

            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`${tab.label} tab${selected ? ", selected for editing" : ""}`}
                onClick={() => setSelectedSlot(index)}
                className={[
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 transition-colors",
                  selected
                    ? "bg-white shadow-sm ring-2 ring-terracotta/70 ring-offset-1 ring-offset-cream"
                    : "hover:bg-white/60",
                ].join(" ")}
              >
                <Icon
                  className={`h-[1.15rem] w-[1.15rem] ${selected ? "text-terracotta" : "text-forest/75"}`}
                />
                <span
                  className={`max-w-full truncate px-0.5 text-[9px] font-semibold ${
                    selected ? "text-forest" : "text-forest/70"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-3 shadow-sm">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sage">
          Replace &ldquo;{MOBILE_TAB_DESTINATIONS[selectedId].label}&rdquo;
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ALL_MOBILE_TAB_DESTINATION_IDS.map((id) => {
            const meta = MOBILE_TAB_DESTINATIONS[id];
            const Icon = meta.icon;
            const slotIndex = bar.indexOf(id);
            const inBar = slotIndex >= 0;
            const isActive = id === selectedId;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSlot(selectedSlot, id)}
                className={[
                  "relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-colors",
                  isActive
                    ? "border-terracotta/50 bg-terracotta/10"
                    : inBar
                      ? "border-mist bg-cream/80"
                      : "border-transparent bg-cream hover:border-mist",
                ].join(" ")}
                aria-pressed={isActive}
                aria-label={`Set ${meta.label} in tab ${selectedSlot + 1}`}
              >
                {isActive ? (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-cream">
                    <CheckIcon className="h-2.5 w-2.5" aria-hidden />
                  </span>
                ) : null}
                <Icon className={`h-6 w-6 ${isActive ? "text-terracotta" : "text-forest"}`} />
                <span className="text-[11px] font-semibold leading-tight text-forest">{meta.label}</span>
                {inBar && !isActive ? (
                  <span className="text-[9px] font-medium text-sage">Tab {slotIndex + 1}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
