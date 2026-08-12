"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  SparklesIcon as SparklesIconSolid,
} from "@heroicons/react/24/solid";

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
}

// Streamlined 3-tab navigation for focused, guided experience
const tabs: TabItem[] = [
  {
    id: "discover",
    label: "Discover",
    path: "/cocktails",
    icon: MagnifyingGlassIcon,
    iconSolid: MagnifyingGlassIconSolid,
  },
  {
    id: "mix",
    label: "Mix",
    path: "/mix",
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
  },
  {
    id: "saved",
    label: "Saved",
    path: "/saved",
    icon: BookmarkIcon,
    iconSolid: BookmarkIconSolid,
  },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNative, setIsNative] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.Capacitor) {
      try {
        setIsNative(Capacitor.isNativePlatform());
      } catch (e) {
        console.error("Error checking native platform in MobileTabBar:", e);
        setIsNative(false);
      }
    }
  }, []);

  // Only show on native platforms after mount
  if (!isMounted || !isNative) {
    return null;
  }

  const handleTabPress = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-white/50 safe-area-bottom shadow-2xl shadow-black/10">
      <div className="flex items-center justify-around h-20 px-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || 
            (tab.path !== "/" && pathname.startsWith(tab.path));
          const Icon = isActive ? tab.iconSolid : tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.path)}
              className={`
                group relative flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-300
              `}
              aria-label={tab.label}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-terracotta to-terracotta-dark rounded-b-full" />
              )}
              
              {/* Icon container with modern styling */}
              <div className={`
                relative w-12 h-12 rounded-2xl flex items-center justify-center mb-1
                transition-all duration-300
                ${isActive 
                  ? "bg-terracotta/10 scale-110" 
                  : "bg-transparent group-active:bg-mist/50 group-active:scale-105"
                }
              `}>
                <Icon className={`
                  w-7 h-7 transition-all duration-300
                  ${isActive 
                    ? "text-terracotta scale-110" 
                    : "text-sage group-active:text-terracotta"
                  }
                `} />
              </div>
              
              <span className={`
                text-xs font-semibold transition-all duration-300
                ${isActive 
                  ? "text-terracotta" 
                  : "text-sage group-active:text-terracotta"
                }
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
