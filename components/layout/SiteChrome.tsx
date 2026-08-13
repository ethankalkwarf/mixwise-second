import { getCocktailsList } from "@/lib/cocktails.server";
import {
  getOccasionCovers,
  getTopLevelOccasions,
  type OccasionCocktail,
} from "@/lib/occasions";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { ConditionalLayoutWrapper } from "@/components/layout/ConditionalLayoutWrapper";
import type { MegaMenuData } from "@/lib/megaMenu";

export type { MegaMenuData } from "@/lib/megaMenu";

async function loadMegaMenuData(): Promise<MegaMenuData> {
  try {
    const cocktails = (await getCocktailsList()) as OccasionCocktail[];
    const covers = getOccasionCovers(cocktails);
    const topLevel = getTopLevelOccasions();
    const occasionCovers = topLevel.map((occasion) => {
      const cover = covers[occasion.slug];
      const staticUrl = staticOccasionCoverIfPresent(occasion.slug);
      return {
        slug: occasion.slug,
        name: occasion.name,
        href: `/occasions/${occasion.slug}`,
        imageUrl: staticUrl || cover?.image_url || null,
        eyebrow: occasion.headline,
      };
    });

    // Feature Party (or first with art) so Summer isn't the hero + a list row
    const featuredOccasion =
      topLevel.find((o) => o.slug === "party") ||
      topLevel.find((o) => o.slug === "aperitivo") ||
      topLevel.find((o) => covers[o.slug]?.image_url || staticOccasionCoverIfPresent(o.slug)) ||
      topLevel[0];
    const featured = featuredOccasion ? covers[featuredOccasion.slug] : null;
    const featuredStatic = featuredOccasion
      ? staticOccasionCoverIfPresent(featuredOccasion.slug)
      : null;

    return {
      occasionCovers,
      featuredCover: featuredOccasion
        ? {
            slug: featuredOccasion.slug,
            name: featuredOccasion.name,
            href: `/occasions/${featuredOccasion.slug}`,
            imageUrl: featuredStatic || featured?.image_url || null,
            eyebrow: featuredOccasion.headline,
          }
        : null,
    };
  } catch {
    return { occasionCovers: [], featuredCover: null };
  }
}

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const megaMenu = await loadMegaMenuData();
  return <ConditionalLayoutWrapper megaMenu={megaMenu}>{children}</ConditionalLayoutWrapper>;
}
