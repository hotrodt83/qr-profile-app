import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const confirm = searchParams.get("confirm");

  if (confirm !== "yes") {
    return NextResponse.json({ 
      error: "Add ?confirm=yes to actually delete",
      message: "This will delete the empty duplicate profile"
    }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  
  if (!supabase) {
    return NextResponse.json({ 
      error: "Service role not configured",
      hint: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (get it from Supabase Dashboard → Settings → API)",
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    }, { status: 500 });
  }

  const duplicateId = "ed64f1fe-8f3a-4fe2-9bbf-b2b120e5b2b4";

  // First, verify the duplicate exists
  const { data: before, error: selectError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", duplicateId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: "Select failed", details: selectError }, { status: 500 });
  }

  if (!before) {
    return NextResponse.json({ 
      success: true, 
      message: "Duplicate already deleted or doesn't exist",
      duplicateId
    });
  }

  // Delete the duplicate
  const { error: deleteError, count } = await supabase
    .from("profiles")
    .delete({ count: "exact" })
    .eq("id", duplicateId);

  if (deleteError) {
    return NextResponse.json({ 
      error: "Delete failed", 
      details: deleteError,
      hint: "Run this SQL in Supabase Dashboard: DELETE FROM profiles WHERE id = 'ed64f1fe-8f3a-4fe2-9bbf-b2b120e5b2b4';"
    }, { status: 500 });
  }

  // Verify it's gone
  const { data: after } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", duplicateId)
    .maybeSingle();

  return NextResponse.json({ 
    success: true, 
    message: `Deleted duplicate profile`,
    deletedCount: count,
    stillExists: Boolean(after),
    before: before,
    after: after
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST with ?confirm=yes to delete duplicate",
    sql: "DELETE FROM profiles WHERE id = 'ed64f1fe-8f3a-4fe2-9bbf-b2b120e5b2b4';",
    instructions: "Run the SQL above in Supabase Dashboard → SQL Editor"
  });
}
