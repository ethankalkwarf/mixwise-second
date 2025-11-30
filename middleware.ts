/**
 * Next.js Middleware for Auth Session Refresh
 * 
 * This middleware ensures that Supabase auth sessions are refreshed on each request.
 * It's essential for maintaining session persistence across page navigations.
 * 
 * Key responsibilities:
 * 1. Refresh the auth session on each request (prevents stale sessions)
 * 2. Update cookies with the refreshed session
 * 3. Handle protected routes (optional redirect to login)
 */

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/account"];

// Routes that should skip middleware entirely (static assets, etc.)
const PUBLIC_ROUTES = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/studio",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes and static assets
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Create response object
  const response = NextResponse.next();
  
  try {
    // Create Supabase client with request/response for cookie handling
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Refresh session - this updates the cookies if the session was refreshed
    // This is crucial for maintaining session persistence
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Middleware session error:", error);
    }
    
    // Check if route is protected and user is not authenticated
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute && !session) {
      // Redirect to home page with a return URL
      // The client will show the auth dialog
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
  } catch (error) {
    console.error("Middleware error:", error);
  }
  
  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


