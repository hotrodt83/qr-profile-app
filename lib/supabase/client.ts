'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    browserClient = createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key');
  } else {
    browserClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/** Alias for createBrowserClient (used by auth and other pages). */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient();
}
