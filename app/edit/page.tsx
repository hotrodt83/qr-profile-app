"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import EditLinksForm from "@/app/components/EditLinksForm";

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
        if (!user) {
          setLoading(false);
          router.replace("/auth?next=/edit");
          return;
        }
        setUserId(user.id);
      } catch (err) {
        if (cancelled) return;
        setAuthError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, supabase]);

  const supabaseMissing = supabase === null;

  if (loading) {
    return (
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
        </div>
      </main>
    );
  }

  if (!supabaseMissing && !userId && !authError) {
    return (
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Redirecting to sign in…</p>
          <Link href="/auth" className="edit-back">Go to sign in</Link>
        </div>
      </main>
    );
  }

  if (!supabaseMissing && authError) {
    return (
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Could not load session</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 16 }}>{authError}</p>
          <Link href="/auth" className="edit-back">Sign in</Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <Link href="/" className="edit-back">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-page">
      <div className="edit-inner">
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
        ) : !supabaseMissing ? null : (
          <Link href="/" className="edit-back">← Back to home</Link>
        )}
      </div>
    </main>
  );
}
