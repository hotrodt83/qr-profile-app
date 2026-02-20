import { NextResponse } from "next/server";
import { createServerClient, createServerClientWithAuth } from "@/lib/supabase/server";

const TEST_USERNAME = "save-test-user";
const TEST_DISPLAY_NAME = "Profile Save Test";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json(
      { error: "Not logged in. Send Authorization: Bearer <access_token>." },
      { status: 401 }
    );
  }

  const supabaseAuth = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json(
      {
        error: "Invalid or expired session.",
        detail: userError?.message ?? "No user",
      },
      { status: 401 }
    );
  }

  const userId = user.id;
  const supabase = createServerClientWithAuth(token);

  const testRow = {
    id: userId,
    username: TEST_USERNAME,
    display_name: TEST_DISPLAY_NAME,
    bio: "Automated save test",
    updated_at: new Date().toISOString(),
  };

  let upserted: Record<string, unknown> | null = null;
  let fetched: Record<string, unknown> | null = null;

  const { data: upsertData, error: upsertError } = await supabase
    .from("profiles")
    .upsert(testRow as never, { onConflict: "id" })
    .select()
    .single();

  if (upsertError) {
    const msg = String((upsertError as { message?: string }).message ?? "");
    const code = String((upsertError as { code?: string }).code ?? "").toLowerCase();
    const rlsHint =
      msg.includes("row-level security") || msg.includes("policy") || code === "42501"
        ? " Check RLS: allow SELECT/UPDATE/INSERT for authenticated user on profiles (id = auth.uid())."
        : "";
    return NextResponse.json(
      {
        upsertOk: false,
        selectOk: false,
        error: "Upsert failed.",
        detail: msg + rlsHint,
        code,
      },
      { status: 400 }
    );
  }

  upserted = upsertData as Record<string, unknown>;

  const { data: fetchData, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError) {
    const msg = String((fetchError as { message?: string }).message ?? "");
    return NextResponse.json(
      {
        upserted,
        upsertOk: true,
        selectOk: false,
        error: "Read-after-write failed.",
        detail: msg,
      },
      { status: 200 }
    );
  }

  fetched = fetchData as Record<string, unknown>;

  return NextResponse.json({
    upsertOk: true,
    selectOk: true,
    upserted,
    fetched,
  });
}
