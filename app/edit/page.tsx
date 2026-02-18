"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import EditLinksForm from "@/app/components/EditLinksForm";
import AuthPanel from "@/app/components/AuthPanel";

export default function EditPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  function refetchUser() {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setAuthError(null);
    });
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        setUserId(user?.id ?? null);
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refetchUser();
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const supabaseMissing = supabase === null;

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
        <div className="w-full max-w-3xl px-4 py-12">
          <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
        </div>
      </main>
    );
  }

  if (supabaseMissing && authError) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
        <div className="w-full max-w-3xl px-4 py-12">
          <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Could not load</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 16 }}>{authError}</p>
          <Link href="/" className="edit-back">← Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-3xl px-4 py-12">
        {supabaseMissing && (
          <div className="edit-banner" role="alert">
            <strong>Supabase not configured.</strong> Copy <code>.env.example</code> to <code>.env.local</code> and add your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to sign in and save.
          </div>
        )}
        {userId && supabase ? (
          <EditLinksForm
            userId={userId}
            supabase={supabase}
            onBack={() => router.push("/")}
          />
        ) : supabase ? (
          <AuthPanel
            supabase={supabase}
            onAuthed={refetchUser}
            onBack={() => router.push("/")}
          />
        ) : !supabaseMissing ? null : (
          <Link href="/" className="edit-back">← Back to home</Link>
        )}
      </div>
    </main>
  );
}
