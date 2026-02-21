import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "HotRod";

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createServerClient();

  // Test 1: Direct query to profiles table
  const { data: directData, error: directError } = await supabase
    .from("profiles")
    .select("id, username, whatsapp, whatsapp_public, email, email_public, website, website_public")
    .ilike("username", username)
    .maybeSingle();

  // Test 2: Call the RPC function
  let rpcData = null;
  let rpcError = null;
  try {
    const result = await (supabase as any).rpc("get_public_profile", {
      p_username: username,
    });
    rpcData = result.data;
    rpcError = result.error;
  } catch (e: any) {
    rpcError = { message: e.message };
  }

  return NextResponse.json({
    username,
    directQuery: {
      data: directData,
      error: directError,
    },
    rpcFunction: {
      data: rpcData,
      error: rpcError,
    },
  });
}
