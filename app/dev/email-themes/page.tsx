import { notFound } from "next/navigation";
import { EmailThemeBrowser } from "@/components/email/EmailThemeBrowser";
import { buildEmailThemeVariants } from "@/lib/email/theme-variants";

function canView(secret?: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const expected = process.env.EMAIL_TEST_SECRET;
  if (!expected || !secret) return false;
  return secret === expected;
}

export default async function EmailThemesPage({
  searchParams,
}: {
  searchParams?: Promise<{ secret?: string }>;
}) {
  const params = (await searchParams) || {};
  if (!canView(params.secret)) {
    notFound();
  }

  const themes = buildEmailThemeVariants();
  return <EmailThemeBrowser themes={themes} />;
}
