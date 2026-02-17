import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, ProfilesRow, ProfilesInsert } from "./database.types"

export type FlatProfile = ProfilesRow

const PROFILE_COLUMNS =
  "id,username,whatsapp,facebook,instagram,tiktok,telegram,linkedin,email,phone,x,website,updated_at"

export type ProfilePayload = {
  username?: string | null
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
}

export async function fetchProfileByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfilesRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle()
  return error ? null : data
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
  return error ? null : data
}

export async function upsertProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: ProfilePayload
): Promise<{ data: ProfilesRow | null; error: unknown }> {
  const row: ProfilesInsert = {
    id: userId,
    ...payload,
    updated_at: new Date().toISOString(),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase.from("profiles") as any).upsert(row, { onConflict: "id" }).select().maybeSingle()
}
