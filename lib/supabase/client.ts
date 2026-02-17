'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      return createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key');
    }
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

/** Alias for createBrowserClient (used by auth and other pages). */
export function createClient() {
  return createBrowserClient();
}
