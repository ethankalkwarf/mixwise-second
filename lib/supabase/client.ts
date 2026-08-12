/**
 * Browser Supabase client for Client Components.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

export function getSupabaseClient() {
  return createClient();
}
