import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Email drafts",
  description: "Internal MixWise email draft preview.",
  path: "/dev/email-drafts",
  noIndex: true,
});

export default function EmailDraftsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
