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
 * 5. User is redirected to the intended page with auth_success flag
 * 
 * IMPORTANT: The redirect URL MUST use the canonical production domain
 * to avoid redirecting users to Vercel preview URLs.
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get the canonical base URL for redirects.
 * ALWAYS use the production domain (getmixwise.com) in production,
 * regardless of what URL the request came from.
 */
function getCanonicalBaseUrl(requestUrl: URL): string {
  // In production, ALWAYS redirect to the canonical domain
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }
  
  // Fallback for local development
  return requestUrl.origin;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  // Get the canonical base URL for all redirects
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
          
          // If no preferences row or onboarding not completed, redirect to onboarding
          if (prefError?.code === "PGRST116") {
            // No row found - new user, needs onboarding
            needsOnboarding = true;
            console.log("[Auth Callback] New user, needs onboarding");
          } else if (!prefError && (!preferences || !preferences.onboarding_completed)) {
            needsOnboarding = true;
            console.log("[Auth Callback] Existing user, onboarding not completed");
          } else if (prefError) {
            // Some other error - log but don't block the user
            console.error("[Auth Callback] Preferences check error:", prefError);
          }
        } catch (prefCheckError) {
          // Table might not exist - don't block the user
          console.error("[Auth Callback] Preferences table check failed:", prefCheckError);
        }
        
        if (needsOnboarding) {
          const redirectUrl = new URL("/onboarding", baseUrl);
          // Add auth_success flag so client knows to refresh session state
          redirectUrl.searchParams.set("auth_success", "true");
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

  // Redirect to the intended destination or home
  // Use a validated URL to prevent open redirect vulnerabilities
  const redirectPath = next.startsWith("/") ? next : "/";
  const finalUrl = new URL(redirectPath, baseUrl);
  
  // Add auth_success flag so client knows to refresh session state
  finalUrl.searchParams.set("auth_success", "true");
  
  console.log("[Auth Callback] Redirecting to:", finalUrl.toString());
  return NextResponse.redirect(finalUrl);
}

