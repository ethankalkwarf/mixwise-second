import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Email Preferences",
  description: "Update or unsubscribe from MixWise emails.",
  path: "/unsubscribe",
  noIndex: true,
});

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
