import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Brand kit",
  description:
    "MixWise brand kit — Botanical Garden colors with hex codes, approved lockups, boilerplate copy, and naming for partners.",
  path: "/brand/logos",
});

export default function BrandLogosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
