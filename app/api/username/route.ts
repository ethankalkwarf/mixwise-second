import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    // Validate username format
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }

    console.log('[POST /api/username] Setting username:', {
      username: trimmedUsername,
      userId: user.id
    });

    // Check uniqueness (excluding current user) - case-insensitive
    // First check if current user already has this username (case-insensitive)
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single();

    if (currentError) {
      console.error('[POST /api/username] Error fetching current profile:', currentError);
    }

    console.log('[POST /api/username] Current profile:', {
      id: currentProfile?.id,
      currentUsername: currentProfile?.username,
      requestedUsername: trimmedUsername,
      match: currentProfile?.username?.toLowerCase() === trimmedUsername.toLowerCase()
    });

    // If user already has this username (case-insensitive), allow the update
    if (currentProfile?.username?.toLowerCase() === trimmedUsername.toLowerCase()) {
      console.log('[POST /api/username] ✅ User already has this username, allowing update');
      // Continue to update (which will just set it to the same value, but that's fine)
    } else {
      // Check if any other user has this username (case-insensitive)
      const { data: allProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', user.id)
        .not('username', 'is', null);

      if (checkError) {
        console.error('[POST /api/username] Error checking username uniqueness:', checkError);
        return NextResponse.json(
          { error: "Failed to validate username" },
          { status: 500 }
        );
      }

      // Check case-insensitively
      const trimmedLower = trimmedUsername.toLowerCase();
      const matchingProfiles = allProfiles?.filter(
        profile => profile.username?.toLowerCase() === trimmedLower
      ) || [];
      
      const isTaken = matchingProfiles.length > 0;

      console.log('[POST /api/username] Uniqueness check:', {
        username: trimmedUsername,
        trimmedLower,
        totalProfilesChecked: allProfiles?.length || 0,
        matchingProfiles: matchingProfiles.map(p => ({ id: p.id, username: p.username })),
        isTaken
      });

      if (isTaken) {
        console.log('[POST /api/username] ❌ Username is taken (case-insensitive):', trimmedUsername);
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    // Update username
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmedUsername })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating username:', updateError);
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, username: trimmedUsername });

  } catch (error) {
    console.error('Username API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check username availability
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Check if username is available (excluding current user)
    // Use case-insensitive comparison to avoid false positives
    const trimmedUsername = username.trim();
    
    console.log('[GET /api/username] Checking availability:', {
      username: trimmedUsername,
      userId: user.id
    });
    
    // First, check if the current user already has this username (case-insensitive)
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single();

    if (currentUserError) {
      console.error('[GET /api/username] Error fetching current user profile:', currentUserError);
    }

    console.log('[GET /api/username] Current user profile:', {
      id: currentUserProfile?.id,
      username: currentUserProfile?.username,
      requestedUsername: trimmedUsername,
      match: currentUserProfile?.username?.toLowerCase() === trimmedUsername.toLowerCase()
    });

    if (currentUserProfile?.username && currentUserProfile.username.toLowerCase() === trimmedUsername.toLowerCase()) {
      // User already has this username (maybe different case) - it's available to them
      console.log('[GET /api/username] ✅ User already has this username, returning available: true');
      return NextResponse.json({
        available: true
      });
    }

    // Check if any other user has this username (case-insensitive using RPC or raw query)
    // Since Supabase doesn't support ILIKE directly, we'll fetch and check in JS
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', user.id)
      .not('username', 'is', null);

    if (error) {
      console.error('[GET /api/username] Error checking username availability:', error);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // Check case-insensitively in JavaScript
    const trimmedLower = trimmedUsername.toLowerCase();
    const matchingProfiles = allProfiles?.filter(
      profile => profile.username?.toLowerCase() === trimmedLower
    ) || [];
    
    const isTaken = matchingProfiles.length > 0;

    console.log('[GET /api/username] Username availability check result:', {
      username: trimmedUsername,
      trimmedLower,
      totalProfilesChecked: allProfiles?.length || 0,
      matchingProfiles: matchingProfiles.map(p => ({ id: p.id, username: p.username })),
      isTaken,
      currentUserHasIt: currentUserProfile?.username?.toLowerCase() === trimmedLower,
      available: !isTaken
    });

    return NextResponse.json({
      available: !isTaken
    });

  } catch (error) {
    console.error('Username availability check error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
