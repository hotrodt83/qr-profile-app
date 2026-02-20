import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/** Use to skip Supabase calls during build when env vars are missing (avoids build crash). */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key')
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

/** Server-only client with service role; use for operations that bypass RLS (e.g. signed URLs). */
export function createServiceRoleClient(): ReturnType<typeof createClient<Database>> | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
}

/** Client that sends the given JWT so RLS sees the user (e.g. in API routes). */
export function createServerClientWithAuth(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key', {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

const SUPABASE_STORAGE_PUBLIC_RE = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/

/**
 * Returns a URL that allows public (guest) access to the avatar.
 * - If avatarUrl is a Supabase storage URL and service role is set: returns a short-lived signed URL (private bucket).
 * - Otherwise returns avatarUrl as-is (public bucket URL or data URL).
 */
export async function getPublicAvatarUrl(avatarUrl: string | null | undefined): Promise<string | null> {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null
  const trimmed = avatarUrl.trim()
  if (!trimmed) return null

  const match = trimmed.match(SUPABASE_STORAGE_PUBLIC_RE)
  if (!match) return trimmed

  const [, bucket, path] = match
  const serviceClient = createServiceRoleClient()
  if (!serviceClient) return trimmed

  const { data, error } = await serviceClient.storage.from(bucket).createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) return trimmed
  return data.signedUrl
}
