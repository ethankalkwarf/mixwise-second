/**
 * Email Diagnostics API
 * 
 * Admin endpoint to diagnose email delivery issues.
 * 
 * GET /api/admin/email-diagnostics?email=user@example.com
 * 
 * Requires ADMIN_SECRET header for authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const authorized = Boolean(ADMIN_SECRET) && authHeader === `Bearer ${ADMIN_SECRET}`;

  if (process.env.NODE_ENV === "production" || ADMIN_SECRET) {
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const showAll = searchParams.get("all") === "true";

  try {
    const supabase = createAdminClient();

    // If specific email requested
    if (email) {
      // Find user in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, display_name, created_at")
        .ilike("email", `%${email}%`)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile lookup error:", profileError);
      }

      // Find user in auth.users (need to use admin API)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 100,
      });

      const authUser = authUsers?.users?.find(
        u => u.email?.toLowerCase().includes(email.toLowerCase())
      );

      // Find email preferences
      let emailPrefs = null;
      if (profile) {
        const { data: prefs } = await supabase
          .from("email_preferences")
          .select("*")
          .eq("user_id", profile.id)
          .single();
        emailPrefs = prefs;
      }

      // Determine why user might not receive emails
      const issues: string[] = [];
      
      if (!profile) {
        issues.push("❌ No profile found in profiles table");
      } else if (!profile.email) {
        issues.push("❌ Profile exists but email is NULL - will NOT receive digest emails");
      }

      if (!authUser) {
        issues.push("⚠️ No auth.users record found with this email");
      } else if (!authUser.email_confirmed_at) {
        issues.push("⚠️ Email not confirmed in auth.users");
      }

      if (profile && authUser && profile.email !== authUser.email) {
        issues.push(`⚠️ Email mismatch: profiles.email="${profile.email}" vs auth.users.email="${authUser.email}"`);
      }

      if (!emailPrefs) {
        issues.push("⚠️ No email_preferences row - will receive emails by default (opt-in)");
      } else {
        if (emailPrefs.weekly_digest === false) {
          issues.push("❌ User has weekly_digest = false - opted out");
        }
        if (emailPrefs.unsubscribed_all_at) {
          issues.push(`❌ User unsubscribed from all emails at ${emailPrefs.unsubscribed_all_at}`);
        }
      }

      if (issues.length === 0) {
        issues.push("✅ User should be receiving weekly digest emails");
      }

      return NextResponse.json({
        email,
        profile: profile || null,
        authUser: authUser ? {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
        } : null,
        emailPreferences: emailPrefs || null,
        diagnosis: issues,
        wouldReceiveDigest: issues.every(i => i.startsWith("✅") || i.startsWith("⚠️ No email_preferences")),
      });
    }

    // Show summary stats
    if (showAll) {
      // Get all profiles with emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .not("email", "is", null);

      // Get email preferences
      const { data: allPrefs } = await supabase
        .from("email_preferences")
        .select("user_id, weekly_digest, unsubscribed_all_at, last_digest_sent_at");

      // Get profiles with NULL email
      const { data: nullEmailProfiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .is("email", null);

      const prefsMap = new Map((allPrefs || []).map(p => [p.user_id, p]));
      
      // Calculate who would receive emails
      const wouldReceive: string[] = [];
      const wouldNotReceive: { email: string; reason: string }[] = [];

      for (const profile of profiles || []) {
        const prefs = prefsMap.get(profile.id);
        
        if (prefs?.unsubscribed_all_at) {
          wouldNotReceive.push({ email: profile.email, reason: "unsubscribed_all" });
        } else if (prefs?.weekly_digest === false) {
          wouldNotReceive.push({ email: profile.email, reason: "weekly_digest=false" });
        } else {
          wouldReceive.push(profile.email);
        }
      }

      return NextResponse.json({
        summary: {
          totalProfilesWithEmail: profiles?.length || 0,
          profilesWithNullEmail: nullEmailProfiles?.length || 0,
          usersWithEmailPreferences: allPrefs?.length || 0,
          wouldReceiveDigest: wouldReceive.length,
          wouldNotReceiveDigest: wouldNotReceive.length,
          lastDigestSentRecorded: allPrefs?.filter(p => p.last_digest_sent_at).length || 0,
        },
        wouldReceive: wouldReceive.slice(0, 50), // First 50
        wouldNotReceive: wouldNotReceive.slice(0, 50),
        nullEmailProfiles: nullEmailProfiles?.slice(0, 20),
      });
    }

    return NextResponse.json({
      usage: "GET /api/admin/email-diagnostics?email=user@example.com or ?all=true",
      requiresAuth: "Authorization: Bearer {ADMIN_SECRET or CRON_SECRET}",
    });

  } catch (error) {
    console.error("[Email Diagnostics] Error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
