import {
  getTopLevelOccasions,
} from "@/lib/occasions";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { ConditionalLayoutWrapper } from "@/components/layout/ConditionalLayoutWrapper";
import { getTodaysDailyCocktailCover } from "@/lib/cocktails.server";
import { formatCocktailName } from "@/lib/formatters";
import type { MegaMenuData } from "@/lib/megaMenu";

export type { MegaMenuData } from "@/lib/megaMenu";

async function loadMegaMenuData(): Promise<MegaMenuData> {
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

  // Feature the party collection (or first with art) so Summer isn't the hero + a list row
  const featuredOccasion =
    topLevel.find((o) => o.slug === "party") ||
    topLevel.find((o) => o.slug === "aperitivo") ||
    topLevel.find((o) => o.staticCoverPath || staticOccasionCoverIfPresent(o.slug)) ||
    topLevel[0];

  let dailyDrink: MegaMenuData["dailyDrink"] = null;
  try {
    const daily = await getTodaysDailyCocktailCover();
    if (daily) {
      dailyDrink = {
        name: formatCocktailName(daily.name),
        href: "/cocktail-of-the-day",
        imageUrl: daily.imageUrl,
      };
    }
  } catch (error) {
    console.error("Failed to load drink of the day for mega menu:", error);
  }

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
    dailyDrink,
  };
}

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const megaMenu = await loadMegaMenuData();
  return <ConditionalLayoutWrapper megaMenu={megaMenu}>{children}</ConditionalLayoutWrapper>;
}
