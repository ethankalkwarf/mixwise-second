import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { display_name } = body;

    // Display name is optional, but if provided, validate it
    if (display_name !== undefined && display_name !== null) {
      if (typeof display_name !== 'string') {
        return NextResponse.json(
          { error: "Display name must be a string" },
          { status: 400 }
        );
      }

      const trimmedName = display_name.trim();
      
      // Optional: Add length validation
      if (trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Display name must be 100 characters or less" },
          { status: 400 }
        );
      }
    }

    // Update display name (can be null to clear it)
    const newDisplayName = display_name === '' ? null : display_name?.trim() || null;
    
    const { data: updatedData, error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: newDisplayName })
      .eq('id', user.id)
      .select('display_name')
      .single();

    if (updateError) {
      console.error('Error updating display name:', updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update display name" },
        { status: 500 }
      );
    }

    // Verify the update actually worked
    if (!updatedData) {
      console.error('Update returned no data');
      return NextResponse.json(
        { error: "Update may have failed - no data returned" },
        { status: 500 }
      );
    }

    const actualDisplayName = updatedData.display_name || null;
    if (actualDisplayName !== newDisplayName) {
      console.error('Update value mismatch:', {
        expected: newDisplayName,
        actual: actualDisplayName
      });
      return NextResponse.json(
        { error: "Update value mismatch - update may have failed" },
        { status: 500 }
      );
    }

    console.log('✅ Display name update verified:', { 
      userId: user.id, 
      display_name: actualDisplayName 
    });

    return NextResponse.json({ 
      success: true, 
      display_name: actualDisplayName
    });

  } catch (error) {
    console.error('Display name API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "Display name API is working",
    endpoint: "/api/profile/display-name",
    methods: ["GET", "PUT"]
  });
}

