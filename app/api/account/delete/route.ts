import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = user.id;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { error: linksError } = await supabaseAdmin
      .from("profile_links")
      .delete()
      .eq("user_id", userId);

    if (linksError) {
      console.error("Failed to delete profile_links:", linksError);
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Failed to delete user:", deleteUserError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
