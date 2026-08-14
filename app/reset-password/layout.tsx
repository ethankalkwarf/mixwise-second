import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Reset Password",
  description: "Choose a new MixWise password.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
