/**
 * Auth Callback Route Handler
 * 
 * This route handles OAuth and magic link callbacks from Supabase Auth.
 * It exchanges the auth code for a session and redirects the user.
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Auth callback error:", error);
      // Redirect to home with error
      return NextResponse.redirect(new URL("/?auth_error=true", requestUrl.origin));
    }
  }

  // Redirect to the intended destination or home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

