import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Onboarding",
  description: "Set up your MixWise bar.",
  path: "/onboarding",
  noIndex: true,
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
