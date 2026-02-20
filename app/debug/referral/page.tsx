"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import ReferralDebugPanel from "@/app/components/ReferralDebugPanel";

type ReferralRow = {
  id: string;
  referrer_username: string;
  referred_user_id: string;
  created_at: string;
};

type FetchStatus = "loading" | "success" | "error" | "not_found";

export default function DebugReferralPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [referral, setReferral] = useState<ReferralRow | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableReachable, setTableReachable] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace("/auth/email?next=/debug/referral");
      return;
    }

    (async () => {
      setFetchStatus("loading");
      setErrorMessage(null);
      setTableReachable(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("referrals")
          .select("id, referrer_username, referred_user_id, created_at")
          .eq("referred_user_id", user.id)
          .maybeSingle();

        if (fetchError) {
          setTableReachable(false);
          setErrorMessage(fetchError.message);
          setFetchStatus("error");
        } else {
          setTableReachable(true);
          if (data) {
            setReferral(data);
            setFetchStatus("success");
          } else {
            setReferral(null);
            setFetchStatus("not_found");
          }
        }
      } catch (e) {
        setTableReachable(false);
        setErrorMessage(e instanceof Error ? e.message : "Unknown error");
        setFetchStatus("error");
      }
    })();
  }, [user, sessionLoading, supabase, router]);

  if (sessionLoading || (!user && fetchStatus === "loading")) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug: Referral Status</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">User Info</h2>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="mb-3">
              <p className="text-sm text-neutral-400 mb-1">User ID</p>
              <p className="font-mono text-sm break-all">{user?.id ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Email</p>
              <p className="text-sm">{user?.email ?? "—"}</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">localStorage</h2>
          <ReferralDebugPanel showClearButton />
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Database Status</h2>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="mb-3">
              <p className="text-sm text-neutral-400 mb-1">Table: public.referrals</p>
              {tableReachable === null ? (
                <span className="text-sm text-neutral-500">Checking...</span>
              ) : tableReachable ? (
                <span className="text-sm text-emerald-400">✓ Reachable</span>
              ) : (
                <span className="text-sm text-red-400">✗ Not reachable</span>
              )}
            </div>

            {fetchStatus === "loading" && (
              <p className="text-neutral-400">Checking referral...</p>
            )}

            {fetchStatus === "error" && (
              <div className="text-red-400">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {fetchStatus === "not_found" && (
              <p className="text-neutral-400">No referral recorded for this user</p>
            )}

            {fetchStatus === "success" && referral && (
              <div>
                <p className="text-emerald-400 font-medium mb-2">
                  Referral found: @{referral.referrer_username}
                </p>
                <p className="text-sm text-neutral-400 mb-3">
                  Created at: {new Date(referral.created_at).toLocaleString()}
                </p>
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Raw JSON:</p>
                  <pre className="bg-neutral-800 rounded p-3 text-xs font-mono overflow-x-auto">
                    {JSON.stringify(referral, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex gap-4 mt-8">
          <Link href="/test/referral" className="text-sm text-neutral-400 hover:text-white">
            ← Test harness
          </Link>
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
