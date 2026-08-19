"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { activeMobileTab, MIXWISE_FOCUS_SEARCH, MOBILE_TABS } from "@/lib/mobile/navConfig";
import { navigateInApp } from "@/lib/mobile/navigate";

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = activeMobileTab(pathname);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const tab of MOBILE_TABS) {
        if (tab.path) router.prefetch(tab.path);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [router]);

  const handlePress = (tab: (typeof MOBILE_TABS)[number]) => {
    if (tab.id === "search" && pathname === "/cocktails") {
      window.dispatchEvent(new Event(MIXWISE_FOCUS_SEARCH));
      return;
    }
    if (tab.path) {
      navigateInApp(router, tab.path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-mist/80 bg-cream shadow-[0_-8px_32px_rgba(44,54,40,0.1)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-[4.25rem] items-stretch px-1">
        {MOBILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = isActive ? tab.iconSolid : tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handlePress(tab)}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-terracotta" />
              )}
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-terracotta/12 scale-105"
                    : "group-active:bg-mist/60 group-active:scale-95"
                }`}
              >
                <Icon
                  className={`h-[1.35rem] w-[1.35rem] transition-colors ${
                    isActive ? "text-terracotta" : "text-sage"
                  }`}
                />
              </span>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors ${
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
