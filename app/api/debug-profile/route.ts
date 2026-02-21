import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "HotRod";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Test 1: Direct query to profiles table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .single();

  // Test 2: Check profile_links table for this user
  let linksData = null;
  let linksError = null;
  if (profileData?.id) {
    const result = await supabase
      .from("profile_links")
      .select("*")
      .eq("user_id", profileData.id)
      .order("sort_order");
    linksData = result.data;
    linksError = result.error;
  }

  // Test 3: Call the RPC function
  let rpcData = null;
  let rpcError = null;
  try {
    const result = await supabase.rpc("get_public_profile", {
      p_username: username,
    });
    rpcData = result.data;
    rpcError = result.error;
  } catch (e: any) {
    rpcError = { message: e.message };
  }

  // Test 4: Check if profile_links table exists
  let tableCheck = null;
  try {
    const { data, error } = await supabase
      .from("profile_links")
      .select("id")
      .limit(1);
    tableCheck = { exists: !error, error: error?.message };
  } catch (e: any) {
    tableCheck = { exists: false, error: e.message };
  }

  return NextResponse.json({
    username,
    profile: {
      data: profileData,
      error: profileError,
    },
    profileLinks: {
      data: linksData,
      error: linksError,
      tableCheck,
    },
    rpcFunction: {
      data: rpcData,
      error: rpcError,
      hasLinksColumn: rpcData?.[0]?.links !== undefined,
    },
  });
}
