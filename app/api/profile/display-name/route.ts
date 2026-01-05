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
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: display_name === '' ? null : display_name?.trim() || null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating display name:', updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update display name" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      display_name: display_name === '' ? null : display_name?.trim() || null 
    });

  } catch (error) {
    console.error('Display name API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

