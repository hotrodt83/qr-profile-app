"use client";

import { useState } from "react";
import Link from "next/link";
import ReferralDebugPanel from "@/app/components/ReferralDebugPanel";

export default function TestReferralPage() {
  const [username, setUsername] = useState("demo");

  const publicProfileUrl = `/u/${encodeURIComponent(username)}`;
  const authWithRefUrl = `/auth/email?ref=${encodeURIComponent(username)}`;
  const debugPageUrl = "/debug/referral";

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Referral Test Harness</h1>
        <p className="text-neutral-400 mb-8">
          Use this page to test the full referral tracking flow.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Test Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-300">
            <li>Clear any existing referral localStorage (button below)</li>
            <li>Open the public profile link for a test user</li>
            <li>Click &quot;Create your own QR profile&quot; on that page</li>
            <li>Confirm the auth page shows &quot;Referred by @username&quot;</li>
            <li>Complete login/signup</li>
            <li>Visit the debug page to confirm referral was recorded</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">1. Configure Test Username</h2>
          <div className="flex gap-2 items-center">
            <label htmlFor="test-username" className="text-sm text-neutral-400">
              Username:
            </label>
            <input
              id="test-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30))}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-sm font-mono w-40"
              placeholder="demo"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">2. localStorage Status</h2>
          <ReferralDebugPanel showClearButton />
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">3. Test Links</h2>
          <div className="space-y-3">
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-sm text-neutral-400 mb-2">
                A) Open public profile (simulates scanning QR)
              </p>
              <Link
                href={publicProfileUrl}
                target="_blank"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
              >
                Open /u/{username} →
              </Link>
              <p className="text-xs text-neutral-500 mt-2 font-mono">{publicProfileUrl}</p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-sm text-neutral-400 mb-2">
                B) Open auth with referral param directly
              </p>
              <Link
                href={authWithRefUrl}
                target="_blank"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
              >
                Open auth with ?ref={username} →
              </Link>
              <p className="text-xs text-neutral-500 mt-2 font-mono">{authWithRefUrl}</p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-sm text-neutral-400 mb-2">
                C) Check recorded referral (requires auth)
              </p>
              <Link
                href={debugPageUrl}
                className="inline-block px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-medium"
              >
                Open /debug/referral →
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Expected Flow</h2>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-sm text-neutral-300 space-y-2">
            <p>1. Visit <code className="bg-neutral-800 px-1 rounded">/u/{username}</code></p>
            <p>2. Click &quot;Create your own QR profile&quot;</p>
            <p>3. Redirected to <code className="bg-neutral-800 px-1 rounded">/auth/email?ref={username}</code></p>
            <p>4. Auth page stores <code className="bg-neutral-800 px-1 rounded">smartqr_ref={username}</code> in localStorage</p>
            <p>5. After login, <code className="bg-neutral-800 px-1 rounded">/create</code> or <code className="bg-neutral-800 px-1 rounded">/edit</code> runs <code className="bg-neutral-800 px-1 rounded">useRecordReferral</code></p>
            <p>6. Referral row inserted into <code className="bg-neutral-800 px-1 rounded">public.referrals</code></p>
            <p>7. localStorage key cleared on success</p>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
