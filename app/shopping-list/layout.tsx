import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Shopping List",
  description: "Track missing ingredients for cocktails you want to make.",
  path: "/shopping-list",
  noIndex: true,
});

export default function ShoppingListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
