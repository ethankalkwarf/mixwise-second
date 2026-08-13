import {
  getTopLevelOccasions,
} from "@/lib/occasions";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { ConditionalLayoutWrapper } from "@/components/layout/ConditionalLayoutWrapper";
import type { MegaMenuData } from "@/lib/megaMenu";

export type { MegaMenuData } from "@/lib/megaMenu";

function loadMegaMenuData(): MegaMenuData {
  const topLevel = getTopLevelOccasions();
  const occasionCovers = topLevel.map((occasion) => {
    const imageUrl =
      occasion.staticCoverPath ||
      staticOccasionCoverIfPresent(occasion.slug) ||
      null;
    return {
      slug: occasion.slug,
      name: occasion.name,
      href: `/occasions/${occasion.slug}`,
      imageUrl,
      eyebrow: occasion.headline,
      focusClass: occasion.coverFocusClass,
    };
  });

  // Feature Party (or first with art) so Summer isn't the hero + a list row
  const featuredOccasion =
    topLevel.find((o) => o.slug === "party") ||
    topLevel.find((o) => o.slug === "aperitivo") ||
    topLevel.find((o) => o.staticCoverPath || staticOccasionCoverIfPresent(o.slug)) ||
    topLevel[0];

  return {
    occasionCovers,
    featuredCover: featuredOccasion
      ? {
          slug: featuredOccasion.slug,
          name: featuredOccasion.name,
          href: `/occasions/${featuredOccasion.slug}`,
          imageUrl:
            featuredOccasion.staticCoverPath ||
            staticOccasionCoverIfPresent(featuredOccasion.slug) ||
            null,
          eyebrow: featuredOccasion.headline,
          focusClass: featuredOccasion.coverFocusClass,
        }
      : null,
  };
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const megaMenu = loadMegaMenuData();
  return <ConditionalLayoutWrapper megaMenu={megaMenu}>{children}</ConditionalLayoutWrapper>;
}
