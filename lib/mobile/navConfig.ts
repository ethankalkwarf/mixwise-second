import type { ComponentType } from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

export type MobileTabId = "home" | "search" | "mix" | "you";

export const MIXWISE_FOCUS_SEARCH = "mixwise-focus-search";

export interface MobileTabConfig {
  id: MobileTabId;
  label: string;
  path?: string;
  icon: ComponentType<{ className?: string }>;
  iconSolid: ComponentType<{ className?: string }>;
  opensSheet?: boolean;
}

export const MOBILE_TABS: MobileTabConfig[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    id: "search",
    label: "Search",
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
    id: "you",
    label: "You",
    path: "/saved",
    icon: UserCircleIcon,
    iconSolid: UserCircleIconSolid,
  },
];

/** Which tab should appear active for a given pathname. */
export function activeMobileTab(pathname: string): MobileTabId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/mix")) return "mix";
  if (
    pathname === "/saved" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/badges") ||
    pathname.startsWith("/ingredients") ||
    pathname.startsWith("/shopping-list")
  ) {
    return "you";
  }
  if (
    pathname.startsWith("/cocktails") ||
    pathname.startsWith("/cocktail-of-the-day") ||
    pathname.startsWith("/occasions") ||
    pathname.startsWith("/collections")
  ) {
    return "search";
  }
  return "home";
}

export interface MobileExploreLink {
  href: string;
  label: string;
  description: string;
  emoji: string;
  gradient: string;
}

export const MOBILE_EXPLORE_LINKS: MobileExploreLink[] = [
  {
    href: "/ingredients",
    label: "Ingredients",
    description: "Guides & bottle picks",
    emoji: "🍾",
    gradient: "from-olive to-forest",
  },
  {
    href: "/cocktails?browse=collections",
    label: "Collections",
    description: "Curated recipe lists",
    emoji: "✨",
    gradient: "from-terracotta to-terracotta-dark",
  },
  {
    href: "/shopping-list",
    label: "Shopping List",
    description: "What to buy next",
    emoji: "🛒",
    gradient: "from-sage to-forest",
  },
];
