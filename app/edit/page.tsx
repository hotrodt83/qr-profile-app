"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { useHasProfile } from "@/lib/useHasProfile";
import EditLinksForm from "@/app/components/EditLinksForm";
import AuthPanel from "@/app/components/AuthPanel";

export default function EditPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { hasProfile, loading: profileLoading, profileError } = useHasProfile();
  const userId = user?.id ?? null;
  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [showAuth, setShowAuth] = useState(false);

  // Route protection: redirect to create only when we know user has no profile (no fetch error)
  useEffect(() => {
    if (sessionLoading || profileLoading) return;
    if (profileError) return; // don't redirect on fetch error — we don't know if they have a profile
    if (user && !hasProfile) {
      router.replace("/create");
    }
  }, [user, hasProfile, sessionLoading, profileLoading, profileError, router]);

  function refetchUser() {
    setShowAuth(false);
  }

  const supabaseMissing = supabase === null;
  const needsRedirect = user && !hasProfile && !profileError;
  const checkingAccess = sessionLoading || profileLoading || needsRedirect;

  if (checkingAccess) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <p className="text-white/70">Loading…</p>
      </main>
    );
  }

  if (user && profileError) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <div className="text-center px-4">
          <p className="text-white/90 mb-2">Could not load your profile.</p>
          <p className="text-white/60 text-sm mb-4">Try refreshing the page or signing in again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            Retry
          </button>
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
          <>
            <EditLinksForm
              isGuest
              supabase={supabase}
              onBack={() => router.push("/")}
              onRequestAuth={() => setShowAuth(true)}
            />
            {showAuth && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Sign in">
                <div className="relative w-full max-w-lg mx-4 bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl p-6">
                  <button
                    type="button"
                    onClick={() => setShowAuth(false)}
                    className="absolute top-4 right-4 text-white/60 hover:text-white"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  <AuthPanel
                    supabase={supabase}
                    onAuthed={refetchUser}
                    onBack={() => setShowAuth(false)}
                    nextUrl="/edit"
                  />
                </div>
              </div>
            )}
          </>
        ) : !supabaseMissing ? null : (
          <Link href="/" className="edit-back">← Back to home</Link>
        )}
      </div>
    </main>
  );
}
