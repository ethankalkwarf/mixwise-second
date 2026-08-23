import { notFound } from "next/navigation";
import { DesignSystemContent } from "@/components/brand/DesignSystemContent";

function canViewDesignSystem(secret?: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const expected = process.env.EMAIL_TEST_SECRET;
  if (!expected || !secret) return false;
  return secret === expected;
}

export default async function DesignSystemPage({
  searchParams,
}: {
  searchParams?: Promise<{ secret?: string }>;
}) {
  const params = (await searchParams) || {};
  if (!canViewDesignSystem(params.secret)) {
    notFound();
  }

  return <DesignSystemContent />;
}
