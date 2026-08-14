import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Signing in",
  description: "Finishing MixWise sign-in.",
  path: "/auth/callback",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
