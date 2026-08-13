export type MegaMenuCover = {
  slug: string;
  name: string;
  href: string;
  imageUrl: string | null;
  eyebrow?: string;
};

export type MegaMenuData = {
  occasionCovers: MegaMenuCover[];
  featuredCover: MegaMenuCover | null;
};
