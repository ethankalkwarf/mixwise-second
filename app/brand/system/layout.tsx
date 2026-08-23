import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Design system",
  description: "MixWise design system — internal tokens and UI patterns.",
  path: "/brand/system",
  noIndex: true,
});

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
