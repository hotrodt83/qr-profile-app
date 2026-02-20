"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { useRecordReferral } from "@/lib/useRecordReferral";
import EditLinksForm from "@/app/components/EditLinksForm";
import AuthPanel from "@/app/components/AuthPanel";

/**
 * First-time profile creation. New users must use this flow (or "Create SmartQR" on landing).
 * After profile exists, use /edit to edit.
 */
export default function CreatePage() {
  const router = useRouter();
  const { user } = useSession();
  const userId = user?.id ?? null;
  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [showAuth, setShowAuth] = useState(false);

  // Record referral on first login (no-op if no ref or already recorded)
  useRecordReferral(supabase, userId);

  function refetchUser() {
    setShowAuth(false);
  }

  const supabaseMissing = supabase === null;

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
            persistDraft
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
                    nextUrl="/create"
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
