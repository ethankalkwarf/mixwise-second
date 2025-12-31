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
 *
 * Environment variables:
 * - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL: The Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: The service role key (never expose client-side!)
 */
export function createAdminClient() {
  // Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL for flexibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable is required");
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
