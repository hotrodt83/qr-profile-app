import { NextResponse } from "next/server";
import { createServerClient, createServerClientWithAuth } from "@/lib/supabase/server";
import {
  upsertProfile,
  validateProfilePayload,
  syncProfileLinks,
  type ProfilePayload,
  type ProfileLinkPayload,
} from "@/lib/supabase/profile";

/**
 * POST /api/profile/save
 * Body: JSON ProfilePayload (username, display_name, bio, avatar_url, links, privacy flags, etc.)
 * Auth: Authorization: Bearer <access_token>
 * Returns: 200 + { profile } on success; 4xx/5xx + { error } on failure.
 * Use this for persistent profile save so server can log and use the same session.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const supabaseAuth = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) {
    console.error("[api/profile/save] auth failed:", userError?.message ?? "No user");
    return NextResponse.json(
      { error: "Invalid or expired session. Please sign in again." },
      { status: 401 }
    );
  }

  const userId = user.id;
  let payload: ProfilePayload;
  let links: ProfileLinkPayload[] = [];
  try {
    const body = await request.json();
    payload = body as ProfilePayload;
    if (Array.isArray(body.links)) {
      links = body.links as ProfileLinkPayload[];
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateProfilePayload(payload);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const supabase = createServerClientWithAuth(token);
  const { data, error } = await upsertProfile(supabase, userId, payload);

  if (error) {
    const msg = String((error as { message?: string }).message ?? "");
    const code = String((error as { code?: string }).code ?? "");
    console.error("[api/profile/save] upsert failed:", { userId, code, message: msg, error });
    if (code === "23505" || msg.includes("unique") || msg.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Username already taken. Choose a different one." },
        { status: 409 }
      );
    }
    if (
      msg.includes("row-level security") ||
      msg.includes("policy") ||
      code === "42501"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to update this profile. Try signing in again." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: msg || "Profile save failed." },
      { status: 500 }
    );
  }

  const row = data ?? null;
  const hasUsername = Boolean(row?.username?.trim());
  if (!hasUsername) {
    console.error("[api/profile/save] upsert returned row without username:", row);
    return NextResponse.json(
      { error: "Profile save failed—check permissions." },
      { status: 500 }
    );
  }

  // Sync profile_links if provided
  if (links.length > 0) {
    const { error: linksError } = await syncProfileLinks(supabase, userId, links);
    if (linksError) {
      console.error("[api/profile/save] syncProfileLinks failed:", linksError);
    }
  }

  return NextResponse.json({ profile: row });
}
