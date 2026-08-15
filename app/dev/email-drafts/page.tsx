import { notFound } from "next/navigation";
import { EmailDraftBrowser } from "@/components/email/EmailDraftBrowser";
import { buildEmailDrafts, collectDraftImageSlugs } from "@/lib/email/drafts";
import { createAdminClient } from "@/lib/supabase/admin";

function canViewEmailDrafts(secret?: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const expected = process.env.EMAIL_TEST_SECRET;
  if (!expected || !secret) return false;
  return secret === expected;
}

async function loadCatalogImages(): Promise<Record<string, string>> {
  try {
    const supabase = createAdminClient();
    const slugs = collectDraftImageSlugs();
    const { data, error } = await supabase
      .from("cocktails")
      .select("slug, image_url")
      .in("slug", slugs)
      .not("image_url", "is", null);

    if (error || !data) return {};

    const images: Record<string, string> = {};
    for (const row of data) {
      if (row.slug && row.image_url) images[row.slug] = row.image_url;
    }
    return images;
  } catch {
    return {};
  }
}

export default async function EmailDraftsPage({
  searchParams,
}: {
  searchParams?: Promise<{ secret?: string }>;
}) {
  const params = (await searchParams) || {};
  if (!canViewEmailDrafts(params.secret)) {
    notFound();
  }

  const catalogImages = await loadCatalogImages();
  const drafts = buildEmailDrafts(catalogImages);

  return <EmailDraftBrowser drafts={drafts} />;
}
