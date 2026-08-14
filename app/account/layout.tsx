import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Account",
  description: "Manage your MixWise profile, bar, and preferences.",
  path: "/account",
  noIndex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
