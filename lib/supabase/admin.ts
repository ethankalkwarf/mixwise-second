/**
 * Supabase Admin Client
 *
 * This module provides server-side Supabase admin client for privileged operations
 * like generating auth links, managing users, etc.
 *
 * SECURITY: This client should NEVER be imported in client components.
 * Only use in server-only contexts (API routes, server actions, etc.)
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Creates a Supabase admin client with service role key.
 * This client has full access to all Supabase features and should be used with caution.
 *
 * Only call this in server-only contexts (API routes, server actions, middleware).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is required");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
