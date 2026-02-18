import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

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
