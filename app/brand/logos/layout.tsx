import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Logos",
  description:
    "MixWise logos and brand kit — approved lockups, boilerplate copy, and naming for partners.",
  path: "/brand/logos",
});

export default function BrandLogosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
