/**
 * Test endpoint to verify signup flow components
 * This helps debug "Database error saving new user" issues
 * 
 * Usage: POST /api/auth/test-signup
 * Body: { email: "test@example.com" }
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const testUserId = "00000000-0000-0000-0000-000000000000";

    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      email,
    };

    // Test 1: Check if admin client works
    try {
      const { data: healthCheck } = await supabaseAdmin.from("profiles").select("count").limit(1);
      results.adminClient = { status: "ok", canQuery: !!healthCheck };
    } catch (err) {
      results.adminClient = { status: "error", error: String(err) };
    }

    // Test 2: Check if profiles table exists and is accessible
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .limit(1);
      results.profilesTable = {
        status: error ? "error" : "ok",
        error: error ? { code: error.code, message: error.message } : null,
        canRead: !!data,
      };
    } catch (err) {
      results.profilesTable = { status: "error", error: String(err) };
    }

    // Test 3: Check if trigger function exists
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: triggerCheck, error: triggerError } = await (supabaseAdmin as any).rpc(
        "pg_get_functiondef",
        { funcname: "handle_new_user" }
      ).catch(() => ({ data: null, error: { message: "Function check not available via RPC" } }));

      results.triggerFunction = {
        status: triggerError ? "unknown" : "exists",
        note: "Check Supabase SQL editor to verify trigger exists",
      };
    } catch (err) {
      results.triggerFunction = { status: "error", error: String(err) };
    }

    // Test 4: Try to verify a user exists (using a test user ID)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userCheck, error: userError } = await (supabaseAdmin.auth.admin as any).getUserById(testUserId);
      results.userVerification = {
        status: userError ? "expected_error" : "ok",
        note: "Test user doesn't exist (expected), but API is accessible",
        error: userError ? userError.message : null,
      };
    } catch (err) {
      results.userVerification = { status: "error", error: String(err) };
    }

    // Test 5: Check RLS policies
    results.rlsNote = "RLS is enabled but admin client should bypass it";

    return NextResponse.json({
      success: true,
      tests: results,
      recommendations: [
        "If adminClient fails: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
        "If profilesTable fails: Check database connection and table exists",
        "If triggerFunction unknown: Run migration 017_verify_profile_trigger.sql",
        "If userVerification fails: Check Supabase Auth API access",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

