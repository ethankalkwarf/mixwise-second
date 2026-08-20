import type { ComponentType } from "react";
import {
  AcademicCapIcon,
  BeakerIcon,
  CalendarDaysIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  AcademicCapIcon as AcademicCapIconSolid,
  BeakerIcon as BeakerIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  HeartIcon as HeartIconSolid,
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  SparklesIcon as SparklesIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

export const MIXWISE_FOCUS_SEARCH = "mixwise-focus-search";
export const TAB_BAR_CONFIG_EVENT = "mixwise-tab-bar-config";
export const TAB_BAR_STORAGE_KEY = "mixwise_tab_bar_v1";

export const MOBILE_TAB_SLOT_COUNT = 5;

/** Destinations users can assign to a tab-bar slot. */
export type MobileTabDestinationId =
  | "home"
  | "search"
  | "mix"
  | "learn"
  | "you"
  | "favorites"
  | "daily"
  | "ingredients"
  | "collections";

export type MobileTabDestination = {
  id: MobileTabDestinationId;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  iconSolid: ComponentType<{ className?: string }>;
  description: string;
};

export const MOBILE_TAB_DESTINATIONS: Record<MobileTabDestinationId, MobileTabDestination> = {
  home: {
    id: "home",
    label: "Home",
    path: "/",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    description: "Your personalized pour hub",
  },
  search: {
    id: "search",
    label: "Search",
    path: "/cocktails",
    icon: MagnifyingGlassIcon,
    iconSolid: MagnifyingGlassIconSolid,
    description: "Browse and filter every recipe",
  },
  mix: {
    id: "mix",
    label: "Mix",
    path: "/mix",
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
    description: "Your cabinet and ready drinks",
  },
  learn: {
    id: "learn",
    label: "Learn",
    path: "/learn",
    icon: AcademicCapIcon,
    iconSolid: AcademicCapIconSolid,
    description: "Guides, methods, and courses",
  },
  you: {
    id: "you",
    label: "You",
    path: "/saved",
    icon: UserCircleIcon,
    iconSolid: UserCircleIconSolid,
    description: "Saved, recent, bar, and settings",
  },
  favorites: {
    id: "favorites",
    label: "Favorites",
    path: "/saved?tab=favorites",
    icon: HeartIcon,
    iconSolid: HeartIconSolid,
    description: "Recipes you've saved",
  },
  daily: {
    id: "daily",
    label: "Daily",
    path: "/cocktail-of-the-day",
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
    description: "Today's featured cocktail",
  },
  ingredients: {
    id: "ingredients",
    label: "Ingredients",
    path: "/ingredients",
    icon: BeakerIcon,
    iconSolid: BeakerIconSolid,
    description: "Bottle guides and picks",
  },
  collections: {
    id: "collections",
    label: "Collections",
    path: "/occasions",
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
    description: "Curated seasonal lists",
  },
};

export const ALL_MOBILE_TAB_DESTINATION_IDS = Object.keys(
  MOBILE_TAB_DESTINATIONS
) as MobileTabDestinationId[];

export const DEFAULT_MOBILE_TAB_BAR: MobileTabDestinationId[] = [
  "home",
  "search",
  "mix",
  "learn",
  "you",
];

const REQUIRED_DESTINATIONS: MobileTabDestinationId[] = ["home", "mix"];

function isDestinationId(value: string): value is MobileTabDestinationId {
  return value in MOBILE_TAB_DESTINATIONS;
}

/** Normalize saved slots — fill gaps, dedupe, enforce required tabs. */
export function normalizeTabBar(slots: unknown): MobileTabDestinationId[] {
  const raw = Array.isArray(slots) ? slots.filter((item) => typeof item === "string") : [];
  const seen = new Set<MobileTabDestinationId>();
  const result: MobileTabDestinationId[] = [];

  for (const item of raw) {
    if (!isDestinationId(item) || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
    if (result.length >= MOBILE_TAB_SLOT_COUNT) break;
  }

  for (const required of REQUIRED_DESTINATIONS) {
    if (!seen.has(required)) {
      if (result.length >= MOBILE_TAB_SLOT_COUNT) {
        result[MOBILE_TAB_SLOT_COUNT - 1] = required;
      } else {
        result.push(required);
      }
      seen.add(required);
    }
  }

  for (const fallback of DEFAULT_MOBILE_TAB_BAR) {
    if (result.length >= MOBILE_TAB_SLOT_COUNT) break;
    if (!seen.has(fallback)) {
      result.push(fallback);
      seen.add(fallback);
    }
  }

  return result.slice(0, MOBILE_TAB_SLOT_COUNT);
}

export function getTabBarConfig(): MobileTabDestinationId[] {
  if (typeof window === "undefined") return DEFAULT_MOBILE_TAB_BAR;
  try {
    const raw = localStorage.getItem(TAB_BAR_STORAGE_KEY);
    if (!raw) return DEFAULT_MOBILE_TAB_BAR;
    return normalizeTabBar(JSON.parse(raw));
  } catch {
    return DEFAULT_MOBILE_TAB_BAR;
  }
}

export function saveTabBarConfig(slots: MobileTabDestinationId[]): MobileTabDestinationId[] {
  const normalized = normalizeTabBar(slots);
  if (typeof window !== "undefined") {
    localStorage.setItem(TAB_BAR_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(TAB_BAR_CONFIG_EVENT));
  }
  return normalized;
}

export function resetTabBarConfig(): MobileTabDestinationId[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TAB_BAR_STORAGE_KEY);
    window.dispatchEvent(new Event(TAB_BAR_CONFIG_EVENT));
  }
  return [...DEFAULT_MOBILE_TAB_BAR];
}

export function resolveTabDestinations(
  bar: MobileTabDestinationId[]
): MobileTabDestination[] {
  return bar.map((id) => MOBILE_TAB_DESTINATIONS[id]);
}

/** Which tab destination should appear active for the current route. */
export function activeTabDestination(
  pathname: string,
  search: URLSearchParams | null,
  bar: MobileTabDestinationId[]
): MobileTabDestinationId | null {
  const candidates: MobileTabDestinationId[] = [];

  if (pathname === "/") candidates.push("home");
  if (pathname.startsWith("/mix")) candidates.push("mix");
  if (pathname.startsWith("/learn")) candidates.push("learn");
  if (pathname.startsWith("/ingredients")) candidates.push("ingredients");
  if (pathname.startsWith("/occasions") || pathname.startsWith("/collections")) {
    candidates.push("collections");
  }
  if (pathname.startsWith("/cocktail-of-the-day")) candidates.push("daily");

  if (pathname === "/saved") {
    if (search?.get("tab") === "favorites") candidates.push("favorites");
    candidates.push("you");
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/badges") ||
    pathname.startsWith("/shopping-list")
  ) {
    candidates.push("you");
  }

  if (pathname.startsWith("/cocktails")) {
    if (search?.get("browse") === "collections") candidates.push("collections");
    candidates.push("search");
  }

  for (const candidate of candidates) {
    if (bar.includes(candidate)) return candidate;
  }

  if (bar.includes("home")) return "home";
  return bar[0] ?? null;
}

/** @deprecated Use MobileTabDestinationId */
export type MobileTabId = MobileTabDestinationId;

/** @deprecated Use resolveTabDestinations(getTabBarConfig()) */
export function activeMobileTab(pathname: string): MobileTabDestinationId {
  return activeTabDestination(pathname, null, getTabBarConfig()) ?? "home";
}
