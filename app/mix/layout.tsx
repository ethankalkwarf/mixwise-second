import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Mix",
  description:
    "Find cocktails you can make with ingredients you already have. Add what's in your cabinet and see what's ready to pour.",
  path: "/mix",
  keywords: ["cocktail mixer", "what can I make", "home bar", "cocktail ingredients"],
});

export default function MixLayout({ children }: { children: React.ReactNode }) {
  return children;
}
