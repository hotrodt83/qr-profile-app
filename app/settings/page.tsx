"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import BuildStamp from "@/app/components/BuildStamp";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    if (!supabase || !user) {
      setError("Not authenticated");
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Session expired. Please sign in again.");
        setDeleting(false);
        return;
      }

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to delete account");
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      router.push("/?deleted=1");
    } catch (err) {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  if (sessionLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-white/60 mb-6">Please sign in to access settings.</p>
          <Link
            href="/edit"
            className="inline-block px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400 hover:bg-cyan-500/30 transition"
          >
            Sign In
          </Link>
        </div>
        <BuildStamp />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-12">
        <Link
          href="/edit"
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </Link>

        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-white/60 mb-8">Manage your account</p>

        <div className="space-y-6">
          {/* Account Info */}
          <section className="bg-neutral-900 border border-white/10 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Account</h2>
            <div className="text-sm text-white/70">
              <p>Email: {user.email}</p>
              <p className="mt-1">
                Status:{" "}
                {user.email_confirmed_at ? (
                  <span className="text-green-400">Verified</span>
                ) : (
                  <span className="text-yellow-400">Not verified</span>
                )}
              </p>
            </div>
          </section>

          {/* Privacy Links */}
          <section className="bg-neutral-900 border border-white/10 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Legal</h2>
            <div className="space-y-2 text-sm">
              <Link href="/privacy" className="block text-cyan-400 hover:text-cyan-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-cyan-400 hover:text-cyan-300">
                Terms of Service
              </Link>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
            <h2 className="font-semibold text-red-400 mb-3">Danger Zone</h2>
            <p className="text-sm text-white/70 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition text-sm font-medium"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400 font-medium">
                  Type DELETE to confirm:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-red-500"
                />
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteInput !== "DELETE"}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition"
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput("");
                      setError(null);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <BuildStamp />
    </main>
  );
}
