import { getCocktailsList } from "@/lib/cocktails.server";
import { OCCASIONS, getOccasionCovers, type OccasionCocktail } from "@/lib/occasions";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import { ConditionalLayoutWrapper } from "@/components/layout/ConditionalLayoutWrapper";
import type { MegaMenuData } from "@/lib/megaMenu";

export type { MegaMenuData } from "@/lib/megaMenu";

async function loadMegaMenuData(): Promise<MegaMenuData> {
  try {
    const cocktails = (await getCocktailsList()) as OccasionCocktail[];
    const covers = getOccasionCovers(cocktails);
    const occasionCovers = OCCASIONS.map((occasion) => {
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

    const featuredOccasion =
      OCCASIONS.find((o) => o.slug === "summer") ||
      OCCASIONS.find((o) => covers[o.slug]?.image_url) ||
      OCCASIONS[0];
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
