/**
 * Badge Definitions
 * 
 * Defines all available badges/achievements in MixWise.
 * Badges are earned by completing various actions.
 */

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "exploration" | "social" | "mastery";
  rarity: "common" | "uncommon" | "rare" | "legendary";
  criteria: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  // Milestone Badges
  home_bartender: {
    id: "home_bartender",
    name: "Home Bartender",
    description: "Completed the onboarding process",
    icon: "🏠",
    category: "milestone",
    rarity: "common",
    criteria: "Complete the onboarding wizard",
  },
  starter_mixer: {
    id: "starter_mixer",
    name: "Starter Mixer",
    description: "Saved your first 3 cocktails",
    icon: "⭐",
    category: "milestone",
    rarity: "common",
    criteria: "Save 3 cocktails to favorites",
  },
  bar_builder: {
    id: "bar_builder",
    name: "Bar Builder",
    description: "Added 10 ingredients to your bar",
    icon: "🍾",
    category: "milestone",
    rarity: "common",
    criteria: "Add 10 ingredients to your bar",
  },
  well_stocked: {
    id: "well_stocked",
    name: "Well Stocked",
    description: "Built a bar with 25+ ingredients",
    icon: "📦",
    category: "milestone",
    rarity: "uncommon",
    criteria: "Add 25 ingredients to your bar",
  },
  cocktail_enthusiast: {
    id: "cocktail_enthusiast",
    name: "Cocktail Enthusiast",
    description: "Saved 10 cocktails to favorites",
    icon: "💝",
    category: "milestone",
    rarity: "uncommon",
    criteria: "Save 10 cocktails to favorites",
  },
  
  // Exploration Badges
  tiki_explorer: {
    id: "tiki_explorer",
    name: "Tiki Explorer",
    description: "Explored 3 tiki-style cocktails",
    icon: "🌴",
    category: "exploration",
    rarity: "uncommon",
    criteria: "View 3 tiki cocktails",
  },
  classic_connoisseur: {
    id: "classic_connoisseur",
    name: "Classic Connoisseur",
    description: "Explored 5 classic cocktails",
    icon: "🎩",
    category: "exploration",
    rarity: "uncommon",
    criteria: "View 5 classic cocktails",
  },
  world_traveler: {
    id: "world_traveler",
    name: "World Traveler",
    description: "Tried cocktails from 5 different countries",
    icon: "🌍",
    category: "exploration",
    rarity: "rare",
    criteria: "Explore cocktails from 5+ origins",
  },
  
  // Mastery Badges
  spirit_master_gin: {
    id: "spirit_master_gin",
    name: "Gin Master",
    description: "Explored 5 gin-based cocktails",
    icon: "🌿",
    category: "mastery",
    rarity: "uncommon",
    criteria: "View 5 gin cocktails",
  },
  spirit_master_whiskey: {
    id: "spirit_master_whiskey",
    name: "Whiskey Master",
    description: "Explored 5 whiskey-based cocktails",
    icon: "🥃",
    category: "mastery",
    rarity: "uncommon",
    criteria: "View 5 whiskey cocktails",
  },
  spirit_master_rum: {
    id: "spirit_master_rum",
    name: "Rum Master",
    description: "Explored 5 rum-based cocktails",
    icon: "🏴‍☠️",
    category: "mastery",
    rarity: "uncommon",
    criteria: "View 5 rum cocktails",
  },
  spirit_master_vodka: {
    id: "spirit_master_vodka",
    name: "Vodka Master",
    description: "Explored 5 vodka-based cocktails",
    icon: "❄️",
    category: "mastery",
    rarity: "uncommon",
    criteria: "View 5 vodka cocktails",
  },
  spirit_master_tequila: {
    id: "spirit_master_tequila",
    name: "Tequila Master",
    description: "Explored 5 tequila-based cocktails",
    icon: "🌵",
    category: "mastery",
    rarity: "uncommon",
    criteria: "View 5 tequila cocktails",
  },
  mixologist: {
    id: "mixologist",
    name: "Mixologist",
    description: "Earned 5 different badges",
    icon: "🏆",
    category: "mastery",
    rarity: "rare",
    criteria: "Earn 5 badges",
  },
  master_mixologist: {
    id: "master_mixologist",
    name: "Master Mixologist",
    description: "Earned 10 different badges",
    icon: "👑",
    category: "mastery",
    rarity: "legendary",
    criteria: "Earn 10 badges",
  },
  
  // Social Badges
  sharer: {
    id: "sharer",
    name: "Sharer",
    description: "Shared your first cocktail card",
    icon: "📤",
    category: "social",
    rarity: "common",
    criteria: "Share a cocktail card",
  },
  bar_host: {
    id: "bar_host",
    name: "Bar Host",
    description: "Shared your bar with someone",
    icon: "🎉",
    category: "social",
    rarity: "common",
    criteria: "Share your public bar link",
  },
};

export const BADGE_LIST = Object.values(BADGES);

export function getBadge(badgeId: string): BadgeDefinition | undefined {
  return BADGES[badgeId];
}

export function getBadgesByCategory(category: BadgeDefinition["category"]): BadgeDefinition[] {
  return BADGE_LIST.filter((badge) => badge.category === category);
}

export function getBadgesByRarity(rarity: BadgeDefinition["rarity"]): BadgeDefinition[] {
  return BADGE_LIST.filter((badge) => badge.rarity === rarity);
}

// Rarity colors for UI
export const RARITY_COLORS = {
  common: "from-slate-400 to-slate-500",
  uncommon: "from-green-400 to-emerald-500",
  rare: "from-blue-400 to-indigo-500",
  legendary: "from-amber-400 to-orange-500",
};

