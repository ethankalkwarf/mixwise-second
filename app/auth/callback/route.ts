/**
 * Auth Callback Route Handler
 * 
 * This route handles OAuth and magic link callbacks from Supabase Auth.
 * It exchanges the auth code for a session and sets cookies for session persistence.
 * 
 * Flow:
 * 1. User completes OAuth (Google) or clicks magic link (email)
 * 2. Supabase redirects here with a `code` parameter
 * 3. We exchange the code for a session
 * 4. Cookies are automatically set by the Supabase client
 * 5. User is redirected to the intended page
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  // Handle OAuth errors (e.g., user denied access)
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    const redirectUrl = new URL("/", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", error);
    if (errorDescription) {
      redirectUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Session exchange error:", exchangeError);
        const redirectUrl = new URL("/", requestUrl.origin);
        redirectUrl.searchParams.set("auth_error", "session_exchange_failed");
        return NextResponse.redirect(redirectUrl);
      }
      
      // Log successful auth for debugging
      console.log("Auth successful for user:", data.user?.email);
      
      // Check if user needs onboarding (new users)
      if (data.user) {
        const { data: preferences, error: prefError } = await supabase
          .from("user_preferences")
          .select("onboarding_completed")
          .eq("user_id", data.user.id)
          .single();
        
        // If no preferences exist or onboarding not completed, redirect to onboarding
        if (!prefError && (!preferences || !preferences.onboarding_completed)) {
          return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        }
        
        // Handle case where preferences table doesn't exist yet (first-time setup)
        if (prefError && prefError.code !== "PGRST116") {
          console.log("Note: user_preferences table may need to be created");
        }
      }
      
    } catch (error) {
      console.error("Auth callback error:", error);
      const redirectUrl = new URL("/", requestUrl.origin);
      redirectUrl.searchParams.set("auth_error", "callback_failed");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to the intended destination or home
  // Use a validated URL to prevent open redirect vulnerabilities
  const redirectPath = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}

