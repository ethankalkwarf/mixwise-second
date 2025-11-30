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
 * 
 * The client-side UserProvider will automatically detect the session
 * via onAuthStateChange and update the UI accordingly.
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get the canonical base URL for redirects.
 * Always use the production domain in production environments.
 */
function getCanonicalBaseUrl(requestUrl: URL): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }
  return requestUrl.origin;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  const baseUrl = getCanonicalBaseUrl(requestUrl);
  
  console.log("[Auth Callback] Processing request", {
    hasCode: !!code,
    hasError: !!error,
    requestOrigin: requestUrl.origin,
    canonicalBaseUrl: baseUrl,
    nextPath: next,
  });
  
  // Handle OAuth errors (e.g., user denied access)
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    const redirectUrl = new URL("/", baseUrl);
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
        console.error("[Auth Callback] Session exchange error:", exchangeError);
        const redirectUrl = new URL("/", baseUrl);
        redirectUrl.searchParams.set("auth_error", "session_exchange_failed");
        return NextResponse.redirect(redirectUrl);
      }
      
      console.log("[Auth Callback] Auth successful for user:", data.user?.email);
      
      // Check if user needs onboarding (new users)
      if (data.user) {
        let needsOnboarding = false;
        
        try {
          const { data: preferences, error: prefError } = await supabase
            .from("user_preferences")
            .select("onboarding_completed")
            .eq("user_id", data.user.id)
            .single();
          
          if (prefError?.code === "PGRST116") {
            // No row found - new user, needs onboarding
            needsOnboarding = true;
            console.log("[Auth Callback] New user, needs onboarding");
          } else if (prefError?.code === "42P01") {
            // Table doesn't exist - skip onboarding entirely
            console.log("[Auth Callback] user_preferences table not found, skipping onboarding");
            needsOnboarding = false;
          } else if (!prefError && (!preferences || !preferences.onboarding_completed)) {
            needsOnboarding = true;
            console.log("[Auth Callback] Existing user, onboarding not completed");
          } else if (prefError) {
            console.error("[Auth Callback] Preferences check error:", prefError);
          }
        } catch (prefCheckError) {
          console.error("[Auth Callback] Preferences table check failed:", prefCheckError);
        }
        
        if (needsOnboarding) {
          const redirectUrl = new URL("/onboarding", baseUrl);
          console.log("[Auth Callback] Redirecting to onboarding:", redirectUrl.toString());
          return NextResponse.redirect(redirectUrl);
        }
      }
      
    } catch (error) {
      console.error("[Auth Callback] Critical error:", error);
      const redirectUrl = new URL("/", baseUrl);
      redirectUrl.searchParams.set("auth_error", "callback_failed");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to the intended destination
  const redirectPath = next.startsWith("/") ? next : "/";
  const finalUrl = new URL(redirectPath, baseUrl);
  
  console.log("[Auth Callback] Redirecting to:", finalUrl.toString());
  return NextResponse.redirect(finalUrl);
}
