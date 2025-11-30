/**
 * Supabase Server-Side Helper
 * 
 * This module provides server-side Supabase clients for use in:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 */

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client for use in Server Components.
 * Must be called in a Server Component context.
 */
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

/**
 * Gets the current user from a server context.
 * Returns null if not authenticated.
 */
export async function getServerUser() {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Gets the current user's profile from a server context.
 * Returns null if not authenticated or profile doesn't exist.
 */
export async function getServerProfile() {
  const supabase = createServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) return null;
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (profileError) return null;
  
  return profile;
}


