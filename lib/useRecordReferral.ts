"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

const REF_STORAGE_KEY = "smartqr_ref";

export function useRecordReferral(
  supabase: SupabaseClient | null,
  userId: string | null
): void {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!supabase || !userId) return;
    if (attemptedRef.current) return;

    let ref: string | null = null;
    try {
      ref = localStorage.getItem(REF_STORAGE_KEY);
    } catch {
      return;
    }

    if (!ref) return;

    attemptedRef.current = true;

    (async () => {
      try {
        const { error } = await supabase.from("referrals").upsert(
          {
            referrer_username: ref,
            referred_user_id: userId,
          },
          { onConflict: "referred_user_id" }
        );

        if (!error) {
          try {
            localStorage.removeItem(REF_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      } catch {
        // Network error or other failure; will retry on next page load
        attemptedRef.current = false;
      }
    })();
  }, [supabase, userId]);
}
