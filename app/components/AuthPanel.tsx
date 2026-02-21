"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Props = {
  onAuthed: () => void;
  onBack?: () => void;
  supabase?: SupabaseClient<Database> | null;
  /** Redirect target after auth (e.g. "/edit?enroll=face"). Defaults to "/edit". */
  nextUrl?: string;
};

export default function AuthPanel({ onAuthed, onBack, supabase: supabaseProp, nextUrl = "/edit" }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => {
    if (supabaseProp !== undefined) return supabaseProp;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, [supabaseProp]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthed();
    });
  }, [supabase, onAuthed]);

  if (!supabase) {
    return (
      <div className="authCard">
        <h1>SmartQR</h1>
        <p className="authSubtitle" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
          Sign-in is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
        </p>
        {onBack && (
          <button type="button" onClick={onBack} className="authBack">
            Back to home
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="authCard">
      <h1>Login to save</h1>
      <p className="authSubtitle">
        You can edit as a guest. Login is required only to save and publish your profile.
      </p>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="authBtnPrimary"
        style={{ width: "100%", marginBottom: 12 }}
      >
        Continue with email
      </button>
      <p className="authHint" style={{ marginTop: 8 }}>
        We’ll send a one-time code to your email. No password.
      </p>
      {onBack && (
        <button type="button" onClick={onBack} className="authBack" style={{ marginTop: 16 }}>
          Back to home
        </button>
      )}
    </div>
  );
}
