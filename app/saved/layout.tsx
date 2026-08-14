import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Saved Cocktails",
  description: "Your saved MixWise recipes.",
  path: "/saved",
  noIndex: true,
});

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
