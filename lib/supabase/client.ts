'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return placeholder on both server and client so the app never crashes (no white screen).
    // AuthPanel shows "Sign-in is not configured" when supabase is the placeholder.
    return createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

/** Alias for createBrowserClient (used by auth and other pages). */
export function createClient() {
  return createBrowserClient();
}
