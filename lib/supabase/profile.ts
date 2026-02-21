import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, ProfilesRow, ProfilesInsert, ProfileLinkRow, ProfileLinkInsert } from "./database.types"

export type FlatProfile = ProfilesRow

const PROFILE_COLUMNS =
  "id,username,display_name,bio,avatar_url,whatsapp,facebook,instagram,tiktok,telegram,linkedin,email,phone,x,website,phone_public,email_public,whatsapp_public,facebook_public,instagram_public,tiktok_public,telegram_public,linkedin_public,x_public,website_public,email_verified,face_descriptor,updated_at"

export type ProfilePayload = {
  username?: string | null
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  whatsapp?: string | null
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  telegram?: string | null
  linkedin?: string | null
  email?: string | null
  phone?: string | null
  x?: string | null
  website?: string | null
  phone_public?: boolean | null
  email_public?: boolean | null
  whatsapp_public?: boolean | null
  facebook_public?: boolean | null
  instagram_public?: boolean | null
  tiktok_public?: boolean | null
  telegram_public?: boolean | null
  linkedin_public?: boolean | null
  x_public?: boolean | null
  website_public?: boolean | null
  email_verified?: boolean | null
  face_descriptor?: number[] | null
}

/** Minimal columns when some link columns (e.g. whatsapp) are missing from the table. */
const PROFILE_COLUMNS_MINIMAL =
  "id,username,display_name,bio,avatar_url,facebook,instagram,tiktok,telegram,linkedin,email,phone,x,website,updated_at"

/** Smallest set when table has only core columns (avoids missing-column errors on strict schemas). */
const PROFILE_COLUMNS_BASE = "id,username,display_name,bio,avatar_url,updated_at"

export type FetchProfileResult = { data: ProfilesRow | null; error: null } | { data: null; error: unknown }

/** Fetches profile by user id. Returns { data, error } so callers can distinguish "no row" from real errors. */
export async function fetchProfileByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FetchProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle()
  if (!error) return { data: data ?? null, error: null }
  const msg = String((error as { message?: string }).message ?? "")
  if (msg.includes("Could not find the") && msg.includes("column")) {
    const { data: dataMin, error: errMin } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS_MINIMAL)
      .eq("id", userId)
      .maybeSingle()
    if (!errMin) return { data: dataMin ?? null, error: null }
    const msgMin = String((errMin as { message?: string }).message ?? "")
    if (msgMin.includes("Could not find the") && msgMin.includes("column")) {
      const { data: dataBase, error: errBase } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS_BASE)
        .eq("id", userId)
        .maybeSingle()
      if (!errBase) return { data: dataBase ?? null, error: null }
      return { data: null, error: errBase }
    }
    return { data: null, error: errMin }
  }
  return { data: null, error }
}

export async function fetchProfileByUsername(
  supabase: SupabaseClient<Database>,
  username: string
): Promise<ProfilesRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("username", username)
    .maybeSingle()
  if (!error) return data
  const msg = String((error as { message?: string }).message ?? "")
  if (msg.includes("Could not find the") && msg.includes("column")) {
    const { data: dataMin, error: errMin } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS_MINIMAL)
      .eq("username", username)
      .maybeSingle()
    if (!errMin) return dataMin ?? null
    const msgMin = String((errMin as { message?: string }).message ?? "")
    if (msgMin.includes("Could not find the") && msgMin.includes("column")) {
      const { data: dataBase } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS_BASE)
        .eq("username", username)
        .maybeSingle()
      return dataBase ?? null
    }
    return null
  }
  return null
}

/** Server-side / shared validation: username required (non-empty). Use before upsert for defense in depth. */
export function validateProfilePayload(payload: ProfilePayload): { valid: true } | { valid: false; message: string } {
  const u = payload.username;
  if (u == null || String(u).trim() === "") {
    return { valid: false, message: "Username is required." };
  }
  return { valid: true };
}

const UPSERT_KEYS: (keyof ProfilePayload)[] = [
  "username", "display_name", "bio", "avatar_url", "email_verified",
  "whatsapp", "facebook", "instagram", "tiktok", "telegram", "linkedin", "email", "phone", "x", "website",
  "phone_public", "email_public", "whatsapp_public", "facebook_public", "instagram_public",
  "tiktok_public", "telegram_public", "linkedin_public", "x_public", "website_public",
]

/** Match PostgREST "Could not find the 'X' column of 'profiles' in the schema cache" */
const MISSING_COLUMN_RE = /Could not find the '(\w+)' column of 'profiles' in the schema cache/

export function buildUpsertRow(
  userId: string,
  payload: ProfilePayload,
  excludeKeys: Set<string> = new Set()
): ProfilesInsert {
  const updated_at = new Date().toISOString()
  const row: Record<string, unknown> = { id: userId, updated_at }
  for (const key of UPSERT_KEYS) {
    if (excludeKeys.has(key)) continue
    const v = payload[key]
    if (v !== undefined) row[key] = v
  }
  return row as ProfilesInsert
}

export async function upsertProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: ProfilePayload
): Promise<{ data: ProfilesRow | null; error: unknown }> {
  const excludeKeys = new Set<string>()
  const maxAttempts = 25
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const row = buildUpsertRow(userId, payload, excludeKeys)
    if (process.env.NODE_ENV === "development") {
      console.log("[profile] upsert row keys:", Object.keys(row), "username:", (row as Record<string, unknown>).username)
    }
    const { data, error } = await supabase
      .from("profiles")
      .upsert(row as never, { onConflict: "id" })
      .select()
      .maybeSingle()
    if (process.env.NODE_ENV === "development" && (error || data)) {
      console.log("[profile] upsert response:", { data, error })
    }
    if (!error) return { data: data ?? null, error: null }
    const msg = String((error as { message?: string }).message ?? "")
    const match = msg.match(MISSING_COLUMN_RE)
    if (match) {
      const col = match[1]
      excludeKeys.add(col)
      if (col.endsWith("_public")) {
        const base = col.replace(/_public$/, "")
        if (UPSERT_KEYS.includes(base as keyof ProfilePayload)) excludeKeys.add(base)
      } else {
        const pub = `${col}_public`
        if (UPSERT_KEYS.includes(pub as keyof ProfilePayload)) excludeKeys.add(pub)
      }
      continue
    }
    return { data: null, error }
  }
  return { data: null, error: new Error("Save failed after retries") }
}

/** Update only avatar_url (and updated_at). Uses upsert to ensure row exists. */
export async function updateAvatarUrl(
  supabase: SupabaseClient<Database>,
  userId: string,
  avatarUrl: string | null
): Promise<{ error: unknown }> {
  const updated_at = new Date().toISOString()
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_url: avatarUrl, updated_at } as never, { onConflict: "id" })
  return { error }
}

/** Ensures a profile row exists for the given user. Creates with minimal defaults if missing. */
export async function ensureProfileExists(
  supabase: SupabaseClient<Database>,
  userId: string,
  _email?: string | null
): Promise<{ data: ProfilesRow | null; error: unknown }> {
  const result = await fetchProfileByUserId(supabase, userId)
  if (result.data) {
    return { data: result.data, error: null }
  }
  if (result.error) {
    return { data: null, error: result.error }
  }
  const minimalRow: ProfilesInsert = {
    id: userId,
    username: null,
    display_name: null,
    bio: null,
    avatar_url: null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from("profiles")
    .upsert(minimalRow as never, { onConflict: "id" })
    .select()
    .maybeSingle()
  return { data: data ?? null, error }
}

/** Public profile data returned by get_public_profile SQL function */
export type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  x_handle: string | null;
  linkedin: string | null;
  website: string | null;
};

/** Fetch public profile via SQL function - returns only fields marked as public */
export async function fetchPublicProfileByUsername(
  supabase: SupabaseClient<Database>,
  username: string
): Promise<PublicProfile | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_public_profile", {
    p_username: username,
  });
  if (error) {
    console.error("[profile] get_public_profile error:", error);
    return null;
  }
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row as PublicProfile;
}

/** Update only face descriptor for owner verification (enrollment). */
export async function updateFaceDescriptor(
  supabase: SupabaseClient<Database>,
  userId: string,
  descriptor: number[]
): Promise<{ error: unknown }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any)
    .update({ face_descriptor: descriptor, updated_at: new Date().toISOString() })
    .eq("id", userId)
  return { error }
}

// =============================================================================
// PROFILE LINKS (profile_links table)
// =============================================================================

export type ProfileLinkPayload = {
  platform: string
  value: string
  is_public: boolean
  sort_order?: number
}

/** Fetch all links for a user (owner view - includes private links) */
export async function fetchProfileLinksByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ data: ProfileLinkRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("profile_links")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
  if (error) return { data: [], error }
  return { data: data ?? [], error: null }
}

/** Fetch public links for a user (public view - only is_public=true) */
export async function fetchPublicProfileLinks(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfileLinkRow[]> {
  const { data, error } = await supabase
    .from("profile_links")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("[profile] fetchPublicProfileLinks error:", error)
    return []
  }
  return data ?? []
}

/** Upsert multiple links for a user (by user_id + platform) */
export async function upsertProfileLinks(
  supabase: SupabaseClient<Database>,
  userId: string,
  links: ProfileLinkPayload[]
): Promise<{ data: ProfileLinkRow[]; error: unknown }> {
  if (links.length === 0) {
    return { data: [], error: null }
  }

  const rows: ProfileLinkInsert[] = links.map((link, idx) => ({
    user_id: userId,
    platform: link.platform,
    value: link.value,
    is_public: link.is_public,
    sort_order: link.sort_order ?? idx,
    updated_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from("profile_links")
    .upsert(rows as any, { onConflict: "user_id,platform" })
    .select()

  if (error) {
    console.error("[profile] upsertProfileLinks error:", error)
    return { data: [], error }
  }
  return { data: data ?? [], error: null }
}

/** Delete links for platforms not in the provided list */
export async function deleteRemovedProfileLinks(
  supabase: SupabaseClient<Database>,
  userId: string,
  keepPlatforms: string[]
): Promise<{ error: unknown }> {
  if (keepPlatforms.length === 0) {
    const { error } = await supabase
      .from("profile_links")
      .delete()
      .eq("user_id", userId)
    return { error }
  }

  const { error } = await supabase
    .from("profile_links")
    .delete()
    .eq("user_id", userId)
    .not("platform", "in", `(${keepPlatforms.map(p => `"${p}"`).join(",")})`)
  return { error }
}

/** Sync profile links: upsert provided links, delete any not in the list */
export async function syncProfileLinks(
  supabase: SupabaseClient<Database>,
  userId: string,
  links: ProfileLinkPayload[]
): Promise<{ data: ProfileLinkRow[]; error: unknown }> {
  const nonEmptyLinks = links.filter(l => l.value.trim() !== "")
  
  const upsertResult = await upsertProfileLinks(supabase, userId, nonEmptyLinks)
  if (upsertResult.error) {
    return upsertResult
  }

  const keepPlatforms = nonEmptyLinks.map(l => l.platform)
  const deleteResult = await deleteRemovedProfileLinks(supabase, userId, keepPlatforms)
  if (deleteResult.error) {
    console.error("[profile] deleteRemovedProfileLinks error:", deleteResult.error)
  }

  return upsertResult
}
