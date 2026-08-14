export type MegaMenuCover = {
  slug: string;
  name: string;
  href: string;
  imageUrl: string | null;
  eyebrow?: string;
  focusClass?: string;
};

export type MegaMenuDailyDrink = {
  name: string;
  href: string;
  imageUrl: string | null;
};

export type MegaMenuData = {
  occasionCovers: MegaMenuCover[];
  featuredCover: MegaMenuCover | null;
  dailyDrink: MegaMenuDailyDrink | null;
};
