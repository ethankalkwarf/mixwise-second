export {
  MIXWISE_FOCUS_SEARCH,
  activeMobileTab,
  activeTabDestination,
  DEFAULT_MOBILE_TAB_BAR,
  getTabBarConfig,
  MOBILE_TAB_DESTINATIONS,
  resolveTabDestinations,
  type MobileTabDestination,
  type MobileTabDestinationId,
  type MobileTabId,
} from "@/lib/mobile/tabBarConfig";
import {
  DEFAULT_MOBILE_TAB_BAR,
  getTabBarConfig,
  resolveTabDestinations,
  type MobileTabDestination,
  type MobileTabDestinationId,
} from "@/lib/mobile/tabBarConfig";

/** @deprecated Use MobileTabDestination */
export type MobileTabConfig = MobileTabDestination & { id: MobileTabDestinationId };

/** @deprecated Use resolveTabDestinations(getTabBarConfig()) */
export function getMobileTabs(): MobileTabConfig[] {
  return resolveTabDestinations(getTabBarConfig()) as MobileTabConfig[];
}

/** @deprecated Use getTabBarConfig() + resolveTabDestinations() */
export const MOBILE_TABS: MobileTabConfig[] = resolveTabDestinations(
  DEFAULT_MOBILE_TAB_BAR
) as MobileTabConfig[];

export interface MobileExploreLink {
  href: string;
  label: string;
  description: string;
  emoji: string;
  gradient: string;
}

export const MOBILE_EXPLORE_LINKS: MobileExploreLink[] = [
  {
    href: "/learn",
    label: "Learn",
    description: "Guides, methods & paths",
    emoji: "📚",
    gradient: "from-forest to-charcoal",
  },
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
