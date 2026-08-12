import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Dashboard",
  description: "Your MixWise bar, favorites, and cocktail recommendations.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
