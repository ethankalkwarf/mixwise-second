import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint for shopping list - tests database operations directly
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", authError }, { status: 401 });
    }

    // Get service client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "No service role key" }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test 1: Count all rows
    const { count: totalCount, error: countError } = await supabase
      .from("shopping_list")
      .select("*", { count: "exact", head: true });

    // Test 2: Count rows for this user
    const { count: userCount, error: userCountError } = await supabase
      .from("shopping_list")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Test 3: Get all rows for this user
    const { data: userRows, error: userRowsError } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id);

    // Test 4: Insert a test row
    const testId = `debug-test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from("shopping_list")
      .insert({
        user_id: user.id,
        ingredient_id: testId,
        ingredient_name: "Debug Test Item",
        ingredient_category: "Test",
        is_checked: false,
      })
      .select();

    // Test 5: Query for the inserted row
    const { data: findData, error: findError } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .eq("ingredient_id", testId);

    // Test 6: Delete the test row
    const { error: deleteError } = await supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", user.id)
      .eq("ingredient_id", testId);

    // Test 7: Final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from("shopping_list")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      tests: {
        totalRowsInTable: { count: totalCount, error: countError?.message },
        userRowCount: { count: userCount, error: userCountError?.message },
        userRows: { data: userRows, error: userRowsError?.message },
        insertTest: { data: insertData, error: insertError?.message },
        findInserted: { data: findData, error: findError?.message },
        deleteTest: { error: deleteError?.message },
        finalUserCount: { count: finalCount, error: finalCountError?.message },
      },
      summary: {
        insertWorked: !insertError && insertData && insertData.length > 0,
        findWorked: !findError && findData && findData.length > 0,
        deleteWorked: !deleteError,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

