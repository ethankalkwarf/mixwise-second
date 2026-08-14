import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Join MixWise",
  description:
    "Save the bar. See what you can pour tonight. Add what's in the cabinet once and MixWise matches every recipe to the bottles you already have.",
  path: "/join",
  noIndex: true,
});

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
