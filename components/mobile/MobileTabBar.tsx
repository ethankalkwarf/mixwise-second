"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  activeTabDestination,
  MIXWISE_FOCUS_SEARCH,
  type MobileTabDestination,
} from "@/lib/mobile/tabBarConfig";
import { useMobileTabBar } from "@/hooks/useMobileTabBar";
import { navigateInApp } from "@/lib/mobile/navigate";

export function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bar, tabs } = useMobileTabBar();

  const activeId = useMemo(
    () => activeTabDestination(pathname, searchParams, bar),
    [pathname, searchParams, bar]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const tab of tabs) {
        router.prefetch(tab.path.split("?")[0] ?? tab.path);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [router, tabs]);

  const handlePress = (tab: MobileTabDestination) => {
    if (tab.id === "home" && pathname === "/") {
      window.dispatchEvent(new Event("mixwise-home-revisit"));
      return;
    }
    if (tab.id === "search" && pathname === "/cocktails" && !searchParams.get("browse")) {
      window.dispatchEvent(new Event(MIXWISE_FOCUS_SEARCH));
      return;
    }
    navigateInApp(router, tab.path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-mist/80 bg-cream shadow-[0_-8px_32px_rgba(44,54,40,0.1)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-[4.25rem] items-stretch px-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const Icon = isActive ? tab.iconSolid : tab.icon;

          return (
            <button
              key={`${tab.id}-${tab.path}`}
              type="button"
              onClick={() => handlePress(tab)}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 outline-none focus:outline-none focus-visible:outline-none"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-terracotta" />
              )}
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                  isActive ? "text-terracotta" : "group-active:bg-mist/50"
                }`}
              >
                <Icon
                  className={`h-[1.35rem] w-[1.35rem] transition-colors ${
                    isActive ? "text-terracotta" : "text-sage"
                  }`}
                />
              </span>
              <span
                className={`max-w-full truncate px-0.5 text-[10px] font-semibold leading-none transition-colors ${
                  isActive ? "text-terracotta" : "text-forest/70"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
