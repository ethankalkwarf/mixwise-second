import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Email themes",
  description: "Compare MixWise email theme variants.",
  path: "/dev/email-themes",
  noIndex: true,
});

export default function EmailThemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
