import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Shopping List",
  description: "Track missing bottles for cocktails you want to make, then add them to your bar when they're home.",
  path: "/shopping-list",
  noIndex: true,
});

export default function ShoppingListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
