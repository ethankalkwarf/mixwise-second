import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Brand resources",
  description:
    "MixWise brand resources — logos, boilerplate copy, and naming for press and partners.",
  path: "/brand/press",
});

export default function BrandPressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
