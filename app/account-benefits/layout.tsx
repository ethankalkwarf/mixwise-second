import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "What you get with a MixWise account",
  description:
    "Save your bar, favorite recipes, tasting notes, and drinks you won't remake. Free MixWise tools for home bartenders.",
  path: "/account-benefits",
  keywords: ["home bar", "cocktail account", "save recipes", "bar inventory", "tasting notes"],
});

export default function AccountBenefitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
