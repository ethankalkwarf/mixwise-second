import { generatePageMetadata, MIXWISE_TOOL } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: MIXWISE_TOOL.title,
  description: MIXWISE_TOOL.mixDescription,
  path: "/mix",
  keywords: [
    "what can I make with ingredients I have",
    "cocktail app",
    "home bar",
    "mix drinks from your cabinet",
    "cocktail mixer",
    "what can I make",
  ],
});

export default function MixLayout({ children }: { children: React.ReactNode }) {
  return children;
}
