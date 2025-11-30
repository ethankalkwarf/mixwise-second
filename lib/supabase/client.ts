/**
 * Supabase Client-Side Helper
 * 
 * This module provides a client-side Supabase client for use in React components.
 * It handles authentication state and provides typed access to the database.
 */

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client for use in client components.
 * This client automatically handles auth state and cookie management.
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

/**
 * Singleton instance for components that don't need fresh client each render
 */
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
}


