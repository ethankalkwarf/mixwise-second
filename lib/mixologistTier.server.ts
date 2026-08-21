import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  countTierBadges,
  getMixologistTier,
  type MixologistTier,
} from "@/lib/mixologistTiers";

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getPublicMixologistTier(
  userId: string,
  options?: { asOwner?: boolean }
): Promise<{ tier: MixologistTier; badgeCount: number }> {
  const supabase = options?.asOwner
    ? await createServerClient()
    : createPublicClient();

  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  if (error) {
    console.error("[mixologistTier] Failed to load badges:", error);
    return { tier: getMixologistTier(0), badgeCount: 0 };
  }

  const ids = (data ?? []).map((row) => row.badge_id);
  const badgeCount = countTierBadges(ids);
  return { tier: getMixologistTier(badgeCount), badgeCount };
}
